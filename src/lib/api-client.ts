import { permissionsFromRoles } from "@/lib/auth/permissions";
import type {
  AppointmentItem,
  AppointmentVideoStatus,
  AppointmentVideoToken,
  AuthResponse,
  AvailabilityRule,
  AvailabilitySlot,
  BookSessionFormData,
  CommunityPost,
  CommunityComment,
  CommunityReactionResult,
  CreateAppointmentBody,
  CreatePostBody,
  DashboardData,
  DirectoryListResponse,
  EditableProfile,
  AiChatAssistBody,
  AiChatAssistResponse,
  ChatConversation,
  ChatMessage,
  ChatTypingStatus,
  EmergencyAlertResponse,
  EmergencyAlertSeverity,
  EmergencyAlertType,
  FavoritePsychologistItem,
  SendChatMessageBody,
  SetTypingBody,
  SupportChatSession,
  SupportInboxSession,
  FavoritesResponse,
  NotificationItem,
  PatientClinicalProfile,
  PatientProfile,
  PatientPsychologistView,
  ProfileSummary,
  PsychologistAvailabilityResponse,
  PsychologistDetail,
  PsychologistStats,
  RecommendationsResponse,
  RegisterPatientResponse,
  RegisterPsychologistResponse,
  SensitiveProfile,
  SessionUser,
  SubscriptionPlan,
  UserMe,
  UserRole,
} from "./api/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string;
}

interface ApiEnvelope<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

function parseErrorMessage(data: unknown, status: number): string {
  if (!data || typeof data !== "object") return `Error ${status}`;
  const d = data as { message?: string | string[]; errors?: string[] };
  if (Array.isArray(d.errors) && d.errors.length > 0) return d.errors.join(", ");
  if (Array.isArray(d.message)) return d.message.join(", ");
  if (typeof d.message === "string" && d.message.length > 0) return d.message;
  return `Error ${status}`;
}

function unwrapApiResponse<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
}

export function normalizeAuthUser(user: AuthResponse["user"]): AuthResponse["user"] {
  const roles = user.roles ?? [user.role];
  return { ...user, roles };
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, token, headers, ...rest } = options;

  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(parseErrorMessage(data, res.status), res.status, data);
  }

  return unwrapApiResponse<T>(data);
}

interface AuthMeResponse {
  id: string;
  alias: string;
  role: UserRole;
  permissions: string[];
}

function toSessionUser(me: UserMe): SessionUser {
  const roles = me.userRoles.map((r) => r.role);
  const primaryRole: UserRole =
    roles.find((r) => r === "ADMIN") ??
    roles.find(
      (r) =>
        r === "PSYCHOLOGIST" ||
        r === "CLINICAL_SUPERVISOR" ||
        r === "SUPERVISOR",
    ) ??
    "PATIENT";

  return {
    id: me.id,
    alias: me.patient?.alias ?? null,
    role: primaryRole,
    roles,
    profile: me,
    permissions: permissionsFromRoles(roles),
  };
}

function toSessionUserFromAuthMe(
  authMe: AuthMeResponse,
  profile: UserMe,
): SessionUser {
  const roles = profile.userRoles.map((r) => r.role);
  return {
    id: authMe.id,
    alias: profile.patient?.alias ?? authMe.alias ?? null,
    role: authMe.role,
    roles,
    profile,
    permissions: permissionsFromRoles(roles),
  };
}

function toProfileSummary(me: UserMe): ProfileSummary {
  return {
    displayName: me.name ?? me.alias ?? null,
    alias: me.patient?.alias ?? me.alias ?? null,
    imageUrl: me.imageUrl,
    verificationStatus: me.psychologist?.verificationStatus ?? null,
    planName: me.subscription?.plan?.name ?? null,
  };
}

