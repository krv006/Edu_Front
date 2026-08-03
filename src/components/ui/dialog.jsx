/* eslint-disable react-refresh/only-export-components */
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export function Dialog({ open, onOpenChange, children }) {
  return <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>{children}</DialogPrimitive.Root>
}

export const DialogTrigger = DialogPrimitive.Trigger

function keepPickerInteractionInside(event) {
  const target = event.target
  if (target instanceof Element && target.closest('.form-picker-popover')) {
    event.preventDefault()
  }
}

export function DialogContent({ title, description, children, className = '', motionPreset = 'modal', closeable = true }) {
  const isSheet = motionPreset === 'right-sheet'
  return (
    <AnimatePresence>
      <DialogPrimitive.Portal forceMount>
        <DialogPrimitive.Overlay asChild>
          <motion.div className="dialog-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
        </DialogPrimitive.Overlay>
        <DialogPrimitive.Content
          asChild
          onPointerDownOutside={(event) => { if (!closeable) event.preventDefault(); else keepPickerInteractionInside(event) }}
          onInteractOutside={(event) => { if (!closeable) event.preventDefault(); else keepPickerInteractionInside(event) }}
          onEscapeKeyDown={(event) => { if (!closeable) event.preventDefault() }}
        >
          <motion.div
            className={`dialog-content ${className}`}
            initial={isSheet ? { opacity: 0, x: '100%' } : { opacity: 0, scale: 0.96, y: 14 }}
            animate={isSheet ? { opacity: 1, x: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isSheet ? { opacity: 0, x: '100%' } : { opacity: 0, scale: 0.97, y: 8 }}
            transition={isSheet ? { duration: .26, ease: [0.22, 1, 0.36, 1] } : { type: 'spring', stiffness: 380, damping: 30 }}
          >
            <div className="dialog-heading">
              <div>
                <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
                {description && <DialogPrimitive.Description>{description}</DialogPrimitive.Description>}
              </div>
              {closeable ? <DialogPrimitive.Close className="icon-button" aria-label="Yopish"><X size={19} /></DialogPrimitive.Close> : null}
            </div>
            {children}
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </AnimatePresence>
  )
}
