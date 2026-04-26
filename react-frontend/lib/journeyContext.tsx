'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface JourneyData {
  recommendedProvider: string
  providerColor: string
  monthlyBudget: string
  teamSize: string
  workload: string
  confidence: number
}

interface JourneyContextType {
  journey: JourneyData | null
  setJourney: (data: JourneyData) => void
  clearJourney: () => void
}

const JourneyContext = createContext<JourneyContextType>({
  journey: null,
  setJourney: () => {},
  clearJourney: () => {},
})

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [journey, setJourneyState] = useState<JourneyData | null>(null)
  const setJourney = (data: JourneyData) => setJourneyState(data)
  const clearJourney = () => setJourneyState(null)
  return (
    <JourneyContext.Provider value={{ journey, setJourney, clearJourney }}>
      {children}
    </JourneyContext.Provider>
  )
}

export const useJourney = () => useContext(JourneyContext)
