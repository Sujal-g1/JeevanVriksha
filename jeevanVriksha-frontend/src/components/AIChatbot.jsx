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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const textToProcess = (manualText ?? input).trim();

  if (!textToProcess || loading) return;

  stopSpeaking();

  const newMessages = [
    ...messages,
    { role: "user", text: textToProcess },
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

    // Read the body safely, even if the server returns HTML or invalid JSON.
    const rawResponse = await response.text();

    let data = {};

    try {
      data = rawResponse ? JSON.parse(rawResponse) : {};
    } catch {
      console.error("AI server returned non-JSON:", rawResponse);
    }

    if (!response.ok) {
      console.error("AI API error:", {
        status: response.status,
        statusText: response.statusText,
        body: data,
      });

      if (response.status === 502 || response.status === 503 ||
          response.status === 504) {
        throw new Error(
          "The AI service is temporarily unavailable. Please try again shortly."
        );
      }

      throw new Error(
        data.reply ||
        data.message ||
        `AI request failed (${response.status}).`
      );
    }

    // Support common response shapes while diagnosing the API.
    const reply =
      typeof data.reply === "string" ? data.reply.trim() :
      typeof data.response === "string" ? data.response.trim() :
      typeof data.message === "string" ? data.message.trim() :
      "";

    if (!reply) {
      console.error("Unexpected AI response structure:", data);
      throw new Error(
        "The AI service returned no answer. Please try again."
      );
    }

    setMessages([
      ...newMessages,
      { role: "assistant", text: reply },
    ]);

    speakResponse(reply);
  } catch (error) {
    console.error("AI chat request failed:", error);

    setMessages([
      ...newMessages,
      {
        role: "assistant",
        text: error.message ||
          "Unable to connect to the AI service. Please try again.",
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
      flex h-[100dvh] min-h-0 w-full max-w-2xl
      flex-col overflow-hidden overscroll-none
      border border-blue-200/70
      bg-[radial-gradient(ellipse_at_top_left,rgba(35,109,181,0.30),transparent_44%),radial-gradient(ellipse_at_bottom_right,rgba(98,168,232,0.40),transparent_42%),linear-gradient(135deg,#B9DEFF_0%,#E5F2FF_35%,#C9E4FF_68%,#A9D2F5_100%)]
      shadow-2xl shadow-blue-900/15
      backdrop-blur-2xl
      rounded-t-2xl
      sm:inset-y-1/2 sm:bottom-auto
      sm:h-[min(88dvh,700px)]
      sm:-translate-y-1/2 sm:rounded-3xl
"
      >

        {/* HEADER */}

      <div className="flex shrink-0 items-center justify-between border-b border-blue-300/70 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">

          <img src={Logo} alt="logo" className="h-12 w-12 shrink-0 bg-blue-200 rounded-xl object-contain sm:h-11 sm:w-11" />

            <div>
              <h2 className="text-lg font-bold text-blue-800">
                SEVA-AI
              </h2>

              <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
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
                className={`min-w-0 p-4 text-sm leading-relaxed shadow-sm
                ${
                  m.role === "user"
                    ? "max-w-[85%] rounded-[1.5rem] rounded-tr-none bg-white/70 text-slate-700"
                    : "w-fit max-w-[95%] rounded-[1.5rem] rounded-tl-none border border-blue-200/70 bg-white/75 text-slate-700 backdrop-blur-sm sm:max-w-[90%]"
                }
              `}
              >
            {m.role === "assistant" ? (
              <div
                className="
                  text-sm leading-7 text-slate-700
                  [&_p]:mb-3
                  [&_p:last-child]:mb-0
                  [&_h1]:mb-3 [&_h1]:mt-5
                  [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-blue-900
                  [&_h2]:mb-2 [&_h2]:mt-5
                  [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-blue-900
                  [&_h3]:mb-2 [&_h3]:mt-4
                  [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-blue-800
                  [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5
                  [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5
                  [&_li]:mb-1 [&_li]:pl-1
                  [&_strong]:font-bold [&_strong]:text-slate-900
                  [&_blockquote]:my-3 [&_blockquote]:border-l-4
                  [&_blockquote]:border-blue-400 [&_blockquote]:pl-3
                  [&_blockquote]:text-slate-600
                  [&_hr]:my-4 [&_hr]:border-blue-200
                  [&_table]:my-3 [&_table]:w-full
                  [&_table]:border-collapse [&_th]:bg-blue-100
                  [&_th]:p-2 [&_td]:p-2
                  [&_th]:text-left [&_th]:text-blue-900
                  [&_th]:border [&_td]:border
                  [&_th]:border-blue-200 [&_td]:border-blue-200
                  [&_a]:text-blue-700 [&_a]:underline
                  [&_code]:rounded [&_code]:bg-blue-100
                  [&_code]:px-1 [&_code]:py-0.5
                  [&_pre]:my-3 [&_pre]:overflow-x-auto
                  [&_pre]:rounded-xl [&_pre]:bg-slate-900
                  [&_pre]:p-3 [&_pre]:text-blue-50
                  [&_pre_code]:bg-transparent
                  [&_pre_code]:p-0
                "
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.text}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="whitespace-pre-wrap break-words">
                {m.text}
              </p>
            )}

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
              Analyzing...
            </div>
          )}
        </div>

        {/* INPUT BAR */}
       <div className="shrink-0 border-t border-blue-300 p-3 backdrop-blur-xl sm:p-4">
  <div
    className="
      flex w-full min-w-0 items-center gap-2
      rounded-2xl border border-blue-200/80
      bg-blue-200/10 p-1.5
      shadow-lg shadow-blue-900/[0.08]
      transition-all duration-200
      focus-within:border-blue-400
      focus-within:ring-4 focus-within:ring-blue-400/10
      sm:p-2
    "
  >
    <input
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      placeholder="Ask a health question..."
      className="
        min-w-0 flex-1 bg-transparent px-2 py-2
        text-sm text-slate-800 outline-none
        placeholder:text-slate-400

      "
    />

    <button
      onClick={() => sendMessage()}
      disabled={!input.trim()}
      className="
        flex h-10 w-10 shrink-0 items-center justify-center
        rounded-xl
        bg-gradient-to-br from-[#236DB5] to-[#174A8B]
        text-white shadow-md shadow-blue-900/20
        transition-all duration-200
        hover:from-[#1D5F9F] hover:to-[#123D75]
        active:scale-95
        disabled:cursor-not-allowed disabled:opacity-40
        disabled:shadow-none
      "
    >
      <Send size={20} />
    </button>

    <button
      onClick={toggleMute}
      className="
        flex h-10 w-10 shrink-0 items-center justify-center
        rounded-xl border border-blue-100
        bg-[#EAF4FF] text-[#245A8D]
        transition-colors duration-200
        hover:bg-[#D8EAFE]
        active:scale-95
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