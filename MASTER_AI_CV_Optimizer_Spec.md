# MASTER SPEC — AI CV Optimizer + Application Pack (Ready-to-Build Web App)
**Languages (UI + AI outputs):** EN / TR / AZ / RU  
**Pricing:** Free + Pro ($30/year only)  
**Primary input:** User CV + pasted Job Description (JD) text (e.g., from LinkedIn)  
**Primary outputs:** Tailored CV (ATS-friendly) + PDF + Share Link + Cover Letter + Application Text + LinkedIn Message Drafts  
**No-code friendly:** Designed so you can paste this file into a cloud coding AI to generate the full system.

---

## 1) Product Summary (What we are building)
A web application that:
1) Lets users upload/import a CV (PDF/DOCX) or build it manually  
2) Lets users paste a job description (JD)  
3) Generates an “Application Pack” for that job:
   - Tailored CV (truthful, ATS-friendly)
   - Cover letter
   - Application text (for forms/email)
   - LinkedIn message drafts (copy/paste)
4) Provides:
   - Downloadable PDF
   - Shareable link (to send HR/recruiter when attachments aren’t possible)

**Important:** We do NOT automatically send LinkedIn messages. We generate drafts only (safer and avoids platform/TOS issues).

---

## 2) Goals, Non-Goals (MVP)
### Must-have (MVP)
- Auth (email + Google)
- CV upload (PDF/DOCX) + parsing into editable sections
- Manual CV editor
- JD paste
- AI generation (CV + cover letter + application text + LinkedIn messages) in selected language
- ATS-friendly PDF export (simple 1-column template)
- Share link page `/s/[token]` (unlisted)
- History of generated packs
- Free vs Pro yearly subscription ($30/year) with usage limits for Free
- Full i18n for UI: EN/TR/AZ/RU

### Not in MVP (V2+)
- Auto-sending messages on LinkedIn
- Scraping LinkedIn
- Full job-tracker / Kanban
- Multi-resume portfolio site builder

---

## 3) Low-cost Tech Stack (Recommended)
**Pick these to minimize cost and complexity:**
- Frontend + Backend: **Next.js (App Router)** (single repo)
- Hosting: **Vercel** (Hobby free for MVP)
- DB + Auth: **Supabase Postgres + Supabase Auth**
- File storage for PDFs: **Cloudflare R2** (cheap; signed URLs)
- Payments: **Stripe** (yearly subscription)
- Email (verification + basic notifications): **Resend** (free tier is enough at MVP)
- AI: **OpenAI-compatible API** (use a cost-effective model; implement caching + rate limits)

**Why this is cheap:** Most components have free tiers; AI cost is pay-as-you-go, controlled by limits and caching.

---

## 4) System Architecture (High-level)
### Components
- **Web app (Next.js)**
  - Pages: landing, auth, dashboard, resume editor, optimize page, results, pricing, settings, admin
  - API routes: AI generation, PDF render, share link creation, stripe webhook, usage tracking
- **Supabase**
  - Auth + Postgres
- **R2 Storage**
  - Stores generated PDFs and (optional) immutable HTML snapshots for share pages
- **Stripe**
  - Handles payments and subscription status
- **AI provider**
  - Tailoring engine

### Core principle: “Truthful Tailoring”
AI must **never invent**:
- companies, job titles, dates, roles, achievements, numbers  
If a JD asks for something missing, AI outputs:
- “Missing requirements” list + “Suggestions” (projects/courses), clearly labeled as suggestions.

---

## 5) User Experience (Screens & Flows)
### Screens
1) Landing  
2) Auth (Sign up / Login)  
3) Onboarding:
   - Choose language
   - Upload CV or “Create CV”
4) Resume Editor:
   - Sections: Header, Summary, Experience, Education, Skills, Projects, Certifications, Languages
5) Optimize:
   - Paste JD
   - Choose output language + tone
   - Click “Optimize”
6) Results (Application Pack):
   - CV preview
   - Cover letter
   - Application text
   - LinkedIn message drafts (3 variants)
   - Buttons: Download PDF, Create Share Link, Copy text
7) History:
   - Past packs (job name + date + actions)
8) Settings:
   - Language
   - Data export/delete
   - Subscription
9) Pricing:
   - Free vs Pro ($30/year)
10) Share link public page:
   - Read-only CV + optional “Download PDF” button

### Flow A — First-time
Landing → Sign up → Upload CV → Edit → Paste JD → Optimize → Download/Share

### Flow B — LinkedIn
Results → Create Share Link → Copy LinkedIn message → Send in LinkedIn chat (no attachments)

---

