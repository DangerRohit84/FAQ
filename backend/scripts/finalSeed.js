const mongoose = require('mongoose');
const FAQ = require('../models/FAQ');

// PASTE YOUR ENTIRE 1K+ LINE DATASET ARRAY HERE
const myBigDataset = [
    {
  "_id": {
    "$oid": "6a16ef9b032c90682e55c398"
  },
  "id": "q-1-1",
  "question": "What is the Vicharanashala internship?",
  "answer": "A two-month internship run by Vicharanashala, a research lab at IIT Ropar. You will work on a real open-source project under a mentor, after a short training phase tailored to where you already are. The internship is free — we do not charge, and the work is real."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c399"
  },
  "id": "q-1-2",
  "question": "What is VINS?",
  "answer": "VINSis the Vicharanashala Internship — an online programme open to anyone who clears our interview. The work is real open-source contribution under a mentor, the certificate is from the Vicharanashala Lab for Education Design at IIT Ropar, and the programme itself is free (we charge nothing). There is no stipend.\nIf you are seeing a yellow VINS panel on your result page, you are selected."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c39a"
  },
  "id": "q-1-3",
  "question": "What are the phases of VINS, and what do the badges mean?",
  "answer": "VINS is structured as four phases. Each one is marked by a badge — a small token of where you are in the journey.\n🥉Bronze (Phase 1)— a short training period at the start, planned\naround what you already know. If you arrive already comfortable with the   basics, your mentor may skip Bronze and put you straight on to the project.\n🥈Silver (Phase 2)— the main work. You contribute to a real\nopen-source project under a Vicharanashala mentor. Finishing Bronze and   Silver completes your internship and earns the certificate.\n🥇Gold (Phase 3)— a recognition awarded during Silver if your\ncontribution stands on its own as a meaningful feature, not just a small   fix.\n🏆Platinum (Phase 4)— a standing invitation to come back and visit\nthe lab — a short trip — any time during the year after your internship   ends. We help with travel through a small visit stipend.\nMost interns finish at Bronze + Silver, and that is exactly what the certificate is for. Gold and Platinum are extras you can pick up if your work makes the case for them. Either way, you walk away with a real open-source contribution to your name and a mentor who knows you well."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c39b"
  },
  "id": "q-1-4",
  "question": "Who is the internship for? Are alumni eligible?",
  "answer": "The internship is forcurrently-enrolled studentsat any college or university — undergraduate, postgraduate, or doctoral. The NOC requirement is the practical reflection of this: we ask for institutional consent that you can commit your time to this internship.\nCandidates who have already graduated and are not currently enrolled in any programme are not eligiblefor this cycle. If you re-enrol later (higher studies, etc.), you are very welcome to apply again in a future cycle."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c39c"
  },
  "id": "q-1-5",
  "question": "Is this the same as IIT Ropar's official Summer Research Internship?",
  "answer": "No. Summership 2026 is a VLED Lab initiative. The certificate is issued by theVicharanashala Lab for Education Design, not centrally by the institute. IIT Ropar runs a separate institutional summer research internship through its own office. Do not represent Summership 2026 as equivalent to that programme."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c39d"
  },
  "id": "q-1-6",
  "question": "I have to attend my class tomorrow/today/some day can I take leave",
  "answer": "Leave is not permitted. If you are also attending classes or exams, you will be relieved from the internship immediately and will need to join the next batch when it starts."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c39e"
  },
  "id": "q-2-1",
  "question": "When can I start?",
  "answer": "You can start any time in 2026 — VINS is flexible on the start date —but there are two things you must hold in mind together, and one strong recommendation.\nThe hard rule.Your internship mustfinish by 31 December 2026.That date is non-negotiable. Whatever start you pick, your end date (your start + 2 months, with up to 1 month grace) must land on or before 31 December 2026. So while there is no last date toopt in, there is absolutely a last date tofinish.\nThe strong recommendation: start as soon as possible.The earlier you join, the more of the May–July main cohort you catch — and three things make starting earlier materially better than starting later:\nCohort networking.The batch goes through Bronze together —\npeer discussions, parallel problem-solving, and lasting   connections happen during this window. Later in the year the   cohort disperses and late starters are largely solo.\nTA support is concentrated in May–July.TAs are full-time\nduring this window. After this they return to their own college   work and bandwidth is materially thinner.\nTraining rolls out with the cohort, not piecemeal — you get\nthe material with the discussion around it, not as a static   document.\nIf starting now is genuinely impossible for you (exams, other unavoidable commitments), you can begin later and still complete and earn the certificate — but be honest with yourself: the cohort effect and support will be lighter, and the December cap means a late start leaves no room for slippage."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c39f"
  },
  "id": "q-2-2",
  "question": "How long is the internship?",
  "answer": "Two months from your chosen start date, with an optionalone-month grace periodif you need it. End must land on or before 31 December 2026."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3a0"
  },
  "id": "q-2-3",
  "question": "Can I start in July, August or later if I have exams now?",
  "answer": "Yes — but only if your exams genuinely make an earlier start impossible. Wait until your exams are done, then opt in and start. Do not attempt to juggle this internship with ongoing exams. Make sure your chosen start date plus 2 months (or 3 with grace) lands on or before 31 December 2026."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3a1"
  },
  "id": "q-2-4",
  "question": "Can I start with the cohort and take a relaxation during my exam window?",
  "answer": "No. This is not an arrangement we offer.\nVINS is a full-attention internship — six to ten hours a day, sometimes more. Splitting that with college exams damages both sides: the project loses momentum, the exams suffer, and the mentor invests in someone who can only half-engage. We have seen this fail enough times to be firm.\nIf your exams fall inside the cohort duration, defer your start to after your exams end, opt in then, and run the internship at full attention. The certificate and project pathway are the same.\nA note on consequences.If we later learn that a candidate was sitting college exams during their internship period,we reserve the right to terminate the internship or withhold the certificate at any time— including after the internship has otherwise been completed."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3a2"
  },
  "id": "q-2-5",
  "question": "Can I take leave or get an exemption during the internship for an exam scheduled in June?",
  "answer": "The attendance rule is firm — the 55-day continuous window is a non-negotiable part of the internship, and we cannot offer an exemption for an exam during this period. The policy exists because split attention genuinely damages both your exam preparation and your internship work."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3a3"
  },
  "id": "q-2-6",
  "question": "Are orientation session recordings shared with interns, and can project or group assignments be changed after watching them?",
  "answer": "Recordings of the sessions will not be provided. However, we may provide access to an abridged version of a talk or session if we consider it important. We do not guarantee this for every session."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3a4"
  },
  "id": "q-3-1",
  "question": "What dates do I put on the NOC?",
  "answer": "Default:your chosen start date → your start + 2 months\n(with up to 1 month grace), ensuring the end date is on or before   31 December 2026. Pick the earliest start date you can realistically   make — the May–July summer window is the main cohort.\nIf the NOC will be signed on a specific later date, pick a start\ndateafterthe signature date."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3a5"
  },
  "id": "q-3-2",
  "question": "Who can sign the NOC?",
  "answer": "Any authorised signatory at your college: HOD, Acting HOD (during holidays), Principal, Dean, Director, or Training & Placement Officer. For dual-degree students, either institution can sign — pick whichever is easier. For IITM BS Online Degree (standalone) students, any officer from the BS office can sign."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3a6"
  },
  "id": "q-3-3",
  "question": "When do I submit the NOC? Is the deadline hard?",
  "answer": "There is no specific calendar cut-off date by which the NOC must be uploaded — butyour internship cannot formally begin until your official institutional NOC has been uploaded and validated by us.A self-declaration gets you a provisional offer letter immediately, but it does not start the internship. So submit your signed NOC as early as possible and join the current summer cohort.\nIf you are on VINS youcantechnically upload your NOC and start later in the year, butwe strongly do not recommend it— by then your mentor may already be busy with other work, you will not get to network properly with the rest of the cohort, and the cohort + TA support that make this internship genuinely good are concentrated during the summer window. Submit early, start as soon as possible, and you will get the full version of the experience."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3a7"
  },
  "id": "q-3-4",
  "question": "What format should I use? Do I need to design it myself?",
  "answer": "No —we provide a printable NOC format. Once your result is out and you log in to samagama.in, you will see aDownload blank NOCbutton on your dashboard. Take a printout, get it physically signed and stamped by your authorised signatory, scan it, and upload the signed PDF using theUpload signed NOCbutton (also on the dashboard). You do not need to draft anything yourself, and you donotneed college letterhead — the format we provide is the canonical layout."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3a8"
  },
  "id": "q-3-5",
  "question": "What if my college / Program Chair gives me an NOC in their own format?",
  "answer": "A college's own NOC format is acceptable, as long as all of the required entries are present on it:\nthe signing authority's (HOD / Dean / Program Chair / Principal)\nhandwritten signature— this is the most important item,\nthe signing authority's **name, designation, official email address,\nand phone number** (we cross-check with that person to verify the   signature is genuine),\nyourfull nameand theinternship period(start and end dates),\nand\nyoursignature.\nIf your college's format does not include a place for your signature, sign clearly and prominently anywhere on the document before uploading. With those entries present, you do not need to switch to our printable format. An NOC missing any of them is incomplete and will be returned for correction."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3a9"
  },
  "id": "q-3-6",
  "question": "Does it need to be signed by hand?",
  "answer": "Yes. Three things are required, all on the NOC format we provide:\nthe authorised signatory'shandwritten signature,theinstitutional rubber stamp / sealapplied in the designated area, andthe signatory'semail addressfilled in the designated field — we\nautomatically cross-check with that person to verify the signature is   genuine.\nDigital signatures are not accepted on the PDF path. If a physically- signed printout is impractical for your HOD, use the email-forward path in 5.7 below — it is fully equivalent."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3aa"
  },
  "id": "q-3-7",
  "question": "Can my HOD email the NOC instead of signing a printout?",
  "answer": "Yes — there is a fully-equivalent email-forward path. Use whichever is easier; you do not need to do both.\nHow it works:\nFrom your dashboard, download thetext NOC(the \"⬇ Download text\nNOC (email path)\" button next to the printable PDF download).\nFill in the student-side fields, then email the file to your HOD and\nask them to forward it.\n**Your HOD forwards the email tosudarshan@iitrpr.ac.infrom their\nofficial institutional email address**, with the subject line:NOC for my student &lt;Your Full Name&gt;\nThe forward itself counts as the signature — the HOD's official institutional email address is the verification, exactly like the signatory-email field on the PDF NOC.\nTwo non-negotiable conditions:\nThe forward must come from the HOD's **official institutional email\naddress** (a college / university domain) — not a personal Gmail or   Outlook account.\nThe subject line must start withNOC for my studentso it routes\ncorrectly. A different subject may be missed.\nAfter the forward arrives and we validate it, confirmation and offer-letter issuance follow (typically within an hour to one working day), and you may then formally begin on your start date. Candidates who use this path donotalso need to upload a signed PDF."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3ab"
  },
  "id": "q-3-8",
  "question": "How do I download and upload the NOC?",
  "answer": "Both happen on yourdashboardat samagama.in once your result is out. You will see a NOC section with two buttons in three places (all backed by the same endpoints — use whichever is convenient):\nA compact pill in the dark header bar at the top of every screen.A standalone NOC card on the dashboard, between the Results card and\nthe Talk-to-Yaksha button.\nA NOC section at the bottom of your full Result message itself.\nThe two buttons:\nDownload blank NOC— saves the printable NOC format PDF.Upload signed NOC (PDF)— opens a file picker; the file must be a\nPDF of at most 1 MB. Confirmation appears on the same card once the   upload is received.\nThe chat surface no longer carries any NOC affordance — please use the dashboard buttons. If you can't see the buttons, make sure you are logged in as the email that received the result, and that your result has been released."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3ac"
  },
  "id": "q-3-9",
  "question": "What if my NOC is not formally verified?",
  "answer": "NOC verification takes time — typically anywhere between an hour and one full working day from the moment you upload.\nIf you need your offer letter sooner, upload aself-declarationon your dashboard and aprovisional offer letterwill be issued to you immediately. Important: the provisional offer confirms your selection, butyou can formally begin the internship only after your official institutional NOC is uploaded and validated by us.The self-declaration does not replace the NOC — please upload your signed NOC as early as you can so your start is not delayed."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3ad"
  },
  "id": "q-3-10",
  "question": "My online course (Masai, NPTEL, Coursera, etc.) won't issue an NOC. What do I do?",
  "answer": "The internship is open only to candidates currently enrolled in afull-time degree programmeat a recognised college or university. Online-only courses — Masai Institute, NPTEL / MOOC enrolments, Coursera, Udacity, bootcamps, and similar — do not by themselves make a candidate eligible.\nIf you are concurrently enrolled in a full-time degree programme alongside the online course, please obtain aNo Due / No Objection certificatefrom that college (department, Dean's office, or Principal) and upload it via the NOC upload flow on your dashboard.\nIf your only current academic engagement is the online course and you are not concurrently enrolled in a full-time degree programme, the internship is not open to you in this cycle. We would warmly welcome you to apply again in a future cycle once you are enrolled in a full-time programme."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3ae"
  },
  "id": "q-3-11",
  "question": "My HOD/college official wants written confirmation before signing my NOC. What do I show them?",
  "answer": "Your selection is already confirmed the moment your yellow VINS (or green VISE) result panel appears on your samagama.in dashboard — that is the official confirmation of selection. There is no separate written letter issued before the NOC step by default.\nIf your HOD/college official insists on a document in hand before signing, use theprovisional offer letterroute:\nLog in to samagama.in and open your dashboard.Upload a briefself-declaration(a short statement that you\nintend to start your internship and will submit your signed NOC    once approved).\nAprovisional offer letteron Vicharanashala letterhead is\nissued to your dashboard immediately.\nHand the provisional offer letter to your HOD/college official — it\nserves as the written confirmation they need to sign your NOC.\nOnce your HOD/college official signs the NOC and you upload it back to samagama.in and we validate it, your provisional offer is confirmed andyou may then formally begin the internship.The same offer letter becomes operative — there is no separate \"formal\" letter issued later (see §4.3 and §3.9)."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3af"
  },
  "id": "q-3-12",
  "question": "Can Prof. Sudarshan Iyengar or a faculty member from IIT Ropar sign my NOC for the internship?",
  "answer": "Your NOC must be signed by an authorised signatory at the institution where you are enrolled as a student — such as your HOD, Dean, Principal, or Training & Placement Officer. Sudarshan Iyengar is a faculty member at IIT Ropar and is not the authorised signatory for the IIT Ropar/Masai online AIML programme. He cannot sign your NOC in a personal capacity. Regarding eligibility: the internship is open to candidates currently enrolled in a UG/PG/Diploma programme at a recognised college or university. An online-only certification course (even if offered jointly with an IIT) does not meet that requirement on its own. If you are concurrently enrolled in a full-time degree programme elsewhere, please obtain the NOC from the authorised signatory at that institution. If your only current academic enrolment is the IIT Ropar/Masai online programme, you are not eligible for this internship cycle. Please clarify your current enrolment status and we will guide you accordingly."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3b0"
  },
  "id": "q-4-1",
  "question": "How do I know I am selected?",
  "answer": "If you can see your yellow VINS result panel on samagama.in, you are selected. There is no separate selection step or confirmation email."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3b1"
  },
  "id": "q-4-2",
  "question": "How do I opt into VINS?",
  "answer": "Tell Yaksha in the chat:\"I want to take up the online internship without stipend.\"Yaksha will confirm. Opting inisthe selection — no separate confirmation email is sent at that stage."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3b2"
  },
  "id": "q-4-3",
  "question": "When do I get the offer letter?",
  "answer": "Your offer letter is issued automatically. There are two ways it can be triggered:\nIf you upload a self-declaration (the fast path),aprovisional offer letteris issued to your dashboard immediately. It confirms your selection. Please note that you mayformally begin the internship only after your official institutional NOC is uploaded and validated by us— the provisional offer does not, by itself, start the internship.\nIf you upload your signed NOC first(and have confirmed your start and end dates on the dashboard, see §4.5), your offer letter is issued automatically once the NOC is validated — typically within an hour to one full working day of upload.\nEither way there is a single offer letter on Vicharanashala letterhead; once your NOC is validated it is the operative offer for your college / employer records.\nThe offer letter lives on your dashboard at samagama.in, not in your email.When it is issued, a notification will appear in theAnnouncements sectionof samagama.in. Log in and clickDownload Offer Letterfrom the Offer Letter card on your dashboard. If you do not see it, do a hard refresh and log back in — or raise#escalatein Yaksha chat."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3b3"
  },
  "id": "q-4-4",
  "question": "Will I get a certificate?",
  "answer": "Yes — every intern who completes the internship gets a certificatefrom Vicharanashala, IIT Ropar. The internship is genuinely demanding; candidates who drop out mid-way do not get a certificate. Finishing means something, because the bar is high."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3b4"
  },
  "id": "q-4-5",
  "question": "How do I confirm my internship dates?",
  "answer": "Once you have opted into VINS in the chat with Yaksha (see §4.2), log in to samagama.in. On the dashboard, you will see a yellow card titled\"🗓️ Confirm your internship dates\". The two date pickers pre-fill with sensible defaults for the current cohort. If those work for you, hit \"Save dates\". Otherwise edit them to your earliest realistic start — your end must be on or before31 December 2026.\nA green confirmation appears once saved. You can edit any time from the same card.\nOrder doesn't matter.You can save your datesbefore or afteruploading your NOC — both paths work.\nThe dates you enter must match the internship period your HOD signs off on in your NOC. If you need to change the period later, edit the dates on the same card and upload a fresh NOC matching the new period."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3b5"
  },
  "id": "q-4-6",
  "question": "I am a minor/major in AI student, can I join the programme? I don't need a NOC as I am from IIT Ropar",
  "answer": "Minor/Major in AI course from IIT Ropar is a certification course and there will be a different track of internship equivalent to them. Kindly write to us separately for this. For you to be part of this internship programme you should be a registered student in a UG/PG programme with some university. This internship is exclusively meant for the students only and not for working professionals."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3b6"
  },
  "id": "q-4-7",
  "question": "How do I accept the offer letter?",
  "answer": "Once your formal offer letter arrives, accepting it has a precise form. Please follow it carefully — the form itself is the first attention-to-detail check of the internship.\nReply All on the offer-letter thread— the email you received fromno-reply@vicharanashala.aialready hassudarshan@iitrpr.ac.inon it; keep that address on your reply. In the body, paste the following acceptance statementexactly as printed, with your full name inserted and a date added:\n> I, [Full Name], confirm that I have read, understood, and accepted > all terms, conditions, and obligations set out in this offer letter > and in the program FAQ at samagama.in. I formally accept the offer > of Summer Internship 2026.\nCopy-paste this sentence as-is.Do not paraphrase, do not shorten, do not rearrange the words. The reply must reach us within5 daysof the offer letter being sent.\nAlternative form— instead of typing the statement, you maydownload the offer letter PDF, fill in your name and the date in the acceptance block, sign and scan as a PDF, and attach that signed file to your reply. An attached signed acceptance counts as a valid reply.\nA few clarifying points (because we've been asked):\nSignature placement on the PDF.If the PDF shows only a \"Date\"\nfield, write your signature next to the date field or directly   below the last line of the acceptance text. Either is acceptable.\nDo not change the recipient fields.Reply on the same email\nthread; do not remove or alter any address that was already there."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3b7"
  },
  "id": "q-4-8",
  "question": "What if I reply without using the exact acceptance format printed in the letter?",
  "answer": "The offer iswithdrawn, effective immediately, with no further correspondence. The withdrawal is final.\nThis is a deliberate policy. The acceptance statement is the first attention-to-detail check of the internship — every commit, every report, every patch you write during the internship is expected to match a stated specification. A candidate who cannot follow a written specification at the acceptance stage is not ready for the work that follows.\nWhat counts asnon-compliant:\nParaphrasing the statement (\"I happily accept\", \"I gladly confirm\",\netc.).\nSending only a bare \"I accept\" or \"Yes, accepted\".Missing the date.Missing the FAQ-reference clause.An attached photo or scan of anunfilledorundatedoffer letter.\nWhat doesnotcount as non-compliant (one-word leniency):\nSingle-word slips (\"the offer letter\" vs. \"this offer letter\";\n\"terms and conditions\" vs. \"terms, conditions, and obligations\").\nObvious typing mistakes in an otherwise complete attestation.\nIf you received a withdrawal email and believe it was a genuine error, see the next entry for the appeal route."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3b8"
  },
  "id": "q-4-9",
  "question": "I received a withdrawal email because I didn't accept the offer letter correctly. Can it be reversed?",
  "answer": "There is an appeal path, with conditions.\nThe withdrawal stands by default.Please do not reply to the withdrawal email itself— replies to that thread are not read. To appeal, send afresh emailto:\nsudarshansudarshan@gmail.com\nThe subject line must beexactly:\n> Request to Reconsider: Confirmation Reply Error\nCopy and paste this subject line as-is.Our AI engine routes appeals by matching this exact title — any typo, extra word, missing colon, or change in capitalisation/punctuation will cause the appeal to be missed entirely.\nIn the body of the email, state an apology for the mistake and the reason. If the reason is genuine, we will respond within 24 hours.\nAn appeal that is granted doesnotrestore the offer on the standard track — it places you on aseparate track with an additional assignment: a short course on attention to detail, which you must complete and clear before the internship can proceed."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3b9"
  },
  "id": "q-4-10",
  "question": "What happens after I send my acceptance? My dashboard doesn't update.",
  "answer": "The dashboard tracks your NOC, your internship dates, and your offer letter — itdoes nottrack the acceptance email. After you send your acceptance reply, you will not see a new green tick or status change on the dashboard. This is normal and expected.\nWe process acceptance emails manually. If your reply was compliant with the format described in §4.7, no further action is needed from your side; you are accepted, and the internship will proceed on the agreed dates. If your reply was non-compliant, you will receive a withdrawal email — see §4.9 for the appeal route.\nIf several working days pass and you have heard nothing, log in to samagama.in and type#escalatein the Yaksha chat — we will check the state of your reply."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3ba"
  },
  "id": "q-4-11",
  "question": "Can I change my internship dates?",
  "answer": "Before the offer letter is issued:yes — open theConfirm Internship Datescard on your dashboard and edit the dates at any time. Your end date must be on or before 31 December 2026.\nAfter the offer letter is issued:no. Dates are final and will not be changed. If the confirmed dates do not work for you, please follow our LinkedIn page for announcements about future cohorts:linkedin.com/company/vicharanashala\nIf you updated your NOC to reflect new dates before the offer letter was issued, upload the revised NOC via the dashboard."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3bb"
  },
  "id": "q-4-12",
  "question": "When and how do I get the Zoom link for the kickoff meeting?",
  "answer": "The kickoff orientation is held for themain summer cohort only— i.e., candidates starting at the opening of the May–July window. The Zoom link is delivered through two channels:\nEmailto your registered samagama.in address.Your Yaksha chat portal— log in to samagama.in, open the\nchat, and the link is shown there.\nIf your start date is later(mid-summer or beyond), there is no separate kickoff event for you. See §2.1 for the trade-offs that come with a later start.\nIf you cannot register with the Zoom link or have not received it, log in to samagama.in and type#escalatein the chat with Yaksha — we will look at your specific case."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3bc"
  },
  "id": "q-4-13",
  "question": "My NOC is not ready but my start date is approaching. What do I do?",
  "answer": "Upload aself-declarationon your dashboard. Aprovisional offer letteris issued to you immediately, which you can show your HOD to get your NOC signed. Please note: your start date cannot be honoured until your official institutional NOC is uploaded and validated by us —the internship formally begins only after the NOC is validated.So upload your signed NOC as early as you can; if it is not in by your chosen start date, your start simply shifts to whenever it is validated."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3bd"
  },
  "id": "q-4-14",
  "question": "When does my internship actually begin? Will I receive a notification on the day?",
  "answer": "Your internship begins on thestart date you confirmedon the dashboard — the same date printed on your offer letter —provided your official institutional NOC has been uploaded and validated by us by then.A self-declaration alone is not enough to begin: if your validated NOC is not yet in on your start date, your start shifts to the day it is validated. There is no separate \"your internship has begun\" email, chat message, or dashboard notification on the day itself; the start date is the start date.\nOn the morning of your start date, log in to samagama.in. Yaksha will guide you through the Day-1 steps of the Bronze phase. If your dashboard appears unchanged on that morning, do a hard refresh and re-login. If it still looks the same, type#escalatein the chat and we will look at your specific case.\nYou can review or change your confirmed dates via theConfirm Internship Datescard on your dashboard (see §4.5 to set, §4.11 for date-change rules)."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3be"
  },
  "id": "q-4-15",
  "question": "Can I switch from VINS (online) to VISE (offline) after being selected?",
  "answer": "The two tracks are finalised at the interview stage, and we do not move candidates between them. VISE has a fixed on-campus capacity planned around mentor bandwidth, hostel availability, and stipend allocation — once the shortlist is set, it stays set. VINS is not a consolation track. The project, the mentor, and the certificate are the same as VISE — what differs is the mode (online) and the absence of a fellowship. Many interns find the online format more effective. Your best path forward is to confirm your VINS start dates and get your NOC uploaded — you're already in a strong position."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3bf"
  },
  "id": "q-4-16",
  "question": "Can I change my internship dates after the offer letter?",
  "answer": "No.Once your offer letter has been issued, the dates you confirmed are final. They will not be changed at this stage.\nIf the confirmed dates do not work for you, please follow our LinkedIn page for announcements about future cohorts:linkedin.com/company/vicharanashala"
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3c0"
  },
  "id": "q-4-17",
  "question": "How do I get the link for the daily Zoom standups? Are they mandatory?",
  "answer": "Daily Zoom standup links are posted in theAnnouncementssection on your samagama.in dashboard — look for the announcement bell at the top of the page. You are expected to check it daily before the session.\nWe donotsend separate emails for daily standups. The announcement on your dashboard is the only delivery channel for the daily link.\nAttending the daily standups is mandatory for all interns.This is a full-time summer internship programme, and the daily standup is the primary touchpoint where progress, blockers, and the day's plan are communicated. Missing standups is treated as missing work. Attendance and participation are tracked against strict thresholds — see §10.7.\nAbout the kickoff orientation.The kickoff orientation was held for therecommended 15 May cohort(see §4.12). Session recordings are not shared with interns who join late — see §2.6.\nIf you joined late,you are expected to complete the orientation through aspecial proctored catch-up path on ViBe. The catch-up is entirely proctored and includes quizzes that check whether you have understood the content of the orientation session. Completing this catch-up is mandatory for late starters before participating in the regular standups."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3c1"
  },
  "id": "q-4-18",
  "question": "How do I provide my Zoom ID, and why does it matter?",
  "answer": "On your dashboard, just before\"Start the internship,\"you'll see a step called\"Provide your Zoom ID.\"Enter the exact email address linked to your Zoom account — the one you use (or will use) to join the daily live sessions — and save it.\nThis matters because we match your live-session attendance and participation using this email. If the Zoom ID you provide doesn't match the email you actually join Zoom with, your attendance won't be credited to you. So enter it carefully and be sure it is genuinely your Zoom account's email."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3c2"
  },
  "id": "q-4-19",
  "question": "I saved the wrong Zoom ID — can I change it?",
  "answer": "Once saved, your Zoom ID isfinal and cannot be changed by you— please double-check before you submit. If you are certain you entered the wrong email, log in and tell us in the chat (type#escalate) with your correct Zoom email, and our team will review and correct it for you."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3c3"
  },
  "id": "q-5-1",
  "question": "What will I work on?",
  "answer": "A real open-source project from Vicharanashala's portfolio — assigned based on your background and the lab's current needs. Areas range across AI/ML, web development, NLP, computer vision, agriculture-tech (Annam.AI), education-tech (ViBe), and open-source infrastructure. We do not pre-publish the exact problem; you choose to join knowing the lab will assign the project."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3c4"
  },
  "id": "q-5-2",
  "question": "How many hours per day?",
  "answer": "Plan for6 to 10 hours a day, sometimes more during the build phase. This is a full-time internship for the two-month window. Most candidates who drop out are juggling something else — VINS expects your full attention."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3c5"
  },
  "id": "q-5-3",
  "question": "Who is my mentor?",
  "answer": "You will work with the lab's research and engineering team. The exact mentor depends on the project. The model is fluid — you will get help from a senior researcher one day, a peer the next, and someone else for a different question. That is how real open-source work happens."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3c6"
  },
  "id": "q-5-4",
  "question": "Is there a stipend?",
  "answer": "No. The internship is unpaid. Stellar performers may be recognised with a discretionary stipend at the lab's option, but this is not promised or expected."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3c7"
  },
  "id": "q-5-5",
  "question": "Do I need my own laptop? Should I preload any software?",
  "answer": "Yes — a personal laptop is required.We prefer that you bring a laptop runningLinux or macOS. If you use Windows, please install a terminal that can SSH and run Unix-style commands — for example,Windows Subsystem for Linux (WSL)is a clean choice; a tool such asPuTTYalso works. You will be SSH-ing into machines and using the command line as part of the work.\nWe do not maintain a fixed software-preload list — your mentor will guide you on the specific tools needed once your project is assigned."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3c8"
  },
  "id": "q-5-6",
  "question": "I am using a different email on GitHub / Zoom / the learning platform. Is that okay?",
  "answer": "No.Your registered email is your sole identifier across all programme platforms.Progress tracking, mentor assignment, and certificate issuance are all tied to it. Mismatches between platforms cannot be retroactively corrected — ensure you use your registered email everywhere from day one."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3c9"
  },
  "id": "q-5-7",
  "question": "Why has my mentor not been assigned yet, or contacted me on day 1?",
  "answer": "Mentors are not assigned on day 1 of the internship. You will be assigned a mentor when you move on to theproject phaseof VINS, which comes later in the timeline. Before that, you must complete themandatory courseworkof the Bronze phase (see §1.3). Once coursework is complete and you are placed on a project, your mentor will reach out.\nIf you are looking for a Discord server, please note: we do not run a Discord server. See §6.1 for the official communication channels."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3ca"
  },
  "id": "q-6-1",
  "question": "What are the official communication channels?",
  "answer": "Official channels only — in this order:\nAnnouncements section on samagama.in.All programme notifications\nare posted here. We no longer send notifications by email. Log in    and check the Announcements section regularly during working hours.    Sessions are announced at least 1 hour before they begin.\nYaksha chatonsamagama.in. This is the primary channel for\nany question or concern. Use#escalatein chat to reach a human.\nDiscussion forum.Use this for peer discussions and\ncollaboration. Details are posted in the Announcements section.\nEmail tosudarshansudarshan@gmail.com— as a last resort only,\nafter Yaksha chat and the FAQ have not resolved your question.\nWhatsApp support is cancelled.There is no WhatsApp troubleshooting group. Not being on WhatsApp does not put you at any disadvantage — all information goes through the channels above.\nUnofficial groups are strictly prohibited.Creating, joining, or operating any WhatsApp group, Telegram channel, Discord server, or any other peer-coordinated space involving interns or a subset of interns — or contacting another intern through their personal phone number — isagainst the code of conduct. Any complaint or report of this will lead to theimmediate terminationof your internship.\nYou may connect with fellow interns overLinkedIn and email."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3cb"
  },
  "id": "q-7-1",
  "question": "My interview is not marked as complete on the dashboard — what do I do?",
  "answer": "A data-sync issue sometimes occurs where the chat session closes but the interview record doesn't update to \"completed.\" The team will check your record and manually mark it as complete if needed. You will be unblocked within 1–2 hours. Apologies for the inconvenience. If you dont hear from us and if your interview continues to be marked incomplete please write to us on sudarshansudarshan@gmail.com"
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3cc"
  },
  "id": "q-8-1",
  "question": "Does Vicharanashala send a grade report or evaluation to my university for internship credit?",
  "answer": "Vicharanashala does not send formal evaluation or grade reports to universities — that process is between you and your college. The certificate issued upon completion is the document you can submit to your college or placement office for credit. Whether your college accepts it and how they translate it into a grade is their decision. If your college specifically requires a structured evaluation form or a report on your performance, raise that with them directly — we can provide the certificate and, if earned, a letter of recommendation, but we don't have a process for sending grade reports to universities."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3cd"
  },
  "id": "q-8-2",
  "question": "Does the Vicharanashala internship certificate specify whether it was completed online or offline ?",
  "answer": "The certificate you receive on completing the internship is the same for both tracks. It is issued by Vicharanashala, IIT Ropar, and does not specify whether you completed it online or on campus. The certificate records only that you completed the internship; the mode is not called out separately on the document."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3ce"
  },
  "id": "q-8-3",
  "question": "Will the completion certificate be a physical hardcopy or an e-certificate?",
  "answer": "The completion certificate is issued as an e-certificate — you download it from your dashboard on samagama.in after completing both Bronze and Silver. We do not print and mail physical copies. The certificate is digitally signed and authentic, so it cannot be duplicated. It can also be verified from our database using the number on the certificate."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3cf"
  },
  "id": "q-8-4",
  "question": "Is there a WhatsApp group for candidates during the internship?",
  "answer": "No. See§6.1for the official communication channels."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3d0"
  },
  "id": "q-9-1",
  "question": "What is Rosetta?",
  "answer": "Rosetta is your internship journal — a 65-day document, one entry per day, every day, for the full duration of Summership 2026. You write in it daily, keep it privately, and submit it at the end of the internship as one of your completion requirements.\nThe name comes from the Rosetta Stone — discovered in 1799, it carried the same text in three scripts and became the key to decoding an ancient language that had been silent for centuries. Not because it was grand, but because it was honest and consistent. That is what this journal is meant to be for you. Sixty-five days of honest writing will become the key to understanding your own experience — what you learned, where you struggled, what shifted in you."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3d1"
  },
  "id": "q-9-2",
  "question": "Why does this exist? Is it just busywork?",
  "answer": "No. It exists for two reasons.\nFor you:Most people go through an intense experience and carry it without processing it. They finish and cannot articulate what they actually learned, what changed in them, or what they would do differently. The journal builds that articulation, one day at a time. Students who reflect regularly during a programme consistently get more out of it than those who do not — not because they work harder, but because they understand what they are doing and why.\nFor us:When you submit Rosetta at the end, it gives us qualitative insight into your experience that no survey or evaluation can capture. We use it to understand what worked, what did not, and how to make the programme better for the next cohort. Your honest voice matters to that process."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3d2"
  },
  "id": "q-9-3",
  "question": "What is a \"thinking routine\"?",
  "answer": "Each day in Rosetta has a thinking routine — a short framework that gives your reflection a specific shape. Instead of staring at a blank page and writing \"today was good,\" the routine gives you a specific lens. Examples:\n3-2-1— 3 things you engaged with, 2 questions on your mind, 1 surprise.Muddy / Clear— what is sharp, and what is still foggy.What? So What? Now What?— separate facts from meaning from action.\nThe routines rotate across the 65 days so the journal does not feel repetitive or mechanical. Some will feel easy. Some will make you stop and actually think. That is the point.\nYou do not need to research the routine or prepare for it. Just read the description at the top of each day's entry and write."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3d3"
  },
  "id": "q-9-4",
  "question": "How do I get my Rosetta journal?",
  "answer": "Your journal will be shared with you as a Google Doc template link during orientation. Open the link,make a copyto your own Google Drive, rename itRosetta — [Your Name] — Summership 2026, and that copy is yours for the full 65 days.\nDo not write in the shared template. Always work in your own copy."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3d4"
  },
  "id": "q-9-5",
  "question": "How do I use it day to day?",
  "answer": "Simple:\nOpen your Rosetta Google Doc.Scroll to the entry for today's day number.Fill in the date at the top of the entry.Read the thinking routine name and its one-line description.Answer the three prompts in the writing boxes below.Close it and get on with your day.\nThat is it. It should take between 10 and 20 minutes. It is not an essay. It is not a report. It is a journal."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3d5"
  },
  "id": "q-9-6",
  "question": "How long should each entry be?",
  "answer": "There is no minimum or maximum word count. A good entry is one that is honest and specific. Three to five sentences per prompt is usually enough. If you find yourself writing more because something genuinely needs unpacking, write more. If a day was quiet and you genuinely only have two sentences, that is fine too.\nWhat isnotacceptable: one-word answers, copy-pasted text, vague non-answers like \"today was productive,\" or anything that reads like it was generated by an AI."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3d6"
  },
  "id": "q-9-7",
  "question": "What is the one rule?",
  "answer": "Write what is true.\nNot what sounds impressive. Not what you think we want to read. Not a polished summary of the day. If you hated today, write that. If you are confused and frustrated, write that. If something clicked and you are genuinely excited, write that.\nWe will know immediately if an entry reads like an LLM wrote it. Do not do that. The journal only counts as a completion requirement if it is genuinely yours — in your voice, from your actual experience."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3d7"
  },
  "id": "q-9-8",
  "question": "Can I use ChatGPT or any AI tool to write my entries?",
  "answer": "No.This is the one firm rule of Rosetta.\nThe journal is a record of your thinking, not a demonstration of what an AI can produce on your behalf. Entries that read as AI-generated will not be counted toward your completion requirement. If your entire journal reads this way, the journal will not be accepted.\nUse AI tools for your technical work if that is permitted in the programme. Do not use them here."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3d8"
  },
  "id": "q-9-9",
  "question": "What if I miss a day?",
  "answer": "Fill it in as soon as you can. Write theactual date you are filling it in, not the date of the missed entry. Be honest in the entry about the fact that you are writing it late and why.\nDo not leave entries blank. A late honest entry is always better than no entry.\nIf you find yourself consistently missing entries, that is worth paying attention to. It usually means something else is going wrong. Use Yaksha in chat, or reach out to your scholar."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3d9"
  },
  "id": "q-9-10",
  "question": "Will anyone read my journal during the internship?",
  "answer": "No.We will not access your journal during the 65 days. You write it, you keep it, it is yours.\nThe only time we read it is after you submit it at the end of the internship. This is intentional — we want you to write freely, without feeling observed. The journal is only useful if it is honest, and it is only honest if you are not performing for an audience."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3da"
  },
  "id": "q-9-11",
  "question": "Can the prompts change mid-internship?",
  "answer": "Occasionally we may update a prompt for a specific day based on what is happening in the cohort — a major milestone, a collective challenge, or something the team wants to address directly. When this happens, we will announce it in theAnnouncements section on samagama.inbefore that day begins.\nCheck the Announcements section before filling any entry where a change has been announced. If no announcement has been made, use the prompt as written in your document."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3db"
  },
  "id": "q-9-12",
  "question": "How do I submit Rosetta at the end?",
  "answer": "On or before Day 65, share your Rosetta Google Doc with the programme coordinator's email address (shared during wrap-up week). Set the sharing permission toViewer.\nMake sure:\nYour name is in the document title —Rosetta — [Your Name] — Summership 2026.All 65 entries have been filled in.Your cover page has your name, product, and team filled in.\nRosetta submission is one of the required criteria for receiving your internship certificate. An incomplete or AI-generated journal will not be accepted."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3dc"
  },
  "id": "q-9-13",
  "question": "I have a question about Rosetta that is not answered here. What do I do?",
  "answer": "Ask Yaksha first. If Yaksha cannot answer it, escalate to your programme coordinator. Do not sit on a question — the journal works best when you start it right."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3dd"
  },
  "id": "q-9-14",
  "question": "My college requires a written confirmation that the internship is self-paced and will not clash with college classes — what document can I share with them?",
  "answer": "This is not a self paced internship, but a very rigorous one which is time demanding. It is not permitted for one to be part of any other activity during this period."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3de"
  },
  "id": "q-10-1",
  "question": "I've previously interned with VLED — am I exempt from any coursework?",
  "answer": "Yes — partially.If you previously interned with VLED and completed theMERN Stackcoursework, you don't need to repeat it this cycle.\nHowever, theAI Fundamentals course (Fundamentals of AI using an Agriculture dataset) is a new addition this cycle and is mandatory for everyone, including returning interns.You'll need to complete it along with its associated activities.\nTo claim this exemption, simply type the hashtag#exemption from mern stack coursein your Yaksha chat on Samagama. Yaksha will record your request.\n> The broader#exemption from coursework(viva-route) option isnot availableto returning interns — it exists only for first-time interns who are already well-versed in both stacks. Since AI Fundamentals is new content, returning interns must complete it."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3df"
  },
  "id": "q-10-2",
  "question": "How do I register for the AI Fundamentals course on Vibe?",
  "answer": "Follow these steps:\nClick the AI Fundamentals registration link posted in theAnnouncements section on samagama.inat Phase 1 launch.You'll be redirected to theVibe sign-in page. If you don't have a Vibe account yet, create one using thesame Gmail you used to register on Samagama.Log in with your credentials.After logging in,open the course registration link againin your browser — the second click after login is what enrols you.Complete the brief registration form and submit.The course will appear instantly on yourVibe dashboard, ready to watch."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3e0"
  },
  "id": "q-10-3",
  "question": "I registered on Vibe with a different email than my Samagama email — is that OK?",
  "answer": "Please use thesame email on both platformsso we can match your Phase 1 progress to your internship record.\nThe one exception:Vibe requires a Gmail address for signup.If the email you used on Samagama is not Gmail (e.g. a college email like@xyz.ac.in,@ds.study.iitm.ac.in), you may useany Gmail of yoursto register on Vibe. In that case, tell Yaksha in your Samagama chat using the tag:\n``#vibe-email your-gmail@gmail.com``\nso we can link the records."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3e1"
  },
  "id": "q-10-4",
  "question": "Are live sessions mandatory if I'm on the viva route?",
  "answer": "Yes — live sessions are mandatory for every intern, regardless of path.Whether you're on the coursework track, MERN-exempt (returning intern), or have cleared the viva and moved to Phase 2, you're expected to attend every live session. The exchange of knowledge across our cohort — diverse streams, varying levels of experience — is something self-paced study cannot replicate."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3e2"
  },
  "id": "q-10-5",
  "question": "Where do I find the daily live-session schedule?",
  "answer": "The daily live-session schedule is posted in theAnnouncements section on samagama.inat least 1 hour before the session begins. Log in and check the Announcements section during working hours — that is the only channel for session notifications."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3e3"
  },
  "id": "q-10-6",
  "question": "Can we register and start the vibe courses before our internship date formally starts?",
  "answer": "You will receive the viBE course link only after your internship starts. You can register and start the viBE courses related to the internship only after your internship formally starts."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3e4"
  },
  "id": "q-10-7",
  "question": "What are the attendance and participation rules?",
  "answer": "Attendance and participation are trackedstrictly, and all of the following are measured continuously over arolling window of the last 5 working days:\nLive-session attendance — at least 85%.You must be present for at least 85% of the total Zoom meeting time.Live participation — at least 85%.You must respond to the in-session polls and quizzes at least 85% of the times they are run.Quizzes — attempted, and passed.Every quiz must be attempted, and your pass percentage must be at least 50%.\nBecause this is a rolling 5-working-day measure, it reflects yourrecentengagement, not a one-time average.If any one of these three falls below its threshold, you will be excused from the current batch and moved to the next batch.This is not a penalty — it simply means you rejoin in a later batch where you can give the programme the full attention it needs."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3e5"
  },
  "id": "q-11-1",
  "question": "I'm unable to type in the chat after clicking 'Interact with Yaksha' — what should I do?",
  "answer": "After logging into your Yaksha portal, if the field shows that you can't type, scroll up to the top of your window and click on the 'Chat with Yaksha' button to activate Yaksha. This way you will be able to interact with Yaksha properly."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3e6"
  },
  "id": "q-12-1",
  "question": "How do I log in to ViBe?",
  "answer": "Link for the website:https://vibe.vicharanashala.ai/authSign up as a student with the registered mail ID into the ViBe platform.To log in to the ViBe platform, follow the steps below carefully:\n```\nLog in to the ViBe platform as a student from registered email IDCheck the \"Notifications\" tab in the Top right side of the Dashboard.Accept the course invite sent for your respective MERN Course.\n```\n⚠️ Logging in with a different email ID may result in access issues or missing course visibility."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3e7"
  },
  "id": "q-12-2",
  "question": "Invite accepted but shows \"No course enrolled\"?",
  "answer": "If you see \"No course enrolled\":\nMake sure you are logged in with the correct registered email ID.Check if your college email has multiple aliases and try the correct one.Log out and log in again once.Use personal wifi instead of college wifi as there might be some network restrictions of access.If the issue continues, please follow these steps:\nStep 1: Allow Third-Party Cookies\nEnable Cookies in Chrome: Openchrome://settings/cookies. Turn OFF\"Block third-party cookies\"and turn ON\"Allow all cookies.\"Add Site Exception: Scroll to\"Sites that can always use cookies\"and click\"Add.\"Paste.vicharanashala.aiand ensure\"Including third-party cookies\"* is enabled.Restart browser.\nStep 2: Fix DNS (Most Important)\nChange your laptop DNS to Google DNS.Go to:Control Panel → Network → Active Network → Properties → IPv4.Shortcut:Win + R→ncpa.cpl→ right-click properties.Set Preferred DNS to8.8.8.8and Alternate DNS to8.8.4.4.Save.\nStep 3: Flush Old DNS Cache (it's safe)\nOpen Command Prompt as Admin.Run the following commands:ipconfig /flushdnsipconfig /releaseipconfig /renewRestart WiFi."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3e8"
  },
  "id": "q-12-3",
  "question": "Why are videos stuck or repeating?",
  "answer": "This may happen due to ViBe's monitored learning system. Common reasons include:\nVideos must be watched fully and in sequence (no skipping).Camera and microphone permissions must be enabled.Poor lighting or high background noise can affect playback.Switching tabs or staying idle may restart the video.\n✅ For smooth playback, stay on the ViBe tab, keep your camera on, and watch videos in a quiet, well-lit environment."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3e9"
  },
  "id": "q-12-4",
  "question": "Can I use a mobile or tablet?",
  "answer": "No, onlydesktop/laptopis supported."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3ea"
  },
  "id": "q-12-5",
  "question": "I'm experiencing video issues (stuck, looping, skipping) on ViBe. How do I troubleshoot?",
  "answer": "Try these troubleshooting steps in order:\nRefresh the pageand check multiple timesInspect browser console: Right-click → Inspect → Go to Network or Console tab → Try watching the video and check for any visible errorsLog out and log in againUse a different browserClear browsing data and cache, then try to re-login\nIf the issue persists after trying all steps,record the issueand contactYakshafor any queries by mentioning#escalate-ViBe."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3eb"
  },
  "id": "q-12-6",
  "question": "I have completed all videos and quizzes in the ViBe course, but my progress is still showing less than 100%. What should I do?",
  "answer": "Please do not worry. This might be a skip made in the quiz/video item due to penalty score as the quiz/video item might not have been successfully completed/marked. Please verify that you've completed all the course items (1006/1006). If not, please retry the missed contents again.\nIn the meantime, you may try the following steps once:\nRefresh your browserLog out, clear your browser cache, andlog in again"
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3ec"
  },
  "id": "q-12-7",
  "question": "I feel the ViBe content or platform is not good or I am unhappy with the way progress is evaluated. Can I request an exception or bypass the system?",
  "answer": "ViBe is built and continuously improved by interns and students themselves. It is a free and open-source learning platform, and our goal is to keep it that way by encouraging the community to actively contribute, improve, and strengthen it rather than bypass it.\nIf a learner strongly feels that the regular ViBe flow does not fairly reflect their understanding, there is a formal alternative evaluation path. However, this path is intentionally rigorous to ensure fairness for everyone.\nIn such cases, you will be asked to:\nWatch the specified YouTube video content completely (links will be provided).Appear for a three-hour proctored examination based only on that content.Write the exam under strict supervision with:Two cameras (front and side view), andOne online human proctor monitoring you live.\nThis examination becomes the sole basis for evaluation in place of the regular internship track.\nThe scoring rules are strict:\nScore below 60%: You are considered not qualified and must join the next cohort and continue only through the normal ViBe mode.Score between 60% and 80%: You get one more chance in the next scheduled exam.Score above 80%: You are considered to have passed.\nThis special exam is conducted once every fortnight, so choosing this route may significantly delay your progress compared to continuing normally on ViBe.\nBecause this path is far more demanding and time-consuming than simply completing the regular videos, quizzes, and activities, most students find that continuing with the standard ViBe workflow is the faster and better option."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3ed"
  },
  "id": "q-12-8",
  "question": "Is the ViBe consent form compulsory? What if I don't want to grant camera access?",
  "answer": "Yes — the consent form is compulsory.\nWe would like to clearly inform you that providing consent is a mandatory requirement for any candidate enrolling in and continuing a course on the ViBe Learning Platform.\nThe platform is designed with proctoring enabled throughout the learning process, which requires access to your webcam and microphone. This is essential to ensure:\nFairness across all participantsAcademic integrityActive and genuine participation\nIf you choose not to grant camera and microphone access, you will not be able to proceed with the course, as proctoring is an integral part of the learning and evaluation workflow.\nPrivacy & Monitoring Clarification\nAs outlined in the consent form:\nViBe does not continuously record videos.Proctoring operates via real-time monitoring mechanisms during learning and assessments.All data is handled strictly in accordance with the stated consent terms and applicable data-protection guidelines.\nIn short, consent is not optional — it is a core requirement for participation on the platform."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3ee"
  },
  "id": "q-12-9",
  "question": "What are penalty scores on the ViBe platform, and how do they affect our performance or HP?",
  "answer": "Penalty scores are generated when anomalies are detected during your activity on the ViBe platform (for example, irregular behavior while watching video lessons or attempting quizzes).\nIf the penalty score becomes high, you may be required to:\nRewatch the video lesson, andRetake the associated quiz.\nAt present, these penalty scoresdo not impact your HP (Health Points) or overall performance evaluation, as they are not being considered for scoring. Their primary purpose is to ensure proper engagement with the learning content."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3ef"
  },
  "id": "q-12-10",
  "question": "When should I use the Flag option on ViBe, and when should I contact support?",
  "answer": "Use theFlag feature on ViBeonly for course content-related issues, such as problems with video content or quiz questions.\nFor technical issues, platform errors, login problems, or logistics-related queries, do not use the flag option. Instead,contact Yakshaso the team can assist you faster.\nUsing the correct method helps resolve issues quickly and keeps the learning process smooth for everyone."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3f0"
  },
  "id": "q-12-11",
  "question": "What is Linear Progression on ViBe?",
  "answer": "Linear progression is enabled for every course on ViBe. This means each learner must watch the videos and attempt the quizzes in theexact orderthey appear on the left panel of the course page.\nIn practice:\nYou cannot click on a video or quiz that lies far ahead of your current position.You must complete each item before the next one unlocks.Skipping videos or quizzes is not allowed by design.\nProgress is sequential — finish the item in front of you, and the next one opens up automatically."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3f1"
  },
  "id": "q-12-12",
  "question": "Can I use the left navigation panel to jump ahead to a later video or quiz?",
  "answer": "No. Although the left navigation panel displays the full list of items in your course, it is meant only as aprogress map— not as a jump-to-anywhere menu.\nInstead of clicking through the left panel:\nClickNext QuizorNext Lessonas it appears on theright panel.Let the platform unlock items for you in sequence as you complete each one.\nTrying to skip ahead through the left panel will simply trigger theAccess Restrictedalert (see 12.13)."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3f2"
  },
  "id": "q-12-13",
  "question": "I am seeing a red \"Access Restricted\" banner. Is this a bug?",
  "answer": "No, this isnot a bug. The redAccess Restrictedbanner is an intentional alert from the platform.\nThe banner looks like this:a red toast notification with an exclamation icon, the title\"Access Restricted\", and the message\"Returning to previous valid content.\"below it.\nIt appears when you try to open an item (video or quiz) before completing all the items that come before it. If you are on thenth item but haven't completed every video and quiz from item 1 through itemn−1, the platform will show this alert.\nWhen the banner appears, ViBe automaticallyreturns you to the previous valid content— that is, the last item you had legitimately reached in the sequence. You will not lose any progress; you'll simply be sent back to where you actually are in the course.\nIt is the system gently telling you:\"Please check — there is something earlier in the course that you haven't finished yet.\""
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3f3"
  },
  "id": "q-12-14",
  "question": "How do I resolve the \"Access Restricted\" error?",
  "answer": "Follow these steps in order:\nGo back to the left paneland scroll through your course items from the beginning.Look for any item without a completion tick— that is your missed video or quiz.Complete that item(watch the full video, or attempt and submit the quiz).Refresh the pageonce you've completed all earlier items.If theAccess Restrictedbannerstillappears after refreshing and you are sure all earlier items are completed,report the issue to Yakshaby mentioning#escalate-ViBe.\nIn the large majority of cases, simply finding and completing the missed item clears the alert."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3f4"
  },
  "id": "q-12-15",
  "question": "Why does ViBe sometimes make me re-watch a clip after a quiz?",
  "answer": "If your answer to the check-in quiz didn't go through correctly, ViBe will take you back to the same clip and let you try again. This is called are-watch, and it is part of the design — not a penalty.\nA few things to keep in mind:\nRe-watches arenot recorded against you. They do not affect your HP or evaluation.The clips are short, so a re-watch usually costs less time than guessing through multiple retries.Think of the re-watch as the platform helping the idea actually stick before you move on, rather than scolding you for getting it wrong."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3f5"
  },
  "id": "q-12-16",
  "question": "What kinds of quiz questions will I see on ViBe?",
  "answer": "ViBe quizzes come in four formats:\nFormatWhat it looks likeWhat to doPick one (MCQ)One right answer out of four or so optionsRead all the options before clickingPick one or more (MSQ)\"Select all that apply\" — could be one correct option or severalRead each option carefully; small mistakes happen here mostType a number (NAT)A text box asking for a numeric valueType just the number — no units or extra symbols, unless the question explicitly asksTrue or FalseA statement with only two options —TrueorFalseRead the statement carefully; a single word like \"always,\" \"never,\" or \"only\" can flip the correct answer\nA small tip: watch the clip first, then answer. Trying to read the question while the clip is still playing splits your attention."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3f6"
  },
  "id": "q-12-17",
  "question": "Are the same proctoring rules applied to every course on ViBe?",
  "answer": "No — and this is one of the most important things to understand before reading the rest of this section.\nViBe's proctoring system ismodular. Each individual check — face visibility, single-face-in-frame, lighting, background voices, gaze on screen, camera/microphone access — can beindependently switched on or off by the instructorfor a given course or cohort.\nThis means:\nThe instructor decideswhich proctoring elements are active for their course.Some courses may run withallchecks active (typical for internships, faculty FDPs, and credentialed programmes).Other courses may run withonly a subsetactive — for example, face visibility on but background-voice detection off — depending on the learning context.Certain pilot or open courses may havemost proctoring relaxed, especially where the focus is exploration rather than verified evaluation.\nThe FAQs that follow (12.18 through 12.23) describe thefull set of proctoring behavioursthe platform is capable of. They are written as if everything is switched on. **Whether a specific check applies toyourcourse depends entirely on what your instructor has enabled for that course.**\n⚠️Please do not assume rules carry across courses.A relaxation given in one course (for example, allowing two faces in frame for a paired-learning module) doesnottransfer to another course on the same platform. Always check the course-specific guidelines shared by your instructor or programme team before each course you join.\nWhen in doubt, ask your instructor or programme coordinator which proctoring elements are active for your current course."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3f7"
  },
  "id": "q-12-18",
  "question": "What does the \"quiet helper\" on ViBe actually do?",
  "answer": "While a lesson plays, a small helper runs gently on your device using your camera and microphone. It checks,in real time, that the basic conditions for learning are present.\nSpecifically, it looks at five things:\nA face is visible— to confirm you are really there.Only one face is in frame— to confirm the learning is yours.There is enough light on your face— a silhouette is hard to recognise.The room isn't full of voices— no talking, TV, or background podcasts.You are looking at the screen— brief glances away are fine; long stretches feel like drifting off.\nThe helper is not a judge. Brief, normal movements (a stretch, a sneeze, a glance at your notebook) are absolutely fine. It only pays attention tosustained patterns, not split-second things."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3f8"
  },
  "id": "q-12-19",
  "question": "Does ViBe record long videos of me while I'm learning?",
  "answer": "No. ViBe doesnotcontinuously record videos of you.\nThe camera and microphone are used forreal-time presence checks only.Long recordings of your face or voice arenot stored.When the lesson ends, the helper goes quiet too.All data is handled strictly in accordance with the consent terms shown when you signed up.\nThink of the helper as a quiet study partner sitting beside you — there if needed, invisible otherwise."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3f9"
  },
  "id": "q-12-20",
  "question": "What is the single most common avoidable mistake learners make?",
  "answer": "Sitting with a window directly behind you during the day.\nThe room may feel bright to you, but your camera only sees a dark silhouette where your face should be. The helper then struggles to confirm your presence, and your lesson may pause or rewind.\nThe fix is simple: move so the window isto your sideorin front of the laptop, not behind you. A lamp placed in front of you works just as well in the evening."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3fa"
  },
  "id": "q-12-21",
  "question": "Why does the lesson keep pausing or restarting even when I'm paying attention?",
  "answer": "If a clip keeps stopping or going back to the start, the cause is almost always something small in your environment, not the platform itself. Run through this checklist:\nYour face is too dark→ add a lamp in front of you.Your face is partly out of frame→ raise the laptop or sit a bit closer to the camera.There are voices in the background→ close the door, or move to a quieter room.You switched tabs or went idle→ stay on the ViBe tab; take breaks between clips, not during them.Camera or mic permission dropped→ check the lock icon in your browser's address bar and confirm both are set to \"Allow\"."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3fb"
  },
  "id": "q-12-22",
  "question": "Can I read the quiz questions aloud or mutter to myself while watching?",
  "answer": "It's best not to. The microphone listens for sustained voices in the room, and reading aloud, muttering, or asking a roommate \"wait, what was that?\" can all be picked up as anomalies.\nThe simple habit is:watch in silence, answer in silence, and chat freely during your breaks between clips."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3fc"
  },
  "id": "q-12-23",
  "question": "Can I study with a friend on camera since we're learning together?",
  "answer": "In most courses, no. Onlyyou— the registered Learner — should be in the camera frame during a lesson. The helper checks that exactly one face is visible at a time.\nGroup study is genuinely a wonderful habit, just not inside a ViBe session itself. A good way to do it:\nHop on a separate call with your friend on your phone or a second device.Discuss concepts before or after a ViBe lesson, not during it.Return to ViBe alone when you're ready to watch the clip and attempt the quiz.\n> 📌Note:As explained in12.17, the single-face-in-frame check is an instructor-controlled setting. A few courses (typically paired-learning or collaborative pilots) may explicitlyrelaxthis rule.Do not assume that relaxation in one course applies to another— even on the same platform with the same login. Always default to studying alone unless your instructor has clearly stated otherwise for that specific course."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3fd"
  },
  "id": "q-12-24",
  "question": "Will I lose my progress if I clear my browser or reinstall it?",
  "answer": "No. Your progress is savedon the server, tied to your registered email — not on your browser or your computer.\nSo:\nRefreshing the page, clearing cache, switching browsers, or even reinstalling your browser willnotwipe your progress.The moment you log back in with the same registered email, all your completed clips and quizzes will be exactly where you left them.\nWhen in doubt: log out, log back in."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3fe"
  },
  "id": "q-12-25",
  "question": "Is there a recommended daily learning rhythm on ViBe?",
  "answer": "Yes — small, regular sessions work far better than long marathon sessions. A practical rhythm:\nShow up daily, even if only for thirty minutes. Daily consistency beats a five-hour weekend cram.Take breaks between clips, not during them. A clip is short — finish it first.Treat each quiz as a gentle check-in, not a high-stakes test.For programmes with deadlines(such as internships or faculty cohorts), aim for the daily progress target announced by your programme team — typically around 3.33% per day.\n> 📌A note on milestones:The pacing above is ageneral guidelineonly. For any specific programme (Vinternship cohort, faculty FDP, NPTEL internship, institutional pilot, etc.), theactual milestones, deadlines, and weekly progress targets will be announced by your instructors or programme team. Always follow the milestone schedule communicated for your specific cohort — that takes precedence over the general guidance here."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c3ff"
  },
  "id": "q-12-26",
  "question": "What should my \"study corner\" look like before I start a ViBe session?",
  "answer": "A ViBe-friendly study spot needs only three things:\nLight in front of your face— a lamp or window facing you, never behind.Just you in the camera frame— ask family, friends, or pets not to wander through.A reasonably quiet room— no TV, no music with words, no one else on a call nearby.\nTwo minutes of setup before you start saves a lot of small frustrations during the lesson."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c400"
  },
  "id": "q-13-1",
  "question": "Is team formation compulsory?",
  "answer": "Yes. All projects in Phase 2 and Phase 3 (some parts) must be completed in teams. Every participant is required to be part of a team."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c401"
  },
  "id": "q-13-2",
  "question": "What is the size of a team?",
  "answer": "The team size is fixed atfour members. This is mandatory — you cannot have fewer or more members in a team at the time of final formation."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c402"
  },
  "id": "q-13-3",
  "question": "How are teams formed?",
  "answer": "For students who joined onMay 15 and 16: Teams were formed through a structured activity.For students joining later: Teams will berandomly assignedby the administration."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c403"
  },
  "id": "q-13-4",
  "question": "I started on May 15/16 but couldn't form a team during the activity. What happens now?",
  "answer": "You will berandomly assignedto a team."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c404"
  },
  "id": "q-13-5",
  "question": "There was a typo in our email addresses during team formation. Can we fix it?",
  "answer": "No action is required from your side. The administration willverify and match email IDs with namesbefore finalizing and locking teams."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c405"
  },
  "id": "q-13-6",
  "question": "I formed a team with only two members. Will it be considered?",
  "answer": "No. Teams with fewer than four members will beexpanded by adding additional membersto make a final team of four."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c406"
  },
  "id": "q-13-7",
  "question": "What if a team member leaves or becomes ineligible during Phase 1?",
  "answer": "The administration will attempt toassign a replacement member.If no replacement is found, you may continue as ateam of three.You mustinform the admin immediately, or the change will not be recognized."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c407"
  },
  "id": "q-13-8",
  "question": "Can I form a team with someone from my own college?",
  "answer": "No. Teams must consist of members fromdifferent institutionsto encourage networking.Exception:Students from the same institution butdifferent campuses/locationsmay be allowed."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c408"
  },
  "id": "q-13-9",
  "question": "Can I form a team with students from my IIT MBS cohort?",
  "answer": "No. You are encouraged to collaborate with participantsoutside your existing cohort."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c409"
  },
  "id": "q-13-10",
  "question": "Can we change our team name after submission?",
  "answer": "Yes, team names aretentativeand can be changed. However, due to operational constraints, frequent changes are discouraged."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c40a"
  },
  "id": "q-13-11",
  "question": "What if multiple teams choose the same name?",
  "answer": "Teams will be distinguished usingsuffixes (e.g., Team X-1, Team X-2, etc.)."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c40b"
  },
  "id": "q-13-12",
  "question": "What should I do if I face issues within my team?",
  "answer": "Report any concerns immediately to yourassigned scholar/mentor. Maintaining asafe and respectful environmentis a priority."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c40c"
  },
  "id": "q-13-13",
  "question": "How will I know who my mentor is?",
  "answer": "Your mentor will be thescholar assigned to the projectyour team is working on."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c40d"
  },
  "id": "q-13-14",
  "question": "When will I know my team details?",
  "answer": "Team details are announced in theAnnouncements section on samagama.in. Log in and check regularly during working hours."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c40e"
  },
  "id": "q-13-15",
  "question": "I received a team list email but my name is not included. What should I do?",
  "answer": "Team announcements arephased, so your name may appear in a later list.If your entire cohort has moved to team activities and you are still unassigned,raise the issue on Yaksha or contact a scholar."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c40f"
  },
  "id": "q-13-16",
  "question": "We selected Project X as our top priority but were assigned Project Y. Can we change it?",
  "answer": "No.Project assignments are finaland cannot be changed. Allocation is done to ensurebalanced distribution across projects."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c410"
  },
  "id": "q-13-17",
  "question": "I just started the internship. Can I form my own team now?",
  "answer": "No. For later cohorts, teams will berandomly assigned. Please wait for the official communication."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c411"
  },
  "id": "q-13-18",
  "question": "When do team activities begin?",
  "answer": "Team-based work begins inPhase 2. During Phase 1 (online coursework), you do not need to worry about team activities."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c412"
  },
  "id": "q-13-19",
  "question": "Can I request a specific teammate after teams are assigned?",
  "answer": "No. Team assignments are final andrequests for changes are not entertained."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c413"
  },
  "id": "q-13-20",
  "question": "What happens if a team member is inactive or not contributing?",
  "answer": "You shouldreport the issue to your mentor/scholar early. Prolonged inactivity may lead to administrative intervention."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c414"
  },
  "id": "q-13-21",
  "question": "Can I switch teams if there are conflicts?",
  "answer": "Team switches arenot allowedexcept in exceptional, admin-approved cases involving serious concerns."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c415"
  },
  "id": "q-13-22",
  "question": "Will team performance affect individual evaluation?",
  "answer": "Yes. While some components may be individual,team deliverables are a key part of evaluation."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c416"
  },
  "id": "q-13-23",
  "question": "How will communication happen within teams?",
  "answer": "Teams self-organise internal coordination overLinkedIn or emailonly, limited to their own team members.WhatsApp is not encouraged for team coordination — and it is not permitted to create a team WhatsApp group(a four-person project team is still a \"subset of interns\", which is prohibited under §6.1; a group of that form, if reported, will lead to immediate termination of the internship).\nOfficial programme updates continue to come through theAnnouncements section on samagama.inandYaksha chat— see §6.1 for the full communication policy."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c417"
  },
  "id": "q-13-24",
  "question": "What if I miss the team allocation announcement?",
  "answer": "All programme updates are posted in theAnnouncements section on samagama.in. Log in and check regularly during working hours — this is the only channel for official notifications."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c418"
  },
  "id": "q-13-25",
  "question": "Can a team be dissolved and reformed?",
  "answer": "No. Once finalized,teams are lockedand cannot be dissolved."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c419"
  },
  "id": "q-13-26",
  "question": "What happens if I drop out of the internship?",
  "answer": "Your team will be adjusted accordingly, and the remaining members may continue as ateam of three or receive a replacement."
},
{
  "_id": {
    "$oid": "6a16ef9b032c90682e55c41a"
  },
  "id": "q-13-27",
  "question": "Will we get time to get to know our teammates before Phase 2?",
  "answer": "Yes. There is typically abuffer period before Phase 2where teams can connect and prepare."
}
];

