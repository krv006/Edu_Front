/* eslint-disable react-refresh/only-export-components */
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export const Dropdown = DropdownMenu.Root
export const DropdownTrigger = DropdownMenu.Trigger
export function DropdownContent({ children, align = 'end', className = '' }) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content className={`dropdown-content ${className}`} align={align} sideOffset={8}>
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  )
}
export function DropdownItem({ children, destructive = false, ...props }) {
  return <DropdownMenu.Item className={`dropdown-item ${destructive ? 'destructive' : ''}`} {...props}>{children}</DropdownMenu.Item>
}
