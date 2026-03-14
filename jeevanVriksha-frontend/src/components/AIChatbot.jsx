import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Send,
  X,
  Square,
  Sparkles,
  Activity,
  VolumeX,
  Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../assets/logo.png";

const API = import.meta.env.VITE_API_URL;



const AIChatbot = ({ close }) => {

  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! I am your health assistant. How can I help?" }
  ]);

  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mute, setMute] = useState(false);

  const scrollRef = useRef(null);

  // ---------- AUTO SCROLL ----------

  useEffect(() => {

    if (scrollRef.current) {

      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });

    }

  }, [messages, loading]);

  // ---------- STOP SPEAKING ----------

  const stopSpeaking = () => {

    if (window.speechSynthesis) {

      window.speechSynthesis.cancel();
      setIsSpeaking(false);

    }

  };

  // ---------- SPEAK RESPONSE ----------

  const speakResponse = (text) => {

    stopSpeaking();

    if (mute) return;

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "hi-IN";

    speech.onstart = () => setIsSpeaking(true);
    speech.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(speech);

  };

  // ---------- SEND MESSAGE ----------

  const sendMessage = async (manualText) => {

    const textToProcess = manualText || input;

    if (!textToProcess.trim()) return;

    stopSpeaking();

    const newMessages = [
      ...messages,
      { role: "user", text: textToProcess }
    ];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {

      const response = await fetch(
        `${API}/api/ai/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: textToProcess })
        }
      );

      const data = await response.json();

      const reply = data.reply;

      setMessages([
        ...newMessages,
        { role: "assistant", text: reply }
      ]);

      speakResponse(reply);

    } catch (error) {

      console.error("AI error:", error);

    } finally {

      setLoading(false);

    }

  };

  // ---------- VOICE INPUT ----------

  // ---------- MUTE ----------
  const startVoiceInput = () => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

      alert("Voice recognition not supported");
      return;

    }

    const recognition = new SpeechRecognition();

    recognition.lang = "hi-IN";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {

      const transcript =
        event.results[0][0].transcript;

      setInput(transcript);

      sendMessage(transcript);

    };

    recognition.start();

  };

  const toggleMute = () => {

  if (!mute) {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }

  setMute(!mute);

};

  return (

    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">

      {/* BACKDROP */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
        onClick={close}
      />

      {/* CONTAINER */}

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full max-w-2xl max-h-[95vh]
        bg-white/80 backdrop-blur-2xl
        sm:rounded-[3rem] rounded-t-[2.5rem]
        shadow-2xl flex flex-col
        border border-white/40 overflow-hidden"
      >

        {/* HEADER */}

        <div className="p-5 flex justify-between items-center border-b border-gray-200/30">

          <div className="flex items-center gap-3">

            {/* <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg">
              <Sparkles className="text-white" size={20} />
            </div> */}
             <img src={Logo} alt="logo" className="h-15 w-15 object-contain rounded-lg p-0.5" />

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                SEVA-AI
              </h2>

              <div className="flex items-center gap-1.5">

                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />

                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                 
                </span>

              </div>

            </div>

          </div>

          <button
            onClick={close}
            className="p-2 hover:bg-black/5 rounded-full"
          >
            <X size={22} />
          </button>

        </div>

        {/* AI ORB */}

        <div className="flex flex-col items-center py-6">

          <div className="relative flex items-center justify-center">

            {/* GLOW */}

            <AnimatePresence>

              {(isListening || isSpeaking) && (

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0.1, 0.3]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5
                  }}
                  className={`absolute w-36 h-36 rounded-full
                    ${isListening ? "bg-red-500" : "bg-blue-500"}
                    blur-xl`}
                />

              )}

            </AnimatePresence>

            {/* ORB */}

            <motion.div
            onClick={startVoiceInput}
            animate={{
            scale: isListening ? 1.2 : 1,
            rotate: isSpeaking ? 360 : 0
            }}
            transition={{
            rotate: {
            duration: 8,
            repeat: Infinity,
            ease: "linear"
                }
            }}
            className="w-24 h-24 rounded-full
            bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-700
            shadow-[0_0_40px_rgba(59,130,246,0.6)]
            flex items-center justify-center
            cursor-pointer hover:scale-105 transition"
            >

              {isSpeaking
                ? <Activity size={32} className="text-white animate-pulse" />
                : <Mic size={32} className="text-white" />
              }

            </motion.div>

          </div>

          {/* STATUS TEXT */}

          <p className="mt-4 text-sm font-semibold text-slate-600">

            {isListening
              ? "Listening..."
              : isSpeaking
              ? "Speaking..."
              : "Tap mic and ask your health question"}

          </p>

          {/* WAVEFORM */}

          {isListening && (

            <div className="flex gap-1 mt-3">

              {[...Array(5)].map((_, i) => (

                <motion.div
                  key={i}
                  animate={{ height: [10, 25, 10] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1
                  }}
                  className="w-1 bg-red-500 rounded-full"
                />

              ))}

            </div>

          )}

          {/* STOP BUTTON */}

          <div className="h-12 mt-4">

            <AnimatePresence>

              {isSpeaking && (

                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={stopSpeaking}
                  className="flex items-center gap-2 px-6 py-2
                  bg-red-600 text-white rounded-full text-xs font-black shadow-xl"
                >
                  <Square size={14} fill="white" />
                  STOP RESPONSE
                </motion.button>

              )}

            </AnimatePresence>

          </div>

        </div>

        {/* CHAT HISTORY */}

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 space-y-4 pb-4"
        >

          {messages.map((m, i) => (

            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user"
                ? "justify-end"
                : "justify-start"
                }`}
            >

              <div
                className={`max-w-[80%] md:max-w-[70%] p-4
                rounded-[1.8rem] text-sm leading-relaxed shadow-sm
                ${m.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                  }`}
              >

                {m.text}

              </div>

            </motion.div>

          ))}

          {loading && (

            <div className="flex items-center gap-2 text-xs text-gray-400">

              <span className="flex gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </span>

              AI thinking...

            </div>

          )}

        </div>

        {/* INPUT BAR */}

        <div className="p-4 sm:p-6 bg-white/60">

          <div className="flex items-center gap-2
          bg-white/90 backdrop-blur-xl
          p-2 rounded-2xl shadow-lg border border-white/50">

            {/* <button
              onClick={startVoiceInput}
              className={`p-3.5 rounded-xl transition-all
              ${isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                }`}
            >
              <Mic size={20} />
            </button> */}

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && sendMessage()
              }
              placeholder="Ask a health question..."
              className="flex-1 bg-transparent outline-none text-slate-800 px-2"
            />

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              className="p-3.5 bg-blue-600 text-white rounded-xl shadow-lg
              hover:bg-blue-700 disabled:opacity-20"
            >
              <Send size={20} />
            </button>

              <button
                onClick={toggleMute}
                className="p-3 rounded-xl bg-black/5"
                >
             {mute ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

          </div>

        </div>

      </motion.div>

    </div>

  );

};

export default AIChatbot;