## 6) Pricing & Limits (Business Rules)
### Plans
- **Free**
- **Pro — $30/year only**

### Suggested Free limits (to prevent AI cost explosion)
- 3 optimizations total (lifetime) OR 3/month (choose one; recommended: 3/month for retention)
- 1 PDF export/day (or 3 total)
- Share links: 1 total (or watermark)
- Cover letter/application text: included but counts as an optimization output

### Pro entitlements
- Unlimited optimizations, PDFs, share links
- Share link analytics: views + last viewed
- No watermark

### Anti-abuse protections (even for Pro)
- Rate limit (e.g., 30 optimizations/hour/user)
- Hard cap on JD length (auto-summarize if too long)
- Cache: same CV + same JD → reuse previous result

---

## 7) Database Schema (Supabase / Postgres)
### Tables
#### `profiles`
- `id` uuid (PK, same as auth user id)
- `email` text
- `full_name` text null
- `lang` text default 'en' (en|tr|az|ru)
- `created_at` timestamptz

#### `resumes`
- `id` uuid PK
- `user_id` uuid FK profiles(id)
- `title` text (e.g., “Main CV”)
- `resume_json` jsonb (normalized resume structure)
- `created_at` timestamptz

#### `job_posts`
- `id` uuid PK
- `user_id` uuid FK profiles(id)
- `job_title` text null
- `company` text null
- `job_url` text null
- `jd_text` text (raw paste)
- `extracted_json` jsonb null (optional: extracted skills/keywords)
- `created_at` timestamptz

#### `tailored_outputs`
- `id` uuid PK
- `user_id` uuid FK profiles(id)
- `resume_id` uuid FK resumes(id)
- `job_post_id` uuid FK job_posts(id)
- `output_language` text (en|tr|az|ru)
- `tone` text (professional|friendly|confident)
- `tailored_resume_json` jsonb
- `cover_letter` text
- `application_text` text
- `linkedin_messages` jsonb (3 variants)
- `ats_keywords_used` jsonb
- `missing_requirements` jsonb
- `suggestions` jsonb
- `created_at` timestamptz

#### `pdf_files`
- `id` uuid PK
- `user_id` uuid FK profiles(id)
- `tailored_output_id` uuid FK tailored_outputs(id)
- `r2_key` text
- `template_id` text (e.g., 'simple-1col')
- `page_size` text (A4|LETTER)
- `created_at` timestamptz

#### `share_links`
- `id` uuid PK
- `user_id` uuid FK profiles(id)
- `tailored_output_id` uuid FK tailored_outputs(id)
- `token` text unique (unguessable)
- `visibility` text default 'unlisted' (unlisted|public)
- `expires_at` timestamptz null
- `revoked_at` timestamptz null
- `views` int default 0
- `last_viewed_at` timestamptz null
- `created_at` timestamptz

#### `subscriptions`
- `id` uuid PK
- `user_id` uuid FK profiles(id)
- `plan` text (free|pro)
- `status` text (active|inactive|canceled|past_due)
- `stripe_customer_id` text null
- `stripe_subscription_id` text null
- `current_period_end` timestamptz null
- `created_at` timestamptz

#### `usage_events`
- `id` uuid PK
- `user_id` uuid FK profiles(id)
- `feature` text (optimize|pdf_export|share_link)
- `count` int default 1
- `created_at` timestamptz

