import React from 'react'
import { cn } from '@/lib/utils'
import { cva, VariantProps } from 'class-variance-authority'

const glowVariants = cva('absolute w-full pointer-events-none', {
  variants: {
    variant: {
      top: 'top-0',
      above: '-top-[128px]',
      bottom: 'bottom-0',
      below: '-bottom-[128px]',
      center: 'top-[50%]',
    },
    color: {
      sunset: '',
      gold: '',
      ocean: '',
      white: '',
    },
  },
  defaultVariants: { variant: 'top', color: 'sunset' },
})

const colorMap = {
  sunset: { outer: 'rgba(232,112,58,0.4)', inner: 'rgba(232,112,58,0.25)' },
  gold: { outer: 'rgba(212,168,67,0.35)', inner: 'rgba(212,168,67,0.2)' },
  ocean: { outer: 'rgba(30,111,175,0.35)', inner: 'rgba(30,111,175,0.2)' },
  white: { outer: 'rgba(255,255,255,0.2)', inner: 'rgba(255,255,255,0.12)' },
}

type GlowColor = keyof typeof colorMap

const Glow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof glowVariants>
>(({ className, variant, color = 'sunset', ...props }, ref) => {
  const c = colorMap[(color as GlowColor) ?? 'sunset']
  return (
    <div ref={ref} className={cn(glowVariants({ variant, color }), className)} {...props}>
      <div
        className={cn(
          'absolute left-1/2 h-[256px] w-[60%] -translate-x-1/2 scale-[2.5] rounded-[50%] sm:h-[512px]',
          variant === 'center' && '-translate-y-1/2'
        )}
        style={{
          background: `radial-gradient(ellipse at center, ${c.outer} 10%, transparent 60%)`,
        }}
      />
      <div
        className={cn(
          'absolute left-1/2 h-[128px] w-[40%] -translate-x-1/2 scale-[2] rounded-[50%] sm:h-[256px]',
          variant === 'center' && '-translate-y-1/2'
        )}
        style={{
          background: `radial-gradient(ellipse at center, ${c.inner} 10%, transparent 60%)`,
        }}
      />
    </div>
  )
})
Glow.displayName = 'Glow'
export { Glow }
