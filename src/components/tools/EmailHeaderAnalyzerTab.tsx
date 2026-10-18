import { useState, useId } from "react";
import { Card, Pill } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

interface ParsedHeader {
  from: string;
  to: string;
  subject: string;
  date: string;
  returnPath: string;
  replyTo: string;
  messageId: string;
  spfResult: "pass" | "fail" | "softfail" | "neutral" | "none";
  spfDetails: string;
  dkimResult: "pass" | "fail" | "none";
  dkimDetails: string;
  dmarcResult: "pass" | "fail" | "none";
  dmarcDetails: string;
  hops: Array<{
    hopNumber: number;
    from: string;
    by: string;
    timestamp: string;
    delay?: string;
  }>;
  alignment: {
    fromDomain: string;
    returnPathDomain: string;
    isAligned: boolean;
    notes: string;
  };
  overallVerdict: "AUTHENTICATED & SAFE" | "SUSPICIOUS CONFIGURATION" | "HIGH RISK / SPOOFED";
  tone: "success" | "warn" | "danger";
  redFlags: string[];
}

function extractDomain(emailStr: string): string {
  const match = emailStr.match(/@([a-zA-Z0-9.-]+)/);
  return match ? match[1].toLowerCase().replace(/>$/, "") : "";
}

function parseRawEmailHeaders(raw: string): ParsedHeader | null {
  if (!raw.trim()) return null;

  // Unfold multi-line headers (RFC 822)
  const unfolded = raw.replace(/\r?\n[ \t]+/g, " ");
  const lines = unfolded.split(/\r?\n/);

  const getHeader = (name: string): string => {
    const regex = new RegExp(`^${name}:\\s*(.*)$`, "i");
    for (const line of lines) {
      const match = line.match(regex);
      if (match) return match[1].trim();
    }
    return "";
  };

  const from = getHeader("From");
  const to = getHeader("To");
  const subject = getHeader("Subject");
  const date = getHeader("Date");
  const returnPath = getHeader("Return-Path").replace(/[<>]/g, "");
  const replyTo = getHeader("Reply-To").replace(/[<>]/g, "");
  const messageId = getHeader("Message-ID");

  const authResults = getHeader("Authentication-Results");
  const receivedSpf = getHeader("Received-SPF");

  // SPF Extraction
  let spfResult: ParsedHeader["spfResult"] = "none";
  let spfDetails = "No SPF record or header found";
  if (receivedSpf) {
    if (/^pass/i.test(receivedSpf)) spfResult = "pass";
    else if (/^fail/i.test(receivedSpf)) spfResult = "fail";
    else if (/^softfail/i.test(receivedSpf)) spfResult = "softfail";
    else if (/^neutral/i.test(receivedSpf)) spfResult = "neutral";
    spfDetails = receivedSpf;
  } else if (authResults) {
    const spfMatch = authResults.match(/spf=(pass|fail|softfail|neutral|none)(\s+[^;]+)?/i);
    if (spfMatch) {
      spfResult = spfMatch[1].toLowerCase() as ParsedHeader["spfResult"];
      spfDetails = spfMatch[0];
    }
  }

  // DKIM Extraction
  let dkimResult: ParsedHeader["dkimResult"] = "none";
  let dkimDetails = "No DKIM signature found";
  if (authResults) {
    const dkimMatch = authResults.match(/dkim=(pass|fail|none)(\s+[^;]+)?/i);
    if (dkimMatch) {
      dkimResult = dkimMatch[1].toLowerCase() as ParsedHeader["dkimResult"];
      dkimDetails = dkimMatch[0];
    }
  } else if (getHeader("DKIM-Signature")) {
    dkimResult = "pass";
    dkimDetails = "DKIM-Signature header present in transmission";
  }

  // DMARC Extraction
  let dmarcResult: ParsedHeader["dmarcResult"] = "none";
  let dmarcDetails = "No DMARC evaluation found in headers";
  if (authResults) {
    const dmarcMatch = authResults.match(/dmarc=(pass|fail|none)(\s+[^;]+)?/i);
    if (dmarcMatch) {
      dmarcResult = dmarcMatch[1].toLowerCase() as ParsedHeader["dmarcResult"];
      dmarcDetails = dmarcMatch[0];
    }
  }

  // Hop Path Extraction
  const hops: ParsedHeader["hops"] = [];
  let hopCount = 1;
  for (const line of lines) {
    if (/^Received:\s*/i.test(line)) {
      const fromMatch = line.match(/from\s+([^\s;]+)/i);
      const byMatch = line.match(/by\s+([^\s;]+)/i);
      const dateMatch = line.match(/;\s*([^;]+)$/);

      hops.push({
        hopNumber: hopCount++,
        from: fromMatch ? fromMatch[1] : "Unknown Relay Host",
        by: byMatch ? byMatch[1] : "Target Gateway",
        timestamp: dateMatch ? dateMatch[1].trim() : "Undated Hop",
      });
    }
  }

  // Alignment Evaluation
  const fromDomain = extractDomain(from);
  const returnPathDomain = extractDomain(returnPath);
  const replyToDomain = extractDomain(replyTo);

  const isAligned = Boolean(fromDomain && returnPathDomain && fromDomain === returnPathDomain);
  let alignmentNotes = "Domains are aligned. Envelope sender matches visible From address.";
  if (!returnPathDomain) {
    alignmentNotes = "Return-Path header is missing or unparseable.";
  } else if (!isAligned) {
    alignmentNotes = `MISMATCH: Visible 'From' is @${fromDomain}, but server envelope 'Return-Path' is @${returnPathDomain}. Possible impersonation / spoofing!`;
  }

  // Red Flags and Threat Score
  const redFlags: string[] = [];
  if (spfResult === "fail") {
    redFlags.push("SPF Validation Failed: Sending IP address is NOT authorized by domain owner's SPF record.");
  } else if (spfResult === "softfail") {
    redFlags.push("SPF SoftFail (~all): Sending IP may not be authorized by domain owner.");
  }

  if (dkimResult === "fail") {
    redFlags.push("DKIM Signature Invalid: Message was modified in transit or signed with an invalid cryptographic key.");
  }

  if (dmarcResult === "fail") {
    redFlags.push("DMARC Policy Violation: Neither SPF nor DKIM passed alignment requirements for this sender domain.");
  }

  if (!isAligned && fromDomain && returnPathDomain) {
    redFlags.push(`Sender Domain Spoofing: Visible From (@${fromDomain}) does not match Envelope Return-Path (@${returnPathDomain}).`);
  }

  if (replyToDomain && fromDomain && replyToDomain !== fromDomain) {
    redFlags.push(`Reply-To Divergence: Replies are directed to @${replyToDomain} instead of the apparent sender @${fromDomain}.`);
  }

  let overallVerdict: ParsedHeader["overallVerdict"] = "AUTHENTICATED & SAFE";
  let tone: ParsedHeader["tone"] = "success";

  if (spfResult === "fail" || dmarcResult === "fail" || (!isAligned && fromDomain && returnPathDomain)) {
    overallVerdict = "HIGH RISK / SPOOFED";
    tone = "danger";
  } else if (spfResult === "softfail" || redFlags.length > 0) {
    overallVerdict = "SUSPICIOUS CONFIGURATION";
    tone = "warn";
  }

  return {
    from: from || "(Not specified)",
    to: to || "(Not specified)",
    subject: subject || "(No subject)",
    date: date || "(No date)",
    returnPath: returnPath || "(None)",
    replyTo: replyTo || "(None)",
    messageId: messageId || "(None)",
    spfResult,
    spfDetails,
    dkimResult,
    dkimDetails,
    dmarcResult,
    dmarcDetails,
    hops,
    alignment: {
      fromDomain,
      returnPathDomain,
      isAligned,
      notes: alignmentNotes,
    },
    overallVerdict,
    tone,
    redFlags,
  };
}

