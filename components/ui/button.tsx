import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base styles - touch-friendly with min-height 44px
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-orange-500',
        destructive: 'bg-destructive text-white hover:bg-red-500',
        outline: 'border border-border bg-transparent hover:bg-secondary text-foreground',
        secondary: 'bg-secondary text-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-secondary text-muted-foreground hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        success: 'bg-accent text-white hover:bg-green-500',
      },
      size: {
        // Touch-friendly: 44px mobile, 40px desktop
        default: 'h-11 min-h-[44px] sm:h-10 sm:min-h-[40px] px-5 py-2',
        sm: 'h-10 min-h-[40px] sm:h-9 sm:min-h-[36px] rounded-lg gap-1.5 px-4 text-xs',
        lg: 'h-12 min-h-[48px] rounded-xl px-8 text-base',
        icon: 'size-11 min-w-[44px] min-h-[44px] sm:size-10 rounded-xl',
        'icon-sm': 'size-10 min-w-[40px] min-h-[40px] sm:size-9 rounded-lg',
        'icon-lg': 'size-12 min-w-[48px] min-h-[48px] rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
