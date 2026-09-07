-- Demo content seed. Run after schema.sql.
-- Content is intentionally minimal; expand from the Admin Panel.

insert into modules (title, slug, description, category, difficulty, duration_minutes, learning_objectives, is_published, order_index) values
('Cybersecurity Fundamentals', 'cybersecurity-fundamentals', 'Core concepts every user needs before going further: the CIA triad, common threat types, and why awareness matters.', 'Fundamentals', 'beginner', 20, array['Understand the CIA triad','Identify common threat categories','Explain why humans are the weakest link'], true, 1),
('Password & Account Security', 'password-account-security', 'Build strong authentication habits: password hygiene, MFA, and password managers.', 'Authentication', 'beginner', 15, array['Create strong unique passwords','Explain how MFA reduces risk','Recognize credential stuffing attacks'], true, 2),
('Phishing Awareness', 'phishing-awareness', 'Spot the signs of phishing emails, smishing, and vishing before you click.', 'Social Engineering', 'beginner', 18, array['Identify phishing red flags','Verify sender legitimacy','Report suspicious messages correctly'], true, 3),
('Social Engineering', 'social-engineering', 'Understand how attackers manipulate trust to bypass technical controls.', 'Social Engineering', 'intermediate', 20, array['Recognize pretexting and baiting','Apply verification procedures','Avoid oversharing on social media'], true, 4),
('Malware & Ransomware', 'malware-ransomware', 'Learn how malicious software spreads and what to do when it strikes.', 'Threats', 'intermediate', 22, array['Differentiate malware types','Respond to a ransomware incident','Practice safe downloading habits'], true, 5),
('Network Security', 'network-security', 'Practice safe habits on public and home networks, including VPN use.', 'Network', 'intermediate', 18, array['Evaluate Wi-Fi network risk','Explain VPN and encryption basics','Secure a home router'], true, 6);

-- Lessons for module 1 (fetch id via slug)
with m as (select id from modules where slug = 'cybersecurity-fundamentals')
insert into lessons (module_id, title, content, order_index)
select m.id, v.title, v.content::jsonb, v.order_index from m, (values
  (1, 'What is cybersecurity?', '[{"type":"paragraph","text":"Cybersecurity is the practice of protecting systems, networks, and data from digital attacks."},{"type":"tip","text":"Most breaches start with a human mistake, not a technical flaw."}]'),
  (2, 'The CIA triad', '[{"type":"paragraph","text":"Confidentiality, Integrity, and Availability form the foundation of security thinking."},{"type":"list","items":["Confidentiality: only the right people can see data","Integrity: data cannot be altered undetected","Availability: systems stay usable when needed"]}]'),
  (3, 'Common threat types', '[{"type":"paragraph","text":"Threats range from opportunistic malware to targeted social engineering."},{"type":"warning","text":"Never assume a threat is too sophisticated to affect you personally."}]')
) as v(order_index, title, content);

with m as (select id from modules where slug = 'phishing-awareness')
insert into lessons (module_id, title, content, order_index)
select m.id, v.title, v.content::jsonb, v.order_index from m, (values
  (1, 'Anatomy of a phishing email', '[{"type":"paragraph","text":"Phishing emails imitate trusted senders to trick you into clicking or sharing data."},{"type":"list","items":["Mismatched sender domain","Urgent or threatening language","Unexpected attachments or links"]}]'),
  (2, 'Smishing and vishing', '[{"type":"paragraph","text":"Phishing is not limited to email. SMS (smishing) and phone calls (vishing) use the same manipulation tactics."}]')
) as v(order_index, title, content);

-- Quizzes
insert into quizzes (module_id, title, category, difficulty, is_published)
select id, 'Cybersecurity Fundamentals Quiz', 'Fundamentals', 'beginner', true from modules where slug = 'cybersecurity-fundamentals';

insert into quizzes (module_id, title, category, difficulty, is_published)
select id, 'Phishing Awareness Quiz', 'Social Engineering', 'beginner', true from modules where slug = 'phishing-awareness';

with q as (select id from quizzes where title = 'Cybersecurity Fundamentals Quiz')
insert into questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
select q.id, v.question, v.a, v.b, v.c, v.d, v.correct, v.explanation, v.order_index from q, (values
  (1, 'What does the "I" in the CIA triad stand for?', 'Identity', 'Integrity', 'Insurance', 'Isolation', 'b', 'Integrity means data cannot be modified without detection.'),
  (2, 'Which of these is the weakest link in most breaches?', 'Firewalls', 'Encryption', 'Humans', 'Antivirus software', 'c', 'Most breaches involve some form of human error or manipulation.'),
  (3, 'What is the primary goal of availability?', 'Keeping data secret', 'Keeping systems usable when needed', 'Keeping data unaltered', 'Keeping passwords complex', 'b', 'Availability ensures authorized users can access systems when required.')
) as v(order_index, question, a, b, c, d, correct, explanation);

