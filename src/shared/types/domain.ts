/**
 * Modul mapper'lari qaytaradigan domen modellari.
 *
 * Bular qatlamlararo shartnoma: `widgets` va `pages` shu tiplarga tayanadi,
 * `modules/*_/lib/*.mappers` esa aynan shu shaklni ishlab chiqaradi.
 * Modullar TS'ga ko'chgach, mapper'lar shu tiplarni qaytish qiymati sifatida e'lon qiladi.
 */

export type AvatarTone = "violet" | "blue" | "emerald" | "amber" | "rose";

/** Chat qobig‘i qaysi rol uchun render qilinayotgani. */
export type ConversationRole = "teacher" | "student";

// ─── Foydalanuvchi ──────────────────────────────────────────────────────────
export interface DomainUser {
  id: string;
  username: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  phone?: string | null;
  inviteCode?: string | null;
  avatarTone?: string;
  status?: string;
}

// ─── Suhbat / xabar ─────────────────────────────────────────────────────────
/** Backend `DirectStatusEnum`: pending | active | blocked. */
export type DirectStatus = "pending" | "active" | "blocked";

export interface ConversationParticipant {
  id: string;
  username: string;
  name: string;
  phone: string | null;
}

export type PresenceStatus = "online" | "offline";

export interface Conversation {
  id: string;
  type: "group" | "direct";
  kind: "course" | "direct";
  courseId: string | null;
  title: string;
  participantId: string | null;
  participant: ConversationParticipant | null;
  directStatus: DirectStatus | null;
  lastMessage: string;
  lastSender: string | null;
  updatedAt: string;
  unreadCount: number;
  status: PresenceStatus;
  typing: boolean;
  typingName?: string | null;
  avatarTone: string;
  memberCount: number;
  /** `GroupWorkspace` kurs ma'lumoti bilan to'ldiradi. */
  subject?: string;
  description?: string;
}

export interface MessageReply {
  author: string;
  text: string;
}

export interface SendMessagePayload {
  text: string;
  replyTo?: MessageReply;
  attachment?: unknown;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  text: string;
  replyTo?: MessageReply;
  type: string;
  createdAt: string;
  status: string;
  pending: boolean;
  failed: boolean;
  editedAt?: string | null;
  retryPayload?: SendMessagePayload;
  /** Backend hozircha reaksiyani qo‘llamaydi — maydon kelajak uchun ochiq qoldirilgan. */
  reactions?: MessageReaction[];
}

// ─── Kurs ───────────────────────────────────────────────────────────────────
export interface Course {
  id: string;
  title: string;
  subject: string;
  description: string;
  teacher: string;
  teacherUser: DomainUser | null;
  students: number;
  studentCount: number;
  status: string;
  enrollmentStatus: string | null;
  isActive: boolean;
  createdAt: string | null;
  color: string;
}

export type EnrollmentStatus = "pending" | "approved" | "declined";

export interface Enrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  student: DomainUser;
  status: EnrollmentStatus;
  createdAt: string;
}

/** `search-students` natijasi — kursdagi holati bilan. */
export interface CourseStudentSearchResult extends DomainUser {
  enrollStatus: EnrollmentStatus | null;
}

// ─── Dars ───────────────────────────────────────────────────────────────────
export type LessonStatus = "scheduled" | "live" | "finished" | "cancelled";

/** `processing` — egress hali MP4 ni yozib tugatmagan. */
export type LessonRecordingStatus = "ready" | "processing" | "failed";

/**
 * Dars video yozuvi (docs/PROJECT.md §10). Havola muddatli va imzolangan —
 * doimiy URL yo'q, shuning uchun `streamUrl` ni saqlab qo'yish mumkin emas.
 */
export interface LessonRecording {
  status: LessonRecordingStatus;
  title: string;
  streamUrl: string | null;
  durationSeconds: number;
  sizeBytes: number;
  createdAt: string | null;
  expiresAt: string | null;
}

export interface Lesson {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  topic: string;
  startsAt: string;
  durationMinutes: number;
  duration: number;
  status: LessonStatus;
  roomName: string;
  createdAt: string;
  date: string;
  time: string;
}

export interface LessonFormValues {
  topic: string;
  date: string;
  time: string;
  duration: number;
}

// ─── Uy vazifasi ────────────────────────────────────────────────────────────
export type SubmissionStatus = "checking" | "done" | "error";

export interface AiQuestion {
  questionNumber?: number;
  question?: string;
  studentAnswer?: string;
  expectedSolution?: string;
  analysis?: string;
  mistakes?: unknown[];
  errorCategories?: unknown[];
  correctAnswer?: string;
  suggestions?: unknown[];
  difficulty?: string;
  score?: number | null;
}

export interface AiSummary {
  strengths: unknown[];
  weaknesses: unknown[];
  topicsToReview: unknown[];
  recommendations: unknown[];
}

export interface AiResult {
  overallScore: number | null;
  grade: string;
  questions: AiQuestion[];
  summary: AiSummary | null;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  fileName: string;
  status: SubmissionStatus;
  overallScore: number | null;
  grade: string;
  error: string;
  isLate: boolean;
  createdAt: string;
  checkedAt: string | null;
  result: AiResult | null;
}

export interface AssignmentStats {
  studentsCount: number | null;
  submittedCount: number | null;
  averageScore: number | null;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseTitle: string;
  subject: string;
  title: string;
  description: string;
  body: string;
  attachmentName: string;
  hasAttachment: boolean;
  dueAt: string | null;
  skillKey: string;
  createdAt: string;
  submissionsCount: number | null;
  mySubmission: Submission | null;
  submissions: Submission[];
  stats: AssignmentStats | null;
}

export interface AssignmentFormValues {
  title: string;
  description: string;
  body?: string;
  dueAt?: string;
  skillKey?: string;
  extraInstructions?: string;
  file?: File | null;
}

// ─── Davomat ────────────────────────────────────────────────────────────────

/** O'quvchi dars oynasidan chiqib turgan bitta oraliq. */
export interface FocusExit {
  leftAt: string;
  /** `null` — dars tugaguncha qaytmagan. */
  returnedAt: string | null;
  seconds: number;
}

/**
 * Fokus jurnali (docs/PROJECT.md §10) — ota-ona "necha marta chiqdi va
 * har safar qancha turdi" degan savolga shu yerdan javob oladi.
 */
export interface FocusJournal {
  exits: number;
  awaySeconds: number;
  longestSeconds: number;
  timeline: FocusExit[];
}

export interface AttendanceRow {
  id: string;
  lessonId: string;
  lesson: string;
  studentId: string;
  student: DomainUser;
  child: string;
  joinedAt: string | null;
  leftAt: string | null;
  entered: string;
  exited: string;
  minutes: number;
  duration: string;
  attentionTotal: number;
  attentionAnswered: number;
  focus: FocusJournal;
  status: "completed" | "active";
}
