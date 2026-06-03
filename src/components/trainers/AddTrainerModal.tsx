'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'

interface AddTrainerModalProps {
  open: boolean
  onClose: () => void
  onAdd?: (trainer: { name: string; phone: string; experience: string; speciality: string[] }) => void
}

const specialityOptions = ['Weight Training', 'HIIT', 'Yoga', 'Zumba', 'Pilates', 'Boxing', 'CrossFit', 'Nutrition', 'Weight Loss', 'Cardio', 'Strength', 'Stretching']

export function AddTrainerModal({ open, onClose, onAdd }: AddTrainerModalProps) {
  const [form, setForm] = useState({ name: '', phone: '', experience: '', speciality: [] as string[] })
  const [saving, setSaving] = useState(false)

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleSpeciality(s: string) {
    setForm((prev) => ({
      ...prev,
      speciality: prev.speciality.includes(s)
        ? prev.speciality.filter((x) => x !== s)
        : [...prev.speciality, s],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    if (form.speciality.length === 0) { toast.error('Select at least one speciality'); return }

    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    setSaving(false)

    onAdd?.({ ...form })
    toast.success(`Trainer added: ${form.name}`)
    setForm({ name: '', phone: '', experience: '', speciality: [] })
    onClose()
  }

  const inputClass = 'w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-blue/40 transition-colors'
  const labelClass = 'block text-xs text-text-muted mb-1.5'

  return (
    <Modal open={open} onClose={onClose} title="Add New Trainer">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full Name <span className="text-red">*</span></label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Arun Sharma" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 98765 43210" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Experience</label>
          <input value={form.experience} onChange={(e) => set('experience', e.target.value)} placeholder="e.g. 5 years" className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Specialities <span className="text-red">*</span></label>
          <div className="flex flex-wrap gap-2 mt-1">
            {specialityOptions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSpeciality(s)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  form.speciality.includes(s)
                    ? 'bg-blue/15 border-blue/30 text-blue-soft'
                    : 'bg-surface2 border-border text-text-muted hover:border-border'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {form.speciality.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap mt-2">
              {form.speciality.map((s) => (
                <span key={s} className="flex items-center gap-1 text-xs bg-blue/10 border border-blue/20 text-blue-soft px-2 py-0.5 rounded-full">
                  {s}
                  <button type="button" onClick={() => toggleSpeciality(s)}>
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm text-text-muted border border-border rounded-lg hover:bg-surface2 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 px-4 py-2 text-sm font-medium bg-blue hover:bg-blue-muted text-white rounded-lg transition-colors disabled:opacity-60">
            {saving ? 'Adding...' : 'Add Trainer'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
