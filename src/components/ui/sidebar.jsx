import { cn } from "@/shared/lib";

export function Sidebar({ collapsed = false, className, children, ...props }) {
  return (
    <aside
      className={cn(
        "teacher-sidebar",
        collapsed && "teacher-sidebar--collapsed",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

export function SidebarContent({ className, children, ...props }) {
  return (
    <nav className={cn("sidebar-nav", className)} {...props}>
      {children}
    </nav>
  );
}

export function SidebarFooter({ className, children, ...props }) {
  return (
    <div className={cn("sidebar-footer", className)} {...props}>
      {children}
    </div>
  );
}
