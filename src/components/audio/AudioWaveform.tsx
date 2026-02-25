import { useEffect, useRef } from "react";

interface AudioWaveformProps {
  level: number;
  isRecording: boolean;
}

export function AudioWaveform({ level, isRecording }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<number[]>([]);

  useEffect(() => {
    if (!isRecording) {
      historyRef.current = [];
      return;
    }

    historyRef.current.push(level);
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const history = historyRef.current;
    const barWidth = w / 50;

    for (let i = 0; i < history.length; i++) {
      const barHeight = Math.max(2, history[i] * h * 5);
      const x = i * barWidth;
      const y = (h - barHeight) / 2;

      ctx.fillStyle = `rgba(139, 92, 246, ${0.3 + history[i] * 3})`;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    }
  }, [level, isRecording]);

  if (!isRecording) return null;

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={32}
      className="rounded bg-zinc-900/50"
    />
  );
}
