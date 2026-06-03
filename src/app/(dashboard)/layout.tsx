'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopBar } from '@/components/dashboard/TopBar'
import { QueryProvider } from '@/components/shared/QueryProvider'
import { motion, AnimatePresence } from 'framer-motion'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, toggleSidebar, theme, setTheme } = useUIStore()

  // Apply saved theme on first load
  useEffect(() => {
    const saved = (localStorage.getItem('gym-theme') || 'dark') as 'dark' | 'light'
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(saved)
    if (saved !== theme) setTheme(saved)
  }, [])

  // Close sidebar on mobile when route changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && !sidebarOpen) {
        useUIStore.setState({ sidebarOpen: true })
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [sidebarOpen])

  return (
    <QueryProvider>
      <div id="app-shell" className="flex h-screen bg-background overflow-hidden">

        {/* Mobile overlay backdrop */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar — drawer on mobile, fixed on desktop */}
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-background">
            <motion.div
              key={typeof window !== 'undefined' ? window.location.pathname : 'page'}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </main>
        </div>

      </div>
    </QueryProvider>
  )
}
