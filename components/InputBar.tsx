"use client";

import { useState, useRef, useCallback } from "react";

interface InputBarProps {
  onSend: (message: string, mode: "text" | "voice") => void;
  disabled?: boolean;
}

export default function InputBar({ onSend, disabled }: InputBarProps) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, "text");
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startVoice = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "zh-CN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        onSend(transcript.trim(), "voice");
      }
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [onSend]);

  const stopVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="border-t border-gray-100 bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        {voiceSupported && (
          <button
            onClick={isRecording ? stopVoice : startVoice}
            disabled={disabled}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-gray-100 text-gray-500 hover:bg-berry-100 hover:text-berry-500"
            }`}
            title={isRecording ? "停止录音" : "语音输入"}
          >
            🎤
          </button>
        )}

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRecording ? "正在聆听..." : "输入音乐心情..."}
          disabled={disabled || isRecording}
          className="flex-1 px-4 py-2.5 rounded-full bg-gray-50 border border-gray-100 focus:outline-none focus:border-berry-300 focus:ring-2 focus:ring-berry-100 text-sm transition-all disabled:opacity-50"
        />

        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="w-10 h-10 rounded-full bg-berry-500 text-white flex items-center justify-center flex-shrink-0 hover:bg-berry-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
