import type { Module, Lesson, Quiz, Simulation, Badge, Profile, Progress, LeaderboardEntry } from "@/types";

export interface SimulationStepData {
  id: string;
  simulation_id: string;
  order_index: number;
  prompt: string;
  options: { id: string; label: string; correct: boolean }[];
  explanation: string;
}

export interface QuestionData {
  id: string;
  quiz_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "a" | "b" | "c" | "d";
  explanation?: string;
  points: number;
  order_index: number;
}

export interface AssessmentQuestionData {
  id: string;
  assessment_id: string;
  topic: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "a" | "b" | "c" | "d";
  explanation?: string;
  order_index: number;
}

/* ── Pre-Seeded Default Dataset ── */

const DEFAULT_PROFILES: Profile[] = [
  {
    id: "user-demo-admin",
    full_name: "Sarah Chen (Security Lead)",
    email: "admin@cyberguard.dev",
    role: "admin",
    avatar_url: null,
    points: 1480,
    level: 5,
    awareness_score: 99,
    status: "active",
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: "user-demo-lead-1",
    full_name: "Tirth Bariya",
    email: "tirth.b@cyberguard.dev",
    role: "user",
    avatar_url: null,
    points: 1250,
    level: 5,
    awareness_score: 98,
    status: "active",
    created_at: new Date(Date.now() - 50 * 86400000).toISOString(),
  },
  {
    id: "user-demo-lead-2",
    full_name: "Aarav Sharma",
    email: "aarav.s@cyberguard.dev",
    role: "user",
    avatar_url: null,
    points: 980,
    level: 4,
    awareness_score: 95,
    status: "active",
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: "user-demo-lead-3",
    full_name: "Kriti Patel",
    email: "kriti.p@cyberguard.dev",
    role: "user",
    avatar_url: null,
    points: 860,
    level: 4,
    awareness_score: 94,
    status: "active",
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
  },
  {
    id: "user-demo-lead-4",
    full_name: "Rohan Mehta",
    email: "rohan.m@cyberguard.dev",
    role: "user",
    avatar_url: null,
    points: 780,
    level: 4,
    awareness_score: 92,
    status: "active",
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "user-demo-lead-5",
    full_name: "Isha Verma",
    email: "isha.v@cyberguard.dev",
    role: "user",
    avatar_url: null,
    points: 700,
    level: 4,
    awareness_score: 90,
    status: "active",
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: "user-demo-lead-6",
    full_name: "Dhruv Singh",
    email: "dhruv.s@cyberguard.dev",
    role: "user",
    avatar_url: null,
    points: 660,
    level: 3,
    awareness_score: 88,
    status: "active",
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: "user-demo-lead-7",
    full_name: "Sneha Joshi",
    email: "sneha.j@cyberguard.dev",
    role: "user",
    avatar_url: null,
    points: 620,
    level: 3,
    awareness_score: 87,
    status: "active",
    created_at: new Date(Date.now() - 16 * 86400000).toISOString(),
  },
  {
    id: "user-demo-lead-8",
    full_name: "Manav Trivedi",
    email: "manav.t@cyberguard.dev",
    role: "user",
    avatar_url: null,
    points: 580,
    level: 3,
    awareness_score: 85,
    status: "active",
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: "user-demo-lead-9",
    full_name: "Priya Shah",
    email: "priya.shah@cyberguard.dev",
    role: "user",
    avatar_url: null,
    points: 540,
    level: 2,
    awareness_score: 84,
    status: "active",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "user-demo-lead-10",
    full_name: "Harsh Patel",
    email: "harsh.p@cyberguard.dev",
    role: "user",
    avatar_url: null,
    points: 500,
    level: 2,
    awareness_score: 82,
    status: "active",
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: "user-demo-operator",
    full_name: "Alex Morgan",
    email: "operator@cyberguard.dev",
    role: "user",
    avatar_url: null,
    points: 460,
    level: 2,
    awareness_score: 80,
    status: "active",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "user-demo-lead-11",
    full_name: "Liam O'Connor",
    email: "liam.o@cyberguard.dev",
    role: "user",
    avatar_url: null,
    points: 210,
    level: 2,
    awareness_score: 79,
    status: "active",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

const DEFAULT_MODULES: Module[] = [
  {
    id: "mod-1",
    title: "Cybersecurity Fundamentals",
    slug: "cybersecurity-fundamentals",
    description: "Core concepts every user needs: the CIA triad, common threat categories, and why human awareness forms the perimeter.",
    category: "Fundamentals",
    difficulty: "beginner",
    duration_minutes: 20,
    thumbnail_url: null,
    learning_objectives: [
      "Understand the CIA triad (Confidentiality, Integrity, Availability)",
      "Identify common threat vectors before they compromise systems",
      "Explain why social engineering targets people rather than firewalls",
    ],
    is_published: true,
    order_index: 1,
  },
  {
    id: "mod-2",
    title: "Password & Account Security",
    slug: "password-account-security",
    description: "Build unbreakable authentication habits: password entropy, password managers, and multi-factor authentication (MFA).",
    category: "Authentication",
    difficulty: "beginner",
    duration_minutes: 15,
    thumbnail_url: null,
    learning_objectives: [
      "Create high-entropy unique passphrases that resist offline cracking",
      "Explain how multi-factor authentication stops 99.9% of automated attacks",
      "Recognize and prevent credential stuffing attacks across work services",
    ],
    is_published: true,
    order_index: 2,
  },
  {
    id: "mod-3",
    title: "Phishing & Spear-Phishing Awareness",
    slug: "phishing-awareness",
    description: "Spot subtle red flags in spoofed emails, urgency pretexts, fake sender domains, and weaponized attachments before clicking.",
    category: "Social Engineering",
    difficulty: "beginner",
    duration_minutes: 18,
    thumbnail_url: null,
    learning_objectives: [
      "Spot typo-squatted sender domains and lookalike characters",
      "Inspect hidden destination URLs by safely previewing hyperlinks",
      "Report suspicious messages to the Security Operations Center (SOC)",
    ],
    is_published: true,
    order_index: 3,
  },
  {
    id: "mod-4",
    title: "Social Engineering & Pretexting",
    slug: "social-engineering",
    description: "Understand how attackers manipulate trust, authority, and emotional urgency to bypass digital and physical controls.",
    category: "Social Engineering",
    difficulty: "intermediate",
    duration_minutes: 20,
    thumbnail_url: null,
    learning_objectives: [
      "Recognize pretexting, baiting, and executive impersonation",
      "Enforce secondary out-of-band verification procedures",
      "Prevent oversharing confidential organizational data on public profiles",
    ],
    is_published: true,
    order_index: 4,
  },
  {
    id: "mod-5",
    title: "Malware & Ransomware Defense",
    slug: "malware-ransomware",
    description: "Learn how malicious payloads infect endpoints, recognize active encryption signs, and practice emergency containment.",
    category: "Threats",
    difficulty: "intermediate",
    duration_minutes: 22,
    thumbnail_url: null,
    learning_objectives: [
      "Differentiate trojans, ransomware, and info-stealer malware",
      "Execute emergency endpoint isolation steps during an active infection",
      "Maintain air-gapped immutable backups to neutralize extortion",
    ],
    is_published: true,
    order_index: 5,
  },
  {
    id: "mod-6",
    title: "Network Security & Safe Browsing",
    slug: "network-security",
    description: "Practice safe habits on public Wi-Fi, verify SSL/TLS encryption certificates, and utilize VPNs to prevent MITM interception.",
    category: "Network",
    difficulty: "intermediate",
    duration_minutes: 18,
    thumbnail_url: null,
    learning_objectives: [
      "Evaluate public wireless access point risks and rogue hotspots",
      "Explain TLS encryption, certificate warnings, and HTTPS indicators",
      "Harden personal devices and home routers against unauthorized access",
    ],
    is_published: true,
    order_index: 6,
  },
];

const DEFAULT_LESSONS: Lesson[] = [
  /* ── MODULE 1: Cybersecurity Fundamentals ── */
  {
    id: "les-1-1",
    module_id: "mod-1",
    title: "The Modern Threat Landscape & The Human Perimeter",
    order_index: 1,
    video_url: null,
    content: [
      { type: "paragraph", text: "In modern cybersecurity, technology alone is no longer enough. Firewalls, endpoint agents, and intrusion detection systems guard network perimeters, but adversaries overwhelmingly target the human element to bypass technical walls." },
      { type: "tip", text: "Over 82% of all enterprise data breaches involve a human element—including social engineering, phishing clicks, credential reuse, and misconfigurations." },
      { type: "case_study", title: "The Single Click that Paralyzed an Entire Municipality", incident: "In 2019, an administrative employee in a major city opened an email disguised as a city utility invoice. The attachment executed a macro that dropped Emotet malware, which propagated laterally across all department servers within 4 hours.", impact: "$17 million in emergency incident response, 2 weeks of offline emergency dispatch services, and compromised resident records.", takeaway: "Never assume a firewall will catch every malicious file. Every employee is an active sentinel in the organization's defense line." },
      { type: "interactive_check", question: "Why do modern cyber attackers focus so heavily on manipulating individual employees rather than exploiting zero-day firewall bugs?", options: [
        { text: "Firewalls are mathematically impossible to penetrate under any circumstances", correct: false, explanation: "Firewalls do have vulnerabilities, but they require immense time, technical skill, and expensive exploit code." },
        { text: "Humans can be deceived through emotional triggers like fear, urgency, and authority in seconds", correct: true, explanation: "Correct! Social engineering exploits human psychology—trust, helpfulness, or panic—which is vastly cheaper and faster than developing zero-day software exploits." },
        { text: "Employees have full administrator access to all root corporate servers by default", correct: false, explanation: "Most employees have standard user privileges; attackers use initial human footholds to gradually escalate privileges." }
      ]},
      { type: "takeaway", title: "Core Mental Models for Every Defender", points: [
        "Adopt a 'Zero Trust' mindset: verify every unexpected request regardless of who appears to send it.",
        "Recognize emotional urgency: if a message makes your heart race, slow down—urgency is the attacker's favorite weapon.",
        "Fast reporting saves networks: reporting a suspected mistake within 10 minutes can stop lateral malware spread."
      ]}
    ],
  },
  {
    id: "les-1-2",
    module_id: "mod-1",
    title: "The CIA Triad & Real-World Breaches",
    order_index: 2,
    video_url: null,
    content: [
      { type: "paragraph", text: "Every security policy, encryption standard, and defense architecture in the world is anchored around three foundational principles: Confidentiality, Integrity, and Availability—known collectively as the CIA Triad." },
      { type: "list", items: [
        "Confidentiality: Ensuring sensitive data is accessible strictly to authorized individuals and concealed from eavesdroppers.",
        "Integrity: Guaranteeing information remains untampered, mathematically authentic, and accurate across its lifecycle.",
        "Availability: Ensuring computing systems, databases, and network connections remain operational and accessible when needed."
      ]},
      { type: "terminal", title: "Integrity Verification via Cryptographic Hashing", command: "sha256sum critical_financial_report.pdf", output: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  critical_financial_report.pdf\n# If even a single byte or digit is altered by a Man-in-the-Middle attacker, this 256-bit hash changes completely!" },
      { type: "warning", text: "Attacks often destroy multiple pillars at once. For example, ransomware breaches Confidentiality (stealing records), Integrity (encrypting data headers), and Availability (locking servers)." },
      { type: "takeaway", title: "Actionable Defenses for Each CIA Pillar", points: [
        "Defend Confidentiality: Use end-to-end encryption, strong unique passwords, and avoid discussing work on public transport.",
        "Defend Integrity: Check cryptographic checksums on downloads, verify payment amounts before signing, and monitor account logs.",
        "Defend Availability: Keep reliable offline backups, use redundant internet connections, and guard against DDoS floods."
      ]}
    ],
  },
  {
    id: "les-1-3",
    module_id: "mod-1",
    title: "Attack Surfaces & Personal Digital Hygiene",
    order_index: 3,
    video_url: null,
    content: [
      { type: "paragraph", text: "Your 'Attack Surface' is the total sum of all points where an unauthorized user can try to enter or extract data from your environment. Every open port, obsolete browser plugin, connected Bluetooth device, and overshared social media profile expands this surface." },
      { type: "tip", text: "Attackers use Open Source Intelligence (OSINT) to scrape your LinkedIn, Instagram, and corporate directories to discover pet names, birthdays, vacation schedules, and software tools you use." },
      { type: "interactive_check", question: "Which of the following actions most effectively shrinks your personal digital attack surface?", options: [
        { text: "Uninstalling unused browser extensions and apps, and closing inactive accounts", correct: true, explanation: "Correct! Every obsolete app or extension is an unpatched vulnerability waiting to be hijacked by attackers." },
        { text: "Clearing your browser cookies once every calendar year", correct: false, explanation: "Clearing cookies once a year does not reduce your software attack surface or eliminate unpatched vulnerabilities." },
        { text: "Using the same strong password across all personal and work websites", correct: false, explanation: "Password reuse exponentially INCREASES your attack surface through credential stuffing." }
      ]},
      { type: "takeaway", title: "15-Minute Digital Hygiene Routine", points: [
        "Audit and purge: Delete apps, extensions, and social accounts you haven't used in 90 days.",
        "Turn on auto-updates for Operating System, browsers, and mobile devices—patches fix known exploit routes.",
        "Turn off Bluetooth and Wi-Fi auto-connect when traveling through public airports or train stations."
      ]}
    ],
  },

  /* ── MODULE 2: Password & Account Security ── */
  {
    id: "les-2-1",
    module_id: "mod-2",
    title: "The Physics of Password Cracking & Entropy",
    order_index: 1,
    video_url: null,
    content: [
      { type: "paragraph", text: "When a website is breached, attackers rarely guess passwords by typing them manually. Instead, they download entire stolen database dumps containing millions of password hashes, and feed them into specialized GPU rigs capable of testing billions of guesses per second." },
      { type: "terminal", title: "Hashcat GPU Attack Speeds (8x RTX 4090)", command: "hashcat -m 1000 -a 0 ntlm_hashes.txt rockyou.txt", output: "Speed.Dev.#1.....:  118.4 GH/s (118,400,000,000 hashes tested per second!)\nRecovered........:  8,421,902 / 10,000,000 (84.21% cracked in 4 minutes)" },
      { type: "tip", text: "Length beats complexity every time! A complex 8-character password like 'P@ssw0rd' can be cracked in under 0.2 seconds. A 16-character passphrase like 'correct-horse-battery-staple' would take 4 million years." },
      { type: "warning", text: "Credential Stuffing: If you use the same password on an old gaming forum and your primary banking email, a leak at the forum gives hackers instant access to your banking." },
      { type: "takeaway", title: "The Unbreakable Password Formula", points: [
        "Aim for at least 15+ characters using a 4-word passphrase formula (e.g., 'crimson-falcon-coffee-orbit').",
        "Never repeat the same password across multiple accounts. Treat each login as an isolated vault.",
        "Let a dedicated password manager generate and remember random 20-character strings for you."
      ]}
    ],
  },
  {
    id: "les-2-2",
    module_id: "mod-2",
    title: "Multi-Factor Authentication (MFA) & Fatigue Attacks",
    order_index: 2,
    video_url: null,
    content: [
      { type: "paragraph", text: "Multi-Factor Authentication (MFA) requires proving your identity using at least two different categories of evidence: Something you know (password/PIN), Something you have (phone/hardware token), and Something you are (biometrics/fingerprint)." },
      { type: "case_study", title: "The 2022 Uber Breach: MFA Fatigue in Real Time", incident: "An attacker obtained a contractor's valid corporate credentials on the dark web. When prompted for 2FA push notification approval, the attacker initiated over 40 login requests at 1:00 AM, then contacted the contractor on WhatsApp pretending to be Uber IT Support, asking them to 'accept the notification to stop the spam'.", impact: "The exhausted contractor tapped 'Approve'. The attacker accessed Uber's internal Slack, AWS console, and vulnerability reports.", takeaway: "Never approve a push prompt or share an OTP you didn't trigger yourself. Report repeated unsolicited push notifications immediately." },
      { type: "interactive_check", question: "Rank 2FA methods from least secure to most secure:", options: [
        { text: "SMS OTP < Authenticator App (TOTP) < Hardware Security Key (FIDO2)", correct: true, explanation: "Correct! SMS is vulnerable to SIM-swapping and SS7 interception. Authenticator apps are much stronger. Hardware keys (FIDO2/WebAuthn) are cryptographically immune to phishing!" },
        { text: "Hardware Security Key < SMS OTP < Security Questions", correct: false, explanation: "Security questions are notoriously weak (answers can be found on social media), while hardware keys are the gold standard." },
        { text: "Authenticator App < SMS OTP < Hardware Key", correct: false, explanation: "SMS OTP is significantly weaker than authenticator apps due to telco SIM swaps and SMS sniffing." }
      ]},
      { type: "takeaway", title: "MFA Defense Checklist", points: [
        "Enable MFA on every critical account: email, banking, social media, and cloud drives.",
        "Migrate away from SMS verification to an Authenticator app (Google Authenticator, Microsoft Authenticator, YubiKey).",
        "If your phone receives a 2FA prompt when you aren't logging in, someone has your password! Change it immediately."
      ]}
    ],
  },
  {
    id: "les-2-3",
    module_id: "mod-2",
    title: "Password Managers, Passkeys & Vault Defense",
    order_index: 3,
    video_url: null,
    content: [
      { type: "paragraph", text: "Human memory cannot safely store 100+ unique 20-character passwords. Password managers solve this by encrypting all credentials locally using AES-256 zero-knowledge encryption, requiring you to remember only one single Master Key." },
      { type: "tip", text: "Passkeys (FIDO2 / WebAuthn) are the future of authentication. They replace passwords with asymmetric cryptographic key pairs tied to your biometric device, making credential theft and phishing mathematically impossible." },
      { type: "interactive_check", question: "If a reputable password manager's cloud servers are breached, can hackers read your saved passwords?", options: [
        { text: "Yes, because all passwords are stored in readable plaintext on the server", correct: false, explanation: "Reputable password managers never store passwords in plaintext." },
        { text: "No, because zero-knowledge architecture means only your local device holds the decryption key derived from your Master Password", correct: true, explanation: "Correct! Even if hackers steal the encrypted vault blobs from the cloud, they cannot decrypt them without your unique Master Password." },
        { text: "Yes, because the company's tech support employees have a master backdoor key", correct: false, explanation: "Zero-knowledge encryption ensures even company employees cannot view or decrypt your vault." }
      ]},
      { type: "takeaway", title: "Master Vault Survival Rules", points: [
        "Craft an extraordinary 5-word master passphrase for your password manager and memorize it.",
        "Store your emergency recovery kit in a secure physical location (e.g. home fireproof safe).",
        "Use passkeys wherever supported to eliminate typing passwords entirely."
      ]}
    ],
  },

  /* ── MODULE 3: Phishing & Spear-Phishing Awareness ── */
  {
    id: "les-3-1",
    module_id: "mod-3",
    title: "Anatomy of a Phishing Trap: Clues & Disguises",
    order_index: 1,
    video_url: null,
    content: [
      { type: "paragraph", text: "Phishing emails exploit digital brand spoofing to disguise dangerous links and weaponized attachments. Attackers rely on four psychological levers: Manufactured Urgency, Authority Impersonation, Fear of Loss, and Lookalike Branding." },
      { type: "list", items: [
        "Lookalike Subdomains: A URL like 'login.microsoft.com.account-verify.net' belongs to 'account-verify.net', NOT Microsoft!",
        "Homograph Typos: Attackers replace Latin characters with identical Cyrillic letters (e.g., Cyrillic 'а' in 'pаypal.com').",
        "Display Name Spoofing: An email shows 'IT Support' as the sender name, but the real address behind it is 'support@random-temp-mail.xyz'."
      ]},
      { type: "tip", text: "The 5-Second Hover Rule: Always hover your mouse pointer over any link or button to inspect the true destination URL in your browser's bottom status bar before clicking." },
      { type: "interactive_check", question: "Examine this URL: 'https://paypal.com.customer-security-portal.co/verify'. Who owns this domain?", options: [
        { text: "PayPal Corporation, because 'paypal.com' is at the start", correct: false, explanation: "Incorrect! Subdomains precede the primary domain. In this case, 'customer-security-portal.co' is the true registered domain." },
        { text: "customer-security-portal.co, an attacker-controlled lookalike domain", correct: true, explanation: "Correct! The true domain is always the text immediately preceding the last slash and following the last period. Attackers use 'paypal.com' as a deceptive subdomain." },
        { text: "The United States Cyber Defense Agency", correct: false, explanation: "Government entities use .gov domains and never spoof commercial brand subdomains." }
      ]},
      { type: "takeaway", title: "Phishing Triage Protocol", points: [
        "Never click links in unprompted emails claiming account suspension or emergency verification.",
        "Open a fresh browser tab and navigate directly to the official website (e.g., type 'netflix.com' yourself).",
        "Forward suspicious emails immediately to your company's security incident mailbox or click the 'Report Phish' button."
      ]}
    ],
  },
  {
    id: "les-3-2",
    module_id: "mod-3",
    title: "Spear-Phishing & Executive Impersonation (CEO Fraud)",
    order_index: 2,
    video_url: null,
    content: [
      { type: "paragraph", text: "Unlike mass spam that casts a wide net, spear-phishing is surgical. Attackers spend weeks researching target companies, vendor relationships, billing schedules, and executive traveling patterns on LinkedIn and social media." },
      { type: "case_study", title: "The $400,000 Vendor Invoice Interception", incident: "In 2020, an attacker compromised the email account of a real estate legal vendor. The attacker monitored email threads until a multimillion-dollar property closing was scheduled, then stepped into the thread from a spoofed email domain stating: 'Our bank accounts are undergoing routine audit—please route today's closing funds to this alternate wire routing number.'", impact: "$400,000 wired straight into a money mule network before anyone picked up the phone.", takeaway: "Always enforce Out-of-Band (OOB) verification: any change in banking details or urgent wire transfer must be verified via a known, pre-established phone number." },
      { type: "warning", text: "CEO Fraud red flags: 'I am currently in an executive meeting and cannot take calls. I need you to purchase 10 Apple Gift Cards for a client immediately and send me the codes.'" },
      { type: "takeaway", title: "Golden Rules for High-Stakes Requests", points: [
        "Never bypass company financial verification procedures, even if an email appears to come from the CEO.",
        "Call the sender using a phone number from your internal company directory, NOT the number listed in the email footer.",
        "Check the 'Reply-To' header: attackers often spoof the 'From' address, but route replies to an external mailbox."
      ]}
    ],
  },
  {
    id: "les-3-3",
    module_id: "mod-3",
    title: "Reverse-Proxy 2FA Bypass & Incident Reporting",
    order_index: 3,
    video_url: null,
    content: [
      { type: "paragraph", text: "Modern cybercrime tooling has evolved. Adversaries now deploy reverse-proxy phishing kits (such as Evilginx). Instead of static fake web pages, the reverse proxy sits directly between the victim and the genuine banking/cloud server, proxying real traffic in real time." },
      { type: "terminal", title: "Evilginx Reverse Proxy C2 Terminal Output", command: "evilginx2 -p corporate_sso", output: "[+] [ID: 941] Victim reached proxy: login.microsoft.security-update.live\n[+] Credentials captured: user=cfo@enterprise.com pass=Q9#xL2$mP\n[!] 2FA OTP prompt forwarded from genuine Microsoft server\n[+] Victim entered OTP 842109 -> Forwarded to genuine server\n[★] SESSION COOKIE HIJACKED: AuthToken=eyJhbGciOiJSUzI1NiIs...\n[★] Adversary logged in without needing the password again!" },
      { type: "tip", text: "How to defeat reverse proxies: Hardware Security Keys (YubiKeys) and FIDO2 Passkeys cryptographically bind the authentication token to the browser's exact domain bar. If the domain is 'security-update.live' instead of 'login.microsoftonline.com', the key refuses to authenticate!" },
      { type: "interactive_check", question: "What is the very first thing you should do if you suspect you just entered your password into a phishing site?", options: [
        { text: "Shut off your computer and wait until tomorrow morning", correct: false, explanation: "Delaying response gives attackers hours of uninterrupted access to siphon data or establish persistence." },
        { text: "Immediately change your password from another device, invalidate all active sessions, and notify your security team", correct: true, explanation: "Correct! Rapid password change and session invalidation terminates the attacker's newly captured cookie before damage occurs." },
        { text: "Reply to the phishing email asking them to delete your data", correct: false, explanation: "Criminal syndicates will not comply with deletion requests." }
      ]},
      { type: "takeaway", title: "Reporting Phishing to Protect Others", points: [
        "Use internal 'Report Phish' buttons to feed security telemetry directly into the organization's email filters.",
        "Forward phishing lures to national registries: reportphishing@apwg.org and local cybercrime helplines (1930).",
        "Practice spotting traps in our hands-on Spear-Phishing Threat Sandbox!"
      ]}
    ],
  },

  /* ── MODULE 4: Social Engineering & Pretexting ── */
  {
    id: "les-4-1",
    module_id: "mod-4",
    title: "The Psychological Playbook of Social Engineering",
    order_index: 1,
    video_url: null,
    content: [
      { type: "paragraph", text: "Social engineering is the art of manipulating people into performing actions or divulging confidential information. Rather than hacking code, social engineers hack the human subconscious by weaponizing well-documented psychological tendencies." },
      { type: "list", items: [
        "Authority: Impersonating police, legal counsel, or senior executives to demand immediate compliance.",
        "Scarcity & Urgency: 'Your account will be permanently deleted in 15 minutes unless you respond now.'",
        "Baiting: Leaving malware-infected USB sticks labeled 'Executive Bonuses 2024' in employee parking lots or lobbies.",
        "Quid Pro Quo: Pretending to be IT Support offering a 'quick network speed optimization' in exchange for your login."
      ]},
      { type: "case_study", title: "The $100 Million MGM Resorts Social Engineering Breach", incident: "In September 2023, cybercrime group Scattered Spider identified an MGM employee on LinkedIn. An operative placed a 10-minute phone call to the MGM internal IT helpdesk, impersonated the employee, and asked for a password and MFA reset.", impact: "The helpdesk granted access. The attackers deployed ransomware, crippling slot machines, hotel digital keycards, and payment terminals across Las Vegas, costing MGM over $100 million in lost revenue.", takeaway: "Identity verification must be mathematically verifiable, never based on verbal reassurance or smooth storytelling." },
      { type: "takeaway", title: "Tactical De-escalation Protocol", points: [
        "When faced with emotional pressure, take a mandatory 60-second breathing pause.",
        "Politely insist on following established verification policy: 'I am required by security policy to verify this through our ticketing portal.'",
        "Legitimate authorities will respect security protocols; scammers will escalate anger or threats."
      ]}
    ],
  },
  {
    id: "les-4-2",
    module_id: "mod-4",
    title: "Smishing, Vishing & AI Voice Cloning Scams",
    order_index: 2,
    video_url: null,
    content: [
      { type: "paragraph", text: "Attacks have expanded aggressively into mobile smartphones. Smishing (SMS phishing) and Vishing (Voice phishing) are now supercharged by modern Artificial Intelligence tools that can clone any person's voice from a 15-second audio snippet." },
      { type: "warning", text: "The 'Bank Cancellation OTP' Myth: Banks generate One-Time Passcodes for ONE reason only: to APPROVE a debit or transfer. There is no such thing in the financial system as an 'OTP to cancel a fraudulent transaction'." },
      { type: "tip", text: "Establish a Family / Team Safe-Word: In an era where AI voice clones can fake a distressed child or executive calling from an unfamiliar number, a pre-agreed secret challenge word immediately exposes impostors." },
      { type: "interactive_check", question: "You receive an urgent SMS: 'Bank Alert: $1,850 debited at Apple Store. If not you, call 1-800-FAKE-NUM immediately to cancel.' What is the correct response?", options: [
        { text: "Call the number in the text immediately to tell them it was fraud", correct: false, explanation: "Calling that number connects you straight to a fake call center operated by scammers!" },
        { text: "Do not call the number. Open your official banking app directly or call the toll-free number printed on the back of your physical card", correct: true, explanation: "Correct! The customer support number on the back of your physical debit or credit card is 100% trustworthy and tamper-proof." },
        { text: "Reply to the SMS with your debit card PIN to freeze it", correct: false, explanation: "Never text or share PINs or passwords under any circumstances." }
      ]},
      { type: "takeaway", title: "Mobile Smishing Defense Rules", points: [
        "Never tap hyperlinks in SMS messages claiming bank activity, package delivery failures, or tax rebates.",
        "Remember: SMS alphanumeric headers (like 'VK-HDFCBK') can be spoofed by international bulk SMS gateways.",
        "Forward scam SMS messages to official spam registries (1909 in India, 7726 in the US and UK)."
      ]}
    ],
  },
  {
    id: "les-4-3",
    module_id: "mod-4",
    title: "Physical Security, Tailgating & Clean Screen Hygiene",
    order_index: 3,
    video_url: null,
    content: [
      { type: "paragraph", text: "Information security extends beyond the keyboard. Physical security is the first line of defense: if an adversary gains physical access to your unlocked laptop, keycard reader, or server room, digital controls can be bypassed in seconds." },
      { type: "list", items: [
        "Tailgating / Piggybacking: An unauthorized person follows closely behind an employee entering a secure building, often carrying boxes or coffee to exploit courtesy.",
        "Shoulder Surfing: Snooping over your shoulder in coffee shops, airports, or trains to capture PINs, passcodes, or confidential customer documents.",
        "Dumpster Diving: Sifting through un-shredded corporate waste to discover passwords, client invoices, and internal organizational charts."
      ]},
      { type: "tip", text: "Win + L (Windows) or Cmd + Ctrl + Q (macOS): Lock your workstation screen EVERY SINGLE TIME you step away from your desk, even for 30 seconds." },
      { type: "takeaway", title: "Clean Desk & Physical Hygiene Habits", points: [
        "Never hold secure doors open for unbadged strangers. Direct visitors to the reception desk.",
        "Use privacy screen filters when working in public spaces or transit.",
        "Never plug unknown USB flash drives into any computer—treat found USB drives as radioactive!"
      ]}
    ],
  },

  /* ── MODULE 5: Malware & Ransomware Defense ── */
  {
    id: "les-5-1",
    module_id: "mod-5",
    title: "The Malware Spectrum: Trojans, Stealers & Exploits",
    order_index: 1,
    video_url: null,
    content: [
      { type: "paragraph", text: "Malware (Malicious Software) is an umbrella term covering code engineered to harm, exploit, or secretly control computing devices. Understanding specific malware types enables defenders to anticipate attacker objectives and recognize early symptoms." },
      { type: "list", items: [
        "Info-Stealers (e.g. RedLine, Lumma): Lightweight payloads designed to silently siphon browser-saved passwords, crypto wallets, and active session cookies within 5 seconds of execution.",
        "Remote Access Trojans (RATs): Backdoors that provide attackers full remote desktop control, webcam streaming, and microphone eavesdropping.",
        "Worms: Self-propagating malware that automatically spreads across local networks without any human interaction by exploiting unpatched network vulnerabilities.",
        "Keyloggers: Covert software that logs every keystroke—capturing passwords, emails, and private messages as you type."
      ]},
      { type: "tip", text: "The Double Extension Trap: Windows hides known file extensions by default. Attackers exploit this by naming malware 'Quarterly_Report.pdf.exe'. On an unprotected PC, this displays deceptively as 'Quarterly_Report.pdf' with a fake PDF icon!" },
      { type: "takeaway", title: "Endpoint Hardening Steps", points: [
        "Enable 'File name extensions' in Windows Explorer or macOS Finder to expose disguised .exe/.scr/.vbs files.",
        "Never download pirated software, cracks, or game keygens—over 70% contain bundled info-stealer malware.",
        "Keep your Endpoint Detection and Response (EDR) or antivirus real-time definitions updated automatically."
      ]}
    ],
  },
  {
    id: "les-5-2",
    module_id: "mod-5",
    title: "Ransomware Anatomy: Encryption, Extortion & Dark Web",
    order_index: 2,
    video_url: null,
    content: [
      { type: "paragraph", text: "Ransomware is malicious software that encrypts a victim's files using military-grade cryptographic ciphers (AES-256 and RSA-4096), demanding a cryptocurrency ransom payment in exchange for the private decryption key." },
      { type: "case_study", title: "The Colonial Pipeline Ransomware Incident", incident: "In May 2021, the DarkSide ransomware syndicate compromised Colonial Pipeline via a single inactive VPN account lacking multi-factor authentication. Attackers deployed ransomware across business systems.", impact: "Colonial halted operations of the 5,500-mile pipeline, sparking fuel shortages, airline flight cancellations, and panic buying along the US East Coast. A $4.4 million Bitcoin ransom was paid.", takeaway: "Ransomware doesn't just disrupt servers—it cripples real-world physical infrastructure and supply chains." },
      { type: "warning", text: "Double & Triple Extortion: Modern ransomware syndicates don't just lock files—they steal confidential data BEFORE encrypting it. If you refuse to pay, they threaten to publish patient records, intellectual property, or customer identities on Dark Web leak sites." },
      { type: "interactive_check", question: "Why do FBI, CISA, and cyber insurance specialists strongly advise AGAINST paying a ransomware ransom?", options: [
        { text: "Cryptocurrency is illegal to possess under international maritime law", correct: false, explanation: "Cryptocurrency regulations vary, but this is not why law enforcement advises against paying." },
        { text: "Over 40% of victims who pay never get their files back, and paying funds future criminal attacks and marks you as a recurring target", correct: true, explanation: "Correct! Criminal syndicates often fail to provide functional keys, demand secondary payments, or hit the same victim again within months." },
        { text: "Ransomware encryption naturally dissolves on its own after 72 hours", correct: false, explanation: "Modern AES-256 encryption is mathematically unbreakable without the private key; it never expires on its own." }
      ]},
      { type: "takeaway", title: "Neutralizing Ransomware Extortion", points: [
        "Immutable, offline backups completely eliminate the attacker's leverage—you can simply wipe and restore.",
        "Restrict administrative privileges: standard user accounts cannot silently disable security services or shadow copies.",
        "Experience an active ransomware attack and containment drill in our hands-on Threat Sandbox!"
      ]}
    ],
  },
  {
    id: "les-5-3",
    module_id: "mod-5",
    title: "Emergency Incident Containment & The 3-2-1 Backup Strategy",
    order_index: 3,
    video_url: null,
    content: [
      { type: "paragraph", text: "When an active infection is discovered, seconds matter. Immediate, aggressive containment prevents malware from spreading across the local subnet to shared network drives, domain controllers, and backup servers." },
      { type: "terminal", title: "First-Responder Emergency Containment Protocol", command: "netsh interface set interface 'Ethernet' admin=disable", output: "[!] EMERGENCY NETWORK SEVERANCE INITIATED\n[✓] Network adapter disconnected: 0 packets routed\n[✓] Lateral worm propagation halted\n[!] ACTION: Do NOT power off machine! Memory (RAM) contains cryptographic decryption keys and forensic evidence!" },
      { type: "tip", text: "Keep the power ON: Powering down an infected computer purges RAM, destroying memory artifacts that security incident responders need to extract encryption keys or determine patient zero." },
      { type: "takeaway", title: "The Industry-Standard 3-2-1 Backup Rule", points: [
        "3 Total Copies: Maintain at least three copies of all essential business and personal data.",
        "2 Different Media Types: Store copies across two different storage formats (e.g. local NVMe drive + cloud storage).",
        "1 Offline / Air-Gapped Copy: Keep at least ONE copy completely physically disconnected from all networks and electricity (an external hard drive in a safe)."
      ]}
    ],
  },

  /* ── MODULE 6: Network Security & Safe Browsing ── */
  {
    id: "les-6-1",
    module_id: "mod-6",
    title: "Public Wi-Fi Dangers: Evil Twins & Packet Sniffing",
    order_index: 1,
    video_url: null,
    content: [
      { type: "paragraph", text: "Open, unencrypted Wi-Fi networks in cafés, airports, and hotels broadcast digital signals through open air. Any device within radio range can use basic packet capture software (like Wireshark) to inspect unencrypted network traffic." },
      { type: "case_study", title: "The 'Evil Twin' Rogue Access Point", incident: "An attacker sits in a coffee shop with a $30 portable Wi-Fi Pineapple device broadcasting an SSID named 'Cafe_Free_WiFi'. The attacker jams the real café Wi-Fi signal, causing patron smartphones and laptops to automatically connect to the attacker's rogue hotspot instead.", impact: "All victim internet traffic flows directly through the attacker's computer, enabling DNS spoofing, credential theft, and payment interception.", takeaway: "Turn off 'Auto-Connect to Open Wi-Fi' on all mobile devices and laptops." },
      { type: "warning", text: "Never conduct sensitive financial banking transactions or access privileged corporate portals over untrusted public Wi-Fi without a verified VPN tunnel." },
      { type: "takeaway", title: "Public Wi-Fi Golden Rules", points: [
        "Verify the exact network name and password with staff before connecting.",
        "Disable file sharing, AirDrop, and network discovery while connected to public networks.",
        "Prefer using your smartphone's personal 4G/5G mobile hotspot over untrusted public Wi-Fi."
      ]}
    ],
  },
  {
    id: "les-6-2",
    module_id: "mod-6",
    title: "HTTPS, SSL/TLS Certificates & MITM Interception",
    order_index: 2,
    video_url: null,
    content: [
      { type: "paragraph", text: "HTTPS (Hypertext Transfer Protocol Secure) encrypts communication between your web browser and the server using Transport Layer Security (TLS). This ensures that third parties eavesdropping on the network see only garbled cipher-text." },
      { type: "terminal", title: "Browser Security Warning Breakdown", command: "curl -v https://mybank.com --cacert rogue_ca.crt", output: "* SSL certificate problem: self-signed certificate in certificate chain\n* ALERT: The certificate presented by this server was NOT issued by a trusted Certificate Authority!\n* CRITICAL: An attacker between you and the server is likely intercepting your connection!" },
      { type: "warning", text: "NEVER click 'Proceed Anyway' or 'Accept Risk and Continue' on public Wi-Fi! That terrifying red browser warning is your computer telling you someone is attempting a Man-in-the-Middle (MITM) interception." },
      { type: "interactive_check", question: "You connect to hotel Wi-Fi and open your banking app. Your browser displays: 'Your connection is not private. NET::ERR_CERT_AUTHORITY_INVALID'. What is happening?", options: [
        { text: "The bank's multi-billion dollar IT infrastructure forgot to renew their certificate this morning", correct: false, explanation: "Large financial institutions use automated enterprise certificate lifecycle management; certificate expiration on banking domains is extraordinarily rare." },
        { text: "Someone on the hotel network or a rogue router is attempting a Man-in-the-Middle (MITM) attack to inspect your traffic", correct: true, explanation: "Correct! A rogue router or proxy is presenting a forged certificate to decrypt your banking traffic. Disconnect immediately!" },
        { text: "Your laptop screen resolution is set too low to render the website", correct: false, explanation: "Display resolution has nothing to do with cryptographic TLS certificate validation." }
      ]},
      { type: "takeaway", title: "Encryption Sanity Checks", points: [
        "Look for 'https://' and the padlock icon in the browser address bar.",
        "Enable 'HTTPS-Only Mode' in Chrome, Firefox, or Safari settings to block accidental unencrypted connections.",
        "Experience live packet tampering in our Rogue Wi-Fi & MITM Threat Sandbox!"
      ]}
    ],
  },
  {
    id: "les-6-3",
    module_id: "mod-6",
    title: "Safe Browsing Habits, VPNs & Home Network Hardening",
    order_index: 3,
    video_url: null,
    content: [
      { type: "paragraph", text: "A Virtual Private Network (VPN) encrypts all data leaving your device and routes it through a secure tunnel to a remote VPN server. Even if an attacker controls the local Wi-Fi router, they see only indecipherable encrypted wire packets." },
      { type: "tip", text: "DNS Filtering Defense: Configure your home router or personal devices to use security-hardened DNS resolvers like Quad9 (9.9.9.9) or Cloudflare for Families (1.1.1.2). These resolvers automatically block connections to known malware and phishing domains before they even load." },
      { type: "takeaway", title: "Home Router Hardening Checklist", points: [
        "Change default router admin credentials (never leave username 'admin' and password 'admin').",
        "Disable WPS (Wi-Fi Protected Setup) and remote web management features in router settings.",
        "Segment IoT devices (smart TVs, cameras, bulbs) onto an isolated 'Guest' Wi-Fi network so a compromised gadget cannot access your work laptops."
      ]}
    ],
  },
];

const DEFAULT_QUIZZES: Quiz[] = [
  {
    id: "quiz-1",
    module_id: "mod-1",
    title: "Cybersecurity Fundamentals Knowledge Check",
    category: "Fundamentals",
    difficulty: "beginner",
    time_limit_seconds: 300,
    is_published: true,
  },
  {
    id: "quiz-2",
    module_id: "mod-3",
    title: "Phishing & Spear-Phishing Detection Quiz",
    category: "Social Engineering",
    difficulty: "beginner",
    time_limit_seconds: 300,
    is_published: true,
  },
  {
    id: "quiz-3",
    module_id: "mod-2",
    title: "Password & Account Security Mastery Quiz",
    category: "Authentication",
    difficulty: "beginner",
    time_limit_seconds: 300,
    is_published: true,
  },
  {
    id: "quiz-4",
    module_id: "mod-4",
    title: "Social Engineering & Pretexting Defense Quiz",
    category: "Social Engineering",
    difficulty: "intermediate",
    time_limit_seconds: 300,
    is_published: true,
  },
  {
    id: "quiz-5",
    module_id: "mod-5",
    title: "Malware & Ransomware Containment Quiz",
    category: "Threats",
    difficulty: "intermediate",
    time_limit_seconds: 300,
    is_published: true,
  },
  {
    id: "quiz-6",
    module_id: "mod-6",
    title: "Network Security & Safe Browsing Quiz",
    category: "Network",
    difficulty: "intermediate",
    time_limit_seconds: 300,
    is_published: true,
  },
];

const DEFAULT_QUESTIONS: QuestionData[] = [
  /* ── Quiz 1: Fundamentals (mod-1) ── */
  {
    id: "q-1-1",
    quiz_id: "quiz-1",
    question: "What does the 'I' in the foundational CIA Triad stand for?",
    option_a: "Identity",
    option_b: "Integrity",
    option_c: "Isolation",
    option_d: "Insurance",
    correct_answer: "b",
    explanation: "Integrity ensures data has not been modified, altered, or corrupted by unauthorized actors during storage or transmission.",
    points: 10,
    order_index: 1,
  },
  {
    id: "q-1-2",
    quiz_id: "quiz-1",
    question: "Which of the following is considered the primary initial entry vector in over 80% of modern organizational security breaches?",
    option_a: "Cracking hardware firewalls with supercomputers",
    option_b: "Fiber optic cable physical tapping",
    option_c: "Human deception, phishing, and credential compromise",
    option_d: "Zero-day BIOS firmware exploits",
    correct_answer: "c",
    explanation: "Over 82% of breaches exploit human trust through phishing, credential reuse, or pretexting rather than complex software zero-days.",
    points: 10,
    order_index: 2,
  },
  {
    id: "q-1-3",
    quiz_id: "quiz-1",
    question: "A company's online store is hit by a massive DDoS flood, preventing customers from purchasing items. Which CIA Triad pillar is compromised?",
    option_a: "Availability",
    option_b: "Confidentiality",
    option_c: "Integrity",
    option_d: "Authentication",
    correct_answer: "a",
    explanation: "Availability ensures systems, networks, and services are accessible when legitimate users need them. DDoS attacks specifically attack Availability.",
    points: 10,
    order_index: 3,
  },
  {
    id: "q-1-4",
    quiz_id: "quiz-1",
    question: "What does adopting a 'Zero Trust' security model mean in daily practice?",
    option_a: "Never trusting antivirus software to scan your computer",
    option_b: "Verifying every identity, device, and access request explicitly, even inside the internal office network",
    option_c: "Disconnecting your computer from the internet permanently",
    option_d: "Changing your password every 30 minutes",
    correct_answer: "b",
    explanation: "Zero Trust operates on the principle of 'never trust, always verify', requiring strict identity and device checks for every transaction.",
    points: 10,
    order_index: 4,
  },

  /* ── Quiz 2: Phishing (mod-3) ── */
  {
    id: "q-2-1",
    quiz_id: "quiz-2",
    question: "You receive an email from 'billing@netflix-support-update.com' claiming your subscription is suspended. What is the safest action?",
    option_a: "Click the verification link immediately to avoid losing access",
    option_b: "Reply to the email with your credit card CVV code",
    option_c: "Do not click; open your browser and navigate directly to netflix.com to verify account status",
    option_d: "Forward the email to all your coworkers",
    correct_answer: "c",
    explanation: "Never follow email links for sensitive account verification. Always navigate directly to the trusted service yourself.",
    points: 10,
    order_index: 1,
  },
  {
    id: "q-2-2",
    quiz_id: "quiz-2",
    question: "How can you safely verify where a hyperlink in an email actually leads without clicking it?",
    option_a: "Double-click the link quickly",
    option_b: "Hover your mouse cursor over the link to preview the true destination URL in the status bar",
    option_c: "Click the link in an incognito window",
    option_d: "Print the email out on physical paper",
    correct_answer: "b",
    explanation: "Hovering your cursor reveals the real destination URL in the bottom status bar before any network request is made.",
    points: 10,
    order_index: 2,
  },
  {
    id: "q-2-3",
    quiz_id: "quiz-2",
    question: "Which domain is genuinely owned by Microsoft Corporation?",
    option_a: "login.microsoft.com.account-update.net",
    option_b: "microsoft-support-team.com",
    option_c: "portal.azure.microsoft.com",
    option_d: "verify-identity-microsoft.co",
    correct_answer: "c",
    explanation: "In 'portal.azure.microsoft.com', 'microsoft.com' is the primary registered domain. In option A, the true owner is 'account-update.net'.",
    points: 10,
    order_index: 3,
  },
  {
    id: "q-2-4",
    quiz_id: "quiz-2",
    question: "What makes modern Reverse-Proxy Phishing tools (like Evilginx) particularly dangerous compared to traditional phishing?",
    option_a: "They can automatically guess your physical home address",
    option_b: "They capture your real-time 2FA OTP code and session cookie as you log into the genuine service",
    option_c: "They format your computer hard drive upon visiting the website",
    option_d: "They only work on Linux workstations",
    correct_answer: "b",
    explanation: "Reverse proxies sit between the victim and the legitimate service, relaying prompts and capturing authenticated session cookies in real time.",
    points: 10,
    order_index: 4,
  },

  /* ── Quiz 3: Passwords & Authentication (mod-2) ── */
  {
    id: "q-3-1",
    quiz_id: "quiz-3",
    question: "Why is a 16-character passphrase like 'crimson-falcon-coffee-orbit' vastly safer than an 8-character password like 'P@ssw0rd'?",
    option_a: "Passphrases are mathematically encrypted by the keyboard driver",
    option_b: "Password cracking complexity grows exponentially with character length, making 16 characters take centuries to brute-force",
    option_c: "Hackers cannot read hyphens on Windows computers",
    option_d: "Dictionary attack tools cannot search for four words in sequence",
    correct_answer: "b",
    explanation: "Length exponentially increases entropy. While 8 characters can be exhausted in seconds by modern GPU rigs, 16+ characters take millions of years.",
    points: 10,
    order_index: 1,
  },
  {
    id: "q-3-2",
    quiz_id: "quiz-3",
    question: "What is an 'MFA Fatigue' attack?",
    option_a: "When a user forgets their password after typing it too many times",
    option_b: "When an attacker bombards a victim with continuous 2FA push notifications until they approve out of exhaustion or distraction",
    option_c: "When an authentication server crashes due to high CPU usage",
    option_d: "When an authenticator app battery runs out on your smartphone",
    correct_answer: "b",
    explanation: "In MFA Fatigue attacks, attackers spam push approvals at odd hours (like 2 AM) hoping the frustrated victim taps 'Approve' to silence notifications.",
    points: 10,
    order_index: 2,
  },
  {
    id: "q-3-3",
    quiz_id: "quiz-3",
    question: "Which form of Two-Factor Authentication is mathematically immune to phishing and reverse-proxy credential interception?",
    option_a: "SMS text message OTP",
    option_b: "Security questions (e.g. mother's maiden name)",
    option_c: "Hardware Security Keys (FIDO2 / WebAuthn / YubiKey)",
    option_d: "Email verification links",
    correct_answer: "c",
    explanation: "FIDO2 security keys cryptographically bind the authentication token to the browser's exact domain URL, completely preventing proxy relay.",
    points: 10,
    order_index: 3,
  },
  {
    id: "q-3-4",
    quiz_id: "quiz-3",
    question: "How does a zero-knowledge password manager protect your saved credentials if their cloud servers are compromised?",
    option_a: "The company pays hackers an insurance bounty not to leak data",
    option_b: "The master encryption key is derived locally on your device and never sent to or stored on the server",
    option_c: "The passwords are saved as screenshots instead of text",
    option_d: "They only store passwords for free websites, not banking logins",
    correct_answer: "b",
    explanation: "Zero-knowledge architecture means the provider only stores encrypted ciphertext blobs. Without your master key, the data cannot be decrypted.",
    points: 10,
    order_index: 4,
  },

  /* ── Quiz 4: Social Engineering (mod-4) ── */
  {
    id: "q-4-1",
    quiz_id: "quiz-4",
    question: "An urgent caller claiming to be from 'Executive IT Support' demands your password to 'remove malware before your laptop is wiped'. Which psychological levers are they weaponizing?",
    option_a: "Authority and Manufactured Panic/Urgency",
    option_b: "Sympathy and Boredom",
    option_c: "Reciprocity and Flattery",
    option_d: "Social Proof and Humor",
    correct_answer: "a",
    explanation: "Attackers combine authority ('Executive IT') with immediate fear/urgency ('before your laptop is wiped') to suppress critical thinking.",
    points: 10,
    order_index: 1,
  },
  {
    id: "q-4-2",
    quiz_id: "quiz-4",
    question: "What is 'Tailgating' (or piggybacking) in physical cybersecurity?",
    option_a: "Following an employee's car home from work",
    option_b: "An unauthorized person following closely behind an authorized employee through a secure keycard door",
    option_c: "Scanning public Wi-Fi networks in a parking lot",
    option_d: "Leaving flash drives on employee desks overnight",
    correct_answer: "b",
    explanation: "Tailgating exploits social courtesy—holding a door open for someone holding boxes or coffee—to enter restricted facilities without badging.",
    points: 10,
    order_index: 2,
  },
  {
    id: "q-4-3",
    quiz_id: "quiz-4",
    question: "What is the most effective organizational defense against executive impersonation wire fraud (CEO Fraud)?",
    option_a: "Requiring the CEO to send all wire requests via WhatsApp voice notes",
    option_b: "A mandatory Out-of-Band (OOB) secondary verification policy via a pre-established phone number or in-person check",
    option_c: "Only doing business with suppliers that accept gift card payments",
    option_d: "Deleting the CEO's LinkedIn profile",
    correct_answer: "b",
    explanation: "Out-of-band verification ensures high-value or unusual requests are verified through a trusted channel separate from the email thread.",
    points: 10,
    order_index: 3,
  },
  {
    id: "q-4-4",
    quiz_id: "quiz-4",
    question: "You find an unmarked USB flash drive labeled 'Q4 Executive Salary Audit' on the floor of the breakroom. What should you do?",
    option_a: "Plug it into your workstation immediately to check who owns it",
    option_b: "Plug it into a colleague's laptop instead of your own",
    option_c: "Hand it directly to your Security Operations / IT department without plugging it into any computer",
    option_d: "Format the drive and use it for your personal photo backups",
    correct_answer: "c",
    explanation: "This is a classic 'Baiting' attack. Plugging in an unknown USB drive can execute keystroke injection (BadUSB) or drop ransomware in milliseconds.",
    points: 10,
    order_index: 4,
  },

  /* ── Quiz 5: Malware & Ransomware (mod-5) ── */
  {
    id: "q-5-1",
    quiz_id: "quiz-5",
    question: "A downloaded email attachment is named 'Invoice_March.pdf.exe'. What type of threat is this?",
    option_a: "A valid PDF document formatted for Windows",
    option_b: "A lethal executable program disguised with a double-extension and fake icon",
    option_c: "A damaged printer driver file",
    option_d: "An encrypted spreadsheet requiring an activation key",
    correct_answer: "b",
    explanation: "Windows treats the final extension (.exe) as the executable format. Attackers append .pdf to deceive users into believing it is a harmless document.",
    points: 10,
    order_index: 1,
  },
  {
    id: "q-5-2",
    quiz_id: "quiz-5",
    question: "You notice files on your desktop suddenly changing names to '.DARKVAULT_LOCKED' and a ransom note appears. What is step 1?",
    option_a: "Pay the Bitcoin ransom immediately with your personal credit card",
    option_b: "Immediately sever all network connections (unplug Ethernet, turn off Wi-Fi) to stop lateral encryption",
    option_c: "Power off the computer and throw it in the trash",
    option_d: "Email all your contacts warning them not to open your emails",
    correct_answer: "b",
    explanation: "Immediate network isolation (air-gapping) stops the ransomware from communicating with its C2 server and prevents lateral spread across network shares.",
    points: 10,
    order_index: 2,
  },
  {
    id: "q-5-3",
    quiz_id: "quiz-5",
    question: "What does the industry-standard '3-2-1' backup strategy require?",
    option_a: "3 passwords, 2 security questions, 1 biometric scan",
    option_b: "3 total copies of data, across 2 different storage media types, with 1 copy kept completely offline and air-gapped",
    option_c: "Backing up your computer 3 times every 2 weeks for 1 month",
    option_d: "Saving files to 3 different folders on your local hard drive",
    correct_answer: "b",
    explanation: "The 3-2-1 rule guarantees that even if ransomware encrypts your local drive and cloud-synced folder, an offline air-gapped copy survives intact.",
    points: 10,
    order_index: 3,
  },
  {
    id: "q-5-4",
    quiz_id: "quiz-5",
    question: "Why is an 'Info-Stealer' trojan (like RedLine or Lumma) particularly insidious compared to ransomware?",
    option_a: "It produces loud siren sounds from your computer speakers",
    option_b: "It silently steals all saved browser passwords, session cookies, and crypto keys without alerting the victim",
    option_c: "It physically destroys your computer's cooling fan",
    option_d: "It only infects computers on weekends",
    correct_answer: "b",
    explanation: "Info-stealers operate invisibly. Victims often have no idea their credentials have been stolen until their bank or email accounts are hijacked weeks later.",
    points: 10,
    order_index: 4,
  },

  /* ── Quiz 6: Network Security & Safe Browsing (mod-6) ── */
  {
    id: "q-6-1",
    quiz_id: "quiz-6",
    question: "What is an 'Evil Twin' Wi-Fi access point?",
    option_a: "A cloned rogue Wi-Fi hotspot set up by an attacker with the exact same name as a trusted public network (e.g. 'Airport_Free_WiFi')",
    option_b: "A computer with two network cards installed",
    option_c: "A virus that infects your home router's power cable",
    option_d: "A dual-band router operating on both 2.4GHz and 5GHz",
    correct_answer: "a",
    explanation: "An Evil Twin mimics a legitimate hotspot. When victims connect, all their internet traffic flows through the attacker's interception equipment.",
    points: 10,
    order_index: 1,
  },
  {
    id: "q-6-2",
    quiz_id: "quiz-6",
    question: "While connected to café Wi-Fi, your browser displays: 'Warning: Potential Security Risk Ahead. The certificate is not trusted.' What should you do?",
    option_a: "Click 'Advanced' -> 'Accept the Risk and Continue'",
    option_b: "Immediately close the tab and disconnect from the Wi-Fi network; an attacker is likely attempting a Man-in-the-Middle (MITM) interception",
    option_c: "Disable your firewall and refresh the page",
    option_d: "Switch your browser to Incognito mode to bypass encryption",
    correct_answer: "b",
    explanation: "Certificate warnings on public networks indicate the cryptographic handshake was intercepted by an untrusted entity. Never bypass certificate warnings!",
    points: 10,
    order_index: 2,
  },
  {
    id: "q-6-3",
    quiz_id: "quiz-6",
    question: "How does a Virtual Private Network (VPN) protect your connection on public Wi-Fi?",
    option_a: "It increases your internet download speed by 500%",
    option_b: "It encrypts all network packets leaving your computer, creating an impenetrable tunnel that local network snoops cannot inspect",
    option_c: "It automatically uninstalls all viruses from your device",
    option_d: "It prevents your physical laptop screen from being viewed by bystanders",
    correct_answer: "b",
    explanation: "A VPN encrypts all inbound and outbound traffic, rendering intercepted data completely unreadable to attackers on the same local Wi-Fi.",
    points: 10,
    order_index: 3,
  },
  {
    id: "q-6-4",
    quiz_id: "quiz-6",
    question: "Which of the following router security configurations offers the strongest protection for your home wireless network?",
    option_a: "Leaving the network open with no password for easier connectivity",
    option_b: "WPA3 encryption, unique non-default admin password, disabled WPS, and isolated IoT guest network",
    option_c: "WEP 64-bit encryption with default admin password 'admin'",
    option_d: "Hiding your SSID name while leaving WPS enabled",
    correct_answer: "b",
    explanation: "Modern WPA3 encryption, strong non-default credentials, disabled WPS (which has known PIN exploits), and IoT isolation deliver robust defense.",
    points: 10,
    order_index: 4,
  },
];

const DEFAULT_SIMULATIONS: Simulation[] = [
  {
    id: "sim-1",
    title: "The Midnight Alert: Anatomy of a Phishing Trap",
    slug: "phishing-email",
    category: "phishing",
    description: "Experience a high-stakes spear-phishing attack. Watch side-by-side as an attacker uses a cloned portal to capture credentials, bypass 2FA, and hijack accounts in real time.",
    scenario: "It's Friday 4:52 PM. An urgent email warns your account will be suspended in 2 hours unless you verify immediately.",
    difficulty: "beginner",
    duration_minutes: 6,
    learning_objective: "Identify artificial urgency, dissect deceptive lookalike URLs, recognize real-time 2FA bypass traps, and report phishing attacks.",
    is_published: true,
  },
  {
    id: "sim-2",
    title: "The Double-Click Disaster: Anatomy of a Ransomware Attack",
    slug: "ransomware-response",
    category: "ransomware",
    description: "Experience the terrifying moment files begin locking on an infected computer. Watch the dark web extortion countdown, air-gap the machine, and recover with the 3-2-1 backup strategy.",
    scenario: "A disguised invoice (.pdf.exe) is executed. Files begin renaming to .DARKVAULT_LOCKED and a $48,500 Bitcoin ransom is demanded.",
    difficulty: "intermediate",
    duration_minutes: 7,
    learning_objective: "Identify double-extension malware traps, execute emergency network air-gapping, understand why paying ransoms fails, and master offline immutable backups.",
    is_published: true,
  },
  {
    id: "sim-3",
    title: "The Panic at 9:15 PM: Anatomy of a Bank Smishing Scam",
    slug: "social-engineering-call",
    category: "social_engineering",
    description: "Experience a hyper-realistic fake bank debit SMS alert. Watch side-by-side as cybercriminals clone bank portals, steal NetBanking credentials, and manipulate victims into giving up 'cancellation' OTPs.",
    scenario: "At 9:15 PM, an urgent SMS arrives: '₹48,999 debited from your A/C. If not done by you, visit hdfc-fraud-cancel.net immediately.'",
    difficulty: "beginner",
    duration_minutes: 6,
    learning_objective: "Recognize spoofed SMS sender headers, fake cancellation URLs, live OTP harvesting tricks, and verify transactions via card-back helplines.",
    is_published: true,
  },
  {
    id: "sim-4",
    title: "Rogue Wi-Fi & MITM Payment Interception",
    slug: "mitm-attack",
    category: "wifi",
    description: "You're at a café paying ₹1,499 over public Wi-Fi. Experience a live simulated interception where an attacker alters the payment amount to ₹9,499 in real time.",
    scenario: "Connected to 'Cafe_Free_WiFi', an attacker intercepts and alters a transaction from ₹1,499 to ₹9,499.",
    difficulty: "beginner",
    duration_minutes: 6,
    learning_objective: "Recognize rogue Wi-Fi hotspots, spot unverified SSL certificate warnings, and block Man-in-the-Middle (MITM) attacks.",
    is_published: true,
  },
  {
    id: "sim-5",
    title: "The Reverse Refund: UPI Collect Request Scam",
    slug: "upi-collect",
    category: "social_engineering",
    description: "An online buyer claims to send you money for an item, but sends a UPI Collect Request instead. Watch as scammers manipulate victims into entering their secret UPI PIN.",
    scenario: "A buyer on OLX insists on paying ₹4,500 immediately. You receive a notification saying 'Collect Request from Priya Traders'.",
    difficulty: "beginner",
    duration_minutes: 5,
    learning_objective: "Understand that receiving money never requires entering a UPI PIN, detect collect request traps, and immediately reject fraudulent VPA demands.",
    is_published: true,
  },
  {
    id: "sim-6",
    title: "Quishing: Weaponized Parking Meter QR Phishing",
    slug: "quishing",
    category: "phishing",
    description: "A deceptive paper QR sticker is pasted over a municipal parking meter. Experience how attackers harvest credit cards through reverse-proxy credential traps.",
    scenario: "You park downtown and scan a QR code on the meter. The URL points to a lookalike .top site asking for payment card details.",
    difficulty: "intermediate",
    duration_minutes: 6,
    learning_objective: "Inspect public QR codes for physical sticker tampering, check URL domains in camera previews, and report quishing to authorities.",
    is_published: true,
  },
];

const DEFAULT_SIMULATION_STEPS: SimulationStepData[] = [
  {
    id: "step-1-1",
    simulation_id: "sim-1",
    order_index: 1,
    prompt: "An incoming email reads from 'support@m1crosoft-auth-verify.com'. The message demands immediate password reset within 2 hours or your account will be disabled. What is your immediate analysis?",
    options: [
      { id: "a", label: "Legitimate notification from Microsoft", correct: false },
      { id: "b", label: "Phishing attempt using lookalike domain and artificial urgency", correct: true },
      { id: "c", label: "Spam advertisement without security impact", correct: false },
    ],
    explanation: "Notice the digit '1' replacing letter 'l' in 'm1crosoft'. Threat actors frequently register lookalike domains to bypass casual inspection.",
  },
  {
    id: "step-1-2",
    simulation_id: "sim-1",
    order_index: 2,
    prompt: "Hovering over the 'Reset Password Now' button reveals the link points to 'http://token-harvest.ru/login'. What action should you take?",
    options: [
      { id: "a", label: "Open in Incognito Mode to inspect safely", correct: false },
      { id: "b", label: "Click 'Report Phishing to SOC' and avoid interacting with links", correct: true },
      { id: "c", label: "Reply telling the sender you noticed their trick", correct: false },
    ],
    explanation: "Never open phishing links even in private tabs. Reporting directly alerts enterprise security controls to block the domain globally.",
  },
];

const DEFAULT_ASSESSMENT = {
  id: "assessment-default",
  title: "Cybersecurity Awareness Assessment",
  description: "A comprehensive evaluation covering passwords, phishing vectors, social engineering, malware triage, and wireless security.",
};

const DEFAULT_ASSESSMENT_QUESTIONS: AssessmentQuestionData[] = [
  /* ── DOMAIN 1: Passwords & Authentication ── */
  {
    id: "aq-1",
    assessment_id: "assessment-default",
    topic: "Passwords & Identity",
    question: "Which of the following passphrases provides the strongest mathematical entropy and resilience against modern GPU-accelerated hash cracking rigs?",
    option_a: "Password2026!#",
    option_b: "glacier-harbor-titan-42#",
    option_c: "P@$$w0rd",
    option_d: "1234567890Aa!",
    correct_answer: "b",
    explanation: "Passphrase length exponentially increases entropy. While complex 8-character passwords can be cracked in seconds by GPU rigs, a 24-character 4-word passphrase takes billions of years to exhaust.",
    order_index: 1,
  },
  {
    id: "aq-2",
    assessment_id: "assessment-default",
    topic: "Passwords & Identity",
    question: "You wake up at 2:15 AM to 30 consecutive 2FA push notifications on your phone, followed by an urgent message from 'IT Support' asking you to 'approve the prompt to stop the notification loop'. What is happening?",
    option_a: "The company's authentication server has a routine glitch; approve the prompt to silence it",
    option_b: "An active 'MFA Fatigue' attack: an adversary has your password and is trying to coerce an approval. Deny the request, report to security, and immediately change your password",
    option_c: "Your smartphone's internal clock is out of sync with GMT",
    option_d: "The IT department is upgrading the corporate VPN gateway",
    correct_answer: "b",
    explanation: "This is a classic MFA Fatigue (Push Bombing) attack. Adversaries spam push approvals hoping an exhausted user taps 'Approve'. Never approve unexpected prompts!",
    order_index: 2,
  },

  /* ── DOMAIN 2: Email Security & Phishing ── */
  {
    id: "aq-3",
    assessment_id: "assessment-default",
    topic: "Email & Spear-Phishing",
    question: "An urgent email alerts you that your company account will be terminated in 2 hours and links to: 'https://login.microsoft.com.account-verification-portal.co/auth'. Who owns this destination domain?",
    option_a: "Microsoft Corporation, because 'login.microsoft.com' appears at the beginning",
    option_b: "account-verification-portal.co, an external attacker-controlled domain using 'login.microsoft.com' as a deceptive subdomain",
    option_c: "The Internet Corporation for Assigned Names and Numbers (ICANN)",
    option_d: "Your internal corporate IT department",
    correct_answer: "b",
    explanation: "The true registered domain is always the text immediately preceding the path slash (account-verification-portal.co). Attackers prepend trusted brand names as subdomains to trick inattentive users.",
    order_index: 3,
  },
  {
    id: "aq-4",
    assessment_id: "assessment-default",
    topic: "Email & Spear-Phishing",
    question: "You receive an email appearing to come from your CEO stating: 'I am in confidential client meetings and cannot take calls. Please immediately wire $120,000 to this new partner account.' What is the required protocol?",
    option_a: "Wire the funds immediately because insubordination could result in termination",
    option_b: "Perform an Out-of-Band (OOB) secondary verification using a known, pre-established internal phone number or in-person confirmation before any funds move",
    option_c: "Reply to the email asking the CEO to provide a photo of their driver's license",
    option_d: "Forward the email to the new partner directly",
    correct_answer: "b",
    explanation: "This is Business Email Compromise (CEO Fraud). Standard protocol requires secondary Out-of-Band verification through a trusted channel separate from the email thread.",
    order_index: 4,
  },

  /* ── DOMAIN 3: Social Engineering & Mobile Smishing ── */
  {
    id: "aq-5",
    assessment_id: "assessment-default",
    topic: "Social Engineering & Smishing",
    question: "An SMS from header 'VK-HDFCBK' states: 'Rs 48,999 debited at Apple Store. If not you, visit hdfc-cancel-fraud.net immediately.' On the page, it prompts for an OTP 'to cancel this unauthorized debit'. What is the critical truth?",
    option_a: "Entering the OTP immediately reverses the debit back into your account balance",
    option_b: "Banks NEVER generate OTPs to cancel charges; OTPs are cryptographically generated exclusively to APPROVE debits or wire transfers. Entering it finalizes the scammer's theft",
    option_c: "You should reply to the SMS with your debit card PIN to lock it",
    option_d: "The SMS is genuine because the alphanumeric header displays the bank name",
    correct_answer: "b",
    explanation: "There is no such mechanism as a 'cancellation OTP'. Criminals clone bank portals, initiate a transfer in the background, and label the genuine bank debit OTP as 'cancellation' to trick victims.",
    order_index: 5,
  },
  {
    id: "aq-6",
    assessment_id: "assessment-default",
    topic: "Social Engineering & Smishing",
    question: "In your corporate office breakroom, you spot an unmarked metallic USB drive labeled 'Executive Compensation & 2026 Layoff List'. What should you do?",
    option_a: "Plug it into your laptop to inspect the file properties and identify the owner",
    option_b: "Deliver it directly to the Security Operations Center or IT Security team without inserting it into any computer",
    option_c: "Insert it into a colleague's desktop to avoid infecting your own workstation",
    option_d: "Format the drive using Windows Disk Management and use it as personal storage",
    correct_answer: "b",
    explanation: "This is a classic 'Baiting' social engineering attack. Unknown USB drives can execute automated keystroke injection (BadUSB/Rubber Ducky) or drop ransomware in milliseconds upon connection.",
    order_index: 6,
  },

  /* ── DOMAIN 4: Malware & Ransomware ── */
  {
    id: "aq-7",
    assessment_id: "assessment-default",
    topic: "Malware & Ransomware",
    question: "You receive an email with an attachment named 'Quarterly_Sales_Report.pdf.exe' showing an Adobe Acrobat PDF icon. What danger does this represent?",
    option_a: "A standard PDF document optimized for Microsoft Windows execution",
    option_b: "A malicious executable payload disguised by taking advantage of Windows' default hidden file extension setting",
    option_c: "A corrupted printer driver file that will fail to open",
    option_d: "An encrypted Adobe file that requires a password from IT",
    correct_answer: "b",
    explanation: "Operating systems execute the final file extension (.exe). Attackers disguise executables by appending .pdf before .exe and embedding a fake PDF icon so users believe it is a harmless document.",
    order_index: 7,
  },
  {
    id: "aq-8",
    assessment_id: "assessment-default",
    topic: "Malware & Ransomware",
    question: "Files across your desktop suddenly begin renaming to '.DARKVAULT_LOCKED' and a ransom countdown window appears. What is your immediate First Responder step?",
    option_a: "Pay the Bitcoin ransom immediately with your personal credit card",
    option_b: "Immediately sever all network interfaces (unplug physical Ethernet, toggle off Wi-Fi) to halt lateral worm spread, keep power ON, and notify Security",
    option_c: "Power off the computer and unplug the power cable immediately",
    option_d: "Open Google Drive and upload all your files to save them",
    correct_answer: "b",
    explanation: "Immediate network isolation prevents ransomware from encrypting shared network drives or contacting C2 servers. Keeping power on preserves vital cryptographic keys stored in volatile RAM.",
    order_index: 8,
  },

  /* ── DOMAIN 5: Network Security & Public Wi-Fi ── */
  {
    id: "aq-9",
    assessment_id: "assessment-default",
    topic: "Network & Wi-Fi Security",
    question: "While sitting in an airport café, you see an open Wi-Fi network called 'Airport_Free_WiFi_HighSpeed' with no password. What risk does this present?",
    option_a: "Your battery will drain 50% faster due to high-speed frequencies",
    option_b: "Anyone within radio range can operate a rogue 'Evil Twin' access point to sniff unencrypted traffic, inject malicious DNS records, or intercept credentials",
    option_c: "Open Wi-Fi automatically deletes your saved desktop bookmarks",
    option_d: "There is zero risk because all modern smartphones have built-in antivirus",
    correct_answer: "b",
    explanation: "Rogue access points broadcast identical network names to intercept victim traffic. Attackers inspect unencrypted packets, redirect users to phishing sites, or attempt MITM attacks.",
    order_index: 9,
  },
  {
    id: "aq-10",
    assessment_id: "assessment-default",
    topic: "Network & Wi-Fi Security",
    question: "You connect to hotel Wi-Fi and open your banking portal. Your browser halts with a red screen: 'Your connection is not private. NET::ERR_CERT_AUTHORITY_INVALID'. What should you do?",
    option_a: "Click 'Advanced' -> 'Proceed to website (unsafe)' to check your balance quickly",
    option_b: "Immediately close the browser and disconnect from the network; an intermediate device is likely attempting a Man-in-the-Middle (MITM) decryption interception",
    option_c: "Open the site in an Incognito / Private window to bypass the security check",
    option_d: "Change your screen display resolution to 1080p",
    correct_answer: "b",
    explanation: "A certificate authority invalid error on public Wi-Fi means the connection is being intercepted by an untrusted intermediate proxy. Bypassing it exposes all passwords and session tokens.",
    order_index: 10,
  },

  /* ── DOMAIN 6: Incident Response & Data Hygiene ── */
  {
    id: "aq-11",
    assessment_id: "assessment-default",
    topic: "Incident Response & Backup",
    question: "What is the core principle of the industry-standard '3-2-1' backup strategy for surviving ransomware and catastrophic hardware loss?",
    option_a: "3 passwords, 2 security questions, and 1 biometric authenticator",
    option_b: "3 total copies of data, stored across 2 different media formats, with at least 1 copy kept completely offline and air-gapped",
    option_c: "Backing up files at 3:00 PM on the 2nd day of each month for 1 year",
    option_d: "Saving files to 3 separate folders on your primary local hard drive",
    correct_answer: "b",
    explanation: "The 3-2-1 rule ensures that even if ransomware encrypts local disks and cloud-synced folders, an offline air-gapped copy cannot be reached by malware over the network.",
    order_index: 11,
  },
  {
    id: "aq-12",
    assessment_id: "assessment-default",
    topic: "Incident Response & Backup",
    question: "You realize you just typed your corporate password into a fake lookalike portal. What is the single most urgent defensive action to take in the first 5 minutes?",
    option_a: "Wait 24 hours to see if any unusual activity occurs before alarming your manager",
    option_b: "Immediately change your password from an uncompromised device, terminate all active login sessions, and report the incident to the Security Operations Center (SOC)",
    option_c: "Reply to the phishing email requesting that they delete your submitted credentials",
    option_d: "Delete your local browser browsing history and cache",
    correct_answer: "b",
    explanation: "Rapid password reset and session invalidation terminates the attacker's newly captured session tokens before they can pivot laterally into internal systems. Speed of reporting is paramount.",
    order_index: 12,
  },
];

const DEFAULT_BADGES: Badge[] = [
  { id: "b-1", name: "Phishing Hunter", description: "Successfully identify and report 3 phishing simulations.", icon: "ti-mail-check", requirement_type: "simulation_category_count", requirement_value: 3 },
  { id: "b-2", name: "Password Guardian", description: "Complete the Password & Account Security curriculum.", icon: "ti-lock-check", requirement_type: "module_complete", requirement_value: 1 },
  { id: "b-3", name: "Network Sentinel", description: "Master the Rogue Wi-Fi and safe networking simulations.", icon: "ti-wifi", requirement_type: "module_complete", requirement_value: 1 },
  { id: "b-4", name: "Cyber Defender", description: "Complete at least 3 comprehensive training modules.", icon: "ti-shield-check", requirement_type: "module_count", requirement_value: 3 },
  { id: "b-5", name: "Security Specialist", description: "Score 85+ on the Comprehensive Awareness Assessment.", icon: "ti-award", requirement_type: "assessment_score", requirement_value: 85 },
  { id: "b-6", name: "Smishing Interceptor", description: "Spot the fake bank cancellation OTP trap in Mobile Smishing sandbox.", icon: "ti-device-mobile-check", requirement_type: "simulation_complete", requirement_value: 1 },
  { id: "b-7", name: "Ransomware First Responder", description: "Execute rapid host isolation during the Ransomware simulation drill.", icon: "ti-virus", requirement_type: "simulation_complete", requirement_value: 1 },
  { id: "b-8", name: "Zero-Day Scout", description: "Inspect active CVE advisories on the Live Threat Radar and export verified IOC blocks.", icon: "ti-radar", requirement_type: "threat_intel_view", requirement_value: 1 },
  { id: "b-9", name: "Incident Commander", description: "Dispatch a validated incident report with containment directives to the SOC.", icon: "ti-flag", requirement_type: "incident_report", requirement_value: 1 },
  { id: "b-10", name: "Vault Master", description: "Generate an ultra-resilient 4-word passphrase with 70+ bits entropy in the Security Toolkit.", icon: "ti-key", requirement_type: "tool_usage", requirement_value: 1 },
  { id: "b-11", name: "Hygiene Hardened", description: "Verify all 8 workstation defense checkpoints on the Cyber Hygiene Audit.", icon: "ti-list-check", requirement_type: "tool_usage", requirement_value: 1 },
  { id: "b-12", name: "Cyber Sentinel", description: "Achieve Tier 5 Operator status with 1,000+ total defense points.", icon: "ti-crown", requirement_type: "level_reached", requirement_value: 5 },
];

const DEFAULT_ACTIVITY = [
  { id: "act-1", user_id: "user-demo-operator", action: "lesson_completed", meta: { module: "Cybersecurity Fundamentals" }, points_earned: 20, created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: "act-2", user_id: "user-demo-operator", action: "simulation_completed", meta: { simulation: "Spear-Phishing Drill", score: 100 }, points_earned: 50, created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: "act-3", user_id: "user-demo-operator", action: "quiz_completed", meta: { quiz: "Phishing Knowledge Check" }, points_earned: 30, created_at: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: "act-4", user_id: "user-demo-operator", action: "badge_earned", meta: { badge: "Phishing Hunter" }, points_earned: 50, created_at: new Date(Date.now() - 25 * 3600000).toISOString() },
];

/* ── Typed Table Mapping ── */

export interface DatabaseTableMap {
  profiles: Profile;
  modules: Module;
  lessons: Lesson;
  quizzes: Quiz;
  questions: QuestionData;
  quiz_results: { id: string; user_id: string; quiz_id: string; score: number; total_questions: number; answers: Record<string, unknown>; completed_at: string };
  simulations: Simulation;
  simulation_steps: SimulationStepData;
  simulation_results: { id: string; user_id: string; simulation_id: string; score: number; completed_at: string };
  assessments: { id: string; title: string; description: string };
  assessment_questions: AssessmentQuestionData;
  assessment_results: { id: string; user_id: string; assessment_id: string; score: number; completed_at: string };
  badges: Badge;
  user_badges: { id: string; user_id: string; badge_id: string; earned_at: string; badge: Badge };
  activity_logs: { id: string; user_id: string; action: string; meta: Record<string, unknown>; points_earned: number; created_at: string };
  incident_reports: { id: string; user_id: string; category: string; urgency: string; subject: string; details: string; status: string; created_at: string };
  progress: Progress;
  leaderboard: LeaderboardEntry;
  certificates: { id: string; user_id: string; full_name: string; score: number; issued_at: string };
}

const STORAGE_KEY = "cyberguard_local_db_v6";

interface DatabaseState {
  profiles: Profile[];
  modules: Module[];
  lessons: Lesson[];
  quizzes: Quiz[];
  questions: QuestionData[];
  quiz_results: Array<{ id: string; user_id: string; quiz_id: string; score: number; total_questions: number; answers: Record<string, unknown>; completed_at: string }>;
  simulations: Simulation[];
  simulation_steps: SimulationStepData[];
  simulation_results: Array<{ id: string; user_id: string; simulation_id: string; score: number; completed_at: string }>;
  assessments: Array<{ id: string; title: string; description: string }>;
  assessment_questions: AssessmentQuestionData[];
  assessment_results: Array<{ id: string; user_id: string; assessment_id: string; score: number; completed_at: string }>;
  badges: Badge[];
  user_badges: Array<{ id: string; user_id: string; badge_id: string; earned_at: string; badge: Badge }>;
  activity_logs: Array<{ id: string; user_id: string; action: string; meta: Record<string, unknown>; points_earned: number; created_at: string }>;
  incident_reports: Array<{ id: string; user_id: string; category: string; urgency: string; subject: string; details: string; status: string; created_at: string }>;
  progress: Progress[];
  /** Issued certificates — stable ID, stored once on passing assessment */
  certificates: Array<{ id: string; user_id: string; full_name: string; score: number; issued_at: string }>;
  /** Hashed credentials — never store plain passwords here */
  credentials: Array<{ user_id: string; salt: string; hash: string }>;
}

/**
 * Demo account password (shown on LoginPage in the Demo Credentials box).
 * Hashed lazily when localDb first loads. Never store plain-text passwords.
 */
export const DEMO_PASSWORD = "CyberGuard2026!";

/** Hex-encode a Uint8Array */
function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Generate a random 16-byte hex salt */
function randomSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return toHex(arr.buffer);
}

/** SHA-256 hash of (salt + password). Returns lowercase hex. */
async function sha256(salt: string, password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(salt + password);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return toHex(buf);
}

/** Build a credential record for a profile+password pair */
async function buildCredential(userId: string, password: string): Promise<{ user_id: string; salt: string; hash: string }> {
  const salt = randomSalt();
  const hash = await sha256(salt, password);
  return { user_id: userId, salt, hash };
}

function getInitialState(): DatabaseState {
  return {
    profiles: DEFAULT_PROFILES,
    modules: DEFAULT_MODULES,
    lessons: DEFAULT_LESSONS,
    quizzes: DEFAULT_QUIZZES,
    questions: DEFAULT_QUESTIONS,
    quiz_results: [
      { id: "qr-1", user_id: "user-demo-operator", quiz_id: "quiz-1", score: 100, total_questions: 2, answers: {}, completed_at: new Date().toISOString() },
    ],
    simulations: DEFAULT_SIMULATIONS,
    simulation_steps: DEFAULT_SIMULATION_STEPS,
    simulation_results: [
      { id: "sr-1", user_id: "user-demo-operator", simulation_id: "sim-1", score: 100, completed_at: new Date().toISOString() },
    ],
    assessments: [DEFAULT_ASSESSMENT],
    assessment_questions: DEFAULT_ASSESSMENT_QUESTIONS,
    assessment_results: [],
    badges: DEFAULT_BADGES,
    user_badges: [
      { id: "ub-1", user_id: "user-demo-operator", badge_id: "b-1", earned_at: new Date().toISOString(), badge: DEFAULT_BADGES[0] },
      { id: "ub-2", user_id: "user-demo-operator", badge_id: "b-2", earned_at: new Date().toISOString(), badge: DEFAULT_BADGES[1] },
    ],
    activity_logs: DEFAULT_ACTIVITY,
    incident_reports: [],
    progress: [
      { id: "prog-1", user_id: "user-demo-operator", module_id: "mod-1", completed_lessons: ["les-1-1", "les-1-2"], is_completed: true },
      { id: "prog-2", user_id: "user-demo-operator", module_id: "mod-3", completed_lessons: ["les-3-1", "les-3-2"], is_completed: true },
    ],
    certificates: [],
    /** credentials seeded asynchronously via seedDemoCredentials() */
    credentials: [],
  };
}

function loadDb(): DatabaseState {
  if (typeof window === "undefined") return getInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const init = getInitialState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
      return init;
    }
    const parsed = JSON.parse(raw);
    // Remove obsolete duplicate public-wifi simulation if present in localStorage
    if (parsed.simulations) {
      const hadPublicWifi = parsed.simulations.some((s: Simulation) => s.slug === "public-wifi");
      if (hadPublicWifi) {
        parsed.simulations = parsed.simulations.filter((s: Simulation) => s.slug !== "public-wifi");
      }
      parsed.simulations = parsed.simulations.map((s: Simulation) => {
        const def = DEFAULT_SIMULATIONS.find((d) => d.slug === s.slug);
        return def ? { ...s, title: def.title, description: def.description, scenario: def.scenario } : s;
      });
      saveDb(parsed);
    }
    // Ensure default simulations exist
    const existingSlugs = new Set((parsed.simulations || []).map((s: Simulation) => s.slug));
    const missing = DEFAULT_SIMULATIONS.filter((s) => !existingSlugs.has(s.slug));
    if (missing.length > 0) {
      parsed.simulations = [...(parsed.simulations || []), ...missing];
      saveDb(parsed);
    }
    // Ensure comprehensive lessons, quizzes, and questions are populated in localStorage
    if (!parsed.lessons || parsed.lessons.length < DEFAULT_LESSONS.length) {
      parsed.lessons = DEFAULT_LESSONS;
      saveDb(parsed);
    }
    if (!parsed.quizzes || parsed.quizzes.length < DEFAULT_QUIZZES.length) {
      parsed.quizzes = DEFAULT_QUIZZES;
      saveDb(parsed);
    }
    if (!parsed.questions || parsed.questions.length < DEFAULT_QUESTIONS.length) {
      parsed.questions = DEFAULT_QUESTIONS;
      saveDb(parsed);
    }
    if (!parsed.assessment_questions || parsed.assessment_questions.length < DEFAULT_ASSESSMENT_QUESTIONS.length) {
      parsed.assessment_questions = DEFAULT_ASSESSMENT_QUESTIONS;
      saveDb(parsed);
    }
    if (!parsed.badges || parsed.badges.length < DEFAULT_BADGES.length) {
      parsed.badges = DEFAULT_BADGES;
      saveDb(parsed);
    }
    if (!parsed.profiles || parsed.profiles.length < DEFAULT_PROFILES.length) {
      const existingIds = new Set((parsed.profiles || []).map((p: Profile) => p.id));
      const toAdd = DEFAULT_PROFILES.filter((p) => !existingIds.has(p.id));
      parsed.profiles = [...(parsed.profiles || []), ...toAdd];
      saveDb(parsed);
    }
    if (!parsed.certificates) {
      parsed.certificates = [];
      saveDb(parsed);
    }
    if (!parsed.credentials) {
      parsed.credentials = [];
      saveDb(parsed);
    }
    return parsed;
  } catch {
    return getInitialState();
  }
}

