import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Lead } from '@/types'

interface LeadState {
  leads: Lead[]
  filterStatus: string | null
  searchQuery: string
  setLeads: (leads: Lead[]) => void
  addLead: (lead: Lead) => void
  updateLead: (id: string, updates: Partial<Lead>) => void
  setFilter: (status: string | null) => void
  setSearch: (query: string) => void
  getFilteredLeads: () => Lead[]
}

export const useLeadStore = create<LeadState>()(
  devtools((set, get) => ({
    leads: [],
    filterStatus: null,
    searchQuery: '',

    setLeads: (leads) => set({ leads }),

    addLead: (lead) => set((state) => ({ leads: [lead, ...state.leads] })),

    updateLead: (id, updates) =>
      set((state) => ({
        leads: state.leads.map((l) => (l.id === id ? { ...l, ...updates } : l)),
      })),

    setFilter: (filterStatus) => set({ filterStatus }),

    setSearch: (searchQuery) => set({ searchQuery }),

    getFilteredLeads: () => {
      const { leads, filterStatus, searchQuery } = get()
      return leads
        .filter((l) => !filterStatus || l.status === filterStatus)
        .filter(
          (l) =>
            !searchQuery ||
            l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.phone.includes(searchQuery) ||
            l.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    },
  }))
)
