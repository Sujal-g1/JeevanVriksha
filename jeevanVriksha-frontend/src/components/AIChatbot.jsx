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
      const response = await fetch(`${API}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToProcess,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.reply || "Unable to get an AI response."
        );
      }

      if (typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("The AI returned an empty response.");
      }

      const reply = data.reply.trim();

      setMessages([
        ...newMessages,
        { role: "assistant", text: reply },
      ]);

      speakResponse(reply);
    } catch (error) {
      console.error("AI error:", error);

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          text: error.message || "Unable to connect to the AI service. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }

  };


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

    <div className="fixed inset-0 z-[9999] h-[100vh] h-[100dvh] overflow-hidden">

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
        initial={{ scale: 0.98, opacity: 0, y: 12 }}
    animate={{ scale: 1, opacity: 1, y: 0 }}
    transition={{ type: "spring", damping: 25 }}
    className="
      absolute inset-x-0 bottom-0 mx-auto
      flex h-[100vh] h-[100dvh] min-h-0 w-full max-w-2xl
      flex-col overflow-hidden overscroll-none
      border border-white/40 bg-white/95
      shadow-2xl backdrop-blur-2xl
      rounded-t-2xl
      sm:inset-y-1/2 sm:bottom-auto
      sm:h-[min(88dvh,700px)]
      sm:-translate-y-1/2 sm:rounded-3xl
    "
      >

        {/* HEADER */}

      <div className="flex shrink-0 items-center justify-between border-b border-slate-200/70 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">

            {/* <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg">
              <Sparkles className="text-white" size={20} />
            </div> */}
             <img src={Logo} alt="logo" className="h-10 w-10 shrink-0 rounded-xl object-contain sm:h-11 sm:w-11" />

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
      <div className="flex shrink-0 flex-col items-center px-3 py-3 sm:py-4">
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
            className="
            relative flex h-16 w-16 cursor-pointer items-center justify-center
            rounded-full
            bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-700
            shadow-[0_0_30px_rgba(59,130,246,0.35)]
            transition hover:scale-105
            sm:h-20 sm:w-20
          "
            >

              {isSpeaking
                ? <Activity size={32} className="text-white animate-pulse" />
                : <Mic size={32} className="text-white" />
              }

            </motion.div>

          </div>

          {/* STATUS TEXT */}

        <p className="mt-2 text-center text-xs font-semibold text-slate-600 sm:mt-3 sm:text-sm">
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
          <div className="mt-2 flex min-h-0 justify-center sm:mt-3">
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
          className="
          min-h-0 flex-1 overflow-y-auto overscroll-contain
          px-4 py-3 space-y-3
          sm:px-6
        "
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
        <div className="shrink-0 border-t border-slate-200/70 bg-white/80 p-3 sm:p-4">
        <div 
        className=" flex w-full min-w-0 items-center gap-2
        rounded-2xl border border-slate-200
        bg-white p-1.5 shadow-lg shadow-slate-200/40
        sm:p-2
      "
          >

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
              className=" min-w-0 flex-1 bg-transparent px-2 py-2
              text-sm text-slate-800 outline-none
              placeholder:text-slate-400
            "
            />

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              className=" flex h-10 w-10 shrink-0 items-center justify-center
              rounded-xl bg-blue-600 text-white shadow-md
              transition-colors hover:bg-blue-700
              disabled:cursor-not-allowed disabled:opacity-40
            "
            >
              <Send size={20} />
            </button>

              <button
                onClick={toggleMute}
                className=" flex h-10 w-10 shrink-0 items-center justify-center
                rounded-xl bg-slate-100 text-slate-600
                transition-colors hover:bg-slate-200
              "
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