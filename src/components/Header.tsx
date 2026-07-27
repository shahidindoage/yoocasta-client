import React, { useState } from 'react';
import { Sparkles, MessageSquare, Plus, Flame, ShieldAlert, CheckCircle2, Menu, X, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface HeaderProps {
  onSearchClick?: () => void;
  onPostCastingClick?: () => void;
  onCreateProfileClick?: () => void;
  onPremiumClick?: () => void;
  onLoginClick?: () => void;
  registeredTalentsCount?: number;
  openCastingsCount?: number;
}

export default function Header({
  onSearchClick,
  onPostCastingClick,
  onCreateProfileClick,
  onPremiumClick,
  onLoginClick,
  registeredTalentsCount,
  openCastingsCount,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    clearAuth();
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/50 bg-white/90 backdrop-blur-md shadow-sm">
      {/* ✦ HIGH FASHION SCROLLING RUNWAY TICKER BANNER (Outstanding Marquee Layout) ✦ */}
      <div className="w-full bg-[#3835a4] py-3 overflow-hidden select-none relative z-20 border-b border-white/10">
        <div className="flex whitespace-nowrap animate-marquee gap-12 text-[10px] uppercase font-mono font-black tracking-[0.2em] text-white">
          <div className="flex items-center gap-12 shrink-0">
            <span>✦ LIVE AUDITIONS OPEN: DUBAI DESIGN DISTRICT</span>
            <span className="text-pink-200">★ CO-LEAD COMMERCIAL ROLES BY EMIRATES</span>
            <span>✦ RIYADH FASHION WEEK CASTING NOW ACTIVE</span>
            <span className="text-pink-200">★ AED 12,500 WEEKEND GALA HOSTESS SLOTS</span>
            <span>✦ FEATURE FILM BACKSTAGE DIRECTORS SCOUTING</span>
            <span className="text-pink-200">★ 100% ESCROW PROTECTED COMMISSIONS</span>
          </div>
          <div className="flex items-center gap-12 shrink-0">
            <span>✦ LIVE AUDITIONS OPEN: DUBAI DESIGN DISTRICT</span>
            <span className="text-pink-200">★ CO-LEAD COMMERCIAL ROLES BY EMIRATES</span>
            <span>✦ RIYADH FASHION WEEK CASTING NOW ACTIVE</span>
            <span className="text-pink-200">★ AED 12,500 WEEKEND GALA HOSTESS SLOTS</span>
            <span>✦ FEATURE FILM BACKSTAGE DIRECTORS SCOUTING</span>
            <span className="text-pink-200">★ 100% ESCROW PROTECTED COMMISSIONS</span>
          </div>
        </div>
      </div>

      {/* Main Bar Navigation Container */}
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 relative">
        
        {/* Brand Logo - Aligned LEFT on both Desktop and Mobile */}
        <div className="flex items-center z-50">
          <Link to="/" className="flex items-center group">
            <img 
              src={isMenuOpen ? "/logo.png" : "https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/images/logo-black.png"} 
              alt="Yoocasta Logo" 
              className="h-9 w-auto sm:h-10 object-contain transition-transform group-hover:scale-105"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
          <Link to="/browse-talents" className="hover:text-[#3835a4] transition-colors">
            Talent Pool
            <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-[#C6007E] animate-pulse"></span>
          </Link>
          <Link to="/browse-jobs" className="hover:text-[#3835a4] transition-colors">
            Casting Calls
          </Link>
          <Link to="/blogs" className="hover:text-[#3835a4] transition-colors">Our Work</Link>
          {/* <a href="/" className="hover:text-[#3835a4] transition-colors">Success Stories</a> */}
          <Link to="/faq" className="hover:text-[#3835a4] transition-colors">FAQ</Link>
        </nav>

        {/* Desktop Action Buttons Interface */}
        <div className="hidden md:flex items-center gap-1.5 sm:gap-3">
         
          {/* <a href="#" className="inline-flex items-center gap-1 rounded-full bg-green-400 px-4 py-2 text-xs font-bold text-white hover:opacity-95 transition-all hover:scale-[1.02] shadow-md shadow-[#3835A4]/25 cursor-pointer">
            <span>Whatsapp</span>
          </a> */}
         
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="text-xs font-mono tracking-wider font-bold text-neutral-500 hover:text-[#3835a4] px-3 py-2 cursor-pointer transition-colors">
                LOG IN
              </Link>
              <Link to="/signup/talent" className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 hover:border-neutral-400 transition-all cursor-pointer">
                <span>Register</span>
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center justify-center h-10 w-10 rounded-full border border-neutral-300 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 transition-all cursor-pointer overflow-hidden"
              >
                {user?.image ? (
                  <img 
                    src={user.image.startsWith('http') ? user.image : `https://pub-9a6daccdd56649a4bb690162026e4c5d.r2.dev/profile/${user.image}`} 
                    alt="Profile" 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-neutral-200 shadow-xl py-2 z-50">
                  {user?.role === 'TALENT' && (
                    <>
                      <Link
                        to="/dashboard/talent"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-[#C6007E] transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                         Dashboard
                      </Link>
                      <Link
                        to="/dashboard/talent/profile"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-[#C6007E] transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/forgot-password"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-[#C6007E] transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Reset Password
                      </Link>
                    </>
                  )}
                  {user?.role === 'RECRUITER' && (
                    <>
                      <Link
                        to="/dashboard/recruiter"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-[#C6007E] transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                         Dashboard
                      </Link>
                      <Link
                        to="/dashboard/recruiter/jobs"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-[#C6007E] transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Manage Jobs
                      </Link>
                      <Link
                        to="/dashboard/recruiter/post-job"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-[#C6007E] transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Post New Job
                      </Link>
                      <Link
                        to="/forgot-password"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-[#C6007E] transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Reset Password
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

         
        </div>

        {/* MOBILE LAYOUT ONLY: Right Side Hamburger Trigger */}
        <div className="flex md:hidden items-center z-50">
          <button
            onClick={toggleMenu}
            aria-label="Toggle Menu"
            className="p-2 text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none relative"
          >
            {isMenuOpen ? <X className="h-6 w-6 text-white fixed top-[68px] right-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Full-Screen Solid High-Fashion Mobile Overlay */}
      <div 
        className={`fixed inset-0 h-screen w-screen z-40 bg-gradient-to-b from-[#3835a4] to-[#1e1c5c] transition-all duration-300 ease-out md:hidden flex flex-col justify-between p-8 pt-36 ${
          isMenuOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 pointer-events-none invisible'
        }`}
      >
        {/* Navigation Links */}
        <nav className="flex flex-col gap-5 text-lg font-black uppercase font-mono tracking-[0.15em] text-white">
          <Link
            to="/browse-talents" 
            onClick={toggleMenu}
            className="flex items-center justify-between border-b border-white/10 pb-4 hover:text-pink-200 transition-colors"
          >
            <span>Talent Pool</span>
            <span className="h-2.5 w-2.5 rounded-full bg-[#C6007E] animate-pulse"></span>
          </Link>
          <Link 
            to="/browse-jobs" 
            onClick={toggleMenu}
            className="border-b border-white/10 pb-4 hover:text-pink-200 transition-colors"
          >
            Casting Calls
          </Link>
          <Link 
            to="/blogs" 
            onClick={toggleMenu}
            className="border-b border-white/10 pb-4 hover:text-pink-200 transition-colors"
          >
            Our Work
          </Link>
          {/* <a 
            href="#" 
            onClick={toggleMenu}
            className="border-b border-white/10 pb-4 hover:text-pink-200 transition-colors"
          >
            Success Stories
          </a> */}
          <Link 
            to="/faq" 
            onClick={toggleMenu}
            className="border-b border-white/10 pb-4 hover:text-pink-200 transition-colors"
          >
            FAQ
          </Link>
        </nav>

        {/* Action Buttons Footer */}
        <div className="flex flex-col gap-4 mb-8">
          <a
            href="#"
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-green-400 py-4 text-sm font-bold text-white shadow-xl transition-all"
          >
            <span>Whatsapp</span>
          </a>

          {!isAuthenticated ? (
            <>
              <Link
                to="/signup/talent"
                onClick={toggleMenu}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white py-4 text-sm font-bold text-[#3835a4] hover:bg-neutral-50 transition-all"
              >
                <span>Register</span>
              </Link>

              <Link
                to="/login"
                onClick={toggleMenu}
                className="w-full py-4 text-center text-sm font-mono tracking-wider font-black text-white border-2 border-white/30 hover:border-white hover:bg-white/10 rounded-full transition-all"
              >
                LOG IN
              </Link>
            </>
          ) : (
            <>
              {user?.role === 'TALENT' && (
                <>
                  <Link
                    to="/dashboard/talent"
                    onClick={toggleMenu}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white py-4 text-sm font-bold text-[#3835a4] hover:bg-neutral-50 transition-all"
                  >
                     Dashboard
                  </Link>
                  <Link
                    to="/dashboard/talent/profile"
                    onClick={toggleMenu}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white py-4 text-sm font-bold text-[#3835a4] hover:bg-neutral-50 transition-all"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/forgot-password"
                    onClick={toggleMenu}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white py-4 text-sm font-bold text-[#3835a4] hover:bg-neutral-50 transition-all"
                  >
                    Reset Password
                  </Link>
                </>
              )}
              {user?.role === 'RECRUITER' && (
                <>
                  <Link
                    to="/dashboard/recruiter"
                    onClick={toggleMenu}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white py-4 text-sm font-bold text-[#3835a4] hover:bg-neutral-50 transition-all"
                  >
                     Dashboard
                  </Link>
                  <Link
                    to="/dashboard/recruiter/jobs"
                    onClick={toggleMenu}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white py-4 text-sm font-bold text-[#3835a4] hover:bg-neutral-50 transition-all"
                  >
                    Manage Jobs
                  </Link>
                  <Link
                    to="/dashboard/recruiter/post-job"
                    onClick={toggleMenu}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white py-4 text-sm font-bold text-[#3835a4] hover:bg-neutral-50 transition-all"
                  >
                    Post New Job
                  </Link>
                  <Link
                    to="/forgot-password"
                    onClick={toggleMenu}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white py-4 text-sm font-bold text-[#3835a4] hover:bg-neutral-50 transition-all"
                  >
                    Reset Password
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="w-full py-4 text-center text-sm font-mono tracking-wider font-black text-red-500 border-2 border-red-500/30 hover:border-red-500 hover:bg-red-500/10 rounded-full transition-all"
              >
                LOGOUT
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}