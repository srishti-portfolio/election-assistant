from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import google.generativeai as genai
from google.cloud import translate_v2 as translate
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Election Assistant API", version="1.0.0")

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
  genai.configure(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = """You are ElectIQ, a friendly and knowledgeable civic education assistant specializing in election processes.

Your role is to help users understand:
- How elections work (primaries, general elections, runoffs)
- Voter registration steps and deadlines
- The Electoral College and how presidents are elected
- Timelines from candidate filing to inauguration
- Ballot types: in-person, early voting, absentee/mail-in
- How votes are counted and certified
- Key election terms and concepts
- Voting rights and accessibility

Guidelines:
- Be NONPARTISAN. Never favor or criticize any political party or candidate.
- Be accurate and cite processes as they work in the United States unless asked about another country.
- Use clear, simple language. Avoid jargon unless explaining it.
- Be encouraging — civic participation matters.
- If asked about a specific state's rules, note that rules vary by state and suggest checking vote.gov.
- Keep answers concise but complete. Use bullet points for steps/lists.
- If a question is outside elections/civic topics, politely redirect.

Always end responses about registration or voting steps with: "Want me to explain any of these steps in more detail?"
"""

ELECTION_KNOWLEDGE = {
  "timeline": [
    {"phase": "Candidate Filing", "timing": "~12 months before Election Day", "description": "Candidates officially declare and file paperwork with election authorities. Party primaries are scheduled."},
    {"phase": "Voter Registration Opens", "timing": "~6 months before", "description": "Citizens register to vote. Deadlines vary by state — typically 15–30 days before Election Day."},
    {"phase": "Primary Elections", "timing": "Spring–Summer before general election", "description": "Party members choose their nominee through primary votes or caucuses."},
    {"phase": "National Conventions", "timing": "Summer", "description": "Each major party formally nominates their presidential candidate and announces their running mate."},
    {"phase": "Campaigns & Debates", "timing": "Summer–Fall", "description": "Candidates campaign nationwide. Presidential debates typically occur in September–October."},
    {"phase": "Early & Absentee Voting", "timing": "2–6 weeks before Election Day", "description": "Mail-in and in-person early voting opens in most states."},
    {"phase": "Election Day", "timing": "First Tuesday after first Monday in November", "description": "Polls open 7am–8pm. In-person voting. Anyone in line at closing time may vote."},
    {"phase": "Vote Counting", "timing": "Election night through days after", "description": "Votes counted by local officials. Mail-heavy states may take 1–2 weeks for final tallies."},
    {"phase": "Electoral College Meets", "timing": "Mid-December", "description": "Electors cast official votes for president in their state capitals."},
    {"phase": "Congressional Certification", "timing": "January 6", "description": "Congress officially certifies the Electoral College results."},
    {"phase": "Inauguration Day", "timing": "January 20", "description": "The president-elect is sworn into office. Transfer of power is complete."},
  ],
  "voter_steps": [
    {"step": 1, "title": "Check Eligibility", "detail": "US citizen, 18+ on Election Day, state resident. Some states restrict voting for people with certain felony convictions."},
    {"step": 2, "title": "Register to Vote", "detail": "Register online, by mail, or in person. Use vote.gov or your state's secretary of state website. Deadlines vary by state."},
    {"step": 3, "title": "Find Your Polling Place", "detail": "Your polling place is based on your registered address. Confirm at your state's voter portal — it can change between elections."},
    {"step": 4, "title": "Research the Ballot", "detail": "Preview your sample ballot at vote.gov. Ballots include federal, state, and local races plus ballot measures."},
    {"step": 5, "title": "Choose How to Vote", "detail": "In-person on Election Day, early in-person, or request a mail-in/absentee ballot. Each state has different options."},
    {"step": 6, "title": "Bring Valid ID", "detail": "~35 states require photo ID. Accepted forms vary. Check your state's requirements."},
    {"step": 7, "title": "Cast Your Ballot", "detail": "Mark your ballot clearly. For mail ballots, follow instructions exactly — sign envelopes, include required witness signatures."},
    {"step": 8, "title": "Track Your Ballot", "detail": "Most states let you track mail ballot status online. Confirm it was received and accepted."},
  ],
  "glossary": {
    "Electoral College": "A body of 538 electors who formally elect the president. Each state gets electors equal to its congressional seats. A candidate needs 270 to win.",
    "Primary Election": "An intra-party election where voters choose which candidate will represent their party in the general election.",
    "Absentee / Mail-in Ballot": "A ballot cast by mail. Available in all 50 states; some states automatically mail ballots to all registered voters.",
    "Provisional Ballot": "A ballot given when a voter's eligibility is in question. Counted after eligibility is verified.",
    "Swing State": "A state with no strong party majority where the outcome is uncertain. Also called a 'battleground state.'",
    "Gerrymandering": "Drawing electoral district boundaries to give one political party an advantage.",
    "Ballot Measure": "A law or constitutional amendment placed directly on the ballot for voters to decide.",
    "Caucus": "A local party meeting where members discuss and vote for their preferred candidate.",
    "Runoff Election": "A second election held when no candidate wins the required majority threshold in the first round.",
    "Certification": "The official process by which state officials verify and declare the final vote totals.",
    "Redistricting": "Redrawing congressional and legislative district boundaries every 10 years after the census.",
    "Ranked-Choice Voting": "A system where voters rank candidates by preference. If no candidate wins a majority, the last-place candidate is eliminated and votes redistributed.",
  }
}


class ChatRequest(BaseModel):
  message: str
  conversation_history: Optional[list] = []
  language: Optional[str] = "en"

class TranslateRequest(BaseModel):
  text: str
  target_language: str

class ChatResponse(BaseModel):
  reply: str
  suggested_followups: list[str]


@app.get("/")
def root():
  return {"status": "ok", "service": "Election Assistant API"}

@app.get("/health")
def health():
  return {"status": "healthy", "gemini_configured": bool(GEMINI_API_KEY)}

@app.get("/api/timeline")
def get_timeline():
  return {"timeline": ELECTION_KNOWLEDGE["timeline"]}

@app.get("/api/voter-steps")
def get_voter_steps():
  return {"steps": ELECTION_KNOWLEDGE["voter_steps"]}

@app.get("/api/glossary")
def get_glossary():
  return {"glossary": ELECTION_KNOWLEDGE["glossary"]}

@app.get("/api/debug/models")
def list_models():
  if not GEMINI_API_KEY:
    return {"error": "GEMINI_API_KEY not set"}
  try:
    models = []
    for m in genai.list_models():
      if 'generateContent' in m.supported_generation_methods:
        models.append(m.name)
    return {"available_models": models, "count": len(models)}
  except Exception as e:
    return {"error": str(e)}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
  if not GEMINI_API_KEY:
    return ChatResponse(
      reply="I'm ElectIQ, your election guide! Running in demo mode. Configure GEMINI_API_KEY to enable AI responses.",
      suggested_followups=["How do I register to vote?", "What is the Electoral College?", "When is Election Day?"]
    )

  # Try several model names in case one is deprecated
  model_candidates = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-flash-latest",
        "gemini-2.0-flash-lite",
        "gemini-2.5-pro",
    ]

  last_error = None
  for model_name in model_candidates:
    try:
      logger.info(f"Trying Gemini model: {model_name}")
      model = genai.GenerativeModel(
        model_name=model_name,
        system_instruction=SYSTEM_PROMPT,
      )

      history = []
      for msg in req.conversation_history:
        role = msg.get("role", "user")
        if role == "assistant":
            role = "model"
        history.append({"role": role, "parts": [msg.get("content", "")]})

      chat_session = model.start_chat(history=history)
      response = chat_session.send_message(req.message)

      return ChatResponse(
        reply=response.text,
        suggested_followups=generate_followups(req.message)
      )

    except Exception as e:
      logger.warning(f"Model {model_name} failed: {e}")
      last_error = e
      continue

  logger.error(f"All Gemini models failed. Last error: {last_error}")
  raise HTTPException(
    status_code=500,
    detail=f"AI service unavailable. Last error: {str(last_error)}"
  )