### SQL (run in Supabase SQL editor)
```sql
-- Enable UUIDs
create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key,
  email text,
  full_name text,
  lang text default 'en',
  created_at timestamptz default now()
);

create table if not exists resumes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null default 'Main CV',
  resume_json jsonb not null,
  created_at timestamptz default now()
);

create table if not exists job_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  job_title text,
  company text,
  job_url text,
  jd_text text not null,
  extracted_json jsonb,
  created_at timestamptz default now()
);

create table if not exists tailored_outputs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  resume_id uuid references resumes(id) on delete set null,
  job_post_id uuid references job_posts(id) on delete set null,
  output_language text not null,
  tone text not null,
  tailored_resume_json jsonb not null,
  cover_letter text not null,
  application_text text not null,
  linkedin_messages jsonb not null,
  ats_keywords_used jsonb,
  missing_requirements jsonb,
  suggestions jsonb,
  created_at timestamptz default now()
);

create table if not exists pdf_files (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  tailored_output_id uuid references tailored_outputs(id) on delete cascade,
  r2_key text not null,
  template_id text not null,
  page_size text not null,
  created_at timestamptz default now()
);

create table if not exists share_links (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  tailored_output_id uuid references tailored_outputs(id) on delete cascade,
  token text unique not null,
  visibility text not null default 'unlisted',
  expires_at timestamptz,
  revoked_at timestamptz,
  views int not null default 0,
  last_viewed_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'inactive',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

create table if not exists usage_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  feature text not null,
  count int not null default 1,
  created_at timestamptz default now()
);

-- RLS (Row Level Security)
alter table profiles enable row level security;
alter table resumes enable row level security;
alter table job_posts enable row level security;
alter table tailored_outputs enable row level security;
alter table pdf_files enable row level security;
alter table share_links enable row level security;
alter table subscriptions enable row level security;
alter table usage_events enable row level security;

-- Policies (basic)
create policy "Profiles are viewable by owner" on profiles
  for select using (auth.uid() = id);

create policy "Profiles are editable by owner" on profiles
  for update using (auth.uid() = id);

create policy "User owns resumes" on resumes
  for all using (auth.uid() = user_id);

create policy "User owns job_posts" on job_posts
  for all using (auth.uid() = user_id);

create policy "User owns tailored_outputs" on tailored_outputs
  for all using (auth.uid() = user_id);

create policy "User owns pdf_files" on pdf_files
  for all using (auth.uid() = user_id);

create policy "User owns share_links" on share_links
  for all using (auth.uid() = user_id);

create policy "User owns subscriptions" on subscriptions
  for all using (auth.uid() = user_id);

create policy "User owns usage_events" on usage_events
  for all using (auth.uid() = user_id);
```

---

## 8) Resume JSON Format (Normalized)
Store CV as structured JSON for reliable AI + PDF rendering.

### Example schema (simplified)
```json
{
  "header": {
    "fullName": "Name Surname",
    "title": "Role Title",
    "email": "user@email.com",
    "phone": "+994...",
    "location": "Baku, AZ",
    "links": ["https://linkedin.com/in/...","https://github.com/..."]
  },
  "summary": "2-3 lines",
  "skills": {
    "hard": ["SQL","Python","Excel"],
    "soft": ["Communication","Ownership"]
  },
  "experience": [
    {
      "company": "Company",
      "role": "Role",
      "location": "City",
      "startDate": "2023-01",
      "endDate": "2024-12",
      "bullets": ["Did X","Improved Y by Z% (real)"]
    }
  ],
  "education": [
    {"school":"University","degree":"BSc ...","startDate":"2019-09","endDate":"2023-06"}
  ],
  "projects": [
    {"name":"Project","description":"...","bullets":["..."],"link":"https://..."}
  ],
  "certifications": ["..."],
  "languages": ["Azerbaijani (Native)","English (B2)"]
}
```

---

## 9) AI Engine (Prompts + Outputs)
### AI tasks
1) Extract key requirements from JD
2) Tailor CV truthfully:
   - reorder bullets, rewrite phrasing, highlight relevant parts
3) Generate:
   - cover letter
   - application text
   - LinkedIn messages (3 variants)
4) Provide:
   - ats_keywords_used
   - missing_requirements
   - suggestions (projects/courses)

### System Rules (hard)
- Never invent experience, employers, dates, education, certifications.
- Never invent metrics (%, $, users, etc.).
- If needed, ask user to confirm missing facts (in UI: “Add details?”), but MVP can proceed with what exists.
- Clearly label suggestions as suggestions.

### Prompt Template (for cloud AI to implement)
**Inputs:**
- `resume_json`
- `job_description_text`
- `output_language` = en|tr|az|ru
- `tone` = professional|friendly|confident

**Expected output JSON (strict):**
```json
{
  "tailored_resume_json": { ... },
  "cover_letter": "string",
  "application_text": "string",
  "linkedin_messages": {
    "recruiter": "string",
    "hiring_manager": "string",
    "referral": "string"
  },
  "ats_keywords_used": ["..."],
  "missing_requirements": ["..."],
  "suggestions": {
    "projects": ["..."],
    "courses": ["..."],
    "skills_to_learn": ["..."]
  }
}
```

### Cost control (required)
- Before AI: run a cheap “JD summarizer” if JD > N chars
- Use caching keyed by:
  - `hash(resume_json + jd_text + output_language + tone)`
- Store the AI result; re-use when the user clicks “regenerate” unless they changed inputs

---

## 10) PDF Generation (ATS-friendly)
### Templates (MVP)
- `simple-1col` (one-column, no icons, no tables)
- clean headings, consistent spacing

### Implementation (recommended)
- Render HTML from `tailored_resume_json`
- Use a server-side PDF renderer:
  - Playwright/Chromium print-to-PDF OR a Node PDF library
- Store PDF to R2
- Return a signed download URL