function saveDb(state: DatabaseState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("Failed to persist local database:", err);
  }
}

/* ── Chainable Typed Local Query Builder ── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class LocalQueryBuilder<T = any> implements PromiseLike<{ data: T; error: { message: string } | null; count?: number | null }> {
  private tableName: string;
  private filters: Array<(item: Record<string, unknown>) => boolean> = [];
  private orderField: string | null = null;
  private orderAscending = true;
  private limitCount: number | null = null;
  private isSingle = false;
  private operation: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private payload: unknown = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(_fields = "*", _options?: { count?: string; head?: boolean }): this {
    return this;
  }

  insert(data: unknown): this {
    this.operation = "insert";
    this.payload = data;
    return this;
  }

  update(patch: unknown): this {
    this.operation = "update";
    this.payload = patch;
    return this;
  }

  upsert(data: unknown, _options?: unknown): this {
    this.operation = "upsert";
    this.payload = data;
    return this;
  }

  delete(): this {
    this.operation = "delete";
    return this;
  }

  eq(column: string, value: unknown): this {
    this.filters.push((item) => String(item[column]) === String(value));
    return this;
  }

  neq(column: string, value: unknown): this {
    this.filters.push((item) => String(item[column]) !== String(value));
    return this;
  }

  order(column: string, opts: { ascending?: boolean } = { ascending: true }): this {
    this.orderField = column;
    this.orderAscending = opts.ascending ?? true;
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  single(): LocalQueryBuilder<any> {
    this.isSingle = true;
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  maybeSingle(): LocalQueryBuilder<any> {
    this.isSingle = true;
    return this;
  }

  async execute(): Promise<{ data: T; error: { message: string } | null; count?: number | null }> {
    const db = loadDb();

    // Virtual Leaderboard view
    if (this.tableName === "leaderboard") {
      const lb = db.profiles
        .filter((p) => p.role !== "admin")
        .map((p, idx) => ({
          rank: idx + 1,
          id: p.id,
          user_id: p.id,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          points: p.points,
          level: p.level,
          badges_count: db.user_badges.filter((ub) => ub.user_id === p.id).length || 3,
        }))
        .sort((a, b) => b.points - a.points)
        .map((p, i) => ({ ...p, rank: i + 1 }));
      return { data: (this.limitCount ? lb.slice(0, this.limitCount) : lb) as unknown as T, error: null, count: lb.length };
    }

    const tableKey = this.tableName as keyof DatabaseState;
    const tableData = ((db[tableKey] as unknown as Array<Record<string, unknown>>) || []) as Array<Record<string, unknown>>;

    if (this.operation === "insert") {
      const rows = Array.isArray(this.payload) ? this.payload : [this.payload as Record<string, unknown>];
      const insertedRows = rows.map((r) => ({
        id: r.id || `${this.tableName.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        created_at: r.created_at || new Date().toISOString(),
        ...r,
      }));
      tableData.push(...insertedRows);
      db[tableKey] = tableData as never;
      saveDb(db);
      return { data: (Array.isArray(this.payload) ? insertedRows : insertedRows[0]) as unknown as T, error: null, count: insertedRows.length };
    }

    if (this.operation === "upsert") {
      const rows = Array.isArray(this.payload) ? this.payload : [this.payload as Record<string, unknown>];
      for (const row of rows) {
        const existingIdx = tableData.findIndex((item) => (row.id && item.id === row.id) || (row.module_id && row.user_id && item.module_id === row.module_id && item.user_id === row.user_id));
        if (existingIdx >= 0) {
          tableData[existingIdx] = { ...tableData[existingIdx], ...row };
        } else {
          tableData.push({
            id: row.id || `${this.tableName.slice(0, 3)}-${Date.now()}`,
            created_at: row.created_at || new Date().toISOString(),
            ...row,
          });
        }
      }
      db[tableKey] = tableData as never;
      saveDb(db);
      return { data: rows as unknown as T, error: null, count: rows.length };
    }

    if (this.operation === "update") {
      const patch = (this.payload || {}) as Record<string, unknown>;
      let updatedCount = 0;
      for (let i = 0; i < tableData.length; i++) {
        const matches = this.filters.every((f) => f(tableData[i]));
        if (matches) {
          tableData[i] = { ...tableData[i], ...patch };
          updatedCount++;
        }
      }
      saveDb(db);
      return { data: { updated: updatedCount } as unknown as T, error: null, count: updatedCount };
    }

    if (this.operation === "delete") {
      const remaining = tableData.filter((item) => !this.filters.every((f) => f(item)));
      db[tableKey] = remaining as never;
      saveDb(db);
      return { data: { deleted: true } as unknown as T, error: null, count: 0 };
    }

    // Default: SELECT operation
    let results = tableData.filter((item) => {
      for (const filter of this.filters) {
        if (!filter(item)) return false;
      }
      return true;
    });

    const totalCount = results.length;

    if (this.orderField) {
      const field = this.orderField;
      const asc = this.orderAscending;
      results.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        return asc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
    }

    if (this.limitCount !== null) {
      results = results.slice(0, this.limitCount);
    }

    if (this.isSingle) {
      return { data: (results[0] ?? null) as unknown as T, error: null, count: totalCount };
    }

    return { data: results as unknown as T, error: null, count: totalCount };
  }

  then<TResult1 = { data: T; error: { message: string } | null; count?: number | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: T; error: { message: string } | null; count?: number | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

/* ── Local Auth Manager ── */