@app.post("/api/translate")
async def translate_text(req: TranslateRequest):
  try:
    client = translate.Client()
    result = client.translate(req.text, target_language=req.target_language)
    return {"translated_text": result["translatedText"], "source_language": result.get("detectedSourceLanguage", "en")}
  except Exception as e:
    logger.error(f"Translation error: {e}")
    raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")

def generate_followups(user_message: str) -> list[str]:
  msg_lower = user_message.lower()
  if any(w in msg_lower for w in ["register", "registration", "sign up"]):
    return ["What ID do I need to vote?", "What is a provisional ballot?", "Can I register on Election Day?"]
  elif any(w in msg_lower for w in ["electoral college", "electors", "270"]):
    return ["How does the popular vote relate to the Electoral College?", "What happens if there's a tie?", "Which states split their electoral votes?"]
  elif any(w in msg_lower for w in ["mail", "absentee", "mail-in"]):
    return ["How do I track my mail-in ballot?", "What's the deadline for mail-in ballots?", "Is mail-in voting safe?"]
  elif any(w in msg_lower for w in ["primary", "caucus", "nominee"]):
    return ["What's the difference between open and closed primaries?", "How does ranked-choice voting work?", "What is a caucus?"]
  elif any(w in msg_lower for w in ["count", "result", "win", "certif"]):
    return ["What happens if results are contested?", "How are recounts triggered?", "What is the certification process?"]
  else:
    return ["How do I register to vote?", "Explain the Electoral College", "What is on a typical ballot?"]