-- Simulations
insert into simulations (title, slug, category, description, scenario, difficulty, learning_objective, is_published) values
('Rogue Wi-Fi & MITM Payment Interception', 'mitm-attack', 'wifi', 'You are at a café paying over public Wi-Fi when an attacker alters your payment in real time. Detect the altered amount and block the attack.', 'Connected to Cafe_Free_WiFi, an attacker intercepts and alters a transaction from ₹1,499 to ₹9,499.', 'beginner', 'Spot unverified public Wi-Fi warnings, identify altered transaction amounts, and block MITM attacks.', true),
('Spot the Phishing Email', 'phishing-email', 'phishing', 'Examine a realistic email and identify suspicious indicators.', 'An email lands in your inbox claiming your account will be suspended.', 'beginner', 'Identify phishing red flags before clicking.', true),
('The Fake IT Call', 'social-engineering-call', 'social_engineering', 'Navigate a phone call from someone claiming to be IT support.', 'Your phone rings. The caller says they are from IT and need your password to fix an issue.', 'intermediate', 'Apply verification steps before sharing sensitive information.', true),
('Ransomware Response', 'ransomware-response', 'ransomware', 'Decide how to respond when files become inaccessible after opening an attachment.', 'A suspicious attachment was opened and files appear inaccessible.', 'intermediate', 'Follow correct incident response steps.', true);

with s as (select id from simulations where slug = 'public-wifi')
insert into simulation_steps (simulation_id, order_index, prompt, options, explanation)
select s.id, v.order_index, v.prompt, v.options::jsonb, v.explanation from s, (values
  (1, 'Which network would you connect to?', '[{"id":"a","label":"Airport_Free_WiFi (open, no password)","correct":false},{"id":"b","label":"Your mobile hotspot","correct":true},{"id":"c","label":"Airport_Free_WiFi_5G (open, no password)","correct":false}]', 'Open networks with no password are easy for attackers to intercept. Your own hotspot is safer.'),
  (2, 'Would you log into online banking on this network?', '[{"id":"a","label":"Yes, I need to check my balance","correct":false},{"id":"b","label":"No, I will wait until I am on a trusted network","correct":true}]', 'Avoid sensitive logins on untrusted networks; wait for a trusted connection or use a VPN.'),
  (3, 'A pop-up appears asking you to install a "network certificate" to access the Wi-Fi. What do you do?', '[{"id":"a","label":"Install it, otherwise I cannot get online","correct":false},{"id":"b","label":"Decline and use mobile data instead","correct":true},{"id":"c","label":"Install it, then remove it later","correct":false}]', 'Certificate prompts on public Wi-Fi are a classic MITM technique that lets an attacker decrypt your traffic. Never install unknown certificates.'),
  (4, 'You must send a work file urgently. What is the safest option on this network?', '[{"id":"a","label":"Upload it over the open Wi-Fi as-is","correct":false},{"id":"b","label":"Use a VPN or your mobile hotspot before sending","correct":true}]', 'A VPN encrypts your traffic end-to-end, protecting sensitive files even on untrusted networks.')
) as v(order_index, prompt, options, explanation);

with s as (select id from simulations where slug = 'phishing-email')
insert into simulation_steps (simulation_id, order_index, prompt, options, explanation)
select s.id, v.order_index, v.prompt, v.options::jsonb, v.explanation from s, (values
  (1, 'The email is from "support@paypa1-security.com" and says your account will be suspended in 24 hours unless you verify now. What is your first move?', '[{"id":"a","label":"Click the verify link immediately to avoid suspension","correct":false},{"id":"b","label":"Check the sender domain closely for spelling tricks","correct":true},{"id":"c","label":"Reply asking them to confirm it is real","correct":false}]', 'The domain uses a digit "1" instead of the letter "l" — a classic lookalike domain. Always inspect sender addresses carefully.'),
  (2, 'The email creates urgency ("act within 24 hours") and has a generic greeting ("Dear Customer"). What does this suggest?', '[{"id":"a","label":"Nothing unusual, most companies write like this","correct":false},{"id":"b","label":"These are common phishing red flags","correct":true}]', 'Urgency and impersonal greetings are designed to make you act before you think. Legitimate companies usually use your real name.'),
  (3, 'You hover over the "Verify Account" button without clicking. The link shown is "http://paypal-verify.ru/login". What should you do?', '[{"id":"a","label":"Click it since it mentions PayPal","correct":false},{"id":"b","label":"Do not click; report and delete the email","correct":true},{"id":"c","label":"Copy the link and open it in an incognito window","correct":false}]', 'The real destination has nothing to do with PayPal''s real domain. Hovering to preview links is one of the best ways to catch phishing before you click.'),
  (4, 'What is the safest way to check if your account really has an issue?', '[{"id":"a","label":"Use the link in the email, just carefully","correct":false},{"id":"b","label":"Open a browser and type the official site address yourself, or use the official app","correct":true}]', 'Always navigate to sensitive accounts directly rather than through email links, even if the email looks convincing.')
) as v(order_index, prompt, options, explanation);