const AUTH_USER_KEY = "cyberguard_active_user";

/** Demo accounts: seeded with known password on first load */
const DEMO_ACCOUNTS = [
  { email: "admin@cyberguard.dev",      userId: "user-demo-admin" },
  { email: "operator@cyberguard.dev",   userId: "user-demo-operator" },
  { email: "tirth.b@cyberguard.dev",    userId: "user-demo-lead-1" },
  { email: "aarav.s@cyberguard.dev",    userId: "user-demo-lead-2" },
  { email: "kriti.p@cyberguard.dev",    userId: "user-demo-lead-3" },
  { email: "rohan.m@cyberguard.dev",    userId: "user-demo-lead-4" },
  { email: "isha.v@cyberguard.dev",     userId: "user-demo-lead-5" },
  { email: "dhruv.s@cyberguard.dev",    userId: "user-demo-lead-6" },
  { email: "sneha.j@cyberguard.dev",    userId: "user-demo-lead-7" },
  { email: "manav.t@cyberguard.dev",    userId: "user-demo-lead-8" },
  { email: "priya.shah@cyberguard.dev", userId: "user-demo-lead-9" },
  { email: "harsh.p@cyberguard.dev",    userId: "user-demo-lead-10" },
  { email: "liam.o@cyberguard.dev",     userId: "user-demo-lead-11" },
];

