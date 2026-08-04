/**
 * Fokus'ning eski (qo'lda yozilgan CSS'ga tayanadigan) primitivlari.
 *
 * Bular `shared/styles/legacy.css` dagi klasslar bilan ishlaydi va bosqichma-bosqich
 * `@/shared/ui/*` dagi shadcn komponentlariga ko'chiriladi. Yangi ekranlarda shadcn'ni
 * ishlating; bu yerga yangi komponent QO'SHMANG.
 */
export { Avatar } from "./avatar";
export type { AvatarProps, AvatarSize, AvatarTone } from "./avatar";
export { Brand } from "./brand";
export { Button } from "./button";
export type { ButtonProps } from "./button";
export { Dialog, DialogContent, DialogTrigger } from "./dialog";
export type { DialogContentProps } from "./dialog";
export { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "./dropdown";
export { LoadingFallback } from "./loading-fallback";
export { RouteState } from "./route-state";
export type { RouteStateProps } from "./route-state";
export { ThemeToggle, ThemeToggleButton } from "./theme-toggle";
