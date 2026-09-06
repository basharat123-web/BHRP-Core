# BHRP Core - Vercel & Supabase Free Hosting Guide (0 PKR)

Yeh guide aapko **BHRP Core** web app ko 100% free me **Supabase** (Database) aur **Vercel** (Global Web Hosting) par live karne ke liye step-by-step guideline deti hai.

---

## 🛠️ Step 1: Supabase Free Database Setup

1. **Account Banayein**:
   - Browser me [https://supabase.com](https://supabase.com) kholein aur **Sign Up** karein (GitHub ya Email se).

2. **Naya Project Banayein**:
   - **New Project** par click karein.
   - Project Name: `BHRP Core`
   - Database Password rakhein aur region select karein (e.g. Frankfurt).
   - **Create New Project** par click karein (1 minute me DB ready ho jata hai).

3. **Database Schema Setup (SQL Execution)**:
   - Left Sidebar me **SQL Editor** par click karein.
   - Project me maujood [`schema.sql`](file:///d:/data/RP%20family/schema.sql) file ka sara code copy karein aur SQL Editor me paste karein.
   - Bottom Right me **Run** button press karein. Is se aapke sare tables (`organizations`, `members`, `events`, `event_slots`) automatically ban jayenge.

4. **API Keys Copy Karein**:
   - Left Sidebar me **Project Settings** → **API** section me jayein.
   - Yahan se 2 cheezein copy karein:
     - **Project URL** (e.g. `https://xyz.supabase.co`)
     - **anon / public key** (e.g. `eyJhbGciOi...`)

---

## 🚀 Step 2: Vercel Par App Live Deploy Karein

1. **Code GitHub Par Push Karein**:
   - Is folder (`d:\data\RP family`) ko apne GitHub account par upload/push karein repository name `bhrp-core` ke saath.

2. **Vercel Account Connection**:
   - [https://vercel.com](https://vercel.com) par jayein aur apne GitHub account se Login karein.

3. **Import Project**:
   - Vercel Dashboard par **Add New...** → **Project** click karein.
   - Apni GitHub repo **bhrp-core** select karke **Import** par click karein.

4. **Environment Variables Add Karein**:
   - Deploy se pehle **Environment Variables** section kholein aur 2 keys add karein:
     - `NEXT_PUBLIC_SUPABASE_URL` = (Jo URL Supabase se copy kiya tha)
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (Jo Anon Key Supabase se copy ki thi)

5. **Deploy Button Press Karein**:
   - **Deploy** par click karein! Sirf 60 seconds me aapki app live link ke sath tayyar ho jayegi (e.g. `https://bhrp-core.vercel.app`).

---

## 📱 Step 3: Mobile Mobile App (PWA) Direct Install

Is web app ko Play Store par publish kiye baghair mobile app ki tarah use karne ke liye:

1. **Android Phones**:
   - Chrome Browser me Vercel wala link kholein (`https://bhrp-core.vercel.app`).
   - Top Right 3 dots menu par tap karein aur **"Add to Home Screen"** ya **"Install App"** select karein.

2. **iPhones / iOS**:
   - Safari Browser me link kholein.
   - Bottom Share icon par tap karein aur **"Add to Home Screen"** tap karein.

Aapke mobile home screen par **BHRP Core** app icon ban jayega jo bilkul native app ki tarah full-screen open hoga!