const SAMPLE_HEADERS = [
  {
    name: "Spoofed Wire Transfer (SPF Fail & DMARC Reject)",
    raw: `Delivered-To: victim-cfo@enterprise-corp.com
Received: by 2002:a05:6512:1287:b0:4f0:66:b814 with SMTP id d7csp120349lfg;
        Mon, 14 Oct 2024 09:14:22 -0700 (PDT)
X-Received: by 2002:a17:906:14c5:b0:9bf:521b:8219 with SMTP id a21-20020a17090614c500b009bf521b8219mr1348220ejc.52.1728922462210;
        Mon, 14 Oct 2024 09:14:22 -0700 (PDT)
Authentication-Results: mx.google.com;
       spf=fail (google.com: domain of mailer-bot@bulk-spammer.ru does not designate 185.220.101.5 as permitted sender) smtp.mailfrom=mailer-bot@bulk-spammer.ru;
       dkim=none;
       dmarc=fail (p=REJECT sp=REJECT dis=REJECT) header.from=bankofamerica.com
Received-SPF: fail (google.com: domain of mailer-bot@bulk-spammer.ru does not designate 185.220.101.5 as permitted sender) client-ip=185.220.101.5;
Received: from mail-relay.bulk-spammer.ru (mail-relay.bulk-spammer.ru. [185.220.101.5])
        by mx.google.com with ESMTPS id o18-20020a170906801200b009bf65d8c6b7si2491122ejx.121.2024.10.14.09.14.21
        for <victim-cfo@enterprise-corp.com>;
        Mon, 14 Oct 2024 09:14:21 -0700 (PDT)
From: "Bank of America Corporate Alerts" <alerts@bankofamerica.com>
Reply-To: wire-recovery-desk@gmail.com
Return-Path: <mailer-bot@bulk-spammer.ru>
To: <victim-cfo@enterprise-corp.com>
Subject: URGENT: Wire Confirmation #BOA-8921102 - Immediate Action Required
Date: Mon, 14 Oct 2024 16:14:15 +0000
Message-ID: <20241014161415.89211@bulk-spammer.ru>`,
  },
  {
    name: "Legitimate GitHub Security Alert (All Passed)",
    raw: `Delivered-To: developer@cyberguard.dev
Received: by 2002:a05:6838:18c:b0:824:1e1a:468e with SMTP id g12csp839401nkj;
        Tue, 15 Oct 2024 04:30:12 -0700 (PDT)
Authentication-Results: mx.google.com;
       spf=pass (google.com: domain of support@github.com designates 192.30.252.204 as permitted sender) smtp.mailfrom=support@github.com;
       dkim=pass header.i=@github.com header.s=pf2023 header.b=H7gZ2fLm;
       dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=github.com
Received-SPF: pass (google.com: domain of support@github.com designates 192.30.252.204 as permitted sender) client-ip=192.30.252.204;
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=github.com; s=pf2023; t=1728991811;
        h=from:to:subject:date:message-id:mime-version:content-type;
        bh=8XvNqfP3L49u1a8eF92jKlMs/1zGz8V=;
        b=H7gZ2fLmxvP90Kqw21N=
Received: from smtp.github.com (out-21.mta.github.com. [192.30.252.204])
        by mx.google.com with ESMTPS id u11-20020a17090647cb00b009ba7145edc5si321908ejw.209.2024.10.15.04.30.11;
        Tue, 15 Oct 2024 04:30:11 -0700 (PDT)
From: GitHub <support@github.com>
Return-Path: <support@github.com>
To: <developer@cyberguard.dev>
Subject: [GitHub] A personal access token has been generated
Date: Tue, 15 Oct 2024 11:30:08 +0000
Message-ID: <github/cyberguard/commit-alert/202410151130@github.com>`,
  },
  {
    name: "Third-Party Mailer Alignment Mismatch (SPF SoftFail)",
    raw: `Delivered-To: employee@acme-corp.com
Received: by 2002:a05:6512:1287 with SMTP id x90csp120349;
        Wed, 16 Oct 2024 11:05:00 -0700 (PDT)
Authentication-Results: mx.google.com;
       spf=softfail (google.com: domain of transitioning of bounce@newsletter-relay.biz does not designate 198.51.100.44 as permitted sender) smtp.mailfrom=bounce@newsletter-relay.biz;
       dkim=pass header.i=@newsletter-relay.biz;
       dmarc=fail (p=NONE) header.from=acme-corp.com
Received-SPF: softfail (google.com: domain of transition of bounce@newsletter-relay.biz) client-ip=198.51.100.44;
From: HR Department <hr-benefits@acme-corp.com>
Return-Path: <bounce@newsletter-relay.biz>
Reply-To: hr-survey-collector@gmail.com
To: <employee@acme-corp.com>
Subject: Mandatory Open Enrollment: Health Plan Elections Closing Tomorrow
Date: Wed, 16 Oct 2024 18:04:55 +0000
Message-ID: <survey.202410161804.88@newsletter-relay.biz>`,
  },
];

