import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Compass } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-neutral-950 text-neutral-400 py-12 border-t border-neutral-900 relative z-10 overflow-hidden">
      
      {/* Editorial Luxury Lighting */}
      <div className="absolute right-[10%] top-0 h-96 w-96 rounded-full bg-amber-500/[0.02] filter blur-[120px] pointer-events-none" />
      <div className="absolute left-[5%] bottom-0 h-80 w-80 rounded-full bg-neutral-500/[0.01] filter blur-[100px] pointer-events-none" />
      
      {/* Technical Grid Pattern Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.002)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.002)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Main footer layout columns */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Creative Brand Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-12 mb-12 border-b border-white/[0.06] gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <img 
                src="/logo.png" 
                alt="Yoocasta Logo" 
                className="h-8 sm:h-9 w-auto object-contain" 
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-xs text-neutral-450 max-w-xl leading-relaxed">
              Yoocasta is a modern-style Online CASTing Agency designed to connect individual freelance talents with industry-leading directors, creators, and ad houses in Dubai, Abu Dhabi, Saudi Arabia, Qatar, Oman, and Bahrain.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pt-4">
          
          {/* Col 1 Brand message */}
          <div className="space-y-6">
            <h4 className="font-display text-xs font-bold text-white uppercase tracking-[0.25em] font-mono flex items-center gap-2">
              <Compass className="h-4 w-4 text-amber-400 animate-spin-slow" />
              THE PLATFORM
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed font-medium">
              We operate completely free of standard talent agency commission percentages, offering performers 100% of their contracted rates, supported by an optional AED 20/Month VIP subscription.
            </p>
          </div>

          {/* Col 2 Office Contact stats */}
          <div className="space-y-5">
            <h4 className="font-display text-xs font-bold text-white uppercase tracking-[0.25em] font-mono">
              OFFICE REGISTRY
            </h4>
            <ul className="space-y-4 text-xs text-neutral-400 leading-relaxed">
              <li className="flex items-start gap-3">
                <MapPin className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
                <span>Sharjah Publishing City, UAE.<br />Sharjah, United Arab Emirates</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-amber-400" />
                <span>+971 58 2224178</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-amber-400" />
                <a href="mailto:management@yoocasta.com" className="hover:text-white transition-colors">
                  management@yoocasta.com
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3 Navigation quick links */}
          <div className="space-y-5">
            <h4 className="font-display text-xs font-bold text-white uppercase tracking-[0.25em] font-mono">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-neutral-400 font-medium">
               <li><Link to="/about" className="hover:text-amber-400 transition-colors flex items-center gap-1">About Us</Link></li>
             <li><Link to="/subscription-plans" className="hover:text-amber-400 transition-colors flex items-center gap-1">Subscription Plans</Link></li>
                           <li><Link to="/blogs" className="hover:text-amber-400 transition-colors flex items-center gap-1">Our Work</Link></li>
                 <li><Link to="/contact" className="hover:text-amber-400 transition-colors flex items-center gap-1">Contact Us</Link></li>
                  <li><Link to="/faq" className="hover:text-amber-400 transition-colors flex items-center gap-1">FAQs</Link></li>
            </ul>
          </div>

          {/* Col 4 Regulatory licensing */}
          <div className="space-y-5">
            <h4 className="font-display text-xs font-bold text-white uppercase tracking-[0.25em] font-mono">
              MEDIA LICENSE
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed font-mono">
              Yoocasta is a registered trademark and digital platform operated by Yoocasta FZE LLC, UAE. Licensed for media casting across all Gulf Emirates.
            </p>
          </div>
        </div>

        {/* Bottom Copy footer lines */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-neutral-500 font-medium">
          <p className="font-mono text-[10px] tracking-wide">
            © 2026 Yoocasta FZE LLC. All rights reserved. Made for the Middle East Talent & Casting Elite.
          </p>
          {/* <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-amber-400 transition-colors">About</Link>
            <Link to="/faq" className="hover:text-amber-400 transition-colors">FAQ</Link>
            <Link to="/contact" className="hover:text-amber-400 transition-colors">Contact</Link>
            <Link to="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
          </div> */}
          <div className="flex flex-wrap gap-4 text-[11px] font-mono">
            <Link to="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
            {/* <span>•</span> */}
            {/* <a href="#" className="hover:text-amber-400 transition-colors">GCC Auditions Act</a> */}
          </div>
        </div>

      </div>
    </footer>
  );
}