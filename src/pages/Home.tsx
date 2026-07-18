import React, { useState, useMemo } from 'react';
// import Header from '../components/Header';
import Hero from '../components/Hero';
import CategoryBrowser from '../components/CategoryBrowser';
import FeaturedTalent from '../components/FeaturedTalent';
import CastingCallsSection from '../components/CastingCallsSection';
import MilestonesSection from '../components/MilestonesSection';
import TestimonialsSection from '../components/TestimonialsSection';
import BlogsSection from '../components/BlogsSection';
import FAQSection from '../components/FAQSection';
import CreativeCTA from '../components/CreativeCTA';
// import Footer from '../components/Footer';
import VideoSection from '../components/VideoSection';

// Wizards and Detail Dialogs
import TalentWizard from '../components/TalentWizard';
import CastingWizard from '../components/CastingWizard';
import TalentDetailsModal from '../components/TalentDetailsModal';
import CastingDetailsModal from '../components/CastingDetailsModal';

// Static lists
import { INITIAL_TALENTS, INITIAL_CASTINGS } from '../data';
import { Talent, CastingCall } from '../types';
import { X, Sparkles, Check, Mail, Phone, Lock, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import TalentAndCastingSection from '../components/Talentandcastingsection';
import BackToTopButton from '../components/BackToTopButton';

export default function Home() {
  // Live dataset states
  const [talents, setTalents] = useState<Talent[]>(INITIAL_TALENTS);
  const [castings, setCastings] = useState<CastingCall[]>(INITIAL_CASTINGS);

  // Search and Filter conditions
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Active Modals States
  const [activeTalentDetails, setActiveTalentDetails] = useState<Talent | null>(null);
  const [activeCastingDetails, setActiveCastingDetails] = useState<CastingCall | null>(null);
  const [isTalentWizardOpen, setIsTalentWizardOpen] = useState(false);
  const [isCastingWizardOpen, setIsCastingWizardOpen] = useState(false);
  
  // Custom alerts or small utility modal states
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);

  // Form states for login/signup
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Form state for premium activation
  const [premiumUserPhone, setPremiumUserPhone] = useState('');
  const [premiumUserEmail, setPremiumUserEmail] = useState('');
  const [isPremiumActivated, setIsPremiumActivated] = useState(false);

  // Callback to execute searches from the Hero search engine
  const handleHeroSearch = (filters: { category: string; location: string; gender: string; keyword: string }) => {
    setSelectedCategory(filters.category);
    setSelectedLocation(filters.location);
    setSelectedGender(filters.gender);
    setSearchKeyword(filters.keyword);
  };

  // Live filtered list computed cleanly
  const filteredTalents = useMemo(() => {
    return talents.filter((talent) => {
      // Check gender match
      const matchesGender =
        selectedGender === 'All' ||
        talent.gender === selectedGender;

      // Check location match
      const matchesLocation =
        selectedLocation === 'All Locations' ||
        talent.location === selectedLocation;

      // Check keyword filter (e.g. name, ethnicity, bio features)
      const matchesKeyword =
        !searchKeyword ||
        talent.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        talent.bio.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        talent.stats.hairColor.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        talent.stats.eyeColor.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        talent.categories.some(cat => cat.toLowerCase().includes(searchKeyword.toLowerCase()));

      return matchesGender && matchesLocation && matchesKeyword;
    });
  }, [talents, selectedGender, selectedLocation, searchKeyword]);

  // Handle adding new talent profile live
  const handleNewTalentPublish = (newTalent: Talent) => {
    setTalents((prev) => [newTalent, ...prev]);
    setIsTalentWizardOpen(false);
    
    // Smooth scroll to talent list to witness the newly added talent com card
    setTimeout(() => {
      const el = document.getElementById('talents-anchor');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Handle adding new Casting Brief live
  const handleNewCastingPublish = (newCasting: CastingCall) => {
    setCastings((prev) => [newCasting, ...prev]);
    setIsCastingWizardOpen(false);

    // Smooth scroll to Castings board
    setTimeout(() => {
      const el = document.getElementById('directors-board');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail) {
      setIsLoggedIn(true);
      setTimeout(() => {
        setIsLoginOpen(false);
      }, 1500);
    }
  };

  const handlePremiumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (premiumUserEmail) {
      setIsPremiumActivated(true);
      setTimeout(() => {
        setIsPremiumOpen(false);
        setIsPremiumActivated(false);
      }, 3500);
    }
  };

  return (
    <div id="app-root" className="min-h-screen bg-white text-neutral-900 selection:bg-amber-400 selection:text-neutral-950">
      
      {/* 1. Brand Header (Moved to App.tsx) */}

      {/* 2. Immersive Video-feel Hero */}
      <Hero 
        onSearch={handleHeroSearch} 
        registeredCount={talents.length} 
      />

      {/* 3. Category Browser Grid */}
      <TalentAndCastingSection
  selectedCategory={selectedCategory}
  onSelectCategory={setSelectedCategory}
  castings={castings}
  onCastingClick={setActiveCastingDetails}
/>

      {/* 4. Filterable Talent Grid portfolio */}
      <FeaturedTalent
        talents={filteredTalents}
        onTalentClick={setActiveTalentDetails}
        selectedCategory={selectedCategory}
        selectedGender={selectedGender}
        selectedLocation={selectedLocation}
        onGenderChange={setSelectedGender}
        onLocationChange={setSelectedLocation}
        onCategoryChange={setSelectedCategory}
      />

      {/* 4.5 Creative Trendy Video Showroom Section */}
      <VideoSection />

      {/* 5. Casting Calls Board */}
      {/* <CastingCallsSection 
        castings={castings} 
        onCastingClick={setActiveCastingDetails} 
      /> */}

      {/* 6. Milestones Sectors */}
      <MilestonesSection />

      {/* 7. Testimonials section */}
      <TestimonialsSection />

      {/* 8. Creative Blog section */}
      <BlogsSection />

      {/* 9. FAQs Section */}
      <FAQSection />

      {/* 10. Creative High-Impact Call to Action Section */}
      <CreativeCTA
        onPostCastingClick={() => setIsCastingWizardOpen(true)}
        onCreateProfileClick={() => setIsTalentWizardOpen(true)}
        onPremiumClick={() => setIsPremiumOpen(true)}
      />

      {/* 11. Gorgeous Brand partner Footer & office registries (Moved to App.tsx) */}
<BackToTopButton />

      {/* MODALS LAYOUT */}

      {/* 1. Talent Wizard (Create com card) */}
      {isTalentWizardOpen && (
        <TalentWizard
          onClose={() => setIsTalentWizardOpen(false)}
          onSubmit={handleNewTalentPublish}
        />
      )}

      {/* 2. Casting Wizard (Publish casting) */}
      {isCastingWizardOpen && (
        <CastingWizard
          onClose={() => setIsCastingWizardOpen(false)}
          onSubmit={handleNewCastingPublish}
        />
      )}

      {/* 3. Talent Com Card Details overlay */}
      {activeTalentDetails && (
        <TalentDetailsModal
          talent={activeTalentDetails}
          onClose={() => setActiveTalentDetails(null)}
        />
      )}

      {/* 4. Casting Brief details overlay */}
      {activeCastingDetails && (
        <CastingDetailsModal
          casting={activeCastingDetails}
          onClose={() => setActiveCastingDetails(null)}
        />
      )}

      {/* 5. Styled Login / Register dialog */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-250 bg-white p-6 md:p-8 shadow-2xl space-y-6">
            <button 
              onClick={() => setIsLoginOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 border border-neutral-200 shadow-sm transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {isLoggedIn ? (
              <div className="text-center py-6 flex flex-col items-center justify-center space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-650 rounded-full animate-scale-in">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-neutral-900">Login Successful</h3>
                <p className="text-xs text-neutral-600">Welcome back to Yoocasta! Redirecting you to your active talent room...</p>
              </div>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="text-center">
                  <span className="text-[10px] font-mono text-amber-700 uppercase font-bold tracking-widest">GET DISCOVERED</span>
                  <h3 className="font-display text-xl font-black text-neutral-900 mt-1">Access Yoocasta Account</h3>
                  <p className="text-xs text-neutral-550 mt-1">Manage your active auditions, comp card, and payments</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1 font-bold">Your Registered Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. archana.model@gmail.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full rounded-xl bg-white border border-neutral-300 p-3 text-sm text-neutral-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">Passkey Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full rounded-xl bg-white border border-neutral-350 p-3 text-sm text-neutral-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-amber-500 py-3 text-xs font-black text-white hover:bg-amber-600 transition-all uppercase tracking-wider shadow-sm cursor-pointer"
                >
                  Access Room
                </button>

                <div className="text-center pt-2">
                  <span className="text-[11px] text-neutral-505">Don’t have a professional profile yet? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginOpen(false);
                      setIsTalentWizardOpen(true);
                    }}
                    className="text-[11px] text-amber-705 hover:underline font-bold"
                  >
                    Register free
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 6. Premium Activation overlay */}
      {isPremiumOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 md:p-8 shadow-2xl space-y-5">
            <button 
              onClick={() => setIsPremiumOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 border border-neutral-200 shadow-sm"
            >
              <X className="h-5 w-5" />
            </button>

            {isPremiumActivated ? (
              <div className="text-center py-6 flex flex-col items-center justify-center space-y-3">
                <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full animate-pulse">
                  <Sparkles className="h-6 w-6 text-amber-700 fill-current" />
                </div>
                <h3 className="font-display text-lg font-bold text-neutral-900 animate-fade-in">Premium Requested!</h3>
                <p className="text-xs text-neutral-600">Our billing curators have transmitted your enrollment inquiry. Check your phone for secure payment link (AED 20)!</p>
              </div>
            ) : (
              <form onSubmit={handlePremiumSubmit} className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="inline-flex py-1 px-3 bg-gradient-to-r from-[#C6007E] to-[#3835A4] text-white font-black text-[9px] uppercase tracking-wider rounded-full mx-auto shadow-sm">
                    ELITE UPGRADE
                  </div>
                  <h3 className="font-display text-xl font-black text-neutral-900">Activate Yoocasta Premium</h3>
                  <p className="text-xs text-neutral-550">Secure unlimited audition applications & top director visibility for only AED 20 / Month!</p>
                </div>

                {/* Benefits specs list */}
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs text-neutral-600">
                  <p className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-600" /> Apply to unlimited open and VIP casting calls</p>
                  <p className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-600" /> Secure custom portfolio view statistics</p>
                  <p className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-600" /> Real-time casting alerts directly via WhatsApp</p>
                  <p className="flex items-center gap-2"><Check className="h-4 w-4 text-amber-600" /> Featured placement on directors' talent pool query</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-505 mb-1 font-bold">Your Registered Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. archana@gmail.com"
                      value={premiumUserEmail}
                      onChange={(e) => setPremiumUserEmail(e.target.value)}
                      className="w-full rounded-xl bg-white border border-neutral-300 p-3 text-sm text-neutral-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-505 mb-1 font-bold font-mono">Mobile / WhatsApp Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +971 58 222 4178"
                      value={premiumUserPhone}
                      onChange={(e) => setPremiumUserPhone(e.target.value)}
                      className="w-full rounded-xl bg-white border border-neutral-305 p-3 text-sm text-neutral-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 font-mono font-semibold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-[#C6007E] to-[#3835A4] py-3 text-xs font-black text-white hover:opacity-90 transition-all uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Acquire Premium Plan
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
