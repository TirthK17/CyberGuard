/**
 * CyberGuard Contact & Feedback API
 * Securely captures visitor & user bug reports, feature suggestions,
 * and security disclosures for Administrator review.
 */

export type ContactCategory = "bug" | "suggestion" | "vulnerability" | "inquiry";
export type ContactUrgency = "low" | "medium" | "high" | "critical";
export type ContactStatus = "unread" | "reviewed" | "in-progress" | "resolved";

export interface ContactMessage {
  id: string;
  category: ContactCategory;
  urgency: ContactUrgency;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  created_at: string;
  admin_notes?: string;
  user_id?: string | null;
}

export interface CreateContactInput {
  name: string;
  email: string;
  category: ContactCategory;
  urgency?: ContactUrgency;
  subject: string;
  message: string;
  userId?: string | null;
}

const STORAGE_KEY = "cyberguard_contact_messages_v1";

const INITIAL_MESSAGES: ContactMessage[] = [
  {
    id: "MSG-2026-91823",
    category: "vulnerability",
    urgency: "critical",
    name: "Devendra Patel",
    email: "dev.patel@shieldsec.in",
    subject: "Emerging fake banking APK impersonating SBI YONO on Telegram",
    message:
      "Hello Security Team, I observed a new malicious APK being circulated on Telegram groups that mimics the latest SBI YONO interface. It requests SMS read permissions to siphon OTPs. Can we add a simulation drill for this scam?",
    status: "unread",
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    admin_notes: "",
  },
  {
    id: "MSG-2026-84512",
    category: "suggestion",
    urgency: "medium",
    name: "Priya Nair",
    email: "priya.nair@community.org",
    subject: "Proposal for AI voice clone & senior citizen protection drill",
    message:
      "Hi Kavach team, love the platform! Many senior citizens in our residential society are receiving panicked calls claiming their grandson is in police custody (voice cloning). A dedicated lesson or audio-based simulation would be incredibly high impact.",
    status: "reviewed",
    created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
    admin_notes: "Forwarded to curriculum authoring queue.",
  },
  {
    id: "MSG-2026-72091",
    category: "bug",
    urgency: "low",
    name: "Aarav Gupta",
    email: "aarav.g@defender.io",
    subject: "Quiz question #3 explanation typo in Module 2",
    message:
      "Found a minor typo in Module 2 (Phishing Detection) Quiz #3 explanation: 'diferent' instead of 'different'. Small issue but wanted to report for perfection!",
    status: "resolved",
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    admin_notes: "Fixed typo in question database.",
  },
];

function getStoredMessages(): ContactMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MESSAGES));
      return INITIAL_MESSAGES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MESSAGES;
  }
}

function saveMessages(messages: ContactMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (err) {
    console.error("Failed to save contact messages:", err);
  }
}

export const contactApi = {
  /**
   * Submit a new contact message, bug report, or suggestion
   */
  async submitMessage(input: CreateContactInput): Promise<ContactMessage> {
    const messages = getStoredMessages();
    const randomHex = Math.floor(10000 + Math.random() * 90000);
    const newId = `MSG-2026-${randomHex}`;

    const newRecord: ContactMessage = {
      id: newId,
      category: input.category,
      urgency: input.urgency || "medium",
      name: input.name.trim(),
      email: input.email.trim(),
      subject: input.subject.trim(),
      message: input.message.trim(),
      status: "unread",
      created_at: new Date().toISOString(),
      user_id: input.userId ?? null,
    };

    const updated = [newRecord, ...messages];
    saveMessages(updated);
    return newRecord;
  },

  /**
   * Admin-only retrieval of all submitted feedback & bug reports
   */
  async getAllMessages(): Promise<ContactMessage[]> {
    return getStoredMessages();
  },

  /**
   * Admin status update (e.g. unread -> reviewed -> resolved)
   */
  async updateStatus(
    id: string,
    status: ContactStatus,
    adminNotes?: string
  ): Promise<ContactMessage | null> {
    const messages = getStoredMessages();
    const idx = messages.findIndex((m) => m.id === id);
    if (idx === -1) return null;

    messages[idx] = {
      ...messages[idx],
      status,
      ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}),
    };

    saveMessages(messages);
    return messages[idx];
  },

  /**
   * Admin delete message
   */
  async deleteMessage(id: string): Promise<void> {
    const messages = getStoredMessages();
    const filtered = messages.filter((m) => m.id !== id);
    saveMessages(filtered);
  },

  /**
   * Get unread count for badges and notifications
   */
  async getUnreadCount(): Promise<number> {
    const messages = getStoredMessages();
    return messages.filter((m) => m.status === "unread").length;
  },
};
