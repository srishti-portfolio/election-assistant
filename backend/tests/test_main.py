import pytest
from fastapi.testclient import TestClient
import sys, os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import app

client = TestClient(app)

def test_root():
  response = client.get("/")
  assert response.status_code == 200
  assert response.json()["status"] == "ok"

def test_health():
  response = client.get("/health")
  assert response.status_code == 200
  assert response.json()["status"] == "healthy"

def test_get_timeline():
  response = client.get("/api/timeline")
  assert response.status_code == 200
  data = response.json()
  assert "timeline" in data
  assert len(data["timeline"]) > 0
  first = data["timeline"][0]
  assert "phase" in first
  assert "timing" in first
  assert "description" in first

def test_get_voter_steps():
  response = client.get("/api/voter-steps")
  assert response.status_code == 200
  data = response.json()
  assert "steps" in data
  assert len(data["steps"]) == 8
  for step in data["steps"]:
    assert "step" in step
    assert "title" in step
    assert "detail" in step

def test_get_glossary():
  response = client.get("/api/glossary")
  assert response.status_code == 200
  data = response.json()
  assert "glossary" in data
  assert "Electoral College" in data["glossary"]

def test_chat_no_api_key():
  response = client.post("/api/chat", json={
    "message": "How do I register to vote?",
    "conversation_history": [],
    "language": "en"
  })
  assert response.status_code == 200
  data = response.json()
  assert "reply" in data
  assert "suggested_followups" in data
  assert isinstance(data["suggested_followups"], list)

def test_chat_with_context():
  response = client.post("/api/chat", json={
    "message": "What is the Electoral College?",
    "conversation_history": [
      {"role": "user", "content": "Hi"},
      {"role": "assistant", "content": "Hello! How can I help?"}
    ],
    "language": "en"
  })
  assert response.status_code == 200

def test_chat_invalid_empty_message():
  response = client.post("/api/chat", json={
    "message": "",
    "conversation_history": []
  })
  assert response.status_code in [200, 422]