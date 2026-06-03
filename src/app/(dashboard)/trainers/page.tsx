'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dumbbell, Plus, Star, Users, Phone } from 'lucide-react'
import { fadeUp, staggerContainer } from '@/lib/constants'
import { GlowCard } from '@/components/shared/GlowCard'
import { StatusDot } from '@/components/shared/StatusDot'
import { cn } from '@/lib/utils'
import { AddTrainerModal } from '@/components/trainers/AddTrainerModal'

const mockTrainers = [
  { id: '1', name: 'Arun Sharma', speciality: ['Weight Training', 'HIIT'], members: 34, rating: 4.8, is_active: true, phone: '+91 98765 43210', experience: '6 years' },
  { id: '2', name: 'Sneha Mehta', speciality: ['Yoga', 'Zumba', 'Pilates'], members: 28, rating: 4.9, is_active: true, phone: '+91 87654 32109', experience: '4 years' },
  { id: '3', name: 'Rohit Patel', speciality: ['Boxing', 'CrossFit'], members: 19, rating: 4.7, is_active: true, phone: '+91 76543 21098', experience: '8 years' },
  { id: '4', name: 'Divya Nair', speciality: ['Nutrition', 'Weight Loss'], members: 22, rating: 4.6, is_active: false, phone: '+91 65432 10987', experience: '3 years' },
]

export default function TrainersPage() {
  const [trainers, setTrainers] = useState(mockTrainers)
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <>
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5 max-w-7xl">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Trainers</h1>
          <p className="text-text-muted text-sm mt-0.5">Manage your training staff</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-blue hover:bg-blue-muted text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Add Trainer
        </button>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {trainers.map((trainer) => (
          <GlowCard key={trainer.id} className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue/10 border border-blue/20 rounded-xl flex items-center justify-center text-lg font-bold text-blue-soft">
                {trainer.name.split(' ').map(n => n[0]).join('')}
              </div>
              <StatusDot status={trainer.is_active ? 'active' : 'offline'} size="sm" label={trainer.is_active ? 'Active' : 'Off-duty'} />
            </div>

            <h3 className="font-semibold text-text-primary mb-0.5">{trainer.name}</h3>
            <p className="text-xs text-text-muted mb-3">{trainer.experience} experience</p>

            <div className="flex flex-wrap gap-1 mb-4">
              {trainer.speciality.map((s) => (
                <span key={s} className="text-xs bg-surface2 border border-border px-2 py-0.5 rounded-full text-text-muted">
                  {s}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-text-secondary">
                <Users className="w-3 h-3" />
                {trainer.members} members
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-text-secondary">{trainer.rating}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border flex items-center gap-1 text-xs text-text-muted">
              <Phone className="w-3 h-3" />
              {trainer.phone}
            </div>
          </GlowCard>
        ))}
      </motion.div>
    </motion.div>

    <AddTrainerModal
      open={showAddModal}
      onClose={() => setShowAddModal(false)}
      onAdd={(newTrainer) => {
        setTrainers((prev) => [{
          id: String(Date.now()),
          name: newTrainer.name,
          phone: newTrainer.phone,
          speciality: newTrainer.speciality,
          members: 0,
          rating: 5.0,
          is_active: true,
          experience: newTrainer.experience,
        }, ...prev])
      }}
    />
    </>
  )
}
