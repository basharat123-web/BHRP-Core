'use client';

import React, { useState } from 'react';
import { Rocket, Database, Globe, CheckCircle2, Copy, Check, Terminal, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

export const DeployGuide: React.FC = () => {
  const [copiedSql, setCopiedSql] = useState(false);

  const sqlSnippet = `-- Copy this script into Supabase SQL Editor:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    discord_tag TEXT NOT NULL,
    ingame_id TEXT NOT NULL,
    rank TEXT DEFAULT 'Member',
    status TEXT DEFAULT 'Active',
    strikes INT DEFAULT 0,
    xp INT DEFAULT 100,
    joined_date DATE DEFAULT CURRENT_DATE
);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-8 shadow-2xl">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Zap className="w-3.5 h-3.5" />
            <span>0 PKR Investment Strategy • Free Hosting & DB</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            BHRP Core Live Deployment Guide (Vercel & Supabase)
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Follow this simple step-by-step guide to connect your **Supabase Database** and host **BHRP Core** live on **Vercel** for 100% Free!
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none flex items-center justify-center">
          <Rocket className="w-96 h-96 text-cyan-400" />
        </div>
      </div>

      {/* Step 1: Supabase Database Setup */}
      <div className="bg-[#0f1423] p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-xl">
            1
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>Step 1: Setup Free Supabase Database</span>
            </h3>
            <p className="text-xs text-slate-400">PostgreSQL Cloud Database (500MB Free Storage)</p>
          </div>
        </div>

        <ol className="list-decimal list-inside space-y-3 text-slate-300 text-xs leading-relaxed pl-2">
          <li>
            Open <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-semibold">https://supabase.com</a> and sign in with GitHub or Email.
          </li>
          <li>Click <strong>New Project</strong>, type name <code>bhrp-core-db</code>, set database password and select region (e.g. Frankfurt or Singapore).</li>
          <li>Once created, go to the <strong>SQL Editor</strong> tab on the left menu.</li>
          <li>
            Paste the contents of <code className="text-amber-300 font-mono">schema.sql</code> (provided in this project) or copy the snippet below, then click <strong>Run</strong>.
          </li>
        </ol>

        {/* SQL Snippet Box */}
        <div className="relative bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
          <button
            onClick={handleCopySql}
            className="absolute right-3 top-3 px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL'}</span>
          </button>
          <pre>{sqlSnippet}</pre>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <p className="text-xs font-semibold text-slate-200">Get API Keys for Vercel:</p>
          <p className="text-xs text-slate-400">
            Go to <strong>Project Settings → API</strong> in Supabase. Copy <strong>Project URL</strong> and <strong>anon / public key</strong>.
          </p>
        </div>
      </div>

      {/* Step 2: Vercel Free Hosting */}
      <div className="bg-[#0f1423] p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-black text-xl">
            2
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              <span>Step 2: Deploy Free on Vercel</span>
            </h3>
            <p className="text-xs text-slate-400">Ultra-fast Global CDN Web Hosting</p>
          </div>
        </div>

        <ol className="list-decimal list-inside space-y-3 text-slate-300 text-xs leading-relaxed pl-2">
          <li>Push your project code to GitHub repository (e.g. <code>github.com/your-username/bhrp-core</code>).</li>
          <li>Log into <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-semibold">https://vercel.com</a> with GitHub.</li>
          <li>Click <strong>Add New → Project</strong> and select <code>bhrp-core</code> repository.</li>
          <li>
            In <strong>Environment Variables</strong> section, add:
            <ul className="list-disc list-inside ml-6 mt-1.5 space-y-1 font-mono text-cyan-300">
              <li><code>NEXT_PUBLIC_SUPABASE_URL</code> = [Your Supabase Project URL]</li>
              <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> = [Your Supabase Anon Key]</li>
            </ul>
          </li>
          <li>Click <strong>Deploy</strong>! Within 60 seconds, your site will be live at <code>https://bhrp-core.vercel.app</code>.</li>
        </ol>
      </div>

      {/* Step 3: Mobile PWA Installation Guide */}
      <div className="bg-[#0f1423] p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-black text-xl">
            3
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>Step 3: Mobile App PWA Install</span>
            </h3>
            <p className="text-xs text-slate-400">Turn website into Android/iOS App for free</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-sm">Android (Chrome Browser):</h4>
            <p className="text-slate-400">Open Vercel URL on mobile → Tap 3 Dots Menu → Select <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>.</p>
          </div>

          <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-white text-sm">iOS / iPhone (Safari):</h4>
            <p className="text-slate-400">Open Vercel URL in Safari → Tap Share Icon → Select <strong>"Add to Home Screen"</strong>.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