const registerPatientBody = (body: {
  fullName: string;
  documentType?: string;
  documentNumber?: string;
  birthDate?: string;
  gender?: string;
  country?: string;
  department?: string;
  city?: string;
  addressLine?: string;
  email: string;
  phone?: string;
  emergencyContact?: string;
  emergencyContactDetail?: {
    name: string;
    phone: string;
    relationship: string;
    email?: string;
  };
  password: string;
  consultationReason?: string;
  psychologicalHistory?: string;
  psychiatricHistory?: string;
  currentMedication?: string;
  selfReportedRiskLevel?: string;
  wellbeingFeeling?: string;
  workOnFocus?: string;
  workOnOther?: string;
  priorSupport?: boolean;
  priorSupportDetail?: string;
  importantMentalHealthInfo?: string;
  acceptTerms?: boolean;
}) => ({
  name: body.fullName,
  email: body.email,
  password: body.password,
  role: "PATIENT" as const,
  documentType: body.documentType,
  documentNumber: body.documentNumber,
  birthDate: body.birthDate,
  gender: body.gender,
  country: body.country,
  department: body.department,
  city: body.city,
  addressLine: body.addressLine,
  phone: body.phone,
  emergencyContact: body.emergencyContact,
  emergencyContactDetail: body.emergencyContactDetail,
  consultationReason: body.consultationReason,
  psychologicalHistory: body.psychologicalHistory,
  psychiatricHistory: body.psychiatricHistory,
  currentMedication: body.currentMedication,
  selfReportedRiskLevel: body.selfReportedRiskLevel,
  wellbeingFeeling: body.wellbeingFeeling,
  workOnFocus: body.workOnFocus,
  workOnOther: body.workOnOther,
  priorSupport: body.priorSupport,
  priorSupportDetail: body.priorSupportDetail,
  importantMentalHealthInfo: body.importantMentalHealthInfo,
  acceptTerms: body.acceptTerms ?? true,
});

