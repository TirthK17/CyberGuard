-- ============================================================================
-- CyberGuard (Kavach) Production Seed Data
-- 100% Idempotent - Safe to run repeatedly in Supabase SQL Editor
-- Populates Courses, Lessons, Quizzes, Questions, Simulations, Steps, Badges, Assessment & Threat Radar
-- ============================================================================

-- 1. MODULES (TRAINING COURSES)
insert into public.modules (title, slug, description, category, difficulty, duration_minutes, learning_objectives, is_published, order_index)
values
  (
    'Cybersecurity Fundamentals',
    'cybersecurity-fundamentals',
    'Core security concepts every individual and team needs: the CIA triad, threat categorization, hygiene routines, and why human factors are critical.',
    'Fundamentals',
    'beginner',
    20,
    array['Understand the CIA Triad (Confidentiality, Integrity, Availability)', 'Identify common attack surfaces and threat categories', 'Recognize the critical role of human defense'],
    true,
    1
  ),
  (
    'Password & Account Security',
    'password-account-security',
    'Build unshakeable authentication habits: passphrase entropy, password manager vaults, MFA factors, and defense against credential stuffing.',
    'Authentication',
    'beginner',
    15,
    array['Create high-entropy unique passphrases', 'Deploy hardware and TOTP authenticator MFA', 'Detect credential stuffing and unauthorized account access'],
    true,
    2
  ),
  (
    'Phishing & Social Engineering',
    'phishing-awareness',
    'Spot deceptive emails, lookalike domains, smishing SMS, and urgent pretexting calls before entering credentials or executing payloads.',
    'Social Engineering',
    'beginner',
    18,
    array['Examine SPF, DKIM, and lookalike domain red flags', 'Verify urgent requests out-of-band', 'Safely report deceptive messages to SOC teams'],
    true,
    3
  ),
  (
    'Malware & Ransomware Defense',
    'malware-ransomware',
    'Understand ransomware kill chains, malicious macro execution, emergency device isolation, and 3-2-1 immutable backup recovery strategies.',
    'Threats',
    'intermediate',
    22,
    array['Differentiate worms, trojans, ransomware, and spyware', 'Execute instant network isolation upon infection indicators', 'Implement immutable backup and containment workflows'],
    true,
    4
  ),
  (
    'Network Security & Safe Browsing',
    'network-security',
    'Protect communications on public Wi-Fi, evaluate TLS/HTTPS certificates, configure home routers securely, and understand VPN tunnels.',
    'Network',
    'intermediate',
    18,
    array['Audit open and rogue evil-twin Wi-Fi networks', 'Inspect TLS certificates and secure browser flags', 'Configure DNS over HTTPS and virtual private network encryption'],
    true,
    5
  ),
  (
    'Incident Response & Recovery',
    'incident-response',
    'Master practical personal and organizational incident triage: evidence preservation, credential containment, and forensic reporting.',
    'Operations',
    'advanced',
    25,
    array['Triage security incidents quickly and systematically', 'Preserve log evidence and indicators of compromise', 'Report incidents through defensive response channels'],
    true,
    6
  )
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  difficulty = excluded.difficulty,
  duration_minutes = excluded.duration_minutes,
  learning_objectives = excluded.learning_objectives,
  is_published = excluded.is_published,
  order_index = excluded.order_index;

