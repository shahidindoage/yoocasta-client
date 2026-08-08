import React, { useState, useEffect } from 'react';
import { FAQS } from '../data';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../api/axios';
import { getCachedCms, setCachedCms } from '../utils/cmsCache';

export default function FAQSection() {
  const [items, setItems] = useState(FAQS);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    let active = true;
    api.get('/cms/home')
      .then((res) => {
        if (!active || !res.data?.success || !res.data?.data) return;
        const cms = res.data.data;
        setCachedCms('home', cms);
        if (active) {
          const section = cms?.faqSection;
          if (section && Array.isArray(section) && section.length > 0) {
            setItems(section);
            setOpenIndex(0);
          }
        }
      })
      .catch(() => {
        const cached = getCachedCms('home');
        if (active && cached?.faqSection && Array.isArray(cached.faqSection) && cached.faqSection.length > 0) {
          setItems(cached.faqSection);
          setOpenIndex(0);
        }
      });
    return () => { active = false; };
  }, []);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div id="faq" className="w-full bg-white py-12 border-b border-[#f2f2f2] relative overflow-hidden">
      
      {/* Light Radial Luxury Ambient Details */}
      <div className="absolute right-[-10%] top-1/4 h-96 w-96 rounded-full bg-[#C6007E]/[0.03] filter blur-[100px] pointer-events-none" />
      <div className="absolute left-[-5%] bottom-10 h-80 w-80 rounded-full bg-[#3835A4]/[0.02] filter blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-30 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Exact 40% (2/5) vs 60% (3/5) CSS Desktop Grid Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-12 items-start">
          
          {/* Left Column: Title Block (40%) */}
          <div className="lg:col-span-2 space-y-5">
            <h2 className="font-display text-4xl font-black text-neutral-900 sm:text-5xl tracking-tight leading-none">
              Got questions? <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C6007E] to-[#3835A4]">We have answers.</span>
            </h2>
            <p className="text-sm text-neutral-500 leading-relaxed font-medium">
              Everything you need to know about GCC auditions, portfolio setups, premium memberships, and zero-fee corporate talent booking workflows.
            </p>
          </div>

          {/* Right Column: Dynamic Framer Motion Accordion Deck (60%) */}
          <div className="lg:col-span-3 space-y-4 w-full">
            {items.map((faq, idx) => {
              const isOpen = openIndex === idx;

              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen 
                      ? 'bg-gradient-to-r from-[#C6007E]/3 to-[#3835A4]/3 border-[#3835A4]/30 shadow-md' 
                      : 'bg-white border-neutral-200 hover:border-[#3835A4]/35'
                  }`}
                >
                  {/* Accordion header button */}
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-display font-black text-sm sm:text-base text-neutral-900 tracking-tight">
                      {faq.question}
                    </span>

                    <div className={`p-1.5 rounded-lg border transition-all duration-300 shrink-0 ${
                      isOpen ? 'bg-gradient-to-br from-[#C6007E] to-[#3835A4] text-white border-transparent rotate-180' : 'bg-neutral-50 text-neutral-500 border-neutral-200'
                    }`}>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>

                  {/* Accordion expand/collapse with physical motion */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                      >
                        <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-neutral-500 leading-relaxed border-t border-neutral-200/50 font-medium">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
}