/**
 * Seeds hashed demo credentials if they don't already exist.
 * Called once on first access — async because Web Crypto is async.
 */
async function seedDemoCredentials(): Promise<void> {
  const db = loadDb();
  const seeded = new Set(db.credentials.map((c) => c.user_id));
  const toSeed = DEMO_ACCOUNTS.filter((a) => !seeded.has(a.userId));
  if (!toSeed.length) return;

  const newCreds = await Promise.all(
    toSeed.map((a) => buildCredential(a.userId, DEMO_PASSWORD))
  );
  db.credentials.push(...newCreds);
  saveDb(db);
}

class LocalAuthClient {
  private listeners: Array<(event: string, session: { user: Profile } | null) => void> = [];
  /** True after async seed is done — prevents race on first sign-in */
  private _seedPromise: Promise<void> | null = null;

  reset() {
    this._seedPromise = null;
    this.listeners = [];
  }

  private ensureSeeded(): Promise<void> {
    if (!this._seedPromise) {
      this._seedPromise = seedDemoCredentials();
    }
    return this._seedPromise;
  }

  /** Returns the active session profile, or null if no one is logged in. */
  getCurrentUser(): Profile | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as Profile;
    } catch {
      return null;
    }
  }

  async getSession(): Promise<{ data: { session: { user: Profile } | null }; error: null }> {
    const user = this.getCurrentUser();
    return { data: { session: user ? { user } : null }, error: null };
  }

  onAuthStateChange(callback: (event: string, session: { user: Profile } | null) => void) {
    this.listeners.push(callback);
    const user = this.getCurrentUser();
    // Fire synchronously with current state
    callback("INITIAL_SESSION", user ? { user } : null);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter((l) => l !== callback);
          },
        },
      },
    };
  }

  /**
   * Signs in with email + password.
   * - Rejects unknown emails (no silent account creation).
   * - Verifies the SHA-256+salt hash.
   * - Never derives role from email.
   */
  async signInWithPassword({ email, password = "" }: { email: string; password?: string }): Promise<{ error: null | { message: string } }> {
    await this.ensureSeeded();
    const db = loadDb();

    const profile = db.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (!profile) {
      return { error: { message: "No account found with that email address." } };
    }

    const cred = db.credentials.find((c) => c.user_id === profile.id);
    if (!cred) {
      // Account exists but has no credential record (edge-case for very old data).
      // Treat as wrong password rather than auto-login.
      return { error: { message: "Invalid password. Please use the demo credentials shown on this page." } };
    }

    const hash = await sha256(cred.salt, password);
    if (hash !== cred.hash) {
      return { error: { message: "Incorrect password. Please try again." } };
    }

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
    this.notify("SIGNED_IN", { user: profile });
    return { error: null };
  }

  /**
   * Creates a new account.
   * - Rejects duplicate emails.
   * - Enforces minimum password length (8).
   * - Always assigns role: 'user' (admins can only be promoted via admin panel).
   * - Uses crypto.randomUUID() for IDs.
   */
  async signUp({
    email,
    password = "",
    options,
  }: {
    email: string;
    password?: string;
    options?: { data?: { full_name?: string } };
  }): Promise<{ error: null | { message: string } }> {
    await this.ensureSeeded();
    if (password.length < 8) {
      return { error: { message: "Password must be at least 8 characters." } };
    }

    const db = loadDb();
    if (db.profiles.some((p) => p.email.toLowerCase() === email.toLowerCase())) {
      return { error: { message: "An account with that email already exists." } };
    }

    const id = crypto.randomUUID();
    const newProfile: Profile = {
      id,
      full_name: options?.data?.full_name || email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role: "user", // Role is ALWAYS 'user' on signup — never derived from email
      avatar_url: null,
      points: 0,
      level: 1,
      awareness_score: 0,
      status: "active",
      created_at: new Date().toISOString(),
    };

    const cred = await buildCredential(id, password);
    db.profiles.push(newProfile);
    db.credentials.push(cred);
    saveDb(db);

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newProfile));
    this.notify("SIGNED_IN", { user: newProfile });
    return { error: null };
  }

  async updateUser({ password: _pw }: { password?: string }): Promise<{ error: null | { message: string } }> {
    // Password change not yet implemented for localDb mode.
    return { error: null };
  }

  async resetPasswordForEmail(_email: string, _options?: unknown): Promise<{ error: null | { message: string } }> {
    return { error: null };
  }

  /**
   * Previously called signInWithOAuth / "Continue with Google".
   * Relabelled: signs in as the Demo Operator account using the known demo password.
   */
  async signInWithOAuth({ provider: _provider }: { provider: string; options?: unknown }): Promise<{ error: null | { message: string } }> {
    return this.signInWithPassword({ email: "operator@cyberguard.dev", password: DEMO_PASSWORD });
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(AUTH_USER_KEY);
    this.notify("SIGNED_OUT", null);
  }

  private notify(event: string, session: { user: Profile } | null) {
    for (const listener of this.listeners) {
      listener(event, session);
    }
  }
}

/* ── Overloaded LocalDb Table Client ── */

export interface LocalDbClient {
  from<K extends keyof DatabaseTableMap>(table: K): LocalQueryBuilder<DatabaseTableMap[K][]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from<T = any>(table: string): LocalQueryBuilder<T>;
  auth: LocalAuthClient;
  resetDatabase(): void;
}

export const localDb: LocalDbClient = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from(table: string): LocalQueryBuilder<any> {
    return new LocalQueryBuilder(table);
  },
  auth: new LocalAuthClient(),
  resetDatabase() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    this.auth.reset();
  },
};
