import React, { useRef, useEffect, useState } from 'react'
import { Send, RotateCcw, Zap } from 'lucide-react'
import { useChat } from '../hooks/useChat'

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
}

export function ChatPanel() {
  const { messages, isLoading, suggestedFollowups, error, sendMessage, clearChat } = useChat()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(input.trim())
    setInput('')
    inputRef.current?.focus()
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft" />
          <span className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>ElectIQ AI</span>
          <span className="chip">Powered by Gemini</span>
        </div>
        <button onClick={clearChat} className="p-1.5 rounded-lg hover:bg-white/5" title="Clear chat">
          <RotateCcw size={14} style={{ color: 'var(--color-muted)' }} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mr-2 mt-1"
                style={{ background: 'rgba(63,63,237,0.2)', border: '1px solid rgba(63,63,237,0.4)' }}>
                <Zap size={12} style={{ color: '#a1b0fd' }} />
              </div>
            )}
            <div className={msg.role === 'user' ? 'chat-message-user' : 'chat-message-ai prose-election'}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mr-2 mt-1"
              style={{ background: 'rgba(63,63,237,0.2)', border: '1px solid rgba(63,63,237,0.4)' }}>
              <Zap size={12} style={{ color: '#a1b0fd' }} />
            </div>
            <div className="chat-message-ai flex items-center gap-1">
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Thinking</span>
              <span className="typing-dots text-xs" style={{ color: '#a1b0fd' }} />
            </div>
          </div>
        )}
        {error && <div className="text-xs text-red-400 text-center py-1">{error}</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested follow-ups */}
      {suggestedFollowups.length > 0 && !isLoading && (
        <div className="px-4 pb-2">
          <p className="text-xs mb-2" style={{ color: 'var(--color-muted)' }}>Suggested questions</p>
          <div className="flex flex-wrap gap-2">
            {suggestedFollowups.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex gap-2 items-end rounded-xl p-2"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey} placeholder="Ask about elections, voting, candidates…"
            rows={1} disabled={isLoading}
            className="flex-1 bg-transparent resize-none text-sm outline-none py-1 px-1"
            style={{ color: 'var(--color-text)', maxHeight: '120px' }} />
          <button onClick={handleSend} disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40"
            style={{ background: input.trim() && !isLoading ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)' }}>
            <Send size={14} color="white" />
          </button>
        </div>
        <p className="text-xs mt-1.5 text-center" style={{ color: 'var(--color-muted)', opacity: 0.6 }}>
          ElectIQ is nonpartisan. Always verify with official sources.
        </p>
      </div>
    </div>
  )
}