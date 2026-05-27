const mongoose = require('mongoose');
const FAQ = require('../models/FAQ');

const seedData = [
  {
    category: 'About the Internship',
    icon: '📋',
    questions: [
      { q: 'What is the Vicharanashala internship?', a: 'A two-month internship run by Vicharanashala, a research lab at IIT Ropar. You work on a real open-source project under a mentor after a short training phase. The internship is free — we do not charge, and the work is real.' },
      { q: 'What is VINS?', a: 'VINS is the Vicharanashala Internship — an online programme open to anyone who clears our interview. The work is real open-source contribution under a mentor, the certificate is from the Vicharanashala Lab for Education Design at IIT Ropar, and the programme is free. There is no stipend.' },
      { q: 'What are the phases of VINS and what do the badges mean?', a: 'Bronze (Phase 1) — short training period. Silver (Phase 2) — main project work completing the internship. Gold (Phase 3) — recognition for a meaningful feature. Platinum (Phase 4) — standing invitation to visit the lab with a travel stipend.' },
      { q: 'Who is the internship for? Are alumni eligible?', a: 'Currently-enrolled students at any college or university (UG, PG, doctoral). Candidates who have already graduated and are not currently enrolled are not eligible for this cycle.' },
      { q: 'Is this the same as IIT Ropar\'s official Summer Research Internship?', a: 'No. Summership 2026 is a VLED Lab initiative. The certificate is issued by the Vicharanashala Lab for Education Design, not centrally by IIT Ropar.' },
      { q: 'Can I take leave for my classes during the internship?', a: 'Leave is not permitted. If you are also attending classes or exams, you will be relieved from the internship immediately and will need to join the next batch.' },
    ],
  },
  {
    category: 'Timing & Dates',
    icon: '📅',
    questions: [
      { q: 'When can I start?', a: 'Any time in 2026, but your internship must finish by 31 December 2026. Starting as early as possible is strongly recommended to benefit from cohort networking, TA support, and structured training.' },
      { q: 'How long is the internship?', a: 'Two months from your chosen start date, with an optional one-month grace period. End must land on or before 31 December 2026.' },
      { q: 'Can I start later if I have exams now?', a: 'Yes — wait until your exams are done, then opt in and start. Do not attempt to juggle this internship with ongoing exams.' },
      { q: 'Can I start with the cohort and take relaxation during my exams?', a: 'No. VINS is a full-attention internship (6–10 hours/day). Splitting attention with exams damages both. Defer your start to after your exams.' },
      { q: 'Can I take leave for an exam scheduled in June?', a: 'No — the 55-day continuous window is non-negotiable. Split attention genuinely damages both exam preparation and internship work.' },
      { q: 'Are orientation session recordings shared?', a: 'Recordings of the sessions will not be provided. However, we may provide access to an abridged version of a talk or session if considered important.' },
    ],
  },
  {
    category: 'NOC (No Objection Certificate)',
    icon: '📄',
    questions: [
      { q: 'What dates do I put on the NOC?', a: 'Your chosen start date to start + 2 months (with up to 1 month grace), ensuring end date is on or before 31 December 2026.' },
      { q: 'Who can sign the NOC?', a: 'Any authorised signatory at your college: HOD, Acting HOD, Principal, Dean, Director, or Training & Placement Officer. For dual-degree students, either institution can sign.' },
      { q: 'When do I submit the NOC? Is the deadline hard?', a: 'There is no hard deadline, but submit it as early as possible to join the summer cohort and get the full experience with TA support.' },
      { q: 'What format should I use for the NOC?', a: 'We provide a printable NOC format on your dashboard. You do not need to draft anything yourself or use college letterhead.' },
      { q: 'Can my college use their own NOC format?', a: 'Yes, as long as it has: the signing authority\'s handwritten signature, their official email, your full name, and your signature.' },
      { q: 'Does the NOC need to be signed by hand?', a: 'Yes — handwritten signature, institutional rubber stamp, and signatory\'s email are required. Digital signatures are not accepted on the PDF path.' },
      { q: 'Can my HOD email the NOC instead of signing a printout?', a: 'Yes — use the email-forward path. Your HOD forwards the text NOC to sudarshan@iitrpr.ac.in from their official institutional email. The forward itself counts as the signature.' },
      { q: 'How do I download and upload the NOC?', a: 'Both happen on your dashboard at samagama.in. Use the "Download blank NOC" and "Upload signed NOC (PDF)" buttons.' },
      { q: 'What if my NOC is not formally verified yet?', a: 'Upload a self-declaration on your profile — a tentative offer letter will be issued immediately. The formal offer letter follows once NOC clears verification.' },
      { q: 'My online course won\'t issue an NOC. What do I do?', a: 'The internship is only for students in a full-time degree programme. Online-only courses do not make a candidate eligible unless concurrently enrolled in a full-time degree.' },
      { q: 'My HOD wants written confirmation before signing. What do I show them?', a: 'Upload a self-declaration on samagama.in — a tentative offer letter is issued immediately. Hand that to your HOD as written confirmation.' },
      { q: 'Can Prof. Sudarshan or an IIT Ropar faculty sign my NOC?', a: 'No — your NOC must be signed by an authorised signatory at the institution where you are enrolled as a student.' },
    ],
  },
  {
    category: 'Selection & Offer Letter',
    icon: '📨',
    questions: [
      { q: 'How do I know I am selected?', a: 'If you can see your yellow VINS result panel on samagama.in, you are selected. There is no separate confirmation email.' },
      { q: 'How do I opt into VINS?', a: 'Tell Yaksha in the chat: "I want to take up the online internship without stipend." Yaksha will confirm.' },
      { q: 'When do I get the offer letter?', a: 'Path 1 (default) — after NOC verification + dates confirmed. Path 2 (faster) — upload a self-declaration for a tentative offer letter immediately. The offer letter lives on your dashboard.' },
      { q: 'Will I get a certificate?', a: 'Yes — every intern who completes the programme gets a certificate from Vicharanashala, IIT Ropar. Candidates who drop out mid-way do not get a certificate.' },
      { q: 'How do I confirm my internship dates?', a: 'Log in to samagama.in — you\'ll see a yellow "Confirm your internship dates" card on the dashboard. Pick your start and end dates and save.' },
      { q: 'How do I accept the offer letter?', a: 'Reply All on the offer-letter thread with the exact acceptance statement printed in the letter. Do not paraphrase — this is the first attention-to-detail check.' },
      { q: 'What if I reply without the exact acceptance format?', a: 'The offer is withdrawn immediately. Paraphrasing, missing the date, or missing the FAQ clause counts as non-compliant.' },
      { q: 'I received a withdrawal email due to format error. Can it be reversed?', a: 'Yes — email sudarshansudarshan@gmail.com with the exact subject "Request to Reconsider: Confirmation Reply Error". If granted, you\'ll be placed on a separate track with an attention-to-detail course.' },
      { q: 'My dashboard doesn\'t update after sending acceptance.', a: 'This is normal. The dashboard tracks NOC, dates, and offer letter — it does not track the acceptance email. If compliant, no further action is needed.' },
      { q: 'Can I change my internship dates?', a: 'Before the offer letter is issued — yes. After the offer letter is issued — no, dates are final.' },
      { q: 'When do I get the Zoom link for kickoff?', a: 'The kickoff is for the main summer cohort only. The Zoom link is delivered via email and your Yaksha chat portal on samagama.in.' },
      { q: 'My NOC isn\'t ready but start date is approaching.', a: 'Upload a self-declaration on your dashboard — a tentative offer letter is issued immediately. You then have a 15-day window to upload the signed NOC.' },
      { q: 'When does my internship actually begin?', a: 'On the start date you confirmed — no separate notification is sent. Log in to samagama.in on that morning and Yaksha will guide you through Day 1.' },
      { q: 'Can I switch from VINS (online) to VISE (offline)?', a: 'No — the two tracks are finalised at the interview stage. The project, mentor, and certificate are the same for both tracks.' },
      { q: 'How do I get daily Zoom standup links? Are they mandatory?', a: 'Links are posted in the Announcements section on your dashboard. Attending daily standups is mandatory for all interns.' },
    ],
  },
  {
    category: 'Work & Mentorship',
    icon: '💻',
    questions: [
      { q: 'What will I work on?', a: 'A real open-source project from Vicharanashala\'s portfolio — AI/ML, web development, NLP, computer vision, agriculture-tech (Annam.AI), education-tech (ViBe), and open-source infrastructure.' },
      { q: 'How many hours per day?', a: '6 to 10 hours a day, sometimes more during the build phase. This is a full-time internship for the two-month window.' },
      { q: 'Who is my mentor?', a: 'You work with the lab\'s research and engineering team. The model is fluid — a senior researcher one day, a peer the next. That is how real open-source work happens.' },
      { q: 'Is there a stipend?', a: 'No, the internship is unpaid. Stellar performers may be recognised with a discretionary stipend at the lab\'s option, but this is not promised or expected.' },
      { q: 'Do I need my own laptop? Should I preload software?', a: 'Yes — a personal laptop is required (Linux or macOS preferred). Your mentor will guide you on specific tools once your project is assigned.' },
      { q: 'I\'m using a different email on GitHub/Zoom — is that okay?', a: 'No — your registered email is your sole identifier across all platforms. Progress tracking, mentor assignment, and certificate issuance are all tied to it.' },
      { q: 'Why hasn\'t my mentor been assigned yet?', a: 'Mentors are assigned when you move to the project phase (Silver), not on Day 1. You must complete the Bronze coursework first.' },
    ],
  },
  {
    category: 'Code of Conduct',
    icon: '⚖️',
    questions: [
      { q: 'What are the official communication channels?', a: '1) Announcements on samagama.in, 2) Yaksha chat (use #escalate for a human), 3) Discussion forum, 4) Email to sudarshansudarshan@gmail.com as last resort. WhatsApp support is cancelled. Unofficial groups are strictly prohibited.' },
    ],
  },
  {
    category: 'Interviews',
    icon: '🎤',
    questions: [
      { q: 'My interview is not marked as complete. What do I do?', a: 'A data-sync issue sometimes occurs. The team will check and manually mark it as complete within 1–2 hours. If not resolved, write to sudarshansudarshan@gmail.com.' },
    ],
  },
  {
    category: 'Certificate',
    icon: '🎓',
    questions: [
      { q: 'Does Vicharanashala send a grade report to my university?', a: 'No — the certificate is the document you submit to your college. We don\'t send formal evaluation or grade reports to universities.' },
      { q: 'Does the certificate specify online or offline mode?', a: 'No — the certificate is the same for both tracks and does not specify the mode of completion.' },
      { q: 'Will the certificate be a physical hardcopy or e-certificate?', a: 'E-certificate — you download it from your dashboard after completing both Bronze and Silver. It is digitally signed and verifiable from our database.' },
      { q: 'Is there a WhatsApp group for candidates?', a: 'No. See §6.1 in the FAQ for official communication channels. WhatsApp support is cancelled and unofficial groups are prohibited.' },
    ],
  },
  {
    category: 'Rosetta (Internship Journal)',
    icon: '📓',
    questions: [
      { q: 'What is Rosetta?', a: 'Your internship journal — a 65-day document, one entry per day, for the full duration of Summership 2026. You write in it daily, keep it privately, and submit it at the end as a completion requirement.' },
      { q: 'Is Rosetta just busywork?', a: 'No. It helps you process your experience and articulate what you learned. For us, it provides qualitative insight to improve the programme.' },
      { q: 'What is a "thinking routine"?', a: 'A short framework that shapes your reflection — e.g., 3-2-1 (3 things engaged, 2 questions, 1 surprise), Muddy/Clear, or What? So What? Now What?' },
      { q: 'How do I get my Rosetta journal?', a: 'A Google Doc template link is shared during orientation. Make a copy to your own Google Drive and rename it "Rosetta — [Your Name] — Summership 2026".' },
      { q: 'How do I use it day to day?', a: 'Open your copy, scroll to today\'s entry, fill in the date, read the thinking routine, and answer the prompts. Takes 10–20 minutes.' },
      { q: 'How long should each entry be?', a: 'No minimum or maximum. 3–5 sentences per prompt is usually enough. Be honest and specific. One-word answers, vague entries, or AI-generated text are not acceptable.' },
      { q: 'What is the one rule of Rosetta?', a: 'Write what is true — not what sounds impressive or what you think we want to read. The journal only counts if it is genuinely yours.' },
      { q: 'Can I use ChatGPT or AI to write my entries?', a: 'No. This is the one firm rule. Entries that read as AI-generated will not be counted toward your completion requirement.' },
      { q: 'What if I miss a day?', a: 'Fill it in as soon as you can. Write the actual date you are filling it in, not the missed date. A late honest entry is always better than no entry.' },
      { q: 'Will anyone read my journal during the internship?', a: 'No — we only read it after you submit it at the end. This is intentional so you can write freely without feeling observed.' },
      { q: 'Can prompts change mid-internship?', a: 'Occasionally. Changes will be announced on the Announcements section before that day begins.' },
      { q: 'How do I submit Rosetta at the end?', a: 'Share your Google Doc with the programme coordinator\'s email (shared during wrap-up week) with Viewer permission. All 65 entries must be filled.' },
      { q: 'My college wants confirmation the internship is self-paced.', a: 'This is not a self-paced internship. It is a rigorous, time-demanding programme. It is not permitted to be part of any other activity during this period.' },
    ],
  },
  {
    category: 'Coursework & ViBe LMS',
    icon: '📚',
    questions: [
      { q: 'I\'ve previously interned — am I exempt from coursework?', a: 'Partially — if you completed the MERN Stack coursework, you don\'t need to repeat it. But the AI Fundamentals course is new and mandatory for everyone, including returning interns.' },
      { q: 'How do I register for the AI Fundamentals course on ViBe?', a: 'Click the registration link in the Announcements section. You\'ll be redirected to ViBe sign-in — use the same Gmail as samagama. Reopen the link after login to enrol.' },
      { q: 'I registered on ViBe with a different email — is that OK?', a: 'Use the same email on both platforms. Exception: if samagama email is not Gmail, use any Gmail for ViBe and tell Yaksha with "#vibe-email your-email@gmail.com".' },
      { q: 'Are live sessions mandatory if I\'m on the viva route?', a: 'Yes — live sessions are mandatory for every intern regardless of path. The exchange of knowledge across the cohort cannot be replicated by self-paced study.' },
      { q: 'Where do I find the daily live-session schedule?', a: 'Posted in the Announcements section on samagama.in at least 1 hour before the session begins. That is the only channel for session notifications.' },
    ],
  },
  {
    category: 'Yaksha Chat',
    icon: '💬',
    questions: [
      { q: 'I\'m unable to type in the chat after clicking "Interact with Yaksha".', a: 'Scroll up to the top of your window and click the "Chat with Yaksha" button to activate the chat input.' },
    ],
  },
  {
    category: 'ViBe Platform',
    icon: '🖥️',
    questions: [
      { q: 'How do I log in to ViBe?', a: 'Go to https://vibe.vicharanashala.ai/auth. Sign up as a student with your registered email. Check the Notifications tab to accept the course invite.' },
      { q: 'Invite accepted but shows "No course enrolled"?', a: 'Check you\'re logged in with the correct email. Log out and back in. Allow third-party cookies for .vicharanashala.ai, change DNS to Google (8.8.8.8, 8.8.4.4), and flush DNS cache.' },
      { q: 'Why are videos stuck or repeating?', a: 'ViBe has a monitored learning system. Videos must be watched fully in sequence with camera on. Poor lighting, background noise, or switching tabs may affect playback.' },
      { q: 'Can I use a mobile or tablet for ViBe?', a: 'No — only desktop/laptop is supported.' },
      { q: 'What should I do for video issues on ViBe?', a: 'Refresh the page, inspect browser console for errors, try a different browser, clear cache. If persists, contact Yaksha with "#escalate-ViBe".' },
      { q: 'Progress shows less than 100% despite completing everything?', a: 'You may have missed a quiz/video item due to penalty score. Verify all items (1006/1006) are complete. Refresh or clear cache and log in again.' },
      { q: 'I\'m unhappy with ViBe — can I bypass the system?', a: 'There is a formal alternative: watch specified YouTube content and appear for a 3-hour proctored exam (dual cameras + human proctor). Score above 80% to pass. This is more demanding than the normal path.' },
      { q: 'Is the ViBe consent form compulsory?', a: 'Yes — consent for camera and microphone access is mandatory. ViBe uses real-time proctoring to ensure academic integrity. It does not continuously record videos.' },
      { q: 'What are penalty scores on ViBe?', a: 'Generated when anomalies are detected during activity (e.g., irregular behaviour while watching videos or attempting quizzes). They may require re-watching lessons but currently do not affect HP or performance evaluation.' },
      { q: 'When should I use the Flag option vs contact support?', a: 'Use Flag for course content issues (video/quiz problems). For technical issues or login problems, contact Yaksha with "#escalate-ViBe".' },
      { q: 'What is Linear Progression on ViBe?', a: 'You must watch videos and attempt quizzes in exact order. Each item must be completed before the next unlocks. Skipping is not allowed.' },
      { q: 'Can I use the left navigation to jump ahead?', a: 'No — the left panel is a progress map only. Use "Next Quiz" or "Next Lesson" on the right panel to proceed sequentially.' },
      { q: 'I see a red "Access Restricted" banner — is this a bug?', a: 'No — it appears when you try to open an item before completing all previous items. ViBe returns you to the last valid content automatically.' },
      { q: 'How do I resolve the "Access Restricted" error?', a: 'Scroll through items from the beginning, find the one without a completion tick, complete it, and refresh. If it persists, report with "#escalate-ViBe".' },
      { q: 'Why does ViBe make me re-watch a clip after a quiz?', a: 'If your quiz answer didn\'t go through correctly, ViBe takes you back to try again. This is called a re-watch and is part of the design — it does not affect your HP or evaluation.' },
      { q: 'What kinds of quiz questions are on ViBe?', a: 'Four formats: MCQ (pick one), MSQ (pick one or more), NAT (type a number), and True/False. Watch the clip first, then answer.' },
      { q: 'Are the same proctoring rules applied to every course?', a: 'No — ViBe\'s proctoring is modular. The instructor decides which checks are active for their course. Always check course-specific guidelines.' },
      { q: 'What does the "quiet helper" on ViBe do?', a: 'It checks in real time: face is visible, only one face in frame, enough light, no background voices, you\'re looking at the screen. Brief normal movements are fine.' },
      { q: 'Does ViBe record long videos of me?', a: 'No — ViBe does not continuously record. Camera and microphone are used for real-time presence checks only. No long recordings are stored.' },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/faq-app');
    await FAQ.deleteMany({});
    await FAQ.insertMany(seedData);
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
