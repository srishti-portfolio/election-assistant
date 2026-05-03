import React, { useState } from 'react'
import { MessageSquare, Clock, CheckSquare, BookOpen, Globe, Shield, ExternalLink } from 'lucide-react'
import { ChatPanel } from './components/ChatPanel'
import { TimelinePanel } from './components/TimelinePanel'
import { VoterStepsPanel } from './components/VoterStepsPanel'
import { GlossaryPanel } from './components/GlossaryPanel'

type Tab = 'chat' | 'timeline' | 'steps' | 'glossary'

const TABS = [
  { id: 'chat' as Tab, label: 'Ask ElectIQ', icon: MessageSquare, desc: 'AI-powered Q&A' },
  { id: 'timeline' as Tab, label: 'Timeline', icon: Clock, desc: 'Election calendar' },
  { id: 'steps' as Tab, label: 'Voter Steps', icon: CheckSquare, desc: 'Your voting checklist' },
  { id: 'glossary' as Tab, label: 'Glossary', icon: BookOpen, desc: 'Key terms defined' },
]

const QUICK_FACTS = [
  "538 total electoral votes",
  "270 needed to win presidency",
  "Election Day: 1st Tue after 1st Mon in Nov",
  "Inauguration: January 20",
]

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <header className="flex-shrink-0 px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(10,15,30,0.8)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--color-primary)', boxShadow: '0 0 20px rgba(63,63,237,0.4)' }}>
            <Shield size={18} color="white" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
              Elect<span style={{ color: '#7c87fb' }}>IQ</span>
            </h1>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Your Civic Education Guide</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs" style={{ color: 'var(--color-muted)' }}>
            <Globe size={12} /><span>Nonpartisan · Powered by Gemini</span>
          </div>
          <a href="https://vote.gov" target="_blank" rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(63,63,237,0.15)', border: '1px solid rgba(63,63,237,0.3)', color: '#a1b0fd' }}>
            <ExternalLink size={11} /> vote.gov
          </a>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 py-4 px-3"
          style={{ borderRight: '1px solid var(--color-border)', background: 'rgba(17,24,39,0.5)' }}>
          <nav className="space-y-1 flex-1">
            <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(240,244,255,0.3)' }}>Navigation</p>
            {TABS.map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${active ? 'tab-btn active' : 'tab-btn'}`}>
                  <Icon size={16} style={{ color: active ? '#a1b0fd' : 'var(--color-muted)' }} />
                  <div>
                    <p className="text-sm font-medium leading-none">{tab.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{tab.desc}</p>
                  </div>
                </button>
              )
            })}
          </nav>
          <div className="mt-4 rounded-xl p-3" style={{ background: 'rgba(63,63,237,0.08)', border: '1px solid rgba(63,63,237,0.15)' }}>
            <p className="text-xs font-medium mb-2" style={{ color: '#a1b0fd' }}>Quick facts</p>
            <ul className="space-y-1.5">
              {QUICK_FACTS.map((fact, i) => (
                <li key={i} className="text-xs" style={{ color: 'var(--color-muted)' }}>· {fact}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4 px-3">
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,244,255,0.25)' }}>
              ElectIQ is for civic education only and is nonpartisan.
            </p>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile tab bar */}
          <div className="lg:hidden flex gap-1 px-3 py-2 overflow-x-auto flex-shrink-0"
            style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
            {TABS.map(tab => {
              const Icon = tab.icon
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap flex-shrink-0 ${activeTab === tab.id ? 'tab-btn active' : 'tab-btn'}`}>
                  <Icon size={14} />{tab.label}
                </button>
              )
            })}
          </div>

          {/* Panels */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full" style={{ display: activeTab === 'chat' ? 'flex' : 'none', flexDirection: 'column' }}><ChatPanel /></div>
            <div className="h-full overflow-hidden" style={{ display: activeTab === 'timeline' ? 'block' : 'none' }}><TimelinePanel /></div>
            <div className="h-full overflow-hidden" style={{ display: activeTab === 'steps' ? 'block' : 'none' }}><VoterStepsPanel /></div>
            <div className="h-full overflow-hidden" style={{ display: activeTab === 'glossary' ? 'block' : 'none' }}><GlossaryPanel /></div>
          </div>
        </main>
      </div>
    </div>
  )
}