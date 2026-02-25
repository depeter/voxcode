interface TranscriptionPreviewProps {
  text: string;
  isRecording: boolean;
}

export function TranscriptionPreview({
  text,
  isRecording,
}: TranscriptionPreviewProps) {
  if (!isRecording && !text) return null;

  return (
    <div className="px-4 py-2 bg-violet-950/20 border-t border-violet-800/30 text-sm">
      {isRecording && !text && (
        <span className="text-violet-400 animate-pulse">Listening...</span>
      )}
      {text && <span className="text-zinc-300">{text}</span>}
    </div>
  );
}
