import { useState, useCallback } from 'react'
import { electionApi, Message } from '../services/api'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "👋 Hello! I'm **ElectIQ**, your civic education guide. I can help you understand:\n\n- How elections work from start to finish\n- How to register and vote\n- The Electoral College system\n- Key election terms and concepts\n\nWhat would you like to learn about today?",
  }])
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedFollowups, setSuggestedFollowups] = useState<string[]>([
    "How do I register to vote?",
    "Explain the Electoral College",
    "What happens on Election Day?",
  ])
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return
    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)
    setError(null)
    try {
      const history = messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0)
      const response = await electionApi.chat(text, history)
      setMessages(prev => [...prev, { role: 'assistant', content: response.reply }])
      setSuggestedFollowups(response.suggested_followups || [])
    } catch {
      setError('Failed to get a response. Please try again.')
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting. Please try again." }])
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading])

  const clearChat = useCallback(() => {
    setMessages([{ role: 'assistant', content: "Chat cleared! Ask me anything about elections." }])
    setSuggestedFollowups(["How do I register to vote?", "Explain the Electoral College", "What happens on Election Day?"])
    setError(null)
  }, [])

  return { messages, isLoading, suggestedFollowups, error, sendMessage, clearChat }
}