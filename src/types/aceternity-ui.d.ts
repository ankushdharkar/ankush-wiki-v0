declare module 'aceternity-ui' {
  import { ReactNode } from 'react'

  interface TooltipItem {
    id: number
    name: string
    designation: string
    image: string
  }

  interface AnimatedTooltipProps {
    items: TooltipItem[]
  }

  interface BackgroundGradientProps {
    children: ReactNode
    className?: string
  }

  interface TextRevealProps {
    text: string
  }

  interface GlowingButtonProps {
    children: ReactNode
    className?: string
  }

  interface FloatingCardProps {
    children: ReactNode
    className?: string
  }

  interface AnimatedBorderCardProps {
    children: ReactNode
    className?: string
  }

  export const AnimatedTooltip: React.FC<AnimatedTooltipProps>
  export const BackgroundGradient: React.FC<BackgroundGradientProps>
  export const TextReveal: React.FC<TextRevealProps>
  export const GlowingButton: React.FC<GlowingButtonProps>
  export const FloatingCard: React.FC<FloatingCardProps>
  export const AnimatedBorderCard: React.FC<AnimatedBorderCardProps>
}