export const api = {
  health: () => apiRequest<{ status: string }>("/health"),

  auth: {
    /** POST /auth/login */
    login: (body: { email: string; password: string }) =>
      apiRequest<AuthResponse>("/auth/login", { method: "POST", body }),

    /** GET /auth/check-email?email= — requiere backend */
    checkEmailAvailable: (email: string) =>
      apiRequest<{ available: boolean }>(
        `/auth/check-email?email=${encodeURIComponent(email)}`,
      ),

    /** POST /auth/register/patient → POST /auth/register */
    registerPatient: (body: Parameters<typeof registerPatientBody>[0]) =>
      apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: registerPatientBody(body),
      }).then(
        (res): RegisterPatientResponse => ({
          userId: res.user.id,
          alias: (res as { alias?: string }).alias ?? res.user.alias ?? res.patient?.alias ?? "",
          created: true,
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          user: normalizeAuthUser(res.user),
        }),
      ),

    /** POST /auth/register/psychologist → POST /auth/register */
    registerPsychologist: (body: {
      fullName: string;
      email: string;
      password: string;
      phone?: string;
      city?: string;
      country?: string;
      department?: string;
      addressLine?: string;
      specialty?: string;
      specialtyCode?: string;
      specialtyOther?: string;
      bio?: string;
      licenseNumber?: string;
      acceptTerms?: boolean;
      workExperiences?: {
        companyName: string;
        roleTitle: string;
        startDate: string;
        endDate?: string;
      }[];
    }) =>
      apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: {
          name: body.fullName,
          email: body.email,
          password: body.password,
          role: "PSYCHOLOGIST",
          phone: body.phone,
          city: body.city,
          country: body.country,
          department: body.department,
          addressLine: body.addressLine,
          specialty: body.specialty,
          specialtyCode: body.specialtyCode,
          specialtyOther: body.specialtyOther,
          bio: body.bio,
          licenseNumber: body.licenseNumber,
          acceptTerms: body.acceptTerms ?? true,
          workExperiences: body.workExperiences,
        },
      }).then(
        (res): RegisterPsychologistResponse => ({
          userId: res.user.id,
          verificationStatus: "PENDING",
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          user: normalizeAuthUser(res.user),
        }),
      ),

    /** POST /auth/refresh */
    refresh: (refreshToken: string) =>
      apiRequest<Pick<AuthResponse, "accessToken" | "refreshToken">>(
        "/auth/refresh",
        { method: "POST", body: { refreshToken } },
      ),

    /** GET /auth/me */
    me: async (token: string) => {
      const [authMe, profile] = await Promise.all([
        apiRequest<AuthMeResponse>("/auth/me", { token }),
        apiRequest<UserMe>("/users/me", { token }),
      ]);
      return toSessionUserFromAuthMe(authMe, profile);
    },

    /** Compatibilidad con registro unificado */
    register: (body: {
      name: string;
      email: string;
      password: string;
      role: "PATIENT" | "PSYCHOLOGIST";
      city?: string;
      specialty?: string;
      licenseNumber?: string;
      documentType?: string;
      documentNumber?: string;
      birthDate?: string;
      gender?: string;
      country?: string;
      phone?: string;
      emergencyContact?: string;
      consultationReason?: string;
      psychologicalHistory?: string;
      psychiatricHistory?: string;
      currentMedication?: string;
      selfReportedRiskLevel?: string;
    }) =>
      apiRequest<AuthResponse>("/auth/register", { method: "POST", body }),
  },

  profile: {
    /** GET /profile — perfil publico/minimo, sin datos sensibles */
    get: (token: string) => apiRequest<unknown>("/profile", { token }),

    /** POST /profile/unlock — requiere backend; devuelve datos sensibles descifrados */
    unlock: (token: string, password: string) =>
      apiRequest<SensitiveProfile>("/profile/unlock", {
        method: "POST",
        token,
        body: { password },
      }),

    /** PATCH /profile — requiere password o unlockToken para campos sensibles */
    update: (
      token: string,
      body: EditableProfile,
      auth?: { password?: string; unlockToken?: string },
    ) =>
      apiRequest<unknown>("/profile", {
        method: "PATCH",
        token,
        body: { ...body, ...auth },
      }),
  },

  dashboard: {
    /** GET /dashboard — agregado en cliente hasta endpoint backend */
    get: async (token: string): Promise<DashboardData> => {
      const session = await api.auth.me(token);
      const [upcoming, notifications] = await Promise.all([
        api.appointments.upcoming(token),
        api.notifications.list(token, true),
      ]);

      const base: DashboardData = {
        appointments: upcoming,
        notifications,
        upcomingEvents: upcoming,
        profileSummary: toProfileSummary(session.profile),
      };

      if (
        session.roles.includes("PSYCHOLOGIST") ||
        session.roles.includes("CLINICAL_SUPERVISOR") ||
        session.roles.includes("SUPERVISOR")
      ) {
        const [stats, posts] = await Promise.all([
          api.psychologists.stats(token).catch(() => null),
          api.community.posts({ limit: "5" }),
        ]);
        return {
          ...base,
          stats: stats ?? undefined,
          communityPosts: posts.items,
        };
      }

      const directory = await api.psychologists.list({ limit: "3" });
      return { ...base, recommendedPsychologists: directory.items };
    },
  },

  users: {
    me: (token: string) =>
      apiRequest<UserMe>("/users/me", { token }),

    updateMe: (token: string, body: { name?: string; phone?: string }) =>
      apiRequest<UserMe>("/users/me", { method: "PATCH", token, body }),

    onboardingPatient: (
      token: string,
      body: {
        city?: string;
        bio?: string;
        country?: string;
        consultationReason?: string;
        psychologicalHistory?: string;
        psychiatricHistory?: string;
        currentMedication?: string;
        selfReportedRiskLevel?: string;
        gender?: string;
      },
    ) =>
      apiRequest<unknown>("/users/onboarding/patient", {
        method: "POST",
        token,
        body,
      }),

    onboardingPsychologist: (
      token: string,
      body: {
        licenseNumber?: string;
        bio?: string;
        city?: string;
        priceCents?: number;
      },
    ) =>
      apiRequest<unknown>("/users/onboarding/psychologist", {
        method: "POST",
        token,
        body,
      }),
  },

  patients: {
    me: (token: string) =>
      apiRequest<PatientProfile>("/patients/me", { token }),

    updateMe: (token: string, body: EditableProfile) =>
      apiRequest<PatientProfile>("/patients/me", {
        method: "PATCH",
        token,
        body,
      }),
  },

  psychologists: {
    /** GET /psychologists → GET /directory/psychologists */
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : "";
      return apiRequest<DirectoryListResponse>(
        `/directory/psychologists${qs}`,
      );
    },

    /** GET /psychologists/:id → GET /directory/psychologists/:slug */
    bySlug: (slug: string) =>
      apiRequest<PsychologistDetail>(`/directory/psychologists/${slug}`),

    slots: (id: string, from?: string, to?: string) => {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const qs = params.toString() ? `?${params}` : "";
      return apiRequest<AvailabilitySlot[]>(
        `/psychologists/${id}/slots${qs}`,
      );
    },

    stats: (token: string) =>
      apiRequest<PsychologistStats>("/psychologists/me/stats", { token }),

    patients: (token: string, params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : "";
      return apiRequest<{
        items: PatientPsychologistView[];
        meta: { total: number; page: number; limit: number };
      }>(`/psychologists/me/patients${qs}`, { token });
    },

    patientClinical: (token: string, patientId: string) =>
      apiRequest<PatientClinicalProfile>(
        `/psychologists/me/patients/${patientId}/clinical`,
        { token },
      ),

    availability: {
      get: (token: string) =>
        apiRequest<AvailabilityRule[]>("/psychologists/me/availability", {
          token,
        }),

      update: (
        token: string,
        rules: { dayOfWeek: number; startTime: string; endTime: string }[],
      ) =>
        apiRequest<AvailabilityRule[]>("/psychologists/me/availability", {
          method: "PUT",
          token,
          body: { rules },
        }),
    },
  },

  directory: {
    list: (params?: Record<string, string>) => api.psychologists.list(params),
    bySlug: (slug: string) => api.psychologists.bySlug(slug),
  },

  appointments: {
    create: (token: string, body: CreateAppointmentBody) =>
      apiRequest<AppointmentItem>("/appointments", {
        method: "POST",
        token,
        body,
      }),

    list: (token: string, params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : "";
      return apiRequest<{ items: AppointmentItem[]; meta: { total: number } }>(
        `/appointments${qs}`,
        { token },
      );
    },

    upcoming: (token: string) =>
      apiRequest<AppointmentItem[]>("/appointments/upcoming", { token }),

    getById: (token: string, id: string) =>
      apiRequest<AppointmentItem>(`/appointments/${id}`, { token }),

    cancel: (token: string, id: string, reason?: string) =>
      apiRequest<AppointmentItem>(`/appointments/${id}/cancel`, {
        method: "PATCH",
        token,
        body: { reason },
      }),

    confirm: (token: string, id: string) =>
      apiRequest<AppointmentItem>(`/appointments/${id}/confirm`, {
        method: "PATCH",
        token,
      }),

    update: (
      token: string,
      id: string,
      body: {
        startAt?: string;
        endAt?: string;
        modality?: string;
        notes?: string;
        slotId?: string;
        timezone?: string;
      },
    ) =>
      apiRequest<AppointmentItem>(`/appointments/${id}`, {
        method: "PATCH",
        token,
        body,
      }),

    proposeReschedule: (
      token: string,
      id: string,
      body: {
        startAt: string;
        endAt: string;
        slotId?: string;
        timezone?: string;
        message?: string;
      },
    ) =>
      apiRequest<AppointmentItem>(`/appointments/${id}/propose-reschedule`, {
        method: "PATCH",
        token,
        body,
      }),

    acceptReschedule: (token: string, id: string) =>
      apiRequest<AppointmentItem>(`/appointments/${id}/accept-reschedule`, {
        method: "PATCH",
        token,
      }),

    rejectReschedule: (token: string, id: string) =>
      apiRequest<AppointmentItem>(`/appointments/${id}/reject-reschedule`, {
        method: "PATCH",
        token,
      }),

    complete: (token: string, id: string) =>
      apiRequest<AppointmentItem>(`/appointments/${id}/complete`, {
        method: "PATCH",
        token,
      }),

    videoStatus: (token: string, id: string) =>
      apiRequest<AppointmentVideoStatus>(`/appointments/${id}/video/status`, {
        token,
      }),

    videoToken: (token: string, id: string) =>
      apiRequest<AppointmentVideoToken>(`/appointments/${id}/video/token`, {
        method: "POST",
        token,
      }),
  },

  recommendations: {
    /** GET /recommendations?query= — endpoint público */
    get: (params?: Record<string, string>, token?: string) => {
      const qs = params ? `?${new URLSearchParams(params)}` : "";
      return apiRequest<RecommendationsResponse>(`/recommendations${qs}`, {
        token,
      });
    },
  },

  availability: {
    /** GET /availability/:psychologistId — endpoint público */
    byPsychologist: (
      psychologistId: string,
      params?: Record<string, string>,
      token?: string,
    ) => {
      const qs = params ? `?${new URLSearchParams(params)}` : "";
      return apiRequest<PsychologistAvailabilityResponse>(
        `/availability/${psychologistId}${qs}`,
        { token },
      );
    },
  },

  favorites: {
    list: (token: string) =>
      apiRequest<FavoritesResponse>("/favorites", { token }),

    add: (token: string, psychologistId: string) =>
      apiRequest<FavoritePsychologistItem>("/favorites", {
        method: "POST",
        token,
        body: { psychologistId },
      }),

    remove: (token: string, psychologistId: string) =>
      apiRequest<void>(`/favorites/${psychologistId}`, {
        method: "DELETE",
        token,
      }),
  },

  emergencyAlerts: {
    create: (
      token: string,
      body: {
        patientId: string;
        type: EmergencyAlertType;
        description: string;
        severity: EmergencyAlertSeverity;
      },
    ) =>
      apiRequest<EmergencyAlertResponse>("/emergency-alerts", {
        method: "POST",
        token,
        body,
      }),
  },

  community: {
    posts: (params?: Record<string, string>, token?: string) => {
      const qs = params ? `?${new URLSearchParams(params)}` : "";
      return apiRequest<{ items: CommunityPost[]; meta: { total: number } }>(
        `/community/posts${qs}`,
        { token },
      );
    },

    validate: (content: string) =>
      apiRequest<{ valid: boolean; issues?: string[] }>(
        "/community/posts/validate",
        { method: "POST", body: { content } },
      ),

    create: (token: string, body: CreatePostBody) =>
      apiRequest<CommunityPost>("/community/posts", {
        method: "POST",
        token,
        body,
      }),

    comment: (token: string, postId: string, content: string) =>
      apiRequest<CommunityComment>(`/community/posts/${postId}/comments`, {
        method: "POST",
        token,
        body: { content },
      }),

    listComments: (postId: string) =>
      apiRequest<CommunityComment[]>(`/comments/${postId}`),

    react: (token: string, postId: string, type = "INTERESTING") =>
      apiRequest<CommunityReactionResult>(`/community/posts/${postId}/react`, {
        method: "POST",
        token,
        body: { type },
      }),

    save: (token: string, postId: string) =>
      apiRequest<unknown>(`/community/posts/${postId}/save`, {
        method: "POST",
        token,
      }),

    share: (postId: string) =>
      apiRequest<{ shareUrl: string }>(`/community/posts/${postId}/share`, {
        method: "POST",
      }),
  },

  subscriptions: {
    plans: () => apiRequest<SubscriptionPlan[]>("/subscriptions/plans"),
    me: (token: string) =>
      apiRequest<unknown>("/subscriptions/me", { token }),
  },

  notifications: {
    list: (token: string, unreadOnly = false) => {
      const qs = unreadOnly ? "?unread=true" : "";
      return apiRequest<NotificationItem[]>(`/notifications${qs}`, { token });
    },

    markRead: (token: string, id: string) =>
      apiRequest<NotificationItem>(`/notifications/${id}/read`, {
        method: "PATCH",
        token,
      }),

    /** PATCH /notifications/read — marca todas (iteración por ID) */
    markAllRead: async (token: string) => {
      const unread = await api.notifications.list(token, true);
      await Promise.all(
        unread.map((n) => api.notifications.markRead(token, n.id)),
      );
    },
  },

  verification: {
    status: (token: string) =>
      apiRequest<{ status: string; documents: unknown[] }>(
        "/verification/status",
        { token },
      ),

    /** POST /verification/documents/upload — multipart (file + type) */
    uploadDocument: async (
      token: string,
      type: string,
      file: File,
    ): Promise<{
      id: string;
      type: string;
      fileUrl: string;
      fileName: string | null;
      status: string;
    }> => {
      const form = new FormData();
      form.append("file", file);
      form.append("type", type);

      const res = await fetch(`${API_BASE}/api/v1/verification/documents/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new ApiError(parseErrorMessage(data, res.status), res.status, data);
      }
      return unwrapApiResponse(data);
    },
  },

  messaging: {
    /** Escuchadero — paciente sin cita agendada */
    support: {
      getSession: (token: string) =>
        apiRequest<SupportChatSession>("/messaging/support/session", { token }),

      getMessages: (token: string) =>
        apiRequest<ChatMessage[]>("/messaging/support/messages", { token }),

      sendMessage: (token: string, body: SendChatMessageBody) =>
        apiRequest<ChatMessage>("/messaging/support/messages", {
          method: "POST",
          token,
          body,
        }),

      /** Al cerrar sesión del paciente — borra historial del lado paciente */
      endSession: (token: string) =>
        apiRequest<void>("/messaging/support/session", {
          method: "DELETE",
          token,
        }),

      setTyping: (token: string, body: SetTypingBody) =>
        apiRequest<void>("/messaging/support/typing", {
          method: "POST",
          token,
          body,
        }),

      getTyping: (token: string) =>
        apiRequest<ChatTypingStatus>("/messaging/support/typing", { token }),

      /** Bandeja escuchadero — psicólogo */
      inbox: (token: string) =>
        apiRequest<SupportInboxSession[]>("/messaging/support/inbox", { token }),

      getSessionMessages: (token: string, sessionId: string) =>
        apiRequest<ChatMessage[]>(
          `/messaging/support/sessions/${sessionId}/messages`,
          { token },
        ),

      sendSessionMessage: (
        token: string,
        sessionId: string,
        body: SendChatMessageBody,
      ) =>
        apiRequest<ChatMessage>(
          `/messaging/support/sessions/${sessionId}/messages`,
          { method: "POST", token, body },
        ),

      setSessionTyping: (
        token: string,
        sessionId: string,
        body: SetTypingBody,
      ) =>
        apiRequest<void>(
          `/messaging/support/sessions/${sessionId}/typing`,
          { method: "POST", token, body },
        ),

      getSessionTyping: (token: string, sessionId: string) =>
        apiRequest<ChatTypingStatus>(
          `/messaging/support/sessions/${sessionId}/typing`,
          { token },
        ),
    },

    /** Chat psicólogo ↔ paciente (requiere cita activa) */
    conversations: {
      list: (token: string) =>
        apiRequest<ChatConversation[]>("/messaging/conversations", { token }),

      byAppointment: (token: string, appointmentId: string) =>
        apiRequest<ChatConversation>(
          `/messaging/conversations/by-appointment/${appointmentId}`,
          { token },
        ),

      getMessages: (token: string, conversationId: string) =>
        apiRequest<ChatMessage[]>(
          `/messaging/conversations/${conversationId}/messages`,
          { token },
        ),

      sendMessage: (
        token: string,
        conversationId: string,
        body: SendChatMessageBody,
      ) =>
        apiRequest<ChatMessage>(
          `/messaging/conversations/${conversationId}/messages`,
          { method: "POST", token, body },
        ),

      openWithPatient: (token: string, patientId: string) =>
        apiRequest<ChatConversation>("/messaging/conversations", {
          method: "POST",
          token,
          body: { patientId },
        }),

      setTyping: (
        token: string,
        conversationId: string,
        body: SetTypingBody,
      ) =>
        apiRequest<void>(
          `/messaging/conversations/${conversationId}/typing`,
          { method: "POST", token, body },
        ),

      getTyping: (token: string, conversationId: string) =>
        apiRequest<ChatTypingStatus>(
          `/messaging/conversations/${conversationId}/typing`,
          { token },
        ),
    },

    ai: {
      assist: (token: string, body: AiChatAssistBody) =>
        apiRequest<AiChatAssistResponse>("/messaging/ai/assist", {
          method: "POST",
          token,
          body,
        }),
    },
  },

  clinicalNotes: {
    get: (token: string, appointmentId: string) =>
      apiRequest<{ id: string; patientAlias: string; body: string; updatedAt: string } | null>(
        `/appointments/${appointmentId}/clinical-notes`,
        { token },
      ),
    put: (token: string, appointmentId: string, body: string) =>
      apiRequest<{ id: string; patientAlias: string; updatedAt: string }>(
        `/appointments/${appointmentId}/clinical-notes`,
        { method: "PUT", token, body: { body } },
      ),
  },
};
