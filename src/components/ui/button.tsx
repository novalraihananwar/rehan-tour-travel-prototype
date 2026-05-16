import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 tracking-wide',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-sunset to-gold text-volcanic shadow-glow-sunset hover:shadow-[0_6px_30px_rgba(232,112,58,0.5)] hover:-translate-y-0.5',
        destructive: 'bg-lava text-cream hover:bg-lava/90',
        outline:
          'border border-white/15 text-cream hover:border-sunset/40 hover:bg-sunset/8 bg-transparent',
        secondary: 'bg-volcanic-400 text-cream hover:bg-volcanic-500 border border-white/8',
        ghost: 'text-cream hover:bg-white/5',
        link: 'text-sunset underline-offset-4 hover:underline',
        glow: 'border border-sunset/30 text-sunset bg-sunset/8 hover:bg-sunset/15 hover:border-sunset/50',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-13 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
