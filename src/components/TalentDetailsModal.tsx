import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Talent } from '../types';
import { X, MapPin, Send } from 'lucide-react';

interface TalentDetailsModalProps {
  talent: Talent;
  onClose: () => void;
}

export default function TalentDetailsModal({ talent, onClose }: TalentDetailsModalProps) {
  const [activePhoto, setActivePhoto] = useState(talent.profileImage);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const navigate = useNavigate();

  const handleViewDetails = () => {
    if (talent.username) {
      navigate(`/talent/${talent.username}`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-md">
      <div className="relative w-full max-w-4xl rounded-3xl border border-neutral-200 bg-white shadow-2xl overflow-y-auto md:overflow-hidden flex flex-col md:flex-row max-h-[92vh] md:h-[650px]">
        
        {/* Close Button on top right */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/80 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 border border-neutral-200 shadow-sm transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Side: Photo presentation & Gallery */}
        <div className="w-full md:w-[45%] bg-neutral-50 p-6 flex flex-col justify-between shrink-0 border-r border-neutral-200">
          {/* Large photo presentation */}
          <div className="h-[280px] md:h-[400px] rounded-2xl overflow-hidden bg-white border border-neutral-100 relative shadow-sm">
            <img 
              src={activePhoto} 
              alt={talent.name} 
              className="h-full w-full object-cover transition-all"
              referrerPolicy="no-referrer"
            />
            {talent.isPremium && (
              <span className="absolute top-4 left-4 inline-flex items-center gap-1 bg-amber-400 text-neutral-950 text-[9px] uppercase font-black px-2 py-0.5 rounded-full shadow-md tracking-wider">
                PREMIUM
              </span>
            )}
          </div>

          {/* Thumbnails grid */}
          <div className="mt-4 flex gap-2.5 overflow-x-auto pb-1">
            {[talent.profileImage, ...talent.galleryImages].map((imgUrl, i) => (
              <button
                key={i}
                onClick={() => setActivePhoto(imgUrl)}
                className={`h-16 w-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border-2 transition-all cursor-pointer ${
                  activePhoto === imgUrl ? 'border-amber-500 scale-[1.03]' : 'border-transparent hover:border-neutral-300'
                }`}
              >
                <img src={imgUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Informative specs and Action CTA */}
        <div className="w-full md:w-[55%] flex flex-col justify-between md:overflow-y-auto p-6 md:p-8">
          
          <div className="space-y-6">
            {/* Title Name and categories */}
            <div>
              <div className="flex flex-wrap items-center gap-1 mb-1">
                {talent.categories.slice(0, showAllCategories ? talent.categories.length : 2).map((cat, idx) => (
                  <span key={idx} className="text-[10px] uppercase font-mono text-amber-700 font-bold tracking-wider">
                    {idx > 0 && ' • '} {cat}
                  </span>
                ))}
                {talent.categories.length > 2 && !showAllCategories && (
                  <button
                    onClick={() => setShowAllCategories(true)}
                    className="text-[10px] uppercase font-mono text-[#3835A4] font-black tracking-wider cursor-pointer hover:underline ml-1"
                  >
                    +{talent.categories.length - 2} more
                  </button>
                )}
              </div>
              <h1 className="font-display text-3xl font-black text-neutral-900">{talent.name}</h1>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-600">
                <MapPin className="h-4 w-4 text-neutral-400" />
                <span>Based in {talent.location}</span>
                <span className="text-neutral-300">•</span>
                <span className="text-amber-750 font-mono font-bold">Verified</span>
              </div>
            </div>

            {/* Biography */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500">Bio / Objective</h3>
              <p className="mt-1.5 text-xs text-neutral-700 leading-relaxed">
                {talent.bio}
              </p>
            </div>

            {/* Grid of Measurements / specs */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-amber-700 font-bold">Physical Specifications</h3>
              
              <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-center">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">Height</p>
                  <p className="text-sm font-black text-neutral-900 font-mono mt-0.5">{talent.stats.height} cm</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">Chest/Bust</p>
                  <p className="text-sm font-black text-neutral-900 font-mono mt-0.5">{talent.stats.chestOrBust || 88} cm</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">Waist</p>
                  <p className="text-sm font-black text-neutral-900 font-mono mt-0.5">{talent.stats.waist || 60} cm</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">Hips</p>
                  <p className="text-sm font-black text-neutral-900 font-mono mt-0.5">{talent.stats.hips || 90} cm</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">Shoe size</p>
                  <p className="text-sm font-black text-neutral-900 font-mono mt-0.5">{talent.stats.shoeSize || 38} EU</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">Hair Style</p>
                  <p className="text-sm font-black text-neutral-900 font-mono mt-0.5">{talent.stats.hairColor}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Clean Layout Action Footer */}
          <div className="mt-8 pt-4 border-t border-neutral-100">
            <button
              onClick={handleViewDetails}
              className="w-full bg-amber-500 text-white hover:bg-amber-600 font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:shadow"
            >
              <Send className="h-3.5 w-3.5" />
              <span>View Full Profile Details</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}