# CyberGuard Data Model & Storage Schema

## 1. Overview
CyberGuard stores data in browser `localStorage` under structured tables managed by `src/lib/localDb.ts`. When connected to Supabase via environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), the same tables map directly to PostgreSQL tables in `supabase/schema.sql`.

---

## 2. Table Specifications

### 2.1 `profiles`
Represents user credentials, role, level, and cumulative experience points.
| Column | Type | Description |
|---|---|---|
| `id` | `UUID` | Primary key (`crypto.randomUUID()`) |
| `email` | `text` | Unique user email address |
| `full_name` | `text` | User display name |
| `password_hash` | `text` | Salted SHA-256 hash (`salt$hash`) |
| `role` | `"user" \| "admin"` | Access level; only admins can modify roles |
| `level` | `number` | Derived level from points (1 to 5) |
| `points` | `number` | Cumulative XP earned |
| `awareness_score` | `number` | Current composite safety index (0 to 100) |
| `created_at` | `timestamptz` | Account creation timestamp |

### 2.2 `modules` (Courses)
High-level curriculum topics.
| Column | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `title` | `text` | Course title |
| `slug` | `string` | URL-safe slug |
| `description` | `text` | Course synopsis |
| `category` | `string` | e.g. `phishing`, `password_security`, `network_safety` |
| `icon` | `string` | Tabler icon class |
| `lessons_count`| `number` | Total lessons contained |

### 2.3 `lessons`
Individual interactive defense lessons.
| Column | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `course_id` | `string` | Foreign key referencing `modules.id` |
| `title` | `text` | Lesson title |
| `content` | `text` | Markdown / formatted lesson instruction |
| `order_index` | `number` | Sequence order within course |
| `points` | `number` | XP awarded upon completion (e.g. 15 XP) |

### 2.4 `quizzes` & `questions`
Knowledge checks evaluating lesson comprehension.
| Column | Type | Description |
|---|---|---|
| `id` | `string` | Unique quiz ID |
| `title` | `text` | Quiz title |
| `category` | `string` | Category tag |
| `questions` | `JSON[]` | Array of `{ id, text, options: string[], answer: number, explanation: string }` |

### 2.5 `simulations`
Attack sandboxes with interactive decision paths.
| Column | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `slug` | `string` | e.g. `phishing-email`, `ransomware-containment`, `upi-collect-scam` |
| `title` | `text` | Scenario name |
| `category` | `string` | Threat category |
| `points` | `number` | Max XP available (proportional to score) |

### 2.6 `certificates`
Cryptographically verified completion certificates.
| Column | Type | Description |
|---|---|---|
| `id` | `string` | Stable ID format `CG-YYYY-XXXXX` |
| `user_id` | `UUID` | Foreign key referencing `profiles.id` |
| `full_name` | `text` | Certificate recipient name |
| `score` | `number` | Passing assessment score (>= 61%) |
| `issued_at` | `timestamptz` | Permanent timestamp of issue date |

### 2.7 `activity_logs`
Idempotent audit record for gamification awards.
| Column | Type | Description |
|---|---|---|
| `id` | `UUID` | Unique log entry ID |
| `user_id` | `UUID` | User who performed action |
| `action` | `string` | Action type union (e.g. `lesson_completed`, `hygiene_check`) |
| `points_earned` | `number` | XP awarded |
| `meta` | `JSON` | Stores `refId` to ensure awards are strictly one-time |
| `created_at` | `timestamptz` | Event timestamp |

### 2.8 `incident_reports`
User incident submissions and containment records.
| Column | Type | Description |
|---|---|---|
| `id` | `string` | Incident record ID |
| `user_id` | `UUID` | Submitting user ID |
| `category` | `string` | Incident classification |
| `status` | `string` | e.g. `draft`, `submitted`, `contained` |
| `details` | `JSON` | Form values and uploaded evidence attachments |
