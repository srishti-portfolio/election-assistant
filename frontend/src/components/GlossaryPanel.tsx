import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { electionApi } from '../services/api'

const STATIC_GLOSSARY: Record<string, string> = {
  "Electoral College": "A body of 538 electors who formally elect the president. Each state gets electors equal to its congressional seats. A candidate needs 270 electoral votes to win.",
  "Primary Election": "An intra-party election where voters choose which candidate will represent their party in the general election.",
  "Absentee / Mail-in Ballot": "A ballot cast by mail. Available in all 50 states. Some states automatically mail ballots to all registered voters.",
  "Provisional Ballot": "A ballot given when a voter's eligibility is uncertain. Set aside and counted only after eligibility is verified.",
  "Swing State": "A state with no strong party lean where the outcome is uncertain. Also called a 'battleground state.'",
  "Gerrymandering": "Drawing electoral district boundaries to give one political party an advantage over others.",
  "Ballot Measure": "A law or constitutional amendment placed directly on the ballot for voters to decide.",
  "Caucus": "A local party meeting where members vote for their preferred candidate instead of a secret ballot primary.",
  "Runoff Election": "A second election held when no candidate wins the required vote threshold in the first round.",
  "Certification": "The official process by which state officials verify and declare the final election results.",
  "Redistricting": "Redrawing congressional and legislative district boundaries every 10 years after the census.",
  "Ranked-Choice Voting": "Voters rank candidates by preference. If no candidate wins a majority, last-place is eliminated and votes redistributed.",
  "Super PAC": "A political action committee that can raise unlimited funds but cannot donate directly to candidates.",
  "Voter Suppression": "Strategies that discourage or prevent specific groups from voting.",
  "Down-ballot": "Candidates and issues below the top-of-ticket races — typically state or local offices.",
  "General Election": "The final election between nominees from different parties, open to all registered voters.",
  "Filibuster": "A Senate tactic to delay a vote by extending debate. Requires 60 votes to end.",
  "Polling Place": "The official location where voters in a precinct cast in-person ballots on Election Day.",
  "Precinct": "A geographic subdivision for organizing voting. Each precinct has one designated polling place.",
  "Split-ticket Voting": "Voting for candidates from different parties on the same ballot.",
}

export function GlossaryPanel() {
  const [glossary, setGlossary] = useState<Record<string, string>>(STATIC_GLOSSARY)
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    electionApi.getGlossary()
      .then(data => { if (Object.keys(data).length) setGlossary({ ...STATIC_GLOSSARY, ...data }) })
      .catch(() => {})
  }, [])

  const filtered = Object.entries(glossary).filter(([term, def]) =>
    term.toLowerCase().includes(query.toLowerCase()) ||
    def.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="h-full overflow-y-auto px-4 py-4">
      <div className="mb-4">
        <h2 className="text-lg font-display font-semibold" style={{ color: 'var(--color-text)' }}>Election Glossary</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>{Object.keys(glossary).length} key terms defined</p>
      </div>
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search terms…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
      </div>
      <div className="space-y-2">
        {filtered.map(([term, definition], i) => {
          const open = expanded === term
          return (
            <div key={term} className="glass glass-hover rounded-xl overflow-hidden cursor-pointer"
              onClick={() => setExpanded(open ? null : term)}>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{term}</p>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                    style={{ background: 'rgba(63,63,237,0.15)', color: '#a1b0fd' }}>
                    {open ? '−' : '+'}
                  </div>
                </div>
                {!open && <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--color-muted)' }}>{definition.substring(0, 80)}…</p>}
                {open && <p className="text-sm mt-2 leading-relaxed animate-fade-in" style={{ color: 'var(--color-muted)' }}>{definition}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}