### Rules
- Free plan: optional watermark
- Pro plan: no watermark
- Support A4 + Letter

---

## 11) Share Links
### Behavior
- `/s/[token]` shows read-only tailored CV (plus optional PDF button)
- Token is unguessable (e.g., 32+ chars)
- Respect:
  - revoked_at
  - expires_at
- Track:
  - views increment
  - last_viewed_at update

### Visibility
- `unlisted` default (not indexed)
- Optional `public` in Pro plan (still tokenized)

---

## 12) Payments (Stripe) — Yearly only
### Stripe configuration
- Product: “Pro”
- Price: $30/year recurring
- Checkout: stripe-hosted checkout session
- Webhook endpoint: `/api/stripe/webhook`

### Subscription logic
- If Stripe subscription active → `subscriptions.plan = 'pro'` and `status='active'`
- On cancel/expire → downgrade to Free rules (keep existing data)

---

## 13) Usage Limits Enforcement (Free vs Pro)
### Server-side checks (must)
Before running expensive actions:
- `optimize`
- `pdf_export`
- `share_link_create`

**Algorithm**
1) Determine plan from `subscriptions`
2) If Pro active → allow (still rate limit)
3) If Free → query `usage_events` for current month or lifetime and enforce limits
4) Record usage_event after success

### Rate limiting (recommended)
- Simple in-memory (Vercel edge) or DB-based
- Example: 30 optimizations/hour/user

---

## 14) i18n (EN/TR/AZ/RU) — UI + AI outputs
### UI language switcher
- In header, available on every page
- Persist to profile + cookie/localStorage

### Translation files
- `locales/en/common.json`
- `locales/tr/common.json`
- `locales/az/common.json`
- `locales/ru/common.json`

### Key UI strings (minimum set)
- `cta_start_free`
- `cta_upgrade_pro`
- `nav_dashboard`
- `nav_pricing`
- `upload_cv`
- `paste_jd`
- `optimize`
- `download_pdf`
- `create_share_link`
- `copy_linkedin_message`
- `history`
- `settings`
- `limit_reached`
- `upgrade_to_continue`

### Ready translations (starter)
**EN**
- Start free
- Upgrade to Pro ($30/year)
- Upload CV
- Paste job description
- Optimize
- Download PDF
- Create share link
- Copy LinkedIn message
- Usage limit reached. Upgrade to continue.

**TR**
- Ücretsiz başla
- Pro’ya yükselt (30$/yıl)
- CV yükle
- İş ilanını yapıştır
- Optimize et
- PDF indir
- Paylaşım linki oluştur
- LinkedIn mesajını kopyala
- Kullanım limitine ulaştın. Devam etmek için yükselt.

**AZ**
- Pulsuz başla
- Pro-ya keç (30$/il)
- CV yüklə
- İş elanını yapışdır
- Optimallaşdır
- PDF yüklə
- Paylaşım linki yarat
- LinkedIn mesajını kopyala
- Limitə çatdın. Davam etmək üçün Pro-ya keç.

**RU**
- Начать бесплатно
- Перейти на Pro (30$/год)
- Загрузить резюме
- Вставить текст вакансии
- Оптимизировать
- Скачать PDF
- Создать ссылку для отправки
- Скопировать сообщение для LinkedIn
- Достигнут лимит. Перейдите на Pro, чтобы продолжить.

---

## 15) Repo Structure (What cloud AI should generate)
```
/app
  /(marketing)
    /page.tsx        (landing)
    /pricing/page.tsx
  /(auth)
    /login/page.tsx
    /signup/page.tsx
  /(dashboard)
    /dashboard/page.tsx
    /resume/page.tsx
    /optimize/page.tsx
    /results/[id]/page.tsx
    /history/page.tsx
    /settings/page.tsx
  /s/[token]/page.tsx
/api
  /ai/optimize/route.ts
  /pdf/render/route.ts
  /share/create/route.ts
  /stripe/checkout/route.ts
  /stripe/webhook/route.ts
  /usage/check/route.ts
/lib
  supabase.ts
  stripe.ts
  r2.ts
  i18n.ts
  ai.ts
  rateLimit.ts
  cache.ts
/components
  LanguageSwitcher.tsx
  ResumeEditor.tsx
  JobPasteBox.tsx
  ResultsTabs.tsx
  PricingCards.tsx
/locales
  /en/common.json
  /tr/common.json
  /az/common.json
  /ru/common.json
```

---

## 16) Environment Variables (copy/paste)
### Supabase
- `NEXT_PUBLIC_SUPABASE_URL=...`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- `SUPABASE_SERVICE_ROLE_KEY=...` (server only)

