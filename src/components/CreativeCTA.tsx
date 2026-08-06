import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function CreativeCTA() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isTalent = user?.role === 'TALENT';
  
  // Custom infinite scrolling tags for the background marquee
  const marqueeWordsLeft = [
    'RUNWAY', 'DIRECT CASTING', 'DUBAI', 'RIYADH', 'MODELS', 'FASHION', 
    'CINEMA', 'ACTORS', 'BILINGUAL', 'GCC SELECTION', 'SHARJAH', 'COMMISSION FREE'
  ];

  const marqueeWordsRight = [
    'VIP PRIORITY', 'ZERO AGENT FEES', 'ELITE ROSTER', 'DIRECT BOOKINGS', 
    'PRODUCTION DESIGNERS', 'EXPOS HOSTESSES', 'ACTORS ACTING', 'LIVE CAMPAIGNS'
  ];

  return (
    <section id="creative-cta" className="w-full bg-gradient-to-br from-[#C6007E] to-[#3835A4] py-12 relative overflow-hidden border-t border-white/10 text-white">
      
      {/* 1. INFINITE RUNNING TEXT TICKERS IN BACKGROUND - MAX TRANSPARENCY */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col gap-10 pointer-events-none select-none z-0 opacity-[0.04]">
        
        {/* Row 1: Left moving */}
        <div className="flex overflow-hidden whitespace-nowrap">
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: '-50%' }}
            transition={{
              repeat: Infinity,
              repeatType: 'loop',
              duration: 30,
              ease: 'linear',
            }}
            className="flex gap-20 text-[12vh] font-display font-black tracking-widest uppercase leading-none text-white"
          >
            {[...marqueeWordsLeft, ...marqueeWordsLeft].map((word, idx) => (
              <span key={idx} className="inline-flex items-center gap-8">
                <span>{word}</span>
                <span className="text-white/40">•</span>
              </span>
            ))}
          </motion.div>
        </div>

        {/* Row 2: Right moving */}
        <div className="flex overflow-hidden whitespace-nowrap">
          <motion.div
            initial={{ x: '-50%' }}
            animate={{ x: 0 }}
            transition={{
              repeat: Infinity,
              repeatType: 'loop',
              duration: 35,
              ease: 'linear',
            }}
            className="flex gap-20 text-[12vh] font-display font-black tracking-widest uppercase leading-none text-white"
          >
            {[...marqueeWordsRight, ...marqueeWordsRight].map((word, idx) => (
              <span key={idx} className="inline-flex items-center gap-8">
                <span className="text-white/40">•</span>
                <span className="italic">{word}</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Luxury Radial Lighting and Accents */}
      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-white/[0.08] filter blur-[120px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

      {/* Main Content: Centered & Creative Editorial Column Stack */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Bold Title */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl sm:text-7xl font-black text-white tracking-tight leading-none mb-6"
        >
          Shape the GCC Runway. <br />
          <span className="text-neutral-950 font-display italic font-medium">Connect Instantly.</span>
        </motion.h2>

        {/* Supporting Description */}
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-sm sm:text-base text-white/90 max-w-2xl mx-auto font-medium leading-relaxed mb-12"
        >
          Say goodbye to expensive agency percentages. Whether you are a premium director sourcing talent or a performer establishing your digital composite card, Yoocasta is your direct gateway.
        </motion.p>

        {/* Primary Centered Action Suite */}
        {!isAuthenticated && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
          <button
            onClick={() => navigate('/signup/talent')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4.5 bg-neutral-950 hover:bg-white hover:text-neutral-950 text-white rounded-2xl font-black text-xs  tracking-wider transition-all duration-300 shadow-xl cursor-pointer group"
          >
            <span>Join as Talent</span>
            <ArrowUpRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>

          <button
            onClick={() => navigate('/signup/recruiter')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4.5 bg-white text-neutral-950 hover:bg-neutral-950 hover:text-white rounded-2xl font-black text-xs  tracking-wider transition-all duration-300 shadow-md cursor-pointer group"
          >
            <span>Join as Recruiter</span>
            <ArrowUpRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 animate-pulse" />
          </button>
        </div>
        )}

        {/* Authenticated Role-Based Actions */}
        {isAuthenticated && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
          {isTalent ? (
            <>
              <button
                onClick={() => navigate('/browse-jobs')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4.5 bg-neutral-950 hover:bg-white hover:text-neutral-950 text-white rounded-2xl font-black text-xs  tracking-wider transition-all duration-300 shadow-xl cursor-pointer group"
              >
                <span>Browse Jobs</span>
                <ArrowUpRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              <button
                onClick={() => navigate('/dashboard/talent/applications')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4.5 bg-white text-neutral-950 hover:bg-neutral-950 hover:text-white rounded-2xl font-black text-xs  tracking-wider transition-all duration-300 shadow-md cursor-pointer group"
              >
                <span>My Applications</span>
                <ArrowUpRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/dashboard/recruiter/jobs')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4.5 bg-neutral-950 hover:bg-white hover:text-neutral-950 text-white rounded-2xl font-black text-xs  tracking-wider transition-all duration-300 shadow-xl cursor-pointer group"
              >
                <span>Manage Jobs</span>
                <ArrowUpRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              <button
                onClick={() => navigate('/dashboard/recruiter/post-job')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4.5 bg-white text-neutral-950 hover:bg-neutral-950 hover:text-white rounded-2xl font-black text-xs  tracking-wider transition-all duration-300 shadow-md cursor-pointer group"
              >
                <span>Post a Job</span>
                <ArrowUpRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </>
          )}
        </div>
        )}

      </div>
    </section>
  );
}