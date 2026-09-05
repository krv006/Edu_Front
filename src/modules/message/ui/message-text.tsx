import { useMemo } from "react";
import { PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { tokenizeMessageText } from "../lib/linkify";

export interface MessageTextProps {
  text: string;
}

/** Video yozuvi havolasi — xom URL o'rniga tanish belgi bilan ko'rsatiladi. */
const RECORDING_PATH = /^\/recordings\//;

/**
 * Xabar matni: doska/yozuv havolalari ilova ichida ochiladi, tashqi havolalar
 * yangi oynada. Matn React tugunlari sifatida quriladi — HTML injeksiya bo'lmaydi.
 */
export function MessageText({ text }: MessageTextProps) {
  const tokens = useMemo(() => tokenizeMessageText(text), [text]);

  return (
    <p>
      {tokens.map((token, index) => {
        if (token.kind === "internal" && RECORDING_PATH.test(token.href)) {
          return (
            <Link
              key={index}
              className="message-recording-chip"
              to={token.href}
              onClick={(event) => event.stopPropagation()}
            >
              <PlayCircle size={15} /> Video yozuvni ko‘rish
            </Link>
          );
        }
        if (token.kind === "internal") {
          return (
            <Link
              key={index}
              className="message-link"
              to={token.href}
              onClick={(event) => event.stopPropagation()}
            >
              {token.value}
            </Link>
          );
        }
        if (token.kind === "external") {
          return (
            <a
              key={index}
              className="message-link"
              href={token.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
            >
              {token.value}
            </a>
          );
        }
        return <span key={index}>{token.value}</span>;
      })}
    </p>
  );
}
