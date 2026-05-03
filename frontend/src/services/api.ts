import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

export interface Message {
  role: 'user' | 'assistant'
  content: string
}
export interface ChatResponse {
  reply: string
  suggested_followups: string[]
}
export interface TimelinePhase {
  phase: string
  timing: string
  description: string
}
export interface VoterStep {
  step: number
  title: string
  detail: string
}

export const electionApi = {
  async chat(message: string, history: Message[], language = 'en'): Promise<ChatResponse> {
    const { data } = await api.post<ChatResponse>('/api/chat', {
      message,
      conversation_history: history.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', content: m.content })),
      language,
    })
    return data
  },
  async getTimeline(): Promise<TimelinePhase[]> {
    const { data } = await api.get<{ timeline: TimelinePhase[] }>('/api/timeline')
    return data.timeline
  },
  async getVoterSteps(): Promise<VoterStep[]> {
    const { data } = await api.get<{ steps: VoterStep[] }>('/api/voter-steps')
    return data.steps
  },
  async getGlossary(): Promise<Record<string, string>> {
    const { data } = await api.get<{ glossary: Record<string, string> }>('/api/glossary')
    return data.glossary
  },
  async translate(text: string, targetLanguage: string): Promise<string> {
    const { data } = await api.post<{ translated_text: string }>('/api/translate', { text, target_language: targetLanguage })
    return data.translated_text
  },
  async checkHealth(): Promise<boolean> {
    try {
      const { data } = await api.get('/health')
      return data.status === 'healthy'
    } catch { return false }
  }
}