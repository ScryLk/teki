import { useState, useEffect, useRef } from 'react';

const ACCENT = '#00d4ff';

interface WaveformProps {
  active: boolean;
  analyser?: AnalyserNode | null;
}

export default function Waveform({ active, analyser }: WaveformProps) {
  const [bars, setBars] = useState<number[]>(Array(32).fill(2));
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      setBars(Array(32).fill(2));
      return;
    }

    if (analyser) {
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        setBars([...data.slice(0, 32)].map((v) => Math.max(2, v / 7)));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      // Fallback animated waveform
      const animate = () => {
        setBars((prev) =>
          prev.map((_, i) => {
            const base = Math.sin(Date.now() / 200 + i * 0.5) * 12 + 14;
            return Math.max(2, base + Math.random() * 8);
          }),
        );
        rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [active, analyser]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 36 }}>
      {bars.map((v, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: Math.max(2, Math.min(36, v)),
            borderRadius: 2,
            background: ACCENT,
            opacity: 0.5 + (v / 36) * 0.5,
            transition: 'height 0.06s ease',
            boxShadow: v > 18 ? `0 0 4px ${ACCENT}66` : 'none',
          }}
        />
      ))}
    </div>
  );
}
