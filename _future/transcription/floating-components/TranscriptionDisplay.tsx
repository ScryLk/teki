/**
 * @future TRANSCRIPTION_FEATURE
 * Arquivo isolado — não importar diretamente.
 * Ver _future/transcription/README.md para instruções de reintegração.
 * Movido em: 2026-03-16
 */

import { useEffect, useRef } from 'react';
import StreamingItalicText from './StreamingItalicText';

interface TranscriptionChunk {
  id: string;
  text: string;
  isFinal: boolean;
  timestamp: number;
}

interface Props {
  chunks: TranscriptionChunk[];
  aiStatus: string | null;
  maxLines?: number;
}

const TEXT_COLOR = 'rgba(255,255,255,0.75)';
const AI_COLOR = 'rgba(56, 217, 169, 0.8)';
const FONT = "'JetBrains Mono', 'Fira Code', monospace";

export default function TranscriptionDisplay({ chunks, aiStatus, maxLines = 4 }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chunks, aiStatus]);

  const recent = chunks.slice(-maxLines);
  const lastChunk = recent[recent.length - 1];
  const transcriptText = lastChunk ? `"${lastChunk.text}"` : '';

  return (
    <div
      ref={scrollRef}
      style={{
        overflow: 'hidden',
        padding: '0 12px',
        maxHeight: `${maxLines * 1.6}rem`,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {transcriptText && (
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, fontFamily: FONT }}>
          <StreamingItalicText
            text={transcriptText}
            speed={lastChunk?.isFinal ? 12 : 8}
            showCursor={!lastChunk?.isFinal}
            color={TEXT_COLOR}
          />
        </p>
      )}

      {aiStatus && (
        <p style={{ margin: 0, fontSize: 11, lineHeight: 1.4, fontFamily: FONT }}>
          <StreamingItalicText
            text={aiStatus}
            speed={14}
            showCursor={true}
            color={AI_COLOR}
          />
        </p>
      )}
    </div>
  );
}
