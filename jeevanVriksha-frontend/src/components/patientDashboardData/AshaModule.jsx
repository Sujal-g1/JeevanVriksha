import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, Volume2, VolumeX, ShieldCheck 
} from 'lucide-react';
import PatientNavbar from '../PatientNavbar';

import { pregnancyData, babyCareDetailed } from './AshaData';

export default function AshaModule() {
  const [activeTab, setActiveTab] = useState('pregnancy');
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [openSectionId, setOpenSectionId] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleSpeak = (text) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setOpenSectionId(null);
  }, [selectedMonth, activeTab]);

  return (
    <div className="min-h-screen bg-[#f1fcf4] pb-12 overflow-x-hidden">
      <PatientNavbar />

      <header className="pt-24 pb-10 px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full mb-4">
           <ShieldCheck size={16} />
           <span className="text-[10px] font-black uppercase tracking-widest">ASHA Assistance Portal</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-green-900 uppercase tracking-tight">
          Complete Care Guide
        </h1>
        <p className="mt-2 text-green-600 font-bold italic opacity-80">"पूर्ण मातृत्व एवं शिशु सुरक्षा"</p>
      </header>

      <div className="max-w-md mx-auto flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-green-100 shadow-sm mb-8">
        <button 
          onClick={() => setActiveTab('pregnancy')}
          className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'pregnancy' ? 'bg-green-600 text-white shadow-lg' : 'text-green-700 hover:bg-green-50'}`}
        >
          Mother / माँ
        </button>
        <button 
          onClick={() => setActiveTab('baby')}
          className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'baby' ? 'bg-green-600 text-white shadow-lg' : 'text-green-700 hover:bg-green-50'}`}
        >
          Baby / बच्चा
        </button>
      </div>

      <main className="w-full max-w-7xl mx-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'pregnancy' ? (
            <motion.div key="preg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex gap-3 overflow-x-auto pb-6 mb-4 no-scrollbar">
                {pregnancyData.map(d => (
                  <button 
                    key={d.month} 
                    onClick={() => setSelectedMonth(d.month)} 
                    className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all shrink-0 ${selectedMonth === d.month ? 'bg-green-600 text-white border-green-600 shadow-xl scale-105' : 'bg-white text-green-700 border-green-100 hover:border-green-300'}`}
                  >
                    Month {d.month}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pregnancyData.find(m => m.month === selectedMonth).sections.map((section) => (
                  <Accordion 
                    key={section.id}
                    {...section}
                    isOpen={openSectionId === section.id} 
                    onToggle={() => setOpenSectionId(openSectionId === section.id ? null : section.id)} 
                    onSpeak={() => toggleSpeak(section.content)} 
                    isSpeaking={isSpeaking} 
                  />
                ))}
              </div>
            </motion.div>
          ) : (
             <motion.div key="baby" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
               {babyCareDetailed.map((ageGroup, i) => (
                 <div key={i}>
                   <h2 className="text-xl md:text-2xl font-black text-green-900 mb-6 flex items-center gap-3">
                     <div className="h-8 w-2 bg-green-600 rounded-full" />
                     {ageGroup.age}
                   </h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {ageGroup.sections.map((section) => (
                       <Accordion 
                        key={section.id}
                        {...section}
                        isOpen={openSectionId === section.id} 
                        onToggle={() => setOpenSectionId(openSectionId === section.id ? null : section.id)} 
                        onSpeak={() => toggleSpeak(section.content)} 
                        isSpeaking={isSpeaking} 
                       />
                     ))}
                   </div>
                 </div>
               ))}
             </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function Accordion({ title, icon, content, isOpen, onToggle, onSpeak, isSpeaking }) {
  return (
    <div className={`rounded-[2rem] border transition-all duration-300 ${isOpen ? 'bg-white ring-4 ring-green-100 shadow-2xl' : 'bg-white/70 hover:bg-white shadow-md border-green-50'}`}>
      <button onClick={onToggle} className="w-full p-6 flex justify-between items-center">
        <div className="flex items-center gap-4 text-left">
          <div className="p-3 bg-green-50 rounded-2xl shadow-sm border border-green-100">
            {React.cloneElement(icon, { size: 24 })}
          </div>
          <span className="font-black text-sm md:text-lg text-green-900 leading-tight uppercase tracking-tight">{title}</span>
        </div>
        <ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-green-600' : 'text-green-300'}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6">
            <div className="bg-green-50/50 p-6 rounded-3xl border border-green-100 relative">
              <p className="whitespace-pre-line text-sm md:text-base leading-relaxed text-green-900 font-bold pb-14 opacity-80">
                {content}
              </p>
              <div className="absolute bottom-4 right-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); onSpeak(); }} 
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs tracking-widest transition-all shadow-lg active:scale-95 ${isSpeaking ? 'bg-red-500 text-white animate-pulse' : 'bg-green-600 text-white hover:bg-green-700'}`}
                >
                  {isSpeaking ? <VolumeX size={16}/> : <Volume2 size={16}/>}
                  {isSpeaking ? 'STOP' : 'LISTEN'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}