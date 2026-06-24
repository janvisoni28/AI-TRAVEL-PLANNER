import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Sparkles, Volume2, VolumeX } from "lucide-react";

interface VoiceAssistantProps {
  onVoiceInput: (text: string) => void;
  isAiResponding: boolean;
}

export default function VoiceAssistant({ onVoiceInput, isAiResponding }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [unsupported, setUnsupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for webkitSpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setUnsupported(true);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsListening(true);
      setTranscript("Listening carefully...");
    };

    rec.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(`"${text}"`);
      onVoiceInput(text);
    };

    rec.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      setTranscript(`Error: ${event.error}. Try typing your request.`);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
  }, [onVoiceInput]);

  const handleToggleListen = () => {
    if (unsupported) {
      // Simulation for sandbox fallback
      setIsListening(true);
      setTranscript("Listening... (Simulating speech input)");
      const simulatedQueries = [
        "What should I pack for Goa in December?",
        "Best restaurants in Manali for food lovers?",
        "How should I split expenses with my group?",
        "Suggest a budget travel style budget list"
      ];
      setTimeout(() => {
        const randomQuery = simulatedQueries[Math.floor(Math.random() * simulatedQueries.length)];
        setTranscript(`"${randomQuery}"`);
        onVoiceInput(randomQuery);
        setIsListening(false);
      }, 2500);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error("Error starting speech recognition:", err);
      }
    }
  };

  return (
    <div id="voice-assistant-widget" className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Absolute ambient light */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-400" />
          <h3 className="font-display font-semibold text-lg text-white">Voice Travel Assistant</h3>
        </div>
        
        <button
          onClick={() => setTtsEnabled(!ttsEnabled)}
          className={`p-1.5 rounded-lg border transition-all ${
            ttsEnabled ? "bg-teal-500/10 border-teal-500/20 text-teal-400" : "bg-slate-900 border-slate-800 text-slate-500"
          }`}
          title={ttsEnabled ? "Speech response active" : "Response muted"}
        >
          {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex flex-col items-center justify-center py-4 text-center">
        {/* Futuristic Audio waves */}
        <div className="h-14 flex items-center gap-1.5 justify-center mb-5">
          {isListening ? (
            Array.from({ length: 9 }).map((_, i) => (
              <span
                key={i}
                className="w-1 bg-teal-400 rounded-full animate-wave-height"
                style={{
                  height: "100%",
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${0.6 + (i % 3) * 0.2}s`,
                }}
              />
            ))
          ) : isAiResponding ? (
            Array.from({ length: 9 }).map((_, i) => (
              <span
                key={i}
                className="w-1 bg-indigo-400 rounded-full animate-wave-height"
                style={{
                  height: "60%",
                  animationDelay: `${i * 0.08}s`,
                  animationDuration: `${0.8 + (i % 2) * 0.3}s`,
                }}
              />
            ))
          ) : (
            <div className="w-14 h-14 rounded-full border border-slate-800/80 flex items-center justify-center bg-slate-950/60 shadow-inner">
              <Mic className="w-5 h-5 text-slate-500" />
            </div>
          )}
        </div>

        <button
          onClick={handleToggleListen}
          disabled={isAiResponding}
          className={`relative p-5 rounded-full transition-all duration-300 shadow-2xl flex items-center justify-center group ${
            isListening
              ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
              : "bg-teal-500 hover:bg-teal-400 hover:scale-105 text-slate-950 shadow-[0_0_20px_rgba(20,184,166,0.3)] disabled:opacity-50"
          }`}
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <p className="text-[11px] font-mono mt-4 text-slate-400 max-w-[240px] truncate h-4">
          {transcript || "Tap to speak travel commands"}
        </p>

        {unsupported && (
          <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 mt-3">
            Mic sandbox fallback mode active
          </span>
        )}
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.2); }
          50% { transform: scaleY(1); }
        }
        .animate-wave-height {
          animation: wave ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>
    </div>
  );
}