// This parses your flat array, groups it by section numbers, and safely handles data structure mapping
const groupDataBySection = (flatDataset) => {
  const categoryMap = {
    '1': { category: 'About the Internship', icon: '📋' },
    '2': { category: 'Timing & Dates', icon: '📅' },
    '3': { category: 'NOC (No Objection Certificate)', icon: '📄' },
    '4': { category: 'Selection & Offer Letter', icon: '📨' },
    '5': { category: 'Work & Mentorship', icon: '💻' },
    '6': { category: 'Code of Conduct', icon: '⚖️' },
    '7': { category: 'Interviews', icon: '🎤' },
    '8': { category: 'Certificate', icon: '🎓' },
    '9': { category: 'Rosetta (Internship Journal)', icon: '📓' },
    '10': { category: 'Coursework & ViBe LMS', icon: '📚' },
    '11': { category: 'Yaksha Chat', icon: '💬' },
    '12': { category: 'ViBe Platform', icon: '🖥️' },
    '13': { category: 'Team Formation', icon: '👥' }
  };

  const grouped = {};

  flatDataset.forEach(item => {
    // Safety check to ensure item has a valid question string
    if (!item || !item.question) return;

    // Extracts the section number from the id (e.g., "1" from "q-1-3")
    const idMatch = item.id && item.id.match(/^q-(\d+)/);
    const sectionNum = idMatch ? idMatch[1] : '1'; 
    
    if (!grouped[sectionNum]) {
      grouped[sectionNum] = {
        category: categoryMap[sectionNum]?.category || 'General',
        icon: categoryMap[sectionNum]?.icon || '❓',
        questions: []
      };
    }

    // We only push q and a. This explicitly bypasses the problematic _id and $oid syntax fields!
    grouped[sectionNum].questions.push({
      q: item.question,
      a: item.answer
    });
  });

  return Object.values(grouped);
};

// Process your array safely
const formattedData = groupDataBySection(myBigDataset);

async function seed() {
  try {
    console.log('Connecting to database...');
    // Connect to database using configuration fallback variables
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/faq-app');
    
    console.log('Clearing old system entries...');
    await FAQ.deleteMany({});
    
    console.log('Inserting formatted 1k+ dataset records into MongoDB...');
    await FAQ.insertMany(formattedData);
    
    console.log('Database successfully initialized and updated!');
    process.exit(0);
  } catch (err) {
    console.error('Database seeding failed:', err.message);
    process.exit(1);
  }
}

seed();