-- 2. LESSONS
-- Lessons for Cybersecurity Fundamentals
with m as (select id from public.modules where slug = 'cybersecurity-fundamentals')
insert into public.lessons (module_id, title, content, order_index)
select m.id, v.title, v.content::jsonb, v.order_index
from m, (values
  (1, 'What is Cybersecurity & Why Human Defense Matters', '[
    {"type":"paragraph","text":"Cybersecurity is the operational practice of defending computers, servers, mobile devices, electronic systems, networks, and sensitive data from malicious attacks. Over 88% of all enterprise data breaches begin with human oversight rather than raw software zero-days."},
    {"type":"tip","text":"Defensive security is not just IT''s responsibility. Every user with an inbox, smartphone, or login credential operates as the organization''s frontline defense barrier."},
    {"type":"heading","text":"The Growing Threat Surface"},
    {"type":"paragraph","text":"Modern cyber threats are no longer isolated computer viruses. They span automated credential harvesting, automated credential stuffing bots, deepfake executive pretexting, and ransomware syndicates operating as commercial enterprises."},
    {"type":"takeaway","title":"Key Takeaways","points":["Humans are the decisive perimeter in modern defensive security","Layered technical defenses fail if users fall for social engineering","Developing high situational awareness stops over 90% of opportunistic attacks"]}
  ]'),
  (2, 'The CIA Triad Explained', '[
    {"type":"paragraph","text":"The CIA Triad (Confidentiality, Integrity, and Availability) is the foundational model designed to guide information security policies within any organization."},
    {"type":"list","items":[
      "Confidentiality: Protecting private data from unauthorized viewers through end-to-end encryption, role-based access control, and strict least-privilege principles.",
      "Integrity: Ensuring data remains authentic, unaltered, and trustworthy from origin to destination using cryptographic hashes (SHA-256) and digital signatures.",
      "Availability: Ensuring systems, portals, and emergency backups remain operational and accessible to legitimate users when needed."
    ]},
    {"type":"warning","text":"A security measure that cripples Availability often drives users to unmonitored shadow IT, destroying Confidentiality in the process."}
  ]'),
  (3, 'Common Threat Categories & Defense in Depth', '[
    {"type":"paragraph","text":"Defense in Depth is an information assurance strategy where multiple layered security controls are placed throughout an IT system."},
    {"type":"case_study","title":"The Compromised Service Desk Credential","incident":"An attacker used a single leaked helpdesk password without MFA to pivot laterally across 14 internal servers.","impact":"Complete operational shutdown for 48 hours costing over ₹2.4 Crores in mitigation.","takeaway":"Defense in Depth with multi-factor authentication, network segmentation, and principle of least privilege confines breaches to single endpoints."}
  ]')
) as v(order_index, title, content)
on conflict do nothing;

-- Lessons for Password & Account Security
with m as (select id from public.modules where slug = 'password-account-security')
insert into public.lessons (module_id, title, content, order_index)
select m.id, v.title, v.content::jsonb, v.order_index
from m, (values
  (1, 'Password Entropy & Passphrases', '[
    {"type":"paragraph","text":"Short complex passwords like P@$$w0rd123 are easily cracked by modern GPU hash tables in seconds. Long passphrases consisting of 4 or 5 unrelated random words (e.g., correct-horse-battery-staple) create astronomical mathematical entropy that would take centuries to brute-force."},
    {"type":"tip","text":"Aim for at least 16 characters. Length beats complexity every single time."}
  ]'),
  (2, 'Multi-Factor Authentication (MFA)', '[
    {"type":"paragraph","text":"MFA requires at least two distinct authentication factors: something you know (password), something you have (authenticator app or FIDO2 hardware key), or something you are (biometrics)."},
    {"type":"warning","text":"SMS-based OTP is vulnerable to SIM-swapping and SS7 interception. Prefer hardware keys (YubiKey) or TOTP authenticator apps whenever possible."}
  ]')
) as v(order_index, title, content)
on conflict do nothing;

-- 3. QUIZZES
insert into public.quizzes (module_id, title, category, difficulty, time_limit_seconds, is_published)
select id, 'Cybersecurity Fundamentals Mastery Quiz', 'Fundamentals', 'beginner', 300, true
from public.modules where slug = 'cybersecurity-fundamentals'
on conflict do nothing;

insert into public.quizzes (module_id, title, category, difficulty, time_limit_seconds, is_published)
select id, 'Authentication & Password Defense Quiz', 'Authentication', 'beginner', 300, true
from public.modules where slug = 'password-account-security'
on conflict do nothing;

