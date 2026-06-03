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

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeNotifications: 3,
  aiGlobalStatus: 'active',
  syncStatus: 'synced',
  gymName: brand.name,
  gymLogo: null,
  theme: 'dark',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setAIStatus: (aiGlobalStatus) => set({ aiGlobalStatus }),
  setSyncStatus: (syncStatus) => set({ syncStatus }),
  setNotifications: (count) => set({ activeNotifications: count }),
  setGymName: (gymName) => set({ gymName }),
  setGymLogo: (gymLogo) => set({ gymLogo }),
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
}))
