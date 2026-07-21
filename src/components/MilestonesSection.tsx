import React, { useState } from 'react';
import { Award, Briefcase, Smile, Users, HeartHandshake, Star, Flame, ArrowUpRight, TrendingUp, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MilestoneData {
  talents: string;
  creators: string;
  projects: string;
  talentsLabel: string;
  creatorsLabel: string;
  projectsLabel: string;
}

const HISTORICAL_MILESTONES: Record<number, MilestoneData> = {
  2026: {
    talents: '240,000 +',
    creators: '1,850 +',
    projects: '8,200 +',
    talentsLabel: 'Elite roster including professional runway experts, bilingual event hosts, actors, and media crew.',
    creatorsLabel: 'Active campaign managers, ad agency directors, and premium brands booking live talents daily.',
    projectsLabel: 'High-profile commercial videos, luxury fashion campaigns, and grand national expos executed.',
  },
  2025: {
    talents: '215,000 +',
    creators: '1,500 +',
    projects: '7,000 +',
    talentsLabel: 'Vetted performers and models registered across Dubai and Riyadh, booking digital campaigns.',
    creatorsLabel: 'Leading agencies, TV streaming networks, and creative crews hosting open casting calls.',
    projectsLabel: 'Middle East cosmetics promotions, product activations, and regional commercials.',
  },
  2024: {
    talents: '160,000 +',
    creators: '1,100 +',
    projects: '4,500 +',
    talentsLabel: 'Expanding talent database backed by digital composite cards and interactive showreels.',
    creatorsLabel: 'Regional production directors scouting authentic local faces and cultural extra rosters.',
    projectsLabel: 'Boutique fashion magazines, local brand lookbooks, and high-energy product launch hostings.',
  },
  2023: {
    talents: '98,000 +',
    creators: '650 +',
    projects: '2,100 +',
    talentsLabel: 'Initial platform release of Yoocasta focusing on digital talent discovery in the Gulf region.',
    creatorsLabel: 'First-mover directors utilizing custom digital casting dashboards to book talents.',
    projectsLabel: 'Sovereign theater plays, local influencer promotions, and boutique clothing campaigns.',
  }
};

export default function MilestonesSection() {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const data = HISTORICAL_MILESTONES[selectedYear];

  const yearsList = Object.keys(HISTORICAL_MILESTONES).map(Number).sort((a, b) => b - a);

  return (
    <div id="milestones" className="w-full bg-white py-12 border-b border-[#f2f2f2] relative overflow-hidden text-neutral-900">
      
      {/* Editorial Luxury Lighting */}
      <div className="absolute right-0 top-10 h-[600px] w-[600px] rounded-full bg-[#3835A4]/[0.035] filter blur-[150px] pointer-events-none" />
      <div className="absolute left-[15%] bottom-10 h-[500px] w-[500px] rounded-full bg-[#C6007E]/[0.02] filter blur-[130px] pointer-events-none" />
      
      {/* High Fashion Technical Studio Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.005)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Epic background year graphic */}
      <div className="absolute -right-16 bottom-0 select-none pointer-events-none text-[22vw] font-black text-neutral-900/[0.02] tracking-[0.05em] capitalize font-mono leading-none z-0">
        {selectedYear}
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section header & luxury timeline segment picker */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-20 gap-10 pb-10 border-b border-neutral-200">
          <div className="space-y-4 max-w-2xl">
            <h2 className="font-display text-4xl font-black text-neutral-900 sm:text-5xl tracking-tight leading-none">
              Scaling The Network
            </h2>
            <p className="text-sm text-neutral-550 font-medium leading-relaxed">
              Yoocasta is the Middle East‘s fastest-growing digital runway, empowering direct connection between production creators and elite regional talents.
            </p>
          </div>

          {/* Luxury Timeline Swappers */}
          <div className="flex items-center p-1.5 bg-neutral-150/60 backdrop-blur-md rounded-2xl border border-neutral-250/35 shrink-0 self-start lg:self-auto relative">
            {yearsList.map((y) => {
              const isActive = selectedYear === y;
              return (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`relative px-6 py-3.5 text-xs font-mono font-black rounded-xl tracking-widest transition-all duration-300 cursor-pointer z-10 ${
                    isActive ? 'text-white' : 'text-neutral-500 hover:text-[#3835A4]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeYearTab"
                      className="absolute inset-0 bg-gradient-to-r from-[#C6007E] to-[#3835A4] rounded-xl -z-10 shadow-md"
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    />
                  )}
                  {y}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic metrics card deck - Beautifully animated */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedYear}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10"
          >
            
            {/* 1. Talents Card */}
            <div className="relative group rounded-[2.25rem] bg-white p-8 sm:p-10 pt-14 border border-neutral-200 hover:border-[#C6007E]/40 hover:shadow-2xl transition-all duration-500 overflow-hidden">
              {/* Abstract decorative graphic line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#C6007E]/0 via-[#C6007E]/40 to-[#3835A4]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Corner Icon */}
              <div className="absolute top-10 right-10 h-11 w-11 rounded-2xl bg-[#C6007E]/5 border border-[#C6007E]/10 text-[#C6007E] flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-[#C6007E] group-hover:to-[#3835A4] group-hover:text-white group-hover:border-transparent transition-all duration-500 shadow-xs">
                <Users className="h-5 w-5" />
              </div>
              
              <h3 className="mt-2 font-display text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight group-hover:text-[#C6007E] transition-colors duration-500">
                {data.talents}
              </h3>
              
              <p className="mt-6 text-xs sm:text-sm text-neutral-550 leading-relaxed min-h-[75px] font-medium">
                {data.talentsLabel}
              </p>
              
              <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between text-[10px] font-mono text-neutral-600">
                <span>Verified GCC Portfolios</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Secured</span>
                </span>
              </div>
            </div>

            {/* 2. Creators Card */}
            <div className="relative group rounded-[2.25rem] bg-white p-8 sm:p-10 pt-14 border border-neutral-200 hover:border-[#3835A4]/40 hover:shadow-2xl transition-all duration-500 overflow-hidden">
              {/* Abstract decorative graphic line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#3835A4]/0 via-[#3835A4]/40 to-[#C6007E]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Corner Icon */}
              <div className="absolute top-10 right-10 h-11 w-11 rounded-2xl bg-[#3835A4]/5 border border-[#3835A4]/10 text-[#3835A4] flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-[#C6007E] group-hover:to-[#3835A4] group-hover:text-white group-hover:border-transparent transition-all duration-500 shadow-xs">
                <HeartHandshake className="h-5 w-5" />
              </div>
              
              <h3 className="mt-2 font-display text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight group-hover:text-[#3835A4] transition-colors duration-500">
                {data.creators}
              </h3>
              
              <p className="mt-6 text-xs sm:text-sm text-neutral-550 leading-relaxed min-h-[75px] font-medium">
                {data.creatorsLabel}
              </p>
              
              <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between text-[10px] font-mono text-neutral-600">
                <span>Corporate Accounts</span>
                <span className="text-[#3835A4] font-bold capitalize tracking-widest text-[9px] bg-[#3835A4]/10 border border-[#3835A4]/20 px-2.5 py-1 rounded-lg">Active Region</span>
              </div>
            </div>

            {/* 3. Projects Card */}
            <div className="relative group rounded-[2.25rem] bg-white p-8 sm:p-10 pt-14 border border-neutral-200 hover:border-[#3835A4]/40 hover:shadow-2xl transition-all duration-500 overflow-hidden">
              {/* Abstract decorative graphic line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#3835A4]/0 via-[#3835A4]/40 to-[#3835A4]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Corner Icon */}
              <div className="absolute top-10 right-10 h-11 w-11 rounded-2xl bg-[#3835A4]/5 border border-[#3835A4]/10 text-[#3835A4] flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-[#C6007E] group-hover:to-[#3835A4] group-hover:text-white group-hover:border-transparent transition-all duration-500 shadow-xs">
                <Briefcase className="h-5 w-5" />
              </div>
              
              <h3 className="mt-2 font-display text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight group-hover:text-[#3835A4] transition-colors duration-500">
                {data.projects}
              </h3>
              
              <p className="mt-6 text-xs sm:text-sm text-neutral-550 leading-relaxed min-h-[75px] font-medium">
                {data.projectsLabel}
              </p>
              
              <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between text-[10px] font-mono text-neutral-600">
                <span>Completed Campaigns</span>
                <span className="text-[#C6007E] font-black capitalize tracking-widest text-[9px] bg-[#C6007E]/10 border border-[#C6007E]/20 px-2.5 py-1 rounded-lg">100% Escrowed</span>
              </div>
            </div>

          </motion.div>
        </AnimatePresence>

        {/* Golden premium ticket ribbon */}
        <div className="mt-20 flex justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group flex flex-col sm:flex-row items-center gap-3.5 bg-gradient-to-r from-[#C6007E]/5 to-[#3835A4]/5 border border-[#3835A4]/15 py-4 px-8 rounded-3xl shadow-xs transition-all duration-300 max-w-4xl text-center"
          >
            <span className="text-xs sm:text-sm text-neutral-600 font-medium">We have securely placed talents, settling over</span>
            <span className="text-base sm:text-lg font-black text-[#3835A4] font-mono tracking-wider flex items-center gap-1.5 justify-center">
              <Star className="h-4.5 w-4.5 fill-current text-[#C6007E] animate-pulse" />
              AED 84,000,000+
            </span>
            <span className="text-neutral-300 hidden sm:inline">•</span>
            <span className="text-[10px] text-[#C6007E] font-black capitalize tracking-[0.15em] font-mono">Commission-Free Ecosystem</span>
          </motion.div>
        </div>

      </div>
    </div>
  );
}