-- Questions for Quiz 1
with q as (select id from public.quizzes where title = 'Cybersecurity Fundamentals Mastery Quiz' limit 1)
insert into public.questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, points, order_index)
select q.id, v.question, v.a, v.b, v.c, v.d, v.correct, v.explanation, 10, v.order_index
from q, (values
  (1, 'What does the "I" in the CIA Triad stand for?', 'Identity', 'Integrity', 'Isolation', 'Intelligence', 'b', 'Integrity guarantees that information is accurate, authentic, and free from unauthorized modification.'),
  (2, 'Which factor is involved in the majority of modern enterprise breaches?', 'Zero-day hardware bugs', 'Broken quantum encryption', 'Human manipulation and credential theft', 'Physical server theft', 'c', 'Over 88% of breaches involve human error, stolen credentials, or social engineering.'),
  (3, 'What is the primary objective of the "Availability" tenet?', 'Encrypting data at rest', 'Ensuring authorized users have timely access to resources', 'Hiding IP addresses', 'Enforcing password complexity', 'b', 'Availability ensures critical services and data remain usable and online for authorized operations.')
) as v(order_index, question, a, b, c, d, correct, explanation)
on conflict do nothing;

-- 4. SIMULATIONS
insert into public.simulations (title, slug, category, description, scenario, difficulty, duration_minutes, learning_objective, is_published)
values
  (
    'Spot the Phishing Email',
    'phishing-email',
    'phishing',
    'Inspect a realistic workplace notification claiming urgent Microsoft account suspension.',
    'An urgent email lands in your inbox requesting immediate password verification with a 2-hour deadline.',
    'beginner',
    8,
    'Inspect sender headers, verify target domains, and detect social engineering urgency triggers.',
    true
  ),
  (
    'Ransomware Response & Device Isolation',
    'ransomware-response',
    'ransomware',
    'Navigate an active ransomware encryption incident on a workstation.',
    'Files on your workstation suddenly append .locked extensions and a ransom countdown window appears.',
    'intermediate',
    10,
    'Execute immediate network isolation and report to SOC response teams.',
    true
  ),
  (
    'The Fake IT Support Call',
    'social-engineering-call',
    'social_engineering',
    'Interact with a confident caller pretending to be corporate IT support needing your login credentials.',
    'Your phone rings. A caller claiming to be from the IT service desk asks for your password to clear a virus.',
    'intermediate',
    10,
    'Apply verification protocols and never surrender credentials over the telephone.',
    true
  ),
  (
    'Rogue Wi-Fi & MITM Payment Interception',
    'mitm-attack',
    'wifi',
    'Detect man-in-the-middle payment alteration while connected to unverified coffee shop Wi-Fi.',
    'Connected to Cafe_Free_WiFi, an attacker intercepts an online checkout and alters transaction amounts.',
    'beginner',
    8,
    'Detect certificate mismatches, verify payment amounts, and use VPN tunnels on public Wi-Fi.',
    true
  ),
  (
    'The Reverse Refund: UPI Collect Scam',
    'upi-collect',
    'social_engineering',
    'Examine a deceptive online buyer sending a UPI Collect request while claiming to send you funds.',
    'A buyer insists on sending money immediately, but you receive a prompt to enter your secret UPI PIN.',
    'beginner',
    8,
    'Remember that receiving funds never requires entering a secret PIN.',
    true
  ),
  (
    'Quishing: Weaponized Parking Meter QR Phishing',
    'quishing',
    'phishing',
    'Detect a physical sticker QR code pasted over a municipal parking terminal.',
    'Scanning a QR code on a parking meter redirects to a lookalike reverse-proxy credential harvester.',
    'intermediate',
    8,
    'Inspect physical QR stickers for tampering and verify URLs before submitting payment credentials.',
    true
  )
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  scenario = excluded.scenario,
  difficulty = excluded.difficulty,
  duration_minutes = excluded.duration_minutes,
  learning_objective = excluded.learning_objective,
  is_published = excluded.is_published;

