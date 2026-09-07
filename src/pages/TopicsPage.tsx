import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/primitives";

export interface AwarenessTopic {
  id: string;
  title: string;
  category: "payments" | "high_alert" | "ai_social" | "safety_privacy" | "mobile_device" | "laws";
  categoryLabel: string;
  badgeTone: "danger" | "warn" | "cyan" | "success";
  targetAudience: string[];
  icon: string;
  keyRedFlag: string;
  readTimeMinutes: number;
  summary: string;
  howItWorks: string[];
  redFlags: string[];
  dos: string[];
  donts: string[];
  emergencyAction: string;
  relatedToolOrSim?: { label: string; link: string };
}

export const AWARENESS_TOPICS: AwarenessTopic[] = [
  {
    id: "digital-arrest",
    title: "Digital Arrest & Law Enforcement Impersonation Scam",
    category: "high_alert",
    categoryLabel: "High-Alert Threat",
    badgeTone: "danger",
    targetAudience: ["Senior Citizens", "Professionals", "Parents", "Students"],
    icon: "ti-alert-triangle",
    keyRedFlag: "No Indian law enforcement agency (Police, CBI, ED, Customs) ever conducts arrests or interrogations over WhatsApp or Skype video calls.",
    readTimeMinutes: 3,
    summary: "Fraudsters impersonate CBI, Police, Narcotics Bureau, or Customs officers over Skype/WhatsApp video calls, claiming illegal parcels or money-laundering warrants, and placing victims under a fake 'digital arrest' to extort life savings.",
    howItWorks: [
      "Victim receives an automated call claiming an international courier (FedEx/DHL) in their name containing contraband, drugs, or fake passports was intercepted.",
      "Call is 'transferred' to fake police or CBI officers wearing simulated uniforms in fake police station setups over video call.",
      "Scammers intimidate the victim with forged Supreme Court arrest warrants and state they are under continuous 'Digital Arrest' and cannot leave the camera frame.",
      "Victim is coerced into transferring life savings into a 'government verification / escrow account' for asset verification, promising a refund that never happens.",
    ],
    redFlags: [
      "Demand to remain continuously on video call without speaking to family or lawyers.",
      "Claims of 'Digital Arrest'—Indian law enforcement does NOT recognize or conduct arrest over video calls.",
      "Request to transfer money to a bank account for 'clearance' or 'safe custody'.",
      "Displaying official-looking seals, arrest warrants, and letterheads via messaging apps.",
    ],
    dos: [
      "Immediately disconnect any call where someone claims you are under digital arrest.",
      "Verify independently by calling the local police station directly using numbers on official government websites.",
      "Immediately report the scam attempt on the National Cyber Crime Portal (cybercrime.gov.in) or call 1930.",
    ],
    donts: [
      "Never transfer money to any account claiming to be a 'Supreme Court clearance' or 'CBI safety' account.",
      "Never install screen-sharing software (AnyDesk, TeamViewer) at the request of callers.",
      "Never stay isolated on a video call out of fear or intimidation.",
    ],
    emergencyAction: "If money was transferred, immediately call 1930 within the 'Golden Hour' (2-3 hours) to freeze the recipient bank accounts, and file an FIR on cybercrime.gov.in.",
    relatedToolOrSim: { label: "Try Scam Spotter", link: "/#interactive-lab" },
  },
  {
    id: "upi-qr-fraud",
    title: "Unified Payment Interface (UPI) & QR Code Fraud",
    category: "payments",
    categoryLabel: "Digital Payments",
    badgeTone: "danger",
    targetAudience: ["Everyone", "Shop Owners", "Seniors", "Youth"],
    icon: "ti-qrcode",
    keyRedFlag: "Scanning a QR code or typing your UPI PIN is STRICTLY used to send money out, NEVER to receive funds.",
    readTimeMinutes: 2,
    summary: "Scammers trick users into entering their UPI PIN under the pretext of 'receiving money', cashback, or lottery winnings, or tamper with merchant static QR code stickers.",
    howItWorks: [
      "Scammer poses as a buyer on OLX/Marketplace and offers to pay advance money.",
      "Sends a QR code or a 'Collect Request' on Google Pay/PhonePe/Paytm claiming: 'Scan this QR or approve request to receive ₹15,000'.",
      "When the victim scans and enters their secret 4-digit or 6-digit UPI PIN, money is debited from their account instead of credited.",
      "In physical stores, fraudsters paste paper stickers of their own QR code on top of genuine merchant payment stands.",
    ],
    redFlags: [
      "Anyone asking you to enter your UPI PIN to 'receive' or 'credit' money.",
      "Receiving unexpected collect requests from unknown VPA handles.",
      "Physical QR stickers peeling off or layered over genuine shop QR codes.",
    ],
    dos: [
      "Remember the golden rule: UPI PIN is strictly used to DEDUCT money from your account. Receiving money never requires a PIN.",
      "Always verify the payee name displayed on the confirmation screen before entering your PIN.",
      "Set daily transaction limits on your UPI apps to reduce exposure.",
    ],
    donts: [
      "Never enter your UPI PIN to claim cashback, lotteries, or payments.",
      "Never scan QR codes sent via WhatsApp or SMS to accept funds.",
      "Never share your UPI registration SMS or OTP with anyone.",
    ],
    emergencyAction: "Call your bank immediately to block the UPI handle, call cyber helpline 1930, and submit a complaint on the NPCI portal (npci.org.in).",
    relatedToolOrSim: { label: "Test Payment Safety", link: "/tools" },
  },
  {
    id: "aeps-scams",
    title: "Aadhaar Enabled Payment System (AePS) Biometric Scams",
    category: "payments",
    categoryLabel: "Digital Payments",
    badgeTone: "warn",
    targetAudience: ["Senior Citizens", "Rural Citizens", "Land Owners", "Bank Account Holders"],
    icon: "ti-fingerprint",
    keyRedFlag: "Lock your biometrics in the mAadhaar app so cloned fingerprints from land deeds cannot cash out your bank balance.",
    readTimeMinutes: 3,
    summary: "Cybercriminals extract Aadhaar numbers and clone fingerprint impressions from public land registry deeds or silicon molds to withdraw cash from AePS micro-ATMs without OTP.",
    howItWorks: [
      "Attackers obtain copies of property sale deeds or government registries that contain public Aadhaar numbers and thumb impressions.",
      "They duplicate the fingerprint onto synthetic polymer or silicone sheets.",
      "Using AePS points of sale (PoS) in remote areas, they initiate cash withdrawals without triggering an SMS OTP to the victim.",
    ],
    redFlags: [
      "Unexpected debit SMS from bank accounts mentioning 'AePS Cash Withdrawal' without you visiting an ATM or banking point.",
      "Unsolicited biometric authentication requests.",
    ],
    dos: [
      "Lock your Aadhaar biometrics permanently using the official mAadhaar mobile app or UIDAI website (uidai.gov.in). You can unlock it in 10 seconds whenever you actually need it.",
      "Mask your Aadhaar number: download and use 'Masked Aadhaar' which shows only the last 4 digits.",
      "Keep transaction alerts enabled on your linked mobile phone number.",
    ],
    donts: [
      "Never leave photocopies of your Aadhaar card with unverified agents.",
      "Never cross out or sign blank verification forms.",
      "Don't share biometric tokens on unverified micro-ATM devices.",
    ],
    emergencyAction: "Immediately lock your biometric in the mAadhaar app, call 1930 to freeze the beneficiary account, and complain to the bank.",
  },
  {
    id: "fake-loan-apps",
    title: "Predatory Instant Loan Apps & Extortion Traps",
    category: "payments",
    categoryLabel: "Digital Payments",
    badgeTone: "danger",
    targetAudience: ["Youth", "Students", "Job Seekers", "Vulnerable Borrowers"],
    icon: "ti-cash",
    keyRedFlag: "Legitimate RBI-registered lenders NEVER demand access to your private photo gallery or contacts book.",
    readTimeMinutes: 3,
    summary: "Unregistered fake lending apps promise instant collateral-free loans, gain complete access to contacts, photos, and camera, then blackmail victims with doctored photos.",
    howItWorks: [
      "Apps promoted on social media promise ₹50,000 loan approved in 2 minutes without credit checks.",
      "Upon installation, the app demands invasive permissions: Contacts, Storage, Gallery, and Location.",
      "App disburses only a fraction (e.g. ₹3,000 for a ₹5,000 loan) with a 7-day repayment window and exorbitant interest (over 100%).",
      "If repayment is delayed by even an hour, recovery agents download your family photos, morph them into obscene pictures, and send them to all your phone contacts.",
    ],
    redFlags: [
      "App available only as direct APK download via Telegram or WhatsApp, not registered with RBI.",
      "Demanding access to contacts and personal photo gallery for a financial loan.",
      "Tenure shorter than 30 days and absence of a designated grievance redressal officer.",
    ],
    dos: [
      "Verify if the lending platform is listed on the official Reserve Bank of India (RBI) registered NBFC / Bank list on rbi.org.in.",
      "Inspect app permissions: financial apps have no legitimate reason to access your contact book or camera roll.",
      "File a police complaint immediately if subjected to harassment or blackmail.",
    ],
    donts: [
      "Never download loan apps from third-party websites or untrusted APK links.",
      "Never pay repeated extortion demands—scammers will continue demanding more.",
      "Never grant contact or media permissions to unknown apps.",
    ],
    emergencyAction: "Revoke app permissions, uninstall the app, file an immediate complaint at cybercrime.gov.in and report to the local Cyber Cell.",
  },
  {
    id: "work-from-home-tasks",
    title: "Earn Big from Easy Tasks / YouTube Like Scam",
    category: "ai_social",
    categoryLabel: "Social Engineering",
    badgeTone: "warn",
    targetAudience: ["College Students", "Homemakers", "Job Seekers"],
    icon: "ti-briefcase",
    keyRedFlag: "Legitimate corporate employers NEVER ask employees to deposit money to unlock tasks or withdraw earnings.",
    readTimeMinutes: 3,
    summary: "Victims are lured via WhatsApp/Telegram with offers to earn ₹2,000 - ₹5,000 daily by liking YouTube videos, rating hotels, or writing reviews, leading to huge prepaid investment traps.",
    howItWorks: [
      "Scammer sends an unsolicited message: 'Part-time remote work: Earn ₹50 per YouTube like / Google Map review'.",
      "Initially, victim completes 3 tasks and receives real money (₹150) to build trust.",
      "Victim is added to a Telegram 'VIP group' and asked to perform 'Prepaid Tasks' (e.g. invest ₹1,000 to get ₹1,300 return).",
      "As investment amounts escalate to lakhs, the fake portal shows fake profits but locks withdrawals, demanding more 'tax clearance' fees until the victim is cleaned out.",
    ],
    redFlags: [
      "Job offers with huge payouts for mindless tasks like liking videos or rating products.",
      "Requirement to deposit money in advance to unlock tasks or commissions.",
      "Operations handled exclusively via Telegram groups with automated screenshots of fake earnings.",
    ],
    dos: [
      "Recognize that legitimate corporate employers never ask employees to deposit money to work.",
      "Research companies on verified portals before accepting freelance offers.",
      "Block and report numbers sending unsolicited employment offers.",
    ],
    donts: [
      "Never transfer money to participate in 'crypto review' or 'high-commission' task schemes.",
      "Never share bank credentials or OTPs on Telegram bots.",
    ],
    emergencyAction: "Stop transferring money immediately. Contact cyber helpline 1930 and submit all transaction UTR numbers to attempt fund recovery.",
  },
  {
    id: "ai-voice-cloning",
    title: "AI Voice Cloning & 'Family Member in Distress' Scam",
    category: "ai_social",
    categoryLabel: "AI & Emerging Threats",
    badgeTone: "danger",
    targetAudience: ["Parents", "Senior Citizens", "Families"],
    icon: "ti-microphone",
    keyRedFlag: "Set up a secret 'Family Code Word'; always hang up and call your relative on their saved phone number to verify.",
    readTimeMinutes: 3,
    summary: "Attackers clone a child's or relative's voice using a 3-second audio sample from social media, then call parents claiming the child was in an accident or arrested to demand urgent bail cash.",
    howItWorks: [
      "Scammers scrape short video or audio clips from Instagram reels, TikTok, or YouTube.",
      "Using generative AI voice cloning software, they synthesize audio that sounds identical to the relative's voice, complete with sobbing and panic.",
      "They call the parents: 'Mom, I hit someone with my car, the police have me locked up, please send ₹50,000 to this lawyer's UPI right now!'.",
      "A fake police inspector takes the phone, shouting and intimidating the parents to transfer funds immediately.",
    ],
    redFlags: [
      "Sudden panic call from an unknown phone number claiming a family emergency.",
      "Demand for immediate money transfer via UPI, cryptocurrency, or wire transfer.",
      "Refusal to let you talk to the relative normally or hanging up when questioned.",
    ],
    dos: [
      "Establish a private, secret 'Family Safe-Word' that only your immediate household knows.",
      "Always hang up and call your family member back on their actual, saved telephone number.",
      "Contact their workplace, school, or friends to verify their physical location.",
    ],
    donts: [
      "Never send money in a state of emotional panic without independent verification.",
      "Don't post voice notes or long vocal monologues publicly on open social accounts.",
    ],
    emergencyAction: "If funds were dispatched, contact 1930 immediately to freeze the receiver bank account.",
  },
  {
    id: "call-merge-otp",
    title: "The Call Merge OTP Scam & Call Forwarding Fraud",
    category: "high_alert",
    categoryLabel: "High-Alert Threat",
    badgeTone: "danger",
    targetAudience: ["Mobile Users", "Everyone"],
    icon: "ti-phone-call",
    keyRedFlag: "Never merge incoming phone calls with strangers, and never dial numeric codes starting with *401* on your phone.",
    readTimeMinutes: 2,
    summary: "Attackers trick victims into merging incoming calls or dialing *401* codes, allowing the scammer to listen to OTP voice calls or forward all calls to attacker numbers.",
    howItWorks: [
      "Victim receives a call pretending to be a courier or utility company: 'Your parcel is delayed, please hold on the line while I merge you with my supervisor'.",
      "While on the call, the attacker triggers a bank password reset via IVR voice OTP call.",
      "When the automated bank call rings, the victim merges the calls, enabling the scammer to record or hear the OTP code spoken by the automated system.",
      "Alternatively, scammers instruct: 'Dial *401*<mobile_number> to upgrade your SIM to 5G', which covertly enables unconditional call forwarding to the attacker.",
    ],
    redFlags: [
      "Anyone asking you to merge calls with an incoming unknown number.",
      "Requests to dial numeric codes starting with *401*, *21*, or *62* followed by a phone number.",
      "Sudden cessation of incoming phone calls and text notifications.",
    ],
    dos: [
      "Immediately disconnect if any caller asks you to merge phone calls.",
      "Dial ##002# or *#21# on your phone to check and cancel all active call forwarding settings.",
      "Check your phone's Call Forwarding settings regularly.",
    ],
    donts: [
      "Never dial *401* or similar codes given by unknown callers under any pretext.",
      "Never merge unexpected calls on your mobile phone.",
    ],
    emergencyAction: "Dial ##002# immediately to deactivate all call forwarding, inform your mobile network operator, and check your banking apps for unauthorized activity.",
  },
  {
    id: "kyc-pan-scam",
    title: "KYC Update & Electricity Disconnection SMS Fraud",
    category: "high_alert",
    categoryLabel: "High-Alert Threat",
    badgeTone: "warn",
    targetAudience: ["Account Holders", "Elderly Users", "Citizens"],
    icon: "ti-id-badge-2",
    keyRedFlag: "Banks & electricity boards NEVER send SMS from random 10-digit mobile numbers with threats of same-day disconnection.",
    readTimeMinutes: 2,
    summary: "Deceptive SMS warnings claiming your bank account, SIM card, or electricity will be terminated tonight unless you update KYC via a link or download a helper app.",
    howItWorks: [
      "Victim receives an SMS: 'Dear Customer, Your Electricity power / SBI account will be disconnected tonight due to pending KYC. Call officer at 9876543210'.",
      "Clicking the link opens a counterfeit bank portal capturing user credentials.",
      "Alternatively, the caller instructs the victim to download a 'support app' (AnyDesk, RustDesk, or TeamViewer QuickSupport).",
      "Once granted access code, the scammer watches the victim log in and empties their bank account.",
    ],
    redFlags: [
      "Threat of account suspension within 12 to 24 hours.",
      "Sender header from a private mobile number (+91-XXXXXXXXXX) rather than an official registered alpha header (e.g. VK-SBIBNK).",
      "Instructions to download remote screen-sharing applications.",
    ],
    dos: [
      "Update KYC exclusively by visiting your official bank branch in person or through the verified official mobile banking app.",
      "Verify SMS sender headers: official entities use registered government/bank shortcodes.",
    ],
    donts: [
      "Never install AnyDesk, TeamViewer, or QuickSupport at the behest of callers claiming to be bank executives.",
      "Never click on links received via SMS claiming KYC termination.",
    ],
    emergencyAction: "Uninstall remote access apps immediately, turn off mobile data, contact your bank fraud helpline to freeze online transactions, and report to 1930.",
  },
  {
    id: "courier-customs-scam",
    title: "Courier & Customs Parcel Extortion Scam",
    category: "high_alert",
    categoryLabel: "High-Alert Threat",
    badgeTone: "warn",
    targetAudience: ["Online Shoppers", "Professionals", "Students"],
    icon: "ti-package",
    keyRedFlag: "Legitimate courier companies like FedEx or DHL do not hold criminal interrogations or connect you to police via phone.",
    readTimeMinutes: 2,
    summary: "Automated robocalls pretending to be FedEx, DHL, or India Post claiming a parcel sent to Taiwan or Dubai contains illegal passports, credit cards, or MDMA drugs.",
    howItWorks: [
      "Interactive voice response (IVR) call says: 'Your parcel has been detained by Customs. Press 9 to speak with an executive'.",
      "Pressing 9 connects to a fraudster alleging that an Aadhaar card in your name was used to send illegal drugs abroad.",
      "Scammers use official-looking badges and forged police case numbers, coercing victims to transfer money to avoid immediate airport detention.",
    ],
    redFlags: [
      "Claims of a parcel you never dispatched.",
      "Demands to settle international criminal investigations through instant online bank transfers.",
    ],
    dos: [
      "Hang up immediately. Legitimate courier companies do not run criminal interrogations over customer care lines.",
      "Report the calling number to Chakshu Portal (sancharsaathi.gov.in) and cybercrime.gov.in.",
    ],
    donts: [
      "Never believe threats of arrest over a package you have no knowledge of.",
      "Never send money to 'clear customs holds'.",
    ],
    emergencyAction: "Disconnect and block the number. Report the incident on cybercrime.gov.in.",
  },
  {
    id: "mule-accounts",
    title: "Mule Accounts & 'Rent Your Bank Account' Fraud",
    category: "payments",
    categoryLabel: "Digital Payments",
    badgeTone: "danger",
    targetAudience: ["College Students", "Jobless Youth", "Unemployed"],
    icon: "ti-building-bank",
    keyRedFlag: "Renting or letting strangers use your bank account makes you an accomplice in criminal money laundering (PMLA).",
    readTimeMinutes: 2,
    summary: "Criminals recruit college students and individuals to 'rent' their bank accounts or UPI VPAs for a small commission, using them to funnel laundered cyber scam proceeds.",
    howItWorks: [
      "Students are contacted on Telegram/WhatsApp: 'Earn ₹10,000 per month by renting your idle bank account for business transactions'.",
      "The victim shares their account details, debit card, and net banking passwords or SIM card.",
      "The syndicate routes money stolen from phishing and investment scams through this account.",
      "When police trace the money, the account holder is named as the primary accused in criminal FIRs.",
    ],
    redFlags: [
      "Offers to pay money in exchange for using your personal bank account.",
      "Requests to open corporate or current accounts on behalf of someone else.",
    ],
    dos: [
      "Keep all bank accounts strictly for personal use only.",
      "Educate students that permitting others to use your bank account is a non-bailable criminal offense under the Prevention of Money Laundering Act (PMLA).",
    ],
    donts: [
      "Never rent, lend, or share your bank account, passbook, or ATM card with anyone.",
      "Never allow third-party money to be transferred to your account to withdraw cash for others.",
    ],
    emergencyAction: "If you have shared your account, contact your bank immediately to freeze the account, and voluntarily report to the local cyber police with transaction records.",
  },
  {
    id: "cyberbullying-stalking",
    title: "Cyber Bullying, Doxxing & Online Morphing",
    category: "safety_privacy",
    categoryLabel: "Safety & Privacy",
    badgeTone: "cyan",
    targetAudience: ["Women", "Teens", "Students", "Parents"],
    icon: "ti-user-x",
    keyRedFlag: "Never pay extortionists; use StopNCII.org to protect your photos and report to cybercrime.gov.in with screenshots.",
    readTimeMinutes: 3,
    summary: "Malicious actors weaponize personal photos, use AI face-swapping (morphing) to create non-consensual deepfake media, or leak private addresses (doxxing) to harass victims.",
    howItWorks: [
      "Attackers scrape publicly accessible photos from social media profiles.",
      "They use AI image generators to superimpose faces onto obscene images (online morphing).",
      "The images are used for extortion, reputation damage, or threatening to share with relatives.",
      "Doxxing involves publishing personal telephone numbers, home addresses, and workplace details online to invite mass harassment.",
    ],
    redFlags: [
      "Unsolicited messages demanding money or compliance under threat of leaking images.",
      "Suspicious followers copying your content to create duplicate impersonation accounts.",
    ],
    dos: [
      "Keep social media accounts set to 'Private' and restrict photo visibility to verified friends.",
      "Take screenshots and preserve exact URLs, usernames, and chat logs as legal evidence before blocking.",
      "Utilize StopNCII.org (supported by tech platforms) to generate cryptographic hashes that prevent non-consensual images from being uploaded online.",
      "Report directly under Section 66E, 67, and 67A of the Information Technology Act via cybercrime.gov.in (anonymity options available for women and children).",
    ],
    donts: [
      "Never pay blackmailers or engage in arguments; paying does not guarantee deletion.",
      "Never delete evidence chats without taking timestamped screenshots.",
    ],
    emergencyAction: "Report immediately to National Cyber Crime Portal (cybercrime.gov.in) under the 'Report Women/Child Related Crime' section or call 1930 / National Commission for Women (NCW) helpline 7827170170.",
  },
  {
    id: "app-permissions-hygiene",
    title: "Mobile App Permissions & Data Harvesting",
    category: "mobile_device",
    categoryLabel: "Device & Mobile",
    badgeTone: "warn",
    targetAudience: ["Smartphone Users", "Everyone"],
    icon: "ti-device-mobile",
    keyRedFlag: "Simple utilities like calculators or flashlights should NEVER be granted SMS or Contact reading permissions.",
    readTimeMinutes: 2,
    summary: "Free utility apps (calculators, wallpapers, flashlight apps) requesting invasive permissions to read your SMS, access microphone, or siphon contacts to sell on dark web markets.",
    howItWorks: [
      "User installs a free PDF reader or casual game from the web or store.",
      "Upon first launch, app requests: 'Allow access to SMS, Contacts, Location, and Background Camera'.",
      "Once approved, background services read SMS messages (including financial OTPs) and upload your private phonebook to remote analytics servers.",
    ],
    redFlags: [
      "A simple app requesting permissions completely unrelated to its core function (e.g. calculator asking for contacts or microphone).",
      "Battery drain and unusual data usage by background apps.",
    ],
    dos: [
      "Audit app permissions regularly in Android/iOS settings and set permissions to 'Only while using the app'.",
      "Uninstall apps that haven't been used in over 30 days.",
      "Download software only from official app stores (Google Play Store with Play Protect / Apple App Store).",
    ],
    donts: [
      "Never grant SMS or Accessibility permissions to non-essential apps.",
      "Never install apps from unofficial third-party APK stores.",
    ],
    emergencyAction: "Go to Settings → Apps → Permissions Manager and immediately revoke SMS, Contacts, and Location permissions for all untrusted apps.",
  },
  {
    id: "cyber-reporting-mechanism",
    title: "Citizen Cyber Fraud Reporting (1930 & Golden Hour)",
    category: "laws",
    categoryLabel: "Cyber Laws & Redressal",
    badgeTone: "success",
    targetAudience: ["All Citizens", "Victims of Fraud"],
    icon: "ti-headset",
    keyRedFlag: "Calling 1930 within the first 2-3 hours allows banks and nodal cyber police to freeze money before cash-out.",
    readTimeMinutes: 2,
    summary: "The official national framework established by the Ministry of Home Affairs (MHA) and Indian Cybercrime Coordination Centre (I4C) for recovering lost funds and filing legal complaints.",
    howItWorks: [
      "When a citizen is defrauded, calling helpline 1930 connects directly to the Citizen Financial Cyber Fraud Reporting and Management System (CFCFRMS).",
      "The police operator records transaction details (UTR, account number, beneficiary wallet) and alerts the respective bank's nodal officer within minutes.",
      "The system flags and freezes the defrauded funds in the intermediary banking pipeline before the fraudster can withdraw cash from an ATM.",
      "The victim is provided an acknowledgment number to formalize their FIR within 24 hours on cybercrime.gov.in.",
    ],
    redFlags: [
      "Delaying reporting: after 2-3 hours, fraudsters withdraw cash through mule ATM networks, drastically reducing recovery chances.",
    ],
    dos: [
      "Act within the 'Golden Hour': Call 1930 immediately within 1-2 hours of unauthorized financial debit.",
      "Keep transaction details ready: Bank name, account number, UTR / Transaction ID, date, time, and suspect telephone number.",
      "Save screenshots of payment confirmations, chats, and call records as evidence.",
    ],
    donts: [
      "Don't search for customer care numbers on Google Search ads (fraudsters place fake helpline numbers in paid Google results). Always dial 1930 directly.",
    ],
    emergencyAction: "Dial 1930 immediately or visit https://cybercrime.gov.in to lodge a financial cyber complaint.",
  },
  {
    id: "pig-butchering-crypto",
    title: "Pig Butchering & Fake Trading App Scams",
    category: "ai_social",
    categoryLabel: "Social Engineering",
    badgeTone: "danger",
    targetAudience: ["Investors", "Professionals", "Singles"],
    icon: "ti-chart-candle",
    keyRedFlag: "Never invest through private APK apps or Telegram groups recommended by romantic or mentor acquaintances met online.",
    readTimeMinutes: 3,
    summary: "Criminal syndicates build romantic or mentor relationships over weeks ('fattening the pig'), then persuade victims to invest on manipulated cryptocurrency or stock platforms before disappearing.",
    howItWorks: [
      "Begins with a 'wrong number' WhatsApp text or dating app match (Tinder/Bumble/LinkedIn).",
      "Scammer builds intimate trust over weeks, sharing photos of a wealthy lifestyle and claiming inside trading expertise.",
      "Introduces victim to a counterfeit trading app (which looks like Binance or MetaTrader).",
      "Victim deposits small amounts and sees huge simulated returns, even successfully withdrawing ₹5,000 once.",
      "Victim is convinced to invest life savings or take loans. When attempting to withdraw, the platform demands a 30% 'tax deposit' and subsequently locks the account.",
    ],
    redFlags: [
      "Online acquaintances offering guaranteed high-return investment advice.",
      "Directing you to download trading apps via private APK links rather than official stores.",
      "Demanding additional fees or taxes to withdraw your own principal investment.",
    ],
    dos: [
      "Invest only through SEBI-registered brokers and RBI-regulated financial institutions.",
      "Check broker credentials on the official SEBI portal (sebi.gov.in).",
    ],
    donts: [
      "Never take financial advice from people you have only met online.",
      "Never invest money through unverified APK apps or Telegram trading groups.",
    ],
    emergencyAction: "Cease all further transfers immediately. Report transaction UTRs and the fake broker URL to 1930 and cybercrime.gov.in.",
  },
  {
    id: "juice-jacking-wifi",
    title: "Juice Jacking & Public Wi-Fi Sniffing",
    category: "mobile_device",
    categoryLabel: "Device & Mobile",
    badgeTone: "warn",
    targetAudience: ["Travelers", "Commuters", "Students", "Remote Workers"],
    icon: "ti-wifi",
    keyRedFlag: "Never plug your phone into free USB charging kiosks without a 'Data Blocker' adapter; use standard AC wall outlets.",
    readTimeMinutes: 2,
    summary: "Compromised public USB charging stations that silently install keystroke-logging malware or siphon smartphone files while your battery charges, plus evil-twin Wi-Fi networks.",
    howItWorks: [
      "USB cables transmit both electric power and high-speed data across different pins.",
      "Attackers tamper with public USB ports at airports, train stations, or hotel lobbies with micro-hardware.",
      "When you plug in your phone, the hidden hardware initiates an MTP/ADB file transfer session or side-loads spyware.",
      "Simultaneously, rogue access points mimic 'Free Airport Wi-Fi' to decrypt unencrypted web traffic.",
    ],
    redFlags: [
      "Phone prompts: 'Trust this computer?' or 'Allow access to device data?' when plugged into a public wall socket.",
      "Public Wi-Fi networks that have no password or misspell the venue's name.",
    ],
    dos: [
      "Use your own AC wall charger adapter and plug into standard electrical wall outlets.",
      "Carry a USB 'Data Blocker' (a small adapter that physically severs the data pins, allowing only power through).",
      "Always use a reputable VPN when connecting to unavoidable public Wi-Fi networks.",
    ],
    donts: [
      "Never tap 'Trust' or 'Allow file transfer' when connecting to a public USB kiosk.",
      "Never access banking portals or type sensitive passwords over unsecured public Wi-Fi without VPN.",
    ],
    emergencyAction: "Disconnect immediately. Restart your phone in Airplane Mode, check for newly installed apps or profiles, and scan with Google Play Protect.",
  },
  {
    id: "dpdp-act-rights",
    title: "DPDP Act 2023: Your Digital Data Privacy Rights",
    category: "laws",
    categoryLabel: "Cyber Laws & Redressal",
    badgeTone: "cyan",
    targetAudience: ["All Citizens", "Consumers", "Parents"],
    icon: "ti-scale",
    keyRedFlag: "You have the legal right to revoke consent and demand companies erase your personal information under the DPDP Act.",
    readTimeMinutes: 3,
    summary: "The Digital Personal Data Protection (DPDP) Act 2023 grants Indian citizens enforceable rights over their personal information and imposes strict penalties on negligent companies.",
    howItWorks: [
      "Companies ('Data Fiduciaries') can only collect personal data with clear, unconditional, and informed consent.",
      "Citizens have the right to request a summary of personal data being processed and the identities of third parties with whom it has been shared.",
      "Citizens have the right to correction, completion, updating, and complete erasure of their personal data.",
      "Penalties for failure to prevent data breaches or protect personal data range up to ₹250 Crore per incident.",
    ],
    redFlags: [
      "Services forcing 'all-or-nothing' bundled consent where you must consent to promotional spam to use a core service.",
      "Companies refusing to provide an easy mechanism to delete your account or stored data.",
    ],
    dos: [
      "Exercise your right to withdraw consent from promotional marketing databases.",
      "Submit formal erasure requests to apps and services you no longer use.",
      "Lodge complaints with the Data Protection Board of India (DPBI) for unauthorized data misuse.",
    ],
    donts: [
      "Never accept terms and conditions blindly without reviewing what data is collected and shared.",
    ],
    emergencyAction: "Submit a formal data erasure notice to the entity's Data Protection Officer (DPO). If unresolved within 30 days, escalate to DPBI.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   PANIC SCENARIO QUICK SHORTCUTS (1-Click Instant Triage)
───────────────────────────────────────────────────────────────────────────── */
const PANIC_SHORTCUTS = [
  {
    id: "digital-arrest",
    label: "Fake Police / CBI Video Call",
    icon: "ti-video",
    tone: "danger",
    trigger: "Someone is on Skype/WhatsApp claiming you are under 'Digital Arrest'?",
  },
  {
    id: "upi-qr-fraud",
    label: "QR Code / UPI Reverse Scam",
    icon: "ti-qrcode",
    tone: "danger",
    trigger: "Buyer sent a QR code telling you to scan or enter PIN to receive money?",
  },
  {
    id: "ai-voice-cloning",
    label: "Relative Crying on Phone for Cash",
    icon: "ti-microphone",
    tone: "warn",
    trigger: "Received a panic call sounding like a relative asking for urgent bail money?",
  },
  {
    id: "kyc-pan-scam",
    label: "Electricity / Bank Blocked Tonight",
    icon: "ti-bolt",
    tone: "warn",
    trigger: "Got an SMS saying power/account will be cut unless you call or click?",
  },
  {
    id: "work-from-home-tasks",
    label: "Paid for Liking YouTube Videos",
    icon: "ti-cash",
    tone: "cyan",
    trigger: "Offered high daily cash on Telegram for completing simple online tasks?",
  },
];

export function TopicsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeAudience, setActiveAudience] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<AwarenessTopic | null>(null);

  // Track learned topic IDs in localStorage
  const [learnedTopics, setLearnedTopics] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("cyberguard_learned_topics");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleLearned = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLearnedTopics((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("cyberguard_learned_topics", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const categories = [
    { id: "all", label: "All Threats", count: AWARENESS_TOPICS.length },
    { id: "high_alert", label: "🚨 High-Alert", count: AWARENESS_TOPICS.filter((t) => t.category === "high_alert").length },
    { id: "payments", label: "💳 Banking & UPI", count: AWARENESS_TOPICS.filter((t) => t.category === "payments").length },
    { id: "ai_social", label: "🤖 AI & Social Engineering", count: AWARENESS_TOPICS.filter((t) => t.category === "ai_social").length },
    { id: "safety_privacy", label: "🛡️ Safety & Privacy", count: AWARENESS_TOPICS.filter((t) => t.category === "safety_privacy").length },
    { id: "mobile_device", label: "📱 Mobile & Devices", count: AWARENESS_TOPICS.filter((t) => t.category === "mobile_device").length },
    { id: "laws", label: "⚖️ Legal & Helpline", count: AWARENESS_TOPICS.filter((t) => t.category === "laws").length },
  ];

  const audienceFilters = [
    { id: "all", label: "All Audiences" },
    { id: "Senior Citizens", label: "👴 Seniors & Parents" },
    { id: "Students", label: "🎓 Students & Youth" },
    { id: "Shop Owners", label: "🏪 Merchants & Shops" },
    { id: "Professionals", label: "💼 Working Professionals" },
  ];

  const filteredTopics = AWARENESS_TOPICS.filter((t) => {
    const matchesCategory = activeCategory === "all" || t.category === activeCategory;
    const matchesAudience =
      activeAudience === "all" ||
      t.targetAudience.some((aud) => aud.toLowerCase().includes(activeAudience.toLowerCase()));
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      t.title.toLowerCase().includes(query) ||
      t.summary.toLowerCase().includes(query) ||
      t.keyRedFlag.toLowerCase().includes(query) ||
      t.redFlags.some((rf) => rf.toLowerCase().includes(query)) ||
      t.targetAudience.some((a) => a.toLowerCase().includes(query));
    return matchesCategory && matchesAudience && matchesSearch;
  });

  // Top 3 Spotlight Scams
  const spotlightTopics = AWARENESS_TOPICS.filter((t) =>
    ["digital-arrest", "upi-qr-fraud", "fake-loan-apps"].includes(t.id)
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12">
      {/* ── 1. CLEAN HERO HEADER & EMERGENCY RIBBON ── */}
      <div className="space-y-6">
        {/* Top Emergency Action Ribbon */}
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 sm:p-4 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white font-bold text-lg shadow-md shadow-rose-600/30">
              <i className="ti ti-phone-call animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-600 text-white">
                  Citizen Helpline 1930
                </span>
                <span className="text-[11px] font-semibold text-rose-300">
                  ⏱️ Golden Hour (2-3 hrs) Protocol
                </span>
              </div>
              <p className="text-xs text-text-pure font-medium mt-0.5">
                Targeted right now or money debited? Call <strong>1930</strong> immediately to freeze stolen funds in bank accounts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <a
              href="tel:1930"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 transition-transform active:scale-95 shadow-sm cursor-pointer"
            >
              <i className="ti ti-phone text-xs" />
              Call 1930 Free
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-surface text-xs font-medium text-text-pure hover:bg-surface-elevated transition-colors"
            >
              cybercrime.gov.in ↗
            </a>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5 pt-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle px-3.5 py-1 text-xs font-semibold text-primary">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Stay Safe Online • National Cyber Awareness Library
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-text-pure">
            Cyber Threat &amp; Scam Encyclopedia
          </h1>
          <p className="text-xs sm:text-sm text-text-fog leading-relaxed max-w-2xl mx-auto">
            Practical, zero-jargon protection guides to help you recognize online deception, protect your family, and know exactly what to do when targeted.
          </p>
        </div>
      </div>

      {/* ── 2. INSTANT PANIC TRIAGE: "ARE YOU EXPERIENCING THIS RIGHT NOW?" ── */}
      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-danger/10 text-danger flex items-center justify-center text-sm">
              <i className="ti ti-bolt" />
            </div>
            <h2 className="font-display text-sm sm:text-base font-bold text-text-pure">
              Experiencing a Suspicious Situation Right Now?
            </h2>
          </div>
          <span className="text-[11px] font-mono text-text-ash">
            Click any scenario for immediate 1-click advice
          </span>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {PANIC_SHORTCUTS.map((sc) => {
            const matched = AWARENESS_TOPICS.find((t) => t.id === sc.id);
            return (
              <button
                key={sc.id}
                onClick={() => matched && setSelectedTopic(matched)}
                className="flex flex-col justify-between text-left p-3 rounded-xl border border-border bg-surface-elevated hover:border-primary/50 hover:bg-surface hover:-translate-y-0.5 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <i className={`ti ${sc.icon} text-base text-primary group-hover:scale-110 transition-transform`} />
                  <span className="font-display text-xs font-bold text-text-pure group-hover:text-primary transition-colors line-clamp-1">
                    {sc.label}
                  </span>
                </div>
                <p className="text-[11px] text-text-fog leading-snug line-clamp-2">
                  {sc.trigger}
                </p>
                <span className="mt-2 text-[10px] font-mono text-primary font-semibold flex items-center gap-0.5">
                  Open Quick Guide <i className="ti ti-arrow-right text-[10px]" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. FEATURED SPOTLIGHT: TOP 3 MOST CRITICAL THREATS ── */}
      {search === "" && activeCategory === "all" && activeAudience === "all" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
              <h2 className="font-display text-base sm:text-lg font-bold text-text-pure">
                Most Critical Threats in 2025–2026
              </h2>
            </div>
            <span className="text-xs text-text-ash font-mono">
              Highest Financial Impact
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {spotlightTopics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => setSelectedTopic(topic)}
                className="relative rounded-2xl border border-rose-500/30 bg-surface p-5 flex flex-col justify-between hover:border-rose-500/70 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 group-hover:scale-105 transition-transform">
                      <i className={`ti ${topic.icon} text-xl`} />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      High Priority
                    </span>
                  </div>

                  <h3 className="font-display text-sm font-bold text-text-pure group-hover:text-primary transition-colors min-h-[2.5rem]">
                    {topic.title}
                  </h3>

                  <p className="mt-1 text-xs text-text-fog leading-relaxed line-clamp-2">
                    {topic.summary}
                  </p>

                  <div className="mt-3 p-2.5 rounded-xl bg-danger/10 border border-danger/20 text-[11px] text-text-pure leading-snug">
                    <span className="font-bold text-danger">⚠️ Warning Sign: </span>
                    {topic.keyRedFlag}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary group-hover:underline flex items-center gap-1">
                    Open Defense Dossier <i className="ti ti-chevron-right text-xs" />
                  </span>
                  <span className="text-[10px] font-mono text-text-ash">
                    ⏱️ {topic.readTimeMinutes} min
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. SEARCH, CATEGORIES & AUDIENCE FILTERS ── */}
      <div className="space-y-4 pt-2">
        {/* Search Bar & Result Count */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-ash" />
            <input
              type="text"
              placeholder="Search by scam name, keyword, or tactic (e.g. UPI, QR, CBI, OTP)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-border bg-surface text-xs sm:text-sm text-text-pure placeholder:text-text-ash focus:outline-none focus:border-primary shadow-sm transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-ash hover:text-text-pure text-xs cursor-pointer"
              >
                <i className="ti ti-x" />
              </button>
            )}
          </div>

          <div className="text-xs font-mono text-text-ash self-end sm:self-center">
            Showing <strong className="text-text-pure">{filteredTopics.length}</strong> of {AWARENESS_TOPICS.length} guides
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface border border-border text-text-fog hover:text-text-pure hover:bg-surface-elevated"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeCategory === cat.id ? "bg-white/20 text-white" : "bg-surface-elevated text-text-ash"
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Audience Sub-Filters */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs text-text-ash">
          <span className="font-mono text-[10px] uppercase shrink-0">Target Audience:</span>
          {audienceFilters.map((aud) => (
            <button
              key={aud.id}
              onClick={() => setActiveAudience(aud.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeAudience === aud.id
                  ? "bg-surface-elevated text-text-pure border border-border font-semibold shadow-xs"
                  : "text-text-fog hover:text-text-pure"
              }`}
            >
              {aud.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 5. COMPLETE THREAT TOPICS GRID ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTopics.map((topic) => {
          const isLearned = learnedTopics.includes(topic.id);
          return (
            <motion.div
              key={topic.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border bg-surface p-5 flex flex-col justify-between transition-all cursor-pointer group hover:border-primary/50 hover:shadow-md ${
                isLearned ? "border-emerald-500/30" : "border-border"
              }`}
              onClick={() => setSelectedTopic(topic)}
            >
              <div>
                {/* Header row with Icon, Category Pill & Learned Checkmark */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform">
                      <i className={`ti ${topic.icon} text-lg`} />
                    </div>
                    <Pill tone={topic.badgeTone}>{topic.categoryLabel}</Pill>
                  </div>

                  <button
                    type="button"
                    title={isLearned ? "Marked as Learned" : "Mark as Learned"}
                    onClick={(e) => toggleLearned(topic.id, e)}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                      isLearned
                        ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                        : "border-border text-text-ash hover:text-text-pure hover:border-text-ash"
                    }`}
                  >
                    <i className={`ti ${isLearned ? "ti-check" : "ti-circle"} text-sm`} />
                  </button>
                </div>

                {/* Card Title */}
                <h3 className="font-display text-sm sm:text-base font-bold text-text-pure group-hover:text-primary transition-colors min-h-[2.75rem]">
                  {topic.title}
                </h3>

                {/* Card Summary */}
                <p className="mt-1.5 text-xs text-text-fog leading-relaxed line-clamp-2">
                  {topic.summary}
                </p>

                {/* Prominent Red Flag Callout */}
                <div className="mt-3 p-2.5 rounded-xl bg-surface-elevated border border-border text-[11px] text-text-pure leading-snug">
                  <span className="font-bold text-warn">⚠️ Key Clue: </span>
                  {topic.keyRedFlag}
                </div>

                {/* Target Audience Pills */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {topic.targetAudience.slice(0, 2).map((aud) => (
                    <span
                      key={aud}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated text-text-ash border border-border"
                    >
                      {aud}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="font-semibold text-primary flex items-center gap-1 group-hover:underline">
                  Open Full Dossier <i className="ti ti-arrow-right text-xs" />
                </span>
                <span className="text-[10px] font-mono text-text-ash">
                  ⏱️ {topic.readTimeMinutes} min read
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty Search State */}
      {filteredTopics.length === 0 && (
        <div className="p-10 text-center rounded-2xl bg-surface border border-border space-y-2">
          <i className="ti ti-search text-3xl text-text-ash mb-1" />
          <p className="text-sm font-semibold text-text-pure">No guides matching &quot;{search}&quot;</p>
          <p className="text-xs text-text-fog">Try broader terms like &apos;UPI&apos;, &apos;Police&apos;, &apos;OTP&apos;, or &apos;Aadhaar&apos;.</p>
          <div className="pt-2">
            <Button
              variant="secondary"
              size="xs"
              onClick={() => {
                setSearch("");
                setActiveCategory("all");
                setActiveAudience("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      )}

      {/* ── 6. DETAILED TOPIC DEEP-DIVE MODAL ── */}
      <AnimatePresence>
        {selectedTopic && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto"
            onClick={() => setSelectedTopic(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-3xl my-6 rounded-2xl border border-border bg-surface p-5 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedTopic(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-xl text-text-ash hover:text-text-pure hover:bg-surface-elevated transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <i className="ti ti-x text-lg" />
              </button>

              {/* Modal Header */}
              <div className="space-y-2 pr-8">
                <div className="flex items-center gap-2">
                  <Pill tone={selectedTopic.badgeTone}>{selectedTopic.categoryLabel}</Pill>
                  <span className="text-xs text-text-ash font-mono">• ⏱️ {selectedTopic.readTimeMinutes} min defense guide</span>
                </div>
                <h2 className="font-display text-lg sm:text-2xl font-bold text-text-pure flex items-center gap-2.5">
                  <i className={`ti ${selectedTopic.icon} text-primary`} />
                  {selectedTopic.title}
                </h2>
                <p className="text-xs sm:text-sm text-text-fog leading-relaxed">
                  {selectedTopic.summary}
                </p>
              </div>

              {/* Primary Key Rule Callout */}
              <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/30 flex items-start gap-3">
                <i className="ti ti-alert-triangle text-danger text-lg shrink-0 mt-0.5" />
                <div className="text-xs text-text-pure leading-relaxed">
                  <strong className="text-danger block mb-0.5 font-mono uppercase text-[10px] tracking-wider">
                    Golden Defense Rule:
                  </strong>
                  {selectedTopic.keyRedFlag}
                </div>
              </div>

              {/* Step-by-Step Modus Operandi */}
              <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2.5">
                <div className="font-bold text-xs uppercase tracking-wider text-primary font-mono flex items-center gap-1.5">
                  <i className="ti ti-eye" /> How Scammers Operate (Step-by-Step):
                </div>
                <ol className="space-y-2 text-xs text-text-pure">
                  {selectedTopic.howItWorks.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-bold font-mono">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Warning Signs & Red Flags */}
              <div className="space-y-2">
                <div className="font-bold text-xs uppercase tracking-wider text-danger font-mono flex items-center gap-1.5">
                  <i className="ti ti-alert-octagon" /> Critical Warning Signs &amp; Red Flags:
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {selectedTopic.redFlags.map((flag, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-danger/5 border border-danger/20 text-xs text-text-pure flex items-start gap-2 leading-relaxed">
                      <i className="ti ti-x text-danger shrink-0 mt-0.5" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Do's and Don'ts */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="p-4 rounded-xl bg-success/5 border border-success/20 space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-success font-mono flex items-center gap-1.5">
                    <i className="ti ti-shield-check" /> Do&apos;s (Protective Habits):
                  </div>
                  <ul className="space-y-1.5 text-xs text-text-pure">
                    {selectedTopic.dos.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <i className="ti ti-check text-success shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-danger/5 border border-danger/20 space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-danger font-mono flex items-center gap-1.5">
                    <i className="ti ti-shield-x" /> Don&apos;ts (Never Do This):
                  </div>
                  <ul className="space-y-1.5 text-xs text-text-pure">
                    {selectedTopic.donts.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <i className="ti ti-ban text-danger shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Emergency Action */}
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1.5 text-xs">
                <div className="font-bold text-rose-400 flex items-center gap-1.5 uppercase font-mono text-[11px] tracking-wider">
                  <i className="ti ti-sos text-sm" /> Emergency Action If Targeted:
                </div>
                <p className="text-text-pure leading-relaxed">
                  {selectedTopic.emergencyAction}
                </p>
              </div>

              {/* Modal Footer with Actions */}
              <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-ash">
                    National Helpline:
                  </span>
                  <a
                    href="tel:1930"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 text-white font-mono text-xs font-bold shadow-xs hover:bg-rose-500"
                  >
                    <i className="ti ti-phone text-[11px]" />
                    Dial 1930
                  </a>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {selectedTopic.relatedToolOrSim && (
                    <Link to={selectedTopic.relatedToolOrSim.link} onClick={() => setSelectedTopic(null)}>
                      <Button variant="primary" size="sm">
                        {selectedTopic.relatedToolOrSim.label}
                      </Button>
                    </Link>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => setSelectedTopic(null)}>
                    Close Dossier
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
