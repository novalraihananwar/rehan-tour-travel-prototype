import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sunset focus:ring-offset-2 tracking-wide',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-gradient-to-r from-sunset to-gold text-volcanic',
        secondary: 'border-transparent bg-volcanic-400 text-cream-dark border-white/8',
        destructive: 'border-transparent bg-lava/20 text-lava border-lava/30',
        outline: 'text-cream border-white/15',
        sunset: 'border-sunset/30 bg-sunset/12 text-sunset',
        gold: 'border-gold/30 bg-gold/12 text-gold',
        jungle: 'border-jungle/30 bg-jungle/12 text-jungle-light',
        ocean: 'border-ocean/30 bg-ocean/12 text-ocean-light',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
