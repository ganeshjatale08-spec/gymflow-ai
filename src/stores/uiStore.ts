import { create } from 'zustand'
import brand from '@/lib/brand.config'

type ThemeMode = 'dark' | 'light'

interface UIState {
  sidebarOpen: boolean
  activeNotifications: number
  aiGlobalStatus: 'active' | 'paused' | 'error'
  syncStatus: 'synced' | 'syncing' | 'offline'
  gymName: string
  gymLogo: string | null
  theme: ThemeMode
  toggleSidebar: () => void
  setAIStatus: (status: 'active' | 'paused' | 'error') => void
  setSyncStatus: (status: 'synced' | 'syncing' | 'offline') => void
  setNotifications: (count: number) => void
  setGymName: (name: string) => void
  setGymLogo: (logo: string | null) => void
  setTheme: (theme: ThemeMode) => void
}

function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.remove('dark', 'light')
  document.documentElement.classList.add(theme)
  localStorage.setItem('gym-theme', theme)
}

// Load persisted values from localStorage
const persistedName = typeof window !== 'undefined' ? (localStorage.getItem('gym_name') || brand.name) : brand.name
const persistedLogo = typeof window !== 'undefined' ? localStorage.getItem('gym_logo') || null : null
const persistedTheme = typeof window !== 'undefined' ? (localStorage.getItem('gym-theme') as 'dark' | 'light' || 'dark') : 'dark'

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeNotifications: 3,
  aiGlobalStatus: 'active',
  syncStatus: 'synced',
  gymName: persistedName,
  gymLogo: persistedLogo,
  theme: persistedTheme,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setAIStatus: (aiGlobalStatus) => set({ aiGlobalStatus }),
  setSyncStatus: (syncStatus) => set({ syncStatus }),
  setNotifications: (count) => set({ activeNotifications: count }),
  setGymName: (gymName) => {
    if (typeof window !== 'undefined') localStorage.setItem('gym_name', gymName)
    set({ gymName })
  },
  setGymLogo: (gymLogo) => {
    if (typeof window !== 'undefined') {
      if (gymLogo) localStorage.setItem('gym_logo', gymLogo)
      else localStorage.removeItem('gym_logo')
    }
    set({ gymLogo })
  },
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
}))
