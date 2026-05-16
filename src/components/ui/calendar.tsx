'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

interface CalendarProps {
  onDateSelect?: (date: Date) => void
  selectedDate?: Date | null
  availableDates?: string[]
  highlightedDates?: string[]
  className?: string
}

export function BookingCalendar({
  onDateSelect,
  selectedDate,
  availableDates,
  highlightedDates,
  className,
}: CalendarProps) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const currentMonth = viewDate.toLocaleString('default', { month: 'long' })
  const currentYear = viewDate.getFullYear()
  const firstDayOfWeek = viewDate.getDay()
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewDate.getMonth() &&
      selectedDate.getFullYear() === viewDate.getFullYear()
    )
  }

  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === viewDate.getMonth() &&
      today.getFullYear() === viewDate.getFullYear()
    )
  }

  const isPast = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    return date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
  }

  const isAvailable = (day: number) => {
    if (!availableDates) return true
    const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return availableDates.includes(dateStr)
  }

  const isHighlighted = (day: number) => {
    if (!highlightedDates) return false
    const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return highlightedDates.includes(dateStr)
  }

  const handleDayClick = (day: number) => {
    if (isPast(day)) return
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    onDateSelect?.(date)
  }

  return (
    <div className={cn('glass-card rounded-2xl p-5 w-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-cream-muted hover:text-cream hover:bg-white/8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="font-display text-lg text-cream">
            {currentMonth} <span className="text-sunset">{currentYear}</span>
          </p>
        </div>
        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-cream-muted hover:text-cream hover:bg-white/8 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES.map((name) => (
          <div key={name} className="flex items-center justify-center h-8">
            <span className="text-xs text-cream-muted font-medium tracking-wider">{name}</span>
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {Array(firstDayOfWeek).fill(null).map((_, i) => (
          <div key={`empty-${i}`} className="h-9 w-full" />
        ))}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const day = i + 1
          const past = isPast(day)
          const selected = isSelected(day)
          const today_ = isToday(day)
          const available = isAvailable(day)
          const highlighted = isHighlighted(day)

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={past || (!available && !!availableDates)}
              className={cn(
                'h-9 w-full flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200',
                past
                  ? 'text-cream-muted/30 cursor-not-allowed'
                  : available
                    ? 'hover:bg-sunset/15 hover:text-sunset cursor-pointer'
                    : 'text-cream-muted/40 cursor-not-allowed',
                selected && 'bg-gradient-to-br from-sunset to-gold text-volcanic shadow-glow-sunset font-bold',
                today_ && !selected && 'ring-1 ring-sunset/40 text-sunset',
                highlighted && !selected && 'bg-gold/15 text-gold ring-1 ring-gold/30',
                !selected && !today_ && !past && available && 'text-cream'
              )}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-sunset to-gold" />
          <span className="text-xs text-cream-muted">Selected</span>
        </div>
        {highlightedDates && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gold/30 ring-1 ring-gold/50" />
            <span className="text-xs text-cream-muted">Departure</span>
          </div>
        )}
      </div>
    </div>
  )
}

export { BookingCalendar as Calendar }
