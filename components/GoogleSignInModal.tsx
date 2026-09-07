'use client';

import React, { useState } from 'react';
import { X, Mail, Shield, Crown, ArrowRight, Sparkles } from 'lucide-react';
import { signInWithGoogle } from '@/lib/supabase';

interface GoogleSignInModalProps {
  onClose: () => void;
  onDirectEmailSignIn: (email: string, name?: string) => void;
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  onClose,
  onDirectEmailSignIn,
}) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOAuthClick = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      console.warn('OAuth redirect notice:', error.message);
    }
    setLoading(false);
  };

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onDirectEmailSignIn(email, fullName || email.split('@')[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111B21]/90 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="relative w-full max-w-md bg-[#1F2C34] border border-[#2A3942] rounded-2xl p-6 sm:p-8 shadow-2xl text-[#E9EDEF] space-y-6 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-[#111B21] border border-[#2A3942] text-[#8696A0] hover:text-[#E9EDEF] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-2 py-0.5 rounded bg-[#00A884]/10 text-[#00A884] text-[10px] font-semibold uppercase">
            <Shield className="w-3.5 h-3.5" /> Authentication Portal
          </div>
          <h2 className="text-2xl font-bold text-[#E9EDEF]">
            Sign in with Google
          </h2>
          <p className="text-[#8696A0] text-sm">
            Authenticate to access your family squad roster & convoy schedule.
          </p>
        </div>

        {/* 1. Primary Google OAuth Button */}
        <button
          onClick={handleOAuthClick}
          disabled={loading}
          className="w-full py-3.5 px-6 rounded bg-[#E9EDEF] hover:bg-white text-[#111B21] font-semibold text-sm flex items-center justify-center space-x-3 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.14C3.26 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.29v3.14c-.81 1.6-1.29 3.4-1.29 5.27s.48 3.67 1.29 5.27l3.99-3.12z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.59l3.99 3.14c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{loading ? 'Redirecting to Google...' : 'Continue with Google'}</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-[#2A3942]" />
          <span className="absolute px-3 bg-[#1F2C34] text-[10px] uppercase font-semibold text-[#8696A0]">OR QUICK EMAIL LOGIN</span>
        </div>

        {/* 2. Direct Email Login Form */}
        <form onSubmit={handleDirectSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#8696A0] mb-1">Google Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8696A0]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. basharat81253@gmail.com"
                className="w-full pl-9 pr-4 py-2.5 bg-[#111B21] border border-[#2A3942] rounded text-[#E9EDEF] text-sm focus:border-[#00A884] outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#8696A0] mb-1">Display Name (Optional)</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Basharat Hussain"
              className="w-full px-3 py-2.5 bg-[#111B21] border border-[#2A3942] rounded text-[#E9EDEF] text-sm focus:border-[#00A884] outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded bg-[#00A884] hover:bg-[#06CF9C] text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <span>Proceed to Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Root Admin Preset */}
        <div className="pt-4 border-t border-[#2A3942]">
          <button
            onClick={() => onDirectEmailSignIn('basharat81253@gmail.com', 'Basharat Hussain')}
            className="w-full py-2.5 px-3 rounded bg-[#00A884]/10 hover:bg-[#00A884]/20 border border-[#00A884]/20 text-[#00A884] font-semibold text-xs flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Crown className="w-4 h-4" />
              <span>Login as Root Admin (basharat81253@gmail.com)</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