-- 5. BADGES
insert into public.badges (name, description, icon, requirement_type, requirement_value)
values
  ('Phishing Hunter', 'Complete 3 phishing inspection drills.', 'ti-fish', 'simulation_category_count', 3),
  ('Password Guardian', 'Complete the Password & Account Security course.', 'ti-lock', 'module_complete', 1),
  ('Network Defender', 'Complete the Network Security module.', 'ti-wifi', 'module_complete', 1),
  ('Cyber Shield', 'Complete 3 complete training modules.', 'ti-shield-check', 'module_count', 3),
  ('Security Certified', 'Score 61%+ on the Cybersecurity Awareness Assessment.', 'ti-award', 'assessment_score', 61),
  ('Master Guardian', 'Achieve a score of 85%+ on the assessment.', 'ti-crown', 'assessment_score', 85)
on conflict do nothing;

-- 6. ASSESSMENTS & 20 COMPREHENSIVE QUESTIONS
insert into public.assessments (title, description)
values ('Cybersecurity Awareness Assessment', 'Comprehensive 20-question safety assessment covering password security, phishing, social engineering, malware, network safety, and privacy.')
on conflict do nothing;

with a as (select id from public.assessments limit 1)
insert into public.assessment_questions (assessment_id, topic, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
select a.id, v.topic, v.q, v.a, v.b, v.c, v.d, v.correct, v.exp, v.idx
from a, (values
  (1, 'Passwords', 'Which of the following passwords has the highest cryptographic entropy against brute-force attacks?', 'P@ssw0rd123', 'correct-horse-battery-staple-vault', 'MyDogName!2024', '1234567890AaBb', 'b', 'Long passphrases consisting of multiple random words provide exponential mathematical resistance against GPU brute-force attacks.'),
  (2, 'Passwords', 'What is the main security benefit of using a dedicated password manager vault?', 'It automatically makes all passwords shorter', 'It lets you safely store and generate unique, complex passwords for every single account', 'It eliminates the need for two-factor authentication', 'It shares passwords across social media profiles', 'b', 'Password managers prevent credential reuse by generating unique high-entropy credentials for every service.'),
  (3, 'Passwords', 'How often should you reuse the exact same password across multiple online accounts?', 'Always for convenience', 'Only between personal and work accounts', 'Never — credential stuffing attacks exploit reused passwords', 'Whenever the password contains numbers', 'c', 'When one service is breached, automated credential stuffing bots immediately test those credentials against thousands of other sites.'),
  (4, 'Phishing', 'An attacker registers "paypa1-security.com" with a digit 1 instead of an "l". What is this technique called?', 'Typosquatting / Lookalike domain spoofing', 'SQL Injection', 'Cross-Site Scripting', 'ARP Poisoning', 'a', 'Typosquatting relies on deceptive characters and lookalike spellings to fool victims into trusting a fraudulent website.'),
  (5, 'Phishing', 'Which indicator is a major red flag that an incoming message is a phishing attempt?', 'Urgent deadline threatening account termination within 2 hours', 'A personalized greeting using your known employee name', 'Routine scheduling from an internal corporate calendar', 'Official communications matching your verified bookmark', 'a', 'Attackers manufacture artificial urgency to bypass logical critical thinking before victims inspect links.'),
  (6, 'Phishing', 'What is the safest action when receiving an unexpected email attachment named "Invoice_Overdue.exe" or ".zip"?', 'Double-click to inspect its contents', 'Forward it to family members to test on another machine', 'Do not open it; immediately report the email to security teams', 'Reply to the sender asking if they really sent it', 'c', 'Executable and compressed files from unexpected senders are standard vectors for malware droppers and ransomware.'),
  (7, 'Social Engineering', 'An incoming phone caller claims to be from corporate IT support and asks for your plaintext password to fix a virus. What should you do?', 'Give them the password since it sounds like an emergency', 'Politely decline; legitimate IT personnel never need your plaintext password', 'Give a fake password to test them', 'Write the password down on a sticky note', 'b', 'Legitimate administrators never need your plaintext password. This is a classic pretexting attack.'),
  (8, 'Social Engineering', 'What is "pretexting" in the context of human engineering attacks?', 'A software patch installation script', 'Creating an invented scenario to persuade a victim to surrender sensitive information', 'Configuring router firewall ports', 'Encrypting hard drives', 'b', 'Pretexting involves building a plausible backstory (e.g., HR auditor, bank manager) to gain trust and extract credentials.'),
  (9, 'Social Engineering', 'What security risk arises from publicly sharing travel itineraries, office badge photos, and personal schedules on social media?', 'Spear-phishing attackers use these details to build hyper-convincing pretexting attacks', 'It increases home Wi-Fi signal speeds', 'It guarantees account verification on LinkedIn', 'No security impact whatsoever', 'a', 'Attackers harvest OSINT (Open Source Intelligence) from public posts to make social engineering attacks convincingly authentic.'),
  (10, 'Malware', 'What is the primary defining characteristic of ransomware?', 'Software that monitors keyboard clicks for ad display', 'Malware that encrypts victim files and demands extortion payment for the decryption key', 'Software that speeds up web browsing', 'An antivirus definitions file', 'b', 'Ransomware targets data Availability and Confidentiality by encrypting business and personal files and demanding payment.'),
  (11, 'Malware', 'What is the safest practice for downloading software onto your devices?', 'Download from random forum threads or torrent networks', 'Download only from official developer websites or verified app stores', 'Click links in sponsored advertisements', 'Allow unexpected browser notifications to install plug-ins', 'b', 'Official vendor repositories verify package signatures and scan for trojanized payloads.'),
  (12, 'Malware', 'What is the first physical action you should take if you suspect your device has been infected with active malware or ransomware?', 'Keep working normally to see if it fixes itself', 'Immediately disconnect from Wi-Fi and unplug the Ethernet cable to isolate the device from the network', 'Reboot the computer twenty times', 'Upload your personal documents to public cloud storage', 'b', 'Network isolation prevents malware from beaconing to command servers or spreading laterally across your home or enterprise network.'),
  (13, 'Network Security', 'What does a Virtual Private Network (VPN) primarily protect?', 'It prevents physical theft of your laptop', 'It encrypts network traffic between your device and the VPN gateway, protecting confidentiality on untrusted networks', 'It automatically fixes spelling mistakes in emails', 'It guarantees you will never receive spam calls', 'b', 'A VPN creates an encrypted tunnel that shields your browsing packets from eavesdropping on open Wi-Fi.'),
  (14, 'Network Security', 'Which Wi-Fi network is safest for conducting online banking transactions?', 'Airport_Free_WiFi_Open (no password)', 'A secure, trusted network or your own mobile personal hotspot', 'A public coffee shop network with an unverified captive portal', 'Any Wi-Fi with strong antenna bars', 'b', 'Untrusted public Wi-Fi networks can be cloned (Evil Twin attacks) or monitored by rogue access points.'),
  (15, 'Network Security', 'What does the presence of "https://" and a valid lock icon in your browser URL bar signify?', 'The website owner is 100% trustworthy and will never scam you', 'Traffic between your browser and the web server is encrypted in transit', 'The webpage has zero software vulnerabilities', 'Your computer is immune to viruses', 'b', 'HTTPS ensures cryptographic encryption in transit; however, phishing sites can also obtain free SSL certificates, so domain inspection remains vital.'),
  (16, 'Privacy', 'What is the Principle of Least Privilege regarding smartphone and web application permissions?', 'Grant every permission an application asks for', 'Grant only the absolute minimum permissions strictly necessary for the application to function', 'Never install any security updates', 'Share contact lists with all installed games', 'b', 'Limiting access to location, camera, and contacts reduces data exposure in the event of an app compromise.'),
  (17, 'Privacy', 'How does Multi-Factor Authentication (MFA) prevent account takeovers even if an attacker learns your password?', 'It scrambles the password into plain English', 'The attacker still cannot authenticate without the second distinct physical or biometric factor', 'It sends an email to the attacker', 'It deletes the account after three tries', 'b', 'MFA requires verification via a second independent factor that the attacker does not physically possess.'),
  (18, 'Privacy', 'Why is it critical to install operating system and browser security updates promptly?', 'They change desktop wallpaper colors', 'They patch known vulnerabilities that attackers actively exploit to achieve remote code execution', 'They make the battery drain faster', 'Updates are only cosmetic', 'b', 'Vendor security patches close exploitable loopholes that automated attack scripts look for on unpatched devices.'),
  (19, 'Threats', 'What is a "zero-day" vulnerability?', 'A bug that only occurs at midnight', 'A security flaw known to attackers or researchers before the vendor has created and distributed a patch', 'A password containing zero characters', 'An expired SSL certificate', 'b', 'A zero-day has zero days of developer protection available at the time of discovery or exploitation.'),
  (20, 'Social Engineering', 'You find an unlabelled USB flash drive in the office parking lot. What should you do?', 'Plug it into your work laptop to see who owns it', 'Hand it directly to your security or IT team without plugging it into any device', 'Plug it into your personal home computer instead', 'Format it and keep it for yourself', 'b', 'Malicious USB drives (Baiting attacks) can execute automated keystroke injection payloads (Rubber Ducky) the instant they receive power.')
) as v(idx, topic, q, a, b, c, d, correct, exp)
on conflict do nothing;

-- 7. THREAT INTELLIGENCE BULLETINS
insert into public.threat_bulletins (
  id, cve, title, category, severity, origin_region, target_sectors, summary, attack_vector, mitigation, mitre, iocs, is_published
)
values
  (
    'ADV-2026-PHP2SHELL',
    'CVE-2026-109618',
    'PHP2Shell: Critical Remote Code Execution Flaw in Core PHP Engine',
    'AI & Emerging',
    'critical',
    'Global',
    array['Cloud Tech', 'Finance', 'Healthcare'],
    'Autonomous AI vulnerability scanners discovered a decade-old parser flaw allowing arbitrary remote code execution via multipart form boundary processing.',
    'Malformed boundary headers trigger heap corruption in CGI/FPM request handling.',
    'Upgrade PHP runtimes to latest patch release immediately. Enforce WAF rules inspecting multipart request headers.',
    '[{"tactic":"Execution","techniqueId":"T1059","techniqueName":"Command and Scripting Interpreter"}]'::jsonb,
    '{"domains":["c2-php-payload.top"],"ips":["185.220.101.5"],"hashes":["e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"]}'::jsonb,
    true
  ),
  (
    'ADV-2026-CLONEDTEAMS',
    'CVE-2026-08124',
    'DarkGate Variant Spreading via Compromised Teams Guest Invites',
    'Social Engineering',
    'high',
    'North America & Europe',
    array['Finance', 'Education', 'Government'],
    'Threat actors weaponize stolen session cookies to send deceptive Teams group invites embedding obfuscated VBScript droppers.',
    'Deceptive calendar invites deliver password-protected ZIP archives containing compiled HTML help files.',
    'Restrict external Teams communication domains. Require MFA re-authentication for guest workspace access.',
    '[{"tactic":"Initial Access","techniqueId":"T1566.002","techniqueName":"Spearphishing Link"}]'::jsonb,
    '{"domains":["teams-auth-meeting.cloud"],"ips":["194.26.29.112"],"hashes":["9f83c605d4a132e08719859f7ec72a39a67451a37c35a60a7263529d285090ef"]}'::jsonb,
    true
  ),
  (
    'ADV-2026-QUISHPARK',
    'CVE-2026-04911',
    'Municipal Parking Meter QR Overlay Fraud Campaign',
    'Social Engineering',
    'elevated',
    'India & APAC',
    array['Transportation', 'Consumer', 'Banking'],
    'Physical vinyl stickers pasted over public parking meters redirect motorists to credential-harvesting payment gateways.',
    'Dynamic reverse proxy harvesting card PAN, CVV, and intercepting SMS OTP codes.',
    'Always pay through official municipal mobile applications. Visually inspect physical payment terminals for sticker overlays.',
    '[{"tactic":"Credential Access","techniqueId":"T1556","techniqueName":"Modify Authentication Process"}]'::jsonb,
    '{"domains":["pay-quick-parking.in"],"ips":["45.142.214.88"],"hashes":["6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b"]}'::jsonb,
    true
  )
on conflict (id) do update set
  title = excluded.title,
  summary = excluded.summary,
  mitigation = excluded.mitigation,
  severity = excluded.severity,
  is_published = excluded.is_published;
