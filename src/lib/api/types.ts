import type { Permission } from "@/lib/auth/permissions";

export type UserRole =
  | "PATIENT"
  | "PSYCHOLOGIST"
  | "CLINICAL_SUPERVISOR"
  | "SUPERVISOR"
  | "ADMIN";

export type DocumentType = "CC" | "CE" | "PASSPORT" | "TI" | "OTHER";
export type Gender = "MALE" | "FEMALE" | "NON_BINARY" | "PREFER_NOT_SAY" | "OTHER";
export type EmergencyAlertType =
  | "SUICIDAL_RISK"
  | "HOMICIDAL_RISK"
  | "DOMESTIC_VIOLENCE"
  | "CHILD_ABUSE"
  | "EMERGENCY";
export type EmergencyAlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AuthUser {
  id: string;
  alias?: string;
  role: UserRole;
  permissions?: string[];
  /** Compatibilidad con respuestas antiguas */
  email?: string;
  roles?: UserRole[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
  patient?: { alias: string };
}

export interface RegisterPatientResponse {
  userId: string;
  alias: string;
  created: boolean;
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

export interface RegisterPsychologistResponse {
  userId: string;
  verificationStatus: string;
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

/** Contrato GET /auth/me — mapeado desde GET /users/me */
export interface SessionUser {
  id: string;
  alias: string | null;
  role: UserRole;
  roles: UserRole[];
  profile: UserMe;
  permissions: Permission[];
}

export interface ProfileSummary {
  displayName: string | null;
  alias: string | null;
  imageUrl: string | null;
  verificationStatus: string | null;
  planName: string | null;
}

export interface DashboardData {
  appointments: AppointmentItem[];
  notifications: NotificationItem[];
  upcomingEvents: AppointmentItem[];
  profileSummary: ProfileSummary;
  recommendedPsychologists?: DirectoryPsychologist[];
  stats?: PsychologistStats;
  communityPosts?: CommunityPost[];
}

export interface SensitiveProfile {
  email: string;
  name: string | null;
  phone: string | null;
  alias?: string | null;
  unlockToken?: string;
  unlockExpiresInMinutes?: number;
  documentType?: string | null;
  documentNumber?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  emergencyContact?: string | null;
  city?: string | null;
  country?: string | null;
  bio?: string | null;
  licenseNumber?: string | null;
  consultationReason?: string | null;
  psychologicalHistory?: string | null;
  psychiatricHistory?: string | null;
  currentMedication?: string | null;
  selfReportedRiskLevel?: string | null;
}

export interface EditableProfile {
  city?: string;
  country?: string;
  phone?: string;
  name?: string;
  imageUrl?: string;
  bio?: string;
  licenseNumber?: string;
  documentNumber?: string;
  birthDate?: string;
  gender?: string;
  consultationReason?: string;
  psychologicalHistory?: string;
  psychiatricHistory?: string;
  currentMedication?: string;
  selfReportedRiskLevel?: string;
  emergencyContact?: string;
}

export interface PsychologistDetail extends DirectoryPsychologist {
  bio?: string | null;
  availabilityRules?: AvailabilityRule[];
}

export interface AvailabilityRule {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface AvailabilitySlot {
  id: string;
  startAt: string;
  endAt: string;
  isBooked: boolean;
}

export interface CreateAppointmentBody {
  psychologistId: string;
  slotId?: string;
  startAt: string;
  endAt: string;
  modality?: "ONLINE" | "IN_PERSON";
  notes?: string;
  timezone?: string;
}

export type EmotionalState =
  | "BIEN"
  | "SOBRECARGADO"
  | "TRISTE"
  | "ANSIOSO"
  | "DESBORDADO";

export interface BookSessionFormData {
  accompanimentReason: string;
  description: string;
  modality: "ONLINE" | "IN_PERSON" | null;
  emotionalState: EmotionalState | "";
}

export interface AvailabilityDateGroup {
  date: string;
  slots: AvailabilitySlot[];
}

export interface PsychologistAvailabilityResponse {
  dates: AvailabilityDateGroup[];
}

export interface FavoritePsychologistItem {
  id: string;
  psychologistId: string;
  psychologist: RecommendedPsychologist;
  createdAt: string;
}

export interface FavoritesResponse {
  items: FavoritePsychologistItem[];
}

export interface CreatePostBody {
  type?: CommunityPostType;
  title?: string;
  content: string;
  isAnonymized?: boolean;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

export interface RecommendedPsychologist extends DirectoryPsychologist {
  nextAvailableAt?: string | null;
  nextAvailable?: string | null;
}

export interface RecommendationsResponse {
  specialties?: string[];
  psychologists?: RecommendedPsychologist[];
}

export interface DirectoryPsychologist {
  id: string;
  slug: string;
  name: string | null;
  image: string | null;
  title: string | null;
  specialties: string[];
  specialtyCodes?: string[];
  city: string | null;
  ratingAvg: number;
  ratingCount: number;
  priceCents: number;
  currency: string;
  modalityOnline: boolean;
  modalityInPerson: boolean;
  yearsExperience: number | null;
  languages: string[];
  verified: boolean;
}

export interface DirectoryListResponse {
  items: DirectoryPsychologist[];
  meta: PaginatedMeta;
}

export interface PatientProfile {
  alias: string;
  city: string | null;
  country: string;
  gender: Gender | null;
  consultationReason: string | null;
  psychologicalHistory: string | null;
  psychiatricHistory: string | null;
  currentMedication: string | null;
  selfReportedRiskLevel: string | null;
  birthDate: string | null;
}

export interface UserMe {
  id: string;
  alias?: string | null;
  email?: string;
  name?: string | null;
  phone?: string | null;
  imageUrl: string | null;
  userRoles: { role: UserRole }[];
  patient?: PatientProfile | null;
  psychologist?: {
    verificationStatus: string;
    slug: string;
    isActive: boolean;
    ratingAvg: number;
  } | null;
  subscription?: {
    status: string;
    plan: { code: string; name: string; tier: string };
  } | null;
}

export interface PatientPsychologistView {
  id: string;
  alias: string;
  age: number | null;
  city: string | null;
  department?: string | null;
  gender: Gender | null;
  consultationReason: string | null;
  wellbeingFeeling?: string | null;
  workOnFocus?: string | null;
  lastAppointmentAt?: string;
  totalAppointments?: number;
}

export interface PatientClinicalProfile extends PatientPsychologistView {
  psychologicalHistory: string | null;
  psychiatricHistory: string | null;
  currentMedication: string | null;
  selfReportedRiskLevel: string | null;
  clinicalTags: string[];
}

export interface AppointmentPatientView {
  id: string;
  alias: string;
  age?: number | null;
  city?: string | null;
  department?: string | null;
  gender?: Gender | null;
  consultationReason?: string | null;
  wellbeingFeeling?: string | null;
  workOnFocus?: string | null;
}

export interface AppointmentItem {
  id: string;
  status: string;
  modality: string;
  startAt: string;
  endAt: string;
  proposedStartAt?: string | null;
  proposedEndAt?: string | null;
  hasRescheduleProposal?: boolean;
  notes?: string | null;
  cancelReason?: string | null;
  cancelledAt?: string | null;
  psychologist?: {
    user: { name: string | null; imageUrl: string | null };
  };
  patient?: AppointmentPatientView;
  payment?: { status: string; amountCents: number } | null;
}

export type VideoParticipantRole =
  | "PATIENT"
  | "PSYCHOLOGIST"
  | "SUPERVISOR"
  | "OBSERVER";

export interface AppointmentVideoStatus {
  configured: boolean;
  roomName: string;
  role: VideoParticipantRole;
  canShareScreen: boolean;
  sessionEnded: boolean;
  appointment: {
    id: string;
    status: string;
    modality: string;
    startAt: string;
    endAt: string;
    peerName: string;
    selfName: string;
  };
}

export interface AppointmentVideoToken {
  token: string;
  url: string;
  roomName: string;
  identity: string;
  role: VideoParticipantRole;
  canShareScreen: boolean;
  configured: boolean;
  appointment: {
    id: string;
    status: string;
    startAt: string;
    endAt: string;
    peerName: string;
    selfName: string;
  };
}

export interface PsychologistStats {
  todayAppointments: number;
  monthRevenue: number;
  ratingAvg: number;
  ratingCount: number;
  activePatients: number;
}

export type CommunityPostType =
  | "CASE"
  | "ARTICLE"
  | "DEBATE"
  | "EVENT"
  | "RESOURCE";

export interface CommunityPost {
  id: string;
  type: CommunityPostType | string;
  title: string | null;
  content: string;
  isAnonymized: boolean;
  publishedAt: string | null;
  author: { id: string; name: string | null; imageUrl: string | null };
  _count?: { reactions: number; comments: number; bookmarks?: number };
  viewerInterested?: boolean;
}

export interface CommunityReactionResult {
  reacted: boolean;
  type?: string | null;
  count: number;
}

export interface CommunityComment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  createdAt: string;
  parentId?: string | null;
}

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  tier: string;
  description: string | null;
  priceCents: number;
  currency: string;
  features: Record<string, unknown> | null;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface EmergencyAlertResponse {
  id: string;
  type: EmergencyAlertType;
  severity: EmergencyAlertSeverity;
  status: string;
  patientAlias: string;
  message: string;
  createdAt: string;
}

/** Mensajería — escuchadero (paciente) y citas (psicólogo) */

export type ChatMessageSender = "PATIENT" | "PSYCHOLOGIST" | "AI" | "SYSTEM";

export type ChatChannelType = "SUPPORT" | "APPOINTMENT";

export interface ChatMessage {
  id: string;
  content: string;
  sender: ChatMessageSender;
  createdAt: string;
  readAt?: string | null;
}

export interface SupportChatSession {
  id: string;
  psychologistId: string | null;
  psychologistName: string | null;
  status: "ACTIVE" | "CLOSED";
  createdAt: string;
}

export interface SupportInboxSession {
  id: string;
  patientId: string;
  patientAlias: string;
  status: "ACTIVE" | "CLOSED";
  caseStatus: "NORMAL" | "SEGUIMIENTO" | "RIESGO" | "EMERGENCIA" | "CERRADO";
  currentRiskLevel: number | null;
  lastMessage: ChatMessage | null;
  unreadCount: number;
  updatedAt: string;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  type: ChatChannelType;
  patientId: string;
  patientAlias: string;
  psychologistId: string;
  appointmentId: string | null;
  hasActiveAppointment: boolean;
  lastMessage: ChatMessage | null;
  unreadCount: number;
  updatedAt: string;
}

export interface SendChatMessageBody {
  content: string;
}

export interface SetTypingBody {
  isTyping: boolean;
}

export interface ChatTypingStatus {
  peerTyping: boolean;
}

export interface AiChatAssistBody {
  conversationId: string;
  prompt?: string;
}

export interface AiChatAssistResponse {
  content: string;
  disclaimer?: string;
}
