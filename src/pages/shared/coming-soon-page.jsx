import { Construction } from "lucide-react";

export function ComingSoonPage({ title = "Bo‘lim tayyorlanmoqda" }) {
  return <div className="portal-page"><div className="portal-empty"><Construction size={32} /><h1>{title}</h1><p>Bu bo‘lim keyingi rivojlantirish bosqichida to‘ldiriladi.</p></div></div>;
}
