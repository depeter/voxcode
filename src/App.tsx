import { useRef, useState, useEffect, useCallback } from "react";
import { ChatContainer } from "./components/chat/ChatContainer";
import { InputBar } from "./components/chat/InputBar";
import { ApprovalBanner } from "./components/approval/ApprovalBanner";
import { Header } from "./components/layout/Header";
import { StatusBar } from "./components/layout/StatusBar";
import { MicButton } from "./components/audio/MicButton";
import { AudioWaveform } from "./components/audio/AudioWaveform";
import { TranscriptionPreview } from "./components/audio/TranscriptionPreview";
import { SessionSidebar } from "./components/session/SessionSidebar";
import { CommandPalette } from "./components/command-palette/CommandPalette";
import { SettingsDialog } from "./components/settings/SettingsDialog";
import { useChat } from "./hooks/useChat";
import { useAudio } from "./hooks/useAudio";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useSettingsStore } from "./stores/settingsStore";
import type { Session } from "./stores/sessionStore";
import * as tauri from "./lib/tauri";

export default function App() {
  const {
    messages,
    isLoading,
    streamingContent,
    pendingPermissions,
    send,
    interrupt,
    approvePermission,
    denyPermission,
    clearMessages,
  } = useChat();

  const {
    isRecording,
    audioLevel,
    transcription,
    isModelLoaded,
    startRecording,
    stopRecording,
    loadModel,
  } = useAudio();

  const { setCwd } = useSettingsStore();

  const [isConnected, setIsConnected] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Track sidecar connection
  useEffect(() => {
    tauri.onSessionReady(() => setIsConnected(true));
    tauri.onSidecarExited(() => setIsConnected(false));
    tauri.isSidecarRunning().then(setIsConnected).catch(() => {});
  }, []);

  // Handle transcription -> input bar
  const handleTranscription = useCallback((text: string) => {
    if (text && inputRef.current) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value"
      )?.set;
      const current = inputRef.current.value;
      const newValue = current ? current + " " + text : text;
      nativeInputValueSetter?.call(inputRef.current, newValue);
      inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }, []);

  // Session select
  const handleSessionSelect = useCallback(
    (_session: Session) => {
      setCwd(_session.cwd);
      setSidebarOpen(false);
    },
    [setCwd]
  );

  // Command palette
  const handleCommand = useCallback(
    (command: string) => {
      switch (command) {
        case "clear":
          clearMessages();
          break;
        case "settings":
          setSettingsOpen(true);
          break;
        case "plan":
          send("/plan");
          break;
        case "compact":
          send("/compact");
          break;
        case "usage":
          send("/usage");
          break;
        default:
          break;
      }
    },
    [clearMessages, send]
  );

  // Keyboard shortcuts
  const handleApproveFirst = useCallback(() => {
    if (pendingPermissions.length > 0) {
      approvePermission(pendingPermissions[0].requestId);
    }
  }, [pendingPermissions, approvePermission]);

  const handleDenyFirst = useCallback(() => {
    if (pendingPermissions.length > 0) {
      denyPermission(pendingPermissions[0].requestId);
    }
  }, [pendingPermissions, denyPermission]);

  const handleFocusInput = useCallback(() => {
    if (!commandPaletteOpen) {
      inputRef.current?.focus();
    }
  }, [commandPaletteOpen]);

  useKeyboardShortcuts({
    onApprove: handleApproveFirst,
    onDeny: handleDenyFirst,
    onInterrupt: interrupt,
    onFocusInput: handleFocusInput,
  });

  // Ctrl+K for command palette
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen">
      <SessionSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSessionSelect={handleSessionSelect}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <Header
          onClear={clearMessages}
        />
        <ChatContainer
          messages={messages}
          streamingContent={streamingContent}
          isLoading={isLoading}
        />
        <ApprovalBanner
          requests={pendingPermissions}
          onApprove={approvePermission}
          onDeny={denyPermission}
        />
        <TranscriptionPreview text={transcription} isRecording={isRecording} />
        <InputBar
          onSend={send}
          onInterrupt={interrupt}
          isLoading={isLoading}
          inputRef={inputRef}
          micButton={
            <MicButton
              isRecording={isRecording}
              isModelLoaded={isModelLoaded}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onTranscription={handleTranscription}
            />
          }
          audioWaveform={
            <AudioWaveform level={audioLevel} isRecording={isRecording} />
          }
        />
        <StatusBar
          isConnected={isConnected}
          isLoading={isLoading}
          pendingApprovals={pendingPermissions.length}
        />
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onCommand={handleCommand}
      />
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        isModelLoaded={isModelLoaded}
        onLoadModel={loadModel}
      />
    </div>
  );
}