export function EmailHeaderAnalyzerTab() {
  const headerInputId = useId();
  const [rawInput, setRawInput] = useState(SAMPLE_HEADERS[0].raw);
  const [parsed, setParsed] = useState<ParsedHeader | null>(() => parseRawEmailHeaders(SAMPLE_HEADERS[0].raw));

  const handleAnalyze = (content: string) => {
    setParsed(parseRawEmailHeaders(content));
  };

  const loadSample = (sample: typeof SAMPLE_HEADERS[0]) => {
    setRawInput(sample.raw);
    setParsed(parseRawEmailHeaders(sample.raw));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-text-pure">
              Email RFC-822 Header &amp; DMARC / SPF Inspector
            </h3>
            <p className="mt-1 text-xs text-text-fog">
              Inspect email transport headers to verify cryptographic authentication, hop paths, and detect spoofed sender addresses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-text-fog">Presets:</span>
            {SAMPLE_HEADERS.map((s, idx) => (
              <Button
                key={idx}
                variant="secondary"
                size="sm"
                onClick={() => loadSample(s)}
                className="text-xs h-7 px-2"
              >
                {idx === 0 ? "Spoofed Wire Lure" : idx === 1 ? "Authentic GitHub" : "Alignment Mismatch"}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Textarea */}
        <div className="space-y-2">
          <label htmlFor={headerInputId} className="text-xs font-semibold text-text-pure uppercase tracking-wider block">
            Paste Raw Email Headers:
          </label>
          <textarea
            id={headerInputId}
            value={rawInput}
            onChange={(e) => {
              setRawInput(e.target.value);
              handleAnalyze(e.target.value);
            }}
            rows={7}
            placeholder="Paste raw email headers starting with Received:, From:, or Authentication-Results:..."
            className="input w-full font-mono text-[11px] leading-relaxed p-3 rounded-xl resize-y"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-dim">
              Tip: In Gmail, click &quot;More&quot; (three dots) &rarr; &quot;Show original&quot; &rarr; &quot;Copy to clipboard&quot;.
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setRawInput("");
                setParsed(null);
              }}
              className="text-xs h-7"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Analysis Results */}
        <AnimatePresence mode="wait">
          {parsed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pt-4 border-t border-border"
            >
              {/* Overall Security Verdict */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  parsed.tone === "danger"
                    ? "bg-danger/10 border-danger/30 text-danger"
                    : parsed.tone === "warn"
                    ? "bg-warning/10 border-warning/30 text-warning"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface/50 flex items-center justify-center shrink-0">
                    <i
                      className={`ti ${
                        parsed.tone === "danger"
                          ? "ti-shield-x text-xl"
                          : parsed.tone === "warn"
                          ? "ti-alert-circle text-xl"
                          : "ti-shield-check text-xl"
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Security Authentication Verdict</p>
                    <h4 className="font-display font-bold text-base sm:text-lg">{parsed.overallVerdict}</h4>
                  </div>
                </div>

                <Pill tone={parsed.tone === "danger" ? "danger" : parsed.tone === "warn" ? "warn" : "success"}>
                  {parsed.redFlags.length === 0 ? "Passed All Security Checks" : `${parsed.redFlags.length} Security Anomaly Identified`}
                </Pill>
              </div>

              {/* Protocol Triad Cards: SPF, DKIM, DMARC */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* SPF */}
                <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-pure">SPF (Sender Policy)</span>
                    <Pill tone={parsed.spfResult === "pass" ? "success" : parsed.spfResult === "softfail" ? "warn" : "danger"}>
                      {parsed.spfResult.toUpperCase()}
                    </Pill>
                  </div>
                  <p className="text-[11px] text-text-fog break-words leading-relaxed font-mono">
                    {parsed.spfDetails}
                  </p>
                </div>

                {/* DKIM */}
                <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-pure">DKIM (Digital Sig)</span>
                    <Pill tone={parsed.dkimResult === "pass" ? "success" : parsed.dkimResult === "fail" ? "danger" : "default"}>
                      {parsed.dkimResult.toUpperCase()}
                    </Pill>
                  </div>
                  <p className="text-[11px] text-text-fog break-words leading-relaxed font-mono">
                    {parsed.dkimDetails}
                  </p>
                </div>

                {/* DMARC */}
                <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-pure">DMARC Alignment</span>
                    <Pill tone={parsed.dmarcResult === "pass" ? "success" : parsed.dmarcResult === "fail" ? "danger" : "default"}>
                      {parsed.dmarcResult.toUpperCase()}
                    </Pill>
                  </div>
                  <p className="text-[11px] text-text-fog break-words leading-relaxed font-mono">
                    {parsed.dmarcDetails}
                  </p>
                </div>
              </div>

              {/* Domain Alignment Inspection */}
              <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-text-pure flex items-center gap-1.5">
                  <i className="ti ti-arrows-diff text-sm" aria-hidden="true" /> Domain Alignment &amp; Spoofing Check
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-surface border border-border">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-dim block">Visible &quot;From&quot; Domain</span>
                    <span className="font-mono text-text-pure font-bold">@{parsed.alignment.fromDomain || "Unknown"}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-surface border border-border">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-dim block">Envelope &quot;Return-Path&quot; Domain</span>
                    <span className="font-mono text-text-pure font-bold">@{parsed.alignment.returnPathDomain || "None"}</span>
                  </div>
                </div>

                <div className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                  parsed.alignment.isAligned ? "bg-emerald-500/10 text-emerald-400" : "bg-danger/10 text-danger"
                }`}>
                  <i className={`ti ${parsed.alignment.isAligned ? "ti-check" : "ti-alert-triangle"} mt-0.5 shrink-0`} aria-hidden="true" />
                  <span>{parsed.alignment.notes}</span>
                </div>
              </div>

              {/* Red Flags List */}
              {parsed.redFlags.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-danger flex items-center gap-1.5">
                    <i className="ti ti-flag text-sm" aria-hidden="true" /> Red Flags &amp; Vulnerabilities
                  </h5>
                  <ul className="space-y-2" aria-label="Detected email red flags">
                    {parsed.redFlags.map((flag, idx) => (
                      <li
                        key={idx}
                        className="text-xs p-3 rounded-xl bg-danger/5 border border-danger/20 text-danger flex items-start gap-2.5"
                      >
                        <i className="ti ti-x mt-0.5 shrink-0" aria-hidden="true" />
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Relay Hop Path */}
              {parsed.hops.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-text-fog flex items-center gap-1.5">
                    <i className="ti ti-route text-sm" aria-hidden="true" /> Transmission Relay Hops ({parsed.hops.length} servers traversed)
                  </h5>
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface text-text-dim border-b border-border text-[10px] uppercase tracking-wider">
                        <tr>
                          <th className="p-2.5">Hop</th>
                          <th className="p-2.5">Transmitted From</th>
                          <th className="p-2.5">Received By</th>
                          <th className="p-2.5">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {parsed.hops.map((hop) => (
                          <tr key={hop.hopNumber} className="hover:bg-surface/50">
                            <td className="p-2.5 font-bold font-mono text-primary">#{hop.hopNumber}</td>
                            <td className="p-2.5 font-mono text-text-pure text-[11px] break-all">{hop.from}</td>
                            <td className="p-2.5 font-mono text-text-fog text-[11px] break-all">{hop.by}</td>
                            <td className="p-2.5 text-text-dim text-[11px] whitespace-nowrap">{hop.timestamp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
