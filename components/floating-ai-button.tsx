"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X, Mic, MicOff, Volume2, VolumeX, Loader2, Sparkles, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getClimateResponse, type LLMMessage } from "@/lib/llm-service"
import { getCachedClimateContext } from "@/lib/climate-context"

interface FloatingAIButtonProps {
  location?: {
    name: string
    lat: number
    lon: number
    timezone?: string
  }
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// Speech recognition types
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: any) => any) | null
  onerror: ((this: SpeechRecognition, ev: any) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
}

const SUGGESTED_QUESTIONS = [
  "What are the biggest risks right now?",
  "Should I be concerned about flooding?",
  "What should I prepare for this week?",
  "How does today compare to normal?",
]

export function FloatingAIButton({ location }: FloatingAIButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [inputText, setInputText] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationHistory, setConversationHistory] = useState<LLMMessage[]>([])
  const [speechSupported, setSpeechSupported] = useState(false)
  const [hasCritical, setHasCritical] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)

  const currentLocation = location || { name: "New York City", lat: 40.7128, lon: -74.006 }

  useEffect(() => {
    if (typeof window === "undefined") return
    const SR = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SR && window.speechSynthesis) {
      setSpeechSupported(true)
      const rec = new SR() as SpeechRecognition
      rec.continuous = false
      rec.interimResults = false
      rec.lang = "en-US"
      rec.onstart = () => setIsListening(true)
      rec.onresult = (ev: any) => {
        const transcript = ev.results[0][0].transcript
        setInputText(transcript)
        handleAsk(transcript)
      }
      rec.onerror = () => setIsListening(false)
      rec.onend = () => setIsListening(false)
      recognitionRef.current = rec
      synthesisRef.current = window.speechSynthesis
    }
    // Check for critical alerts in localStorage to show badge
    const stored = localStorage.getItem("climateguard_critical_count")
    if (stored && parseInt(stored) > 0) setHasCritical(true)
  }, [])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: `Hi! I'm your ClimateGuard AI assistant. I have real-time climate data for **${currentLocation.name}**. Ask me anything about current risks, forecasts, or what you should do to prepare.`,
        timestamp: new Date(),
      }])
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleAsk = async (text: string) => {
    if (!text.trim() || isProcessing) return
    const question = text.trim()
    setInputText("")
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: question, timestamp: new Date() }])
    setIsProcessing(true)
    try {
      const context = await getCachedClimateContext(currentLocation)
      const answer = await getClimateResponse(question, context, conversationHistory)
      setConversationHistory(prev => [
        ...prev.slice(-6),
        { role: "user", content: question },
        { role: "assistant", content: answer }
      ])
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: answer, timestamp: new Date() }])
      // Auto-speak if user asked via voice
      if (isListening && synthesisRef.current) {
        const utterance = new SpeechSynthesisUtterance(answer.substring(0, 300))
        utterance.rate = 0.95
        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        synthesisRef.current.speak(utterance)
      }
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "I'm having trouble connecting right now. Please check the dashboard directly for current risk information.", timestamp: new Date() }])
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleVoice = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }

  const stopSpeech = () => {
    synthesisRef.current?.cancel()
    setIsSpeaking(false)
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-80 sm:w-96 glass-panel rounded-2xl border border-[#00E5FF]/20 shadow-[0_0_30px_rgba(0,229,255,0.15)] overflow-hidden pointer-events-auto flex flex-col origin-bottom-right"
              style={{ maxHeight: "70vh" }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#00E5FF]/10 to-transparent p-4 border-b border-outline/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.8)] animate-pulse"></div>
                  <div>
                    <span className="font-label text-xs uppercase tracking-widest text-[#00E5FF] font-bold block">Sentinel Voice AI</span>
                    <span className="text-[10px] text-slate-400 font-label">{currentLocation.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {speechSupported && (
                    <button
                      onClick={isSpeaking ? stopSpeech : undefined}
                      disabled={!isSpeaking}
                      className={`material-symbols-outlined text-sm hover:text-white transition-colors ${isSpeaking ? 'text-[#00E5FF] animate-pulse' : 'text-slate-500'}`}
                    >
                      {isSpeaking ? 'volume_off' : 'volume_up'}
                    </button>
                  )}
                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="material-symbols-outlined text-slate-400 hover:text-white text-sm transition-colors cursor-pointer ml-2"
                  >
                    close
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 custom-scrollbar relative" style={{ maxHeight: "calc(70vh - 140px)" }}>
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed font-body ${
                      msg.role === "user"
                        ? "bg-[#00E5FF]/20 text-white rounded-br-sm border border-[#00E5FF]/30"
                        : "bg-surface-container-low text-slate-200 rounded-bl-sm border border-outline/10"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-surface-container-low rounded-2xl rounded-bl-sm px-4 py-3 border border-outline/10">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Questions */}
              {messages.length <= 1 && (
                <div className="px-4 pb-3 flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map(q => (
                    <button
                      key={q}
                      onClick={() => handleAsk(q)}
                      disabled={isProcessing}
                      className="text-[11px] font-label px-3 py-1.5 rounded border border-outline/20 bg-surface-container-low hover:bg-white/5 transition-colors text-slate-300 hover:text-white"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-outline/10 bg-black/20 flex gap-2 items-center">
                {speechSupported && (
                  <button
                    onClick={toggleVoice}
                    disabled={isProcessing}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                      isListening 
                        ? 'bg-error/20 text-error border border-error/30 animate-pulse shadow-[0_0_15px_rgba(255,59,48,0.3)]' 
                        : 'bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF]/20'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isListening ? 'mic_off' : 'mic'}
                    </span>
                  </button>
                )}
                
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleAsk(inputText)}
                  placeholder={isListening ? "Listening..." : "Type or speak securely..."}
                  disabled={isListening || isProcessing}
                  className="flex-1 bg-surface-container-low border border-outline/10 rounded-full px-4 h-9 focus:outline-none focus:border-[#00E5FF]/50 font-body text-sm text-white placeholder-slate-500 transition-colors"
                />
                
                <button
                  onClick={() => handleAsk(inputText)}
                  disabled={!inputText.trim() || isProcessing}
                  className="w-9 h-9 rounded-full bg-[#00E5FF] flex items-center justify-center text-black hover:bg-white transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-full bg-[#00E5FF] flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(0,229,255,0.4)] pointer-events-auto group mt-2"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <span className="material-symbols-outlined text-black text-2xl font-bold">close</span>
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <span className="material-symbols-outlined text-black text-2xl font-bold group-hover:scale-110 transition-transform">graphic_eq</span>
              </motion.div>
            )}
          </AnimatePresence>
          {hasCritical && !isOpen && (
             <span className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full border-2 border-background animate-pulse shadow-[0_0_10px_rgba(255,59,48,0.8)]" />
          )}
        </motion.button>
      </div>
    </>
  )
}
