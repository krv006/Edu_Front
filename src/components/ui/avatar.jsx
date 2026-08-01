import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn, initials } from '../../lib/utils'

export function Avatar({ name, tone = 'violet', size = 'md', status, className }) {
  return (
    <span className={cn('avatar-wrap', className)}>
      <AvatarPrimitive.Root className={cn('avatar', `avatar--${size}`, `avatar--${tone}`)}>
        <AvatarPrimitive.Fallback>{initials(name)}</AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      {status === 'online' && <span className="avatar-status" aria-label="Onlayn" />}
    </span>
  )
}

