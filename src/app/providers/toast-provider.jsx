import { Toaster } from "sonner";

export function ToastProvider() {
  return <Toaster position="top-right" toastOptions={{ className: "fokus-toast" }} />;
}
