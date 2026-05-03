import React, { useState, useEffect } from 'react'
import { ChevronDown, Calendar, Clock } from 'lucide-react'
import { electionApi, TimelinePhase } from '../services/api'

const STATIC_TIMELINE: TimelinePhase[] = [
  { phase: "Candidate Filing & Primaries", timing: "~12 months before Election Day", description: "Candidates officially declare and file paperwork. In primaries, party members vote for their preferred nominee." },
  { phase: "Voter Registration Opens", timing: "~6 months before Election Day", description: "Citizens register online, by mail, or in person. Deadlines typically 15–30 days before Election Day." },
  { phase: "National Conventions", timing: "Summer before Election Day", description: "Each major party formally nominates their presidential and vice-presidential candidates." },
  { phase: "Campaigns & Presidential Debates", timing: "Summer–Fall", description: "Candidates campaign nationwide. Presidential debates occur in September–October." },
  { phase: "Early & Absentee Voting Opens", timing: "2–6 weeks before Election Day", description: "Mail-in ballots available in all states. In-person early voting opens in most states." },
  { phase: "Election Day", timing: "First Tuesday after first Monday in November", description: "Polls open 7am–8pm. Anyone in line when polls close is allowed to vote." },
  { phase: "Vote Counting & Results", timing: "Election night through days after", description: "Votes tabulated by local officials. Mail-heavy states may take 1–2 weeks. Media 'calls' are projections, not official." },
  { phase: "Electoral College Meets", timing: "Mid-December", description: "Each state's electors formally cast presidential votes in their state capitals." },
  { phase: "Congressional Certification", timing: "January 6", description: "A joint session of Congress officially counts and certifies the Electoral College results." },
  { phase: "Inauguration Day", timing: "January 20", description: "The president-elect is sworn in. The oath is administered by the Chief Justice of the Supreme Court." },
]

export function TimelinePanel() {
  const [timeline, setTimeline] = useState<TimelinePhase[]>(STATIC_TIMELINE)
  const [openIndex, setOpenIndex] = useState<number | null>(4)

  useEffect(() => {
    electionApi.getTimeline().then(data => { if (data.length) setTimeline(data) }).catch(() => {})
  }, [])

  const handleCalendarLink = (phase: TimelinePhase) => {
    const title = encodeURIComponent(`Election: ${phase.phase}`)
    const details = encodeURIComponent(phase.description)
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`, '_blank')
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-4">
      <div className="mb-4">
        <h2 className="text-lg font-display font-semibold" style={{ color: 'var(--color-text)' }}>Election Timeline</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>Click any phase to expand details</p>
      </div>
      <div className="relative">
        <div className="absolute left-3.5 top-4 bottom-4 w-px" style={{ background: 'rgba(63,63,237,0.25)' }} />
        <div className="space-y-3">
          {timeline.map((phase, i) => (
            <div key={i} className="relative pl-10 animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
              <div className={`absolute left-0 top-3.5 timeline-dot ${i <= 4 ? 'done' : ''} ${i === 4 ? 'active' : ''}`} />
              <div className="glass glass-hover rounded-xl overflow-hidden cursor-pointer"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{phase.phase}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={11} style={{ color: 'var(--color-muted)' }} />
                        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{phase.timing}</p>
                      </div>
                    </div>
                    <ChevronDown size={14} style={{ color: 'var(--color-muted)', transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                  </div>
                  {openIndex === i && (
                    <div className="mt-3 pt-3 animate-fade-in" style={{ borderTop: '1px solid var(--color-border)' }}>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>{phase.description}</p>
                      <button onClick={e => { e.stopPropagation(); handleCalendarLink(phase) }}
                        className="mt-3 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                        style={{ background: 'rgba(63,63,237,0.15)', border: '1px solid rgba(63,63,237,0.3)', color: '#a1b0fd' }}>
                        <Calendar size={11} /> Add to Google Calendar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}