with s as (select id from simulations where slug = 'social-engineering-call')
insert into simulation_steps (simulation_id, order_index, prompt, options, explanation)
select s.id, v.order_index, v.prompt, v.options::jsonb, v.explanation from s, (values
  (1, 'The caller says: "This is IT, we detected a virus on your machine. I need your password to fix it right now." What do you do?', '[{"id":"a","label":"Give the password, it sounds urgent","correct":false},{"id":"b","label":"Refuse and explain IT never needs your password","correct":true}]', 'Legitimate IT staff never need your plaintext password. This is a core social engineering red flag.'),
  (2, 'The caller sounds confident, knows your name and department, and pressures you to hurry. How should this affect your trust?', '[{"id":"a","label":"Trust increases because they know details about me","correct":false},{"id":"b","label":"Trust should not increase; attackers often research targets beforehand","correct":true}]', 'Attackers frequently gather public details (LinkedIn, company directories) to sound credible. Insider knowledge is not proof of identity.'),
  (3, 'You want to verify the caller is really from IT. What is the best step?', '[{"id":"a","label":"Ask them to prove it over the phone","correct":false},{"id":"b","label":"Hang up and call IT back using the official number from the company directory","correct":true}]', 'Always verify through an independently known contact channel, never one the caller provides.'),
  (4, 'The caller becomes irritated and says delays will get you in trouble with your manager. What should you do?', '[{"id":"a","label":"Comply to avoid trouble","correct":false},{"id":"b","label":"Stay calm, do not share credentials, and report the call to security","correct":true}]', 'Pressure and threats are manipulation tactics. A legitimate request will survive verification through proper channels.')
) as v(order_index, prompt, options, explanation);

with s as (select id from simulations where slug = 'ransomware-response')
insert into simulation_steps (simulation_id, order_index, prompt, options, explanation)
select s.id, v.order_index, v.prompt, v.options::jsonb, v.explanation from s, (values
  (1, 'You opened an email attachment and now files show a ".locked" extension with a ransom note demanding payment. What is your first step?', '[{"id":"a","label":"Pay the ransom immediately to get files back","correct":false},{"id":"b","label":"Disconnect the device from the network immediately","correct":true},{"id":"c","label":"Keep working and ignore the note","correct":false}]', 'Isolating the infected device first prevents ransomware from spreading to shared drives and other machines on the network.'),
  (2, 'After disconnecting, who should you contact next?', '[{"id":"a","label":"Your IT/security team or incident response contact","correct":true},{"id":"b","label":"Post about it on social media for advice","correct":false}]', 'IT/security teams have the tools and playbooks to contain and investigate ransomware. Reporting early limits damage.'),
  (3, 'Should you pay the ransom?', '[{"id":"a","label":"Yes, it is the fastest way to get files back","correct":false},{"id":"b","label":"No, paying does not guarantee recovery and funds further attacks","correct":true}]', 'Paying encourages more attacks and there is no guarantee attackers will actually decrypt your files. Follow your organization''s incident response plan instead.'),
  (4, 'How could this attack have been prevented or mitigated in advance?', '[{"id":"a","label":"Regular offline backups and not opening unexpected attachments","correct":true},{"id":"b","label":"Nothing can be done to prevent ransomware","correct":false}]', 'Maintaining offline/immutable backups and practicing caution with attachments are the strongest defenses against ransomware impact.')
) as v(order_index, prompt, options, explanation);

-- Badges
insert into badges (name, description, icon, requirement_type, requirement_value) values
('Phishing Hunter', 'Complete 5 phishing simulations.', 'ti-fish', 'simulation_category_count', 5),
('Password Guardian', 'Complete the Password & Account Security module.', 'ti-lock', 'module_complete', 1),
('Network Defender', 'Complete the Network Security module.', 'ti-wifi', 'module_complete', 1),
('Cyber Defender', 'Complete 3 training modules.', 'ti-shield-check', 'module_count', 3),
('Security Expert', 'Score 90+ on the final assessment.', 'ti-award', 'assessment_score', 90);

-- Assessment
insert into assessments (title, description) values ('Cybersecurity Awareness Assessment', 'A 20-question assessment covering passwords, phishing, social engineering, malware, network security, and privacy.');

with a as (select id from assessments limit 1)
insert into assessment_questions (assessment_id, topic, question, option_a, option_b, option_c, option_d, correct_answer, order_index)
select a.id, v.topic, v.question, v.oa, v.ob, v.oc, v.od, v.correct, v.order_index from a, (values
  (1, 'Passwords', 'Which password is strongest?', 'password123', 'Tr0ub4dor&3-Kite-Wagon', 'qwerty', '123456789', 'b', 1),
  (2, 'Passwords', 'What is the main benefit of a password manager?', 'It makes passwords shorter', 'It lets you safely use unique, complex passwords everywhere', 'It removes the need for MFA', 'It shares your passwords with trusted friends', 'b', 2),
  (3, 'Passwords', 'How often should you reuse the same password across accounts?', 'Always, for convenience', 'Only for unimportant accounts', 'Never', 'Only if it is very strong', 'c', 3),
  (4, 'Phishing', 'A suspicious link uses a domain that looks almost right but is slightly misspelled. This is called:', 'Typosquatting', 'Firewalling', 'Encryption', 'Tunneling', 'a', 4),
  (5, 'Phishing', 'Which of these is a common phishing red flag?', 'A generic greeting and urgent deadline', 'A professionally formatted email', 'An email from a known coworker about a routine meeting', 'A newsletter you subscribed to', 'a', 5),
  (6, 'Phishing', 'What should you do if you receive a suspicious email attachment?', 'Open it to see what it is', 'Forward it to friends to check', 'Avoid opening it and report it to IT/security', 'Reply asking for more details', 'c', 6),
  (7, 'Social Engineering', 'Someone calls claiming to be IT and asks for your password. You should:', 'Give it to them, they are IT', 'Verify through an official channel before sharing anything', 'Give a slightly different password', 'Ask a coworker to give it instead', 'b', 7),
  (8, 'Social Engineering', 'What is "pretexting"?', 'Creating a fabricated scenario to obtain information', 'A type of firewall rule', 'A form of encryption', 'A password policy', 'a', 8),
  (9, 'Social Engineering', 'Sharing too much personal information on social media can lead to:', 'Better job offers', 'Increased risk of targeted social engineering', 'Faster internet speeds', 'No security impact', 'b', 9),
  (10, 'Malware', 'What best describes ransomware?', 'Software that speeds up your computer', 'Malware that encrypts files and demands payment', 'A type of firewall', 'A password manager', 'b', 10),
  (11, 'Malware', 'What is the safest way to install new software?', 'From any website that offers it for free', 'From the official vendor or app store', 'From a link in an unsolicited email', 'From a torrent site', 'b', 11),
  (12, 'Malware', 'What should you do immediately if you suspect malware on your device?', 'Keep using it normally', 'Disconnect from the network and contact IT/security', 'Share files with others to check', 'Restart repeatedly', 'b', 12),
  (13, 'Network Security', 'What does a VPN primarily protect?', 'Your physical device', 'The confidentiality of your network traffic', 'Your email password', 'Your social media likes', 'b', 13),
  (14, 'Network Security', 'Which Wi-Fi network is generally safest to use for sensitive tasks?', 'An open network with no password', 'A network you fully trust, or your own mobile hotspot', 'Any network with a strong signal', 'A network named after a well-known brand', 'b', 14),
  (15, 'Network Security', 'What does HTTPS in a URL indicate?', 'The site is definitely legitimate', 'The connection to the site is encrypted', 'The site has no ads', 'The site loads faster', 'b', 15),
  (16, 'Privacy', 'What is the safest approach to app permissions?', 'Grant every permission requested', 'Grant only the permissions the app genuinely needs', 'Never install any apps', 'Grant permissions once, then revoke all of them', 'b', 16),
  (17, 'Privacy', 'Multi-factor authentication (MFA) adds security by:', 'Replacing the need for passwords entirely', 'Requiring a second form of verification beyond your password', 'Making your password visible to trusted apps', 'Slowing down login for everyone', 'b', 17),
  (18, 'Privacy', 'What should you do with software and OS updates?', 'Delay them indefinitely', 'Install them promptly, since they often patch security flaws', 'Only install updates on weekends', 'Ignore update notifications', 'b', 18),
  (19, 'Malware', 'What is a "zero-day" vulnerability?', 'A bug that has existed for zero days', 'A flaw exploited before the vendor has released a fix', 'A password with zero characters', 'An expired security certificate', 'b', 19),
  (20, 'Social Engineering', 'You receive an unexpected USB drive in the mail. You should:', 'Plug it in to see what is on it', 'Give it to IT/security without plugging it in', 'Use it on a personal device instead', 'Throw it away without telling anyone', 'b', 20)
) as v(order_index, topic, question, oa, ob, oc, od, correct);
