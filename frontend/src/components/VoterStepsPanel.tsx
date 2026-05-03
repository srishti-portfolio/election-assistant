import React, { useState, useEffect } from 'react'
import { CheckCircle, Circle, ChevronRight, ExternalLink } from 'lucide-react'
import { electionApi, VoterStep } from '../services/api'

const STATIC_STEPS: VoterStep[] = [
  { step: 1, title: "Check Eligibility", detail: "US citizen, 18+ on Election Day, state resident. Some states have additional rules for people with past felony convictions." },
  { step: 2, title: "Register to Vote", detail: "Register online via vote.gov, by mail, or in person at the DMV. Deadlines typically 15–30 days before Election Day." },
  { step: 3, title: "Find Your Polling Place", detail: "Based on your registered address. Confirm at your state's official voter portal. Can change between elections." },
  { step: 4, title: "Research Your Ballot", detail: "Includes federal, state, and local races plus ballot measures. Preview your sample ballot at vote.gov." },
  { step: 5, title: "Choose How to Vote", detail: "In-person on Election Day, early in-person (2–6 weeks before), or mail-in/absentee ballot. Options vary by state." },
  { step: 6, title: "Prepare Your ID", detail: "~35 states require photo ID. Driver's license, passport, or student ID. You may cast a provisional ballot without ID." },
  { step: 7, title: "Cast Your Ballot", detail: "Give your name, show ID if required, mark your ballot clearly. For mail: sign envelope, add witness signatures, return by deadline." },
  { step: 8, title: "Track Your Ballot", detail: "Most states let you track mail ballot status online. You'll see when received and accepted." },
]

export function VoterStepsPanel() {
  const [steps, setSteps] = useState<VoterStep[]>(STATIC_STEPS)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('electiq-completed-steps')
    if (saved) setCompleted(new Set(JSON.parse(saved)))
    electionApi.getVoterSteps().then(data => { if (data.length) setSteps(data) }).catch(() => {})
  }, [])

  const toggleComplete = (step: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setCompleted(prev => {
      const next = new Set(prev)
      next.has(step) ? next.delete(step) : next.add(step)
      localStorage.setItem('electiq-completed-steps', JSON.stringify([...next]))
      return next
    })
  }

  const completedCount = completed.size
  const progress = Math.round((completedCount / steps.length) * 100)

  return (
    <div className="h-full overflow-y-auto px-4 py-4">
      <div className="mb-4">
        <h2 className="text-lg font-display font-semibold" style={{ color: 'var(--color-text)' }}>Your Voter Journey</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>8 steps from eligibility to casting your ballot</p>
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--color-muted)' }}>
            <span>{completedCount} of {steps.length} steps checked</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'var(--color-primary)' }} />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {steps.map((step, i) => {
          const done = completed.has(step.step)
          const open = expanded === i
          return (
            <div key={i} className="glass glass-hover rounded-xl overflow-hidden cursor-pointer animate-slide-up"
              style={{ animationDelay: `${i * 30}ms`, borderColor: done ? 'rgba(16,185,129,0.3)' : undefined }}
              onClick={() => setExpanded(open ? null : i)}>
              <div className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <button onClick={e => toggleComplete(step.step, e)} className="flex-shrink-0 hover:scale-110 transition-transform">
                    {done ? <CheckCircle size={20} style={{ color: '#10b981' }} /> : <Circle size={20} style={{ color: 'rgba(255,255,255,0.2)' }} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(63,63,237,0.2)', color: '#a1b0fd' }}>
                        {String(step.step).padStart(2, '0')}
                      </span>
                      <p className={`text-sm font-medium ${done ? 'line-through opacity-50' : ''}`} style={{ color: 'var(--color-text)' }}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--color-muted)', transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                </div>
                {open && (
                  <div className="mt-3 pt-3 animate-fade-in" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{step.detail}</p>
                    {step.step === 2 && (
                      <a href="https://vote.gov" target="_blank" rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs" style={{ color: '#a1b0fd' }}
                        onClick={e => e.stopPropagation()}>
                        <ExternalLink size={11} /> Register at vote.gov
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {completedCount === steps.length && (
        <div className="mt-4 rounded-xl p-4 text-center animate-fade-in"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <p className="text-sm font-medium" style={{ color: '#10b981' }}>🎉 You're ready to vote!</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(16,185,129,0.7)' }}>Every vote shapes our democracy.</p>
        </div>
      )}
    </div>
  )
}