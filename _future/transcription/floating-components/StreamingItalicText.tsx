/**
 * @future TRANSCRIPTION_FEATURE
 * Arquivo isolado — não importar diretamente.
 * Ver _future/transcription/README.md para instruções de reintegração.
 * Movido em: 2026-03-16
 */

import { useEffect, useState, useRef } from 'react';

interface StreamingItalicTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  showCursor?: boolean;
  color?: string;
}

export default function StreamingItalicText({
  text,
  speed = 18,
  onComplete,
  className = '',
  showCursor = true,
  color,
}: StreamingItalicTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const prevText = useRef('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const isExtension = text.startsWith(prevText.current);
    const startFrom = isExtension ? prevText.current.length : 0;

    if (!isExtension) {
      setDisplayed(text.slice(0, startFrom));
    }

    prevText.current = text;
    setDone(false);

    let index = isExtension ? displayed.length : startFrom;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (index >= text.length) {
        clearInterval(intervalRef.current!);
        setDone(true);
        onComplete?.();
        return;
      }
      setDisplayed(text.slice(0, index + 1));
      index++;
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]);

  return (
    <span className={className} style={{ fontStyle: 'italic', color }}>
      {displayed}
      {showCursor && !done && (
        <span
          style={{
            display: 'inline-block',
            width: 2,
            height: '0.9em',
            marginLeft: 2,
            verticalAlign: 'middle',
            backgroundColor: color ?? 'currentColor',
            animation: 'tekiBlink 0.8s ease-in-out infinite',
          }}
        />
      )}
    </span>
  );
}