### Stripe
- `STRIPE_SECRET_KEY=...`
- `STRIPE_WEBHOOK_SECRET=...`
- `STRIPE_PRICE_ID_PRO_YEARLY=...`

### AI
- `OPENAI_API_KEY=...`
- `OPENAI_MODEL=...`

### Cloudflare R2 (S3-compatible)
- `R2_ENDPOINT=...`
- `R2_ACCESS_KEY_ID=...`
- `R2_SECRET_ACCESS_KEY=...`
- `R2_BUCKET=cv-pdfs`

### Resend
- `RESEND_API_KEY=...`
- `EMAIL_FROM=no-reply@yourdomain.com`

### App
- `APP_URL=https://yourdomain.com`

---

## 17) Deployment Checklist (No dev knowledge)
### Step 1 — Create accounts
- Supabase
- Stripe
- Cloudflare (R2)
- Vercel
- Resend
- AI provider account

### Step 2 — Supabase setup
- Create project
- Run SQL from section 7
- Enable Auth providers (Email + Google)
- Add redirect URLs: `APP_URL/*`

### Step 3 — Stripe setup
- Create product “Pro”
- Create yearly price = $30/year
- Set webhook events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

### Step 4 — R2 setup
- Create bucket `cv-pdfs`
- Create access keys
- Keep bucket private

### Step 5 — Vercel deploy
- Connect GitHub repo generated by cloud AI
- Add env vars from section 16
- Deploy

### Step 6 — Domain
- Add custom domain in Vercel
- Configure DNS

### Step 7 — Smoke test
- Sign up
- Upload CV
- Paste JD
- Generate output
- Download PDF
- Create share link
- Upgrade to Pro and test unlimited

---

## 18) Cloud AI “Build Prompt” (Single Prompt to generate the full system)
Copy-paste this into your cloud coding AI (Cursor / Bolt / Lovable / etc.):

**PROMPT (EN):**
Build a production-ready Next.js (App Router) web app called “AI CV Optimizer”.
Requirements:
1) Auth: Supabase email + Google.
2) DB: Supabase Postgres with tables and RLS policies from the MASTER SPEC (use the provided SQL).
3) Pricing: Free + Pro ($30/year only). Payments via Stripe Checkout. Webhook updates `subscriptions` table.
4) i18n: Full UI localization in EN/TR/AZ/RU with a language switcher in the header. Store selected language in profile + cookie.
5) Core flow:
   - User uploads CV (PDF/DOCX). Parse into a normalized resume_json (use a simple parser; allow manual editing of every field).
   - User pastes a job description text (JD).
   - On “Optimize”, call AI and generate:
     a) tailored_resume_json (truthful; do not invent experience/metrics)
     b) cover_letter
     c) application_text
     d) linkedin_messages (recruiter/hiring_manager/referral)
     e) ats_keywords_used, missing_requirements, suggestions
   - Save outputs in `tailored_outputs`.
6) Output:
   - Generate ATS-friendly PDF (simple 1-column template) from tailored_resume_json using server-side rendering (Playwright print-to-PDF is acceptable).
   - Store PDF in Cloudflare R2 (private) and return signed download URL.
   - Create shareable link `/s/[token]` that shows read-only CV and optional PDF download (respect expiry/revoke).
7) Limits:
   - Enforce Free plan limits server-side using `usage_events`.
   - Pro plan unlimited but add rate limiting (e.g., 30 optimizations/hour/user) and caching by hash.
8) Pages:
   - Landing, Pricing, Login, Signup, Dashboard, Resume Editor, Optimize, Results, History, Settings, Share Page.
9) Security:
   - RLS for all user-owned tables.
   - Share token unguessable; unlisted default; revoke and optional expiry.
   - Data deletion: user can delete all stored data.
10) Minimal clean UI, mobile-friendly.
Deliver: full repository code + README with deploy steps to Vercel, plus env var list.

---

## 19) Acceptance Criteria (MVP is “done”)
- User can sign up, choose language, upload CV
- CV is parsed into editable sections
- User can paste JD and generate outputs in selected language
- Outputs saved; visible in history
- PDF export works and is ATS-friendly
- Share link works (tokenized, unlisted, view tracking)
- Free limits enforced; Pro unlocks unlimited
- Stripe checkout + webhook works
- EN/TR/AZ/RU UI fully functional
- User can delete their data

---

## 20) Future Upgrade (Optional)
- Apify-powered job recommendations from permitted sources (NOT LinkedIn scraping in MVP)
- Better CV parsing + template library
- Recruiter CRM + outreach tracking
- Team accounts

---

# END OF MASTER SPEC
