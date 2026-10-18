"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FormField,
  FormSelect,
  FormTextarea,
} from "@/components/ui/form-field";
import { PrivacyNotice } from "@/components/ui/privacy-notice";
import {
  emailStatusMessage,
  useEmailAvailability,
} from "@/hooks/use-email-availability";
import { api, ApiError, normalizeAuthUser } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth/store";
import {
  CO_DEPARTMENTS,
  COUNTRY_OPTIONS,
  RELATIONSHIP_OPTIONS,
  STREET_TYPE_OPTIONS,
  WELLBEING_OPTIONS,
  WORK_ON_OPTIONS,
} from "@/lib/colombia-locations";
import { PSYCHOLOGIST_SPECIALTY_OPTIONS } from "@/lib/psychologist-specialties";
import type { DocumentType, Gender } from "@/lib/patient-utils";
import { DOCUMENT_TYPE_OPTIONS, GENDER_OPTIONS } from "@/lib/patient-utils";
import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { Shield, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type Role = "patient" | "psychologist";

interface PatientFormData {
  name: string;
  documentType: DocumentType | "";
  documentNumber: string;
  birthDate: string;
  gender: Gender | "";
  country: string;
  department: string;
  city: string;
  addressLine: string;
  addressStreetType: string;
  addressNumber: string;
  addressHouseDetail: string;
  email: string;
  phone: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
  emergencyEmail: string;
  password: string;
  confirmPassword: string;
  wellbeingFeeling: string;
  workOnFocus: string;
  workOnOther: string;
  priorSupport: "yes" | "no" | "";
  priorSupportDetail: string;
  importantMentalHealthInfo: string;
  acceptTerms: boolean;
}

interface AddressFormData {
  country: string;
  department: string;
  city: string;
  addressStreetType: string;
  addressNumber: string;
  addressHouseDetail: string;
  addressLine: string;
}

interface WorkExperience {
  companyName: string;
  roleTitle: string;
  startDate: string;
  endDate?: string;
}

interface VerificationDocument {
  type: string;
  fileName: string;
  file: File;
}

const INITIAL_PATIENT: PatientFormData = {
  name: "",
  documentType: "",
  documentNumber: "",
  birthDate: "",
  gender: "",
  country: "CO",
  department: "",
  city: "",
  addressLine: "",
  addressStreetType: "",
  addressNumber: "",
  addressHouseDetail: "",
  email: "",
  phone: "",
  emergencyName: "",
  emergencyPhone: "",
  emergencyRelationship: "",
  emergencyEmail: "",
  password: "",
  confirmPassword: "",
  wellbeingFeeling: "",
  workOnFocus: "",
  workOnOther: "",
  priorSupport: "",
  priorSupportDetail: "",
  importantMentalHealthInfo: "",
  acceptTerms: false,
};

const EMPTY_WORK_EXP: WorkExperience = {
  companyName: "",
  roleTitle: "",
  startDate: "",
  endDate: "",
};

const MAX_SPECIALIZATION_FILES = 5;
const ACCEPTED_DOCUMENT_TYPES = ".pdf,.doc,.docx";

const INITIAL_PSYCH_ADDRESS: AddressFormData = {
  country: "CO",
  department: "",
  city: "",
  addressStreetType: "",
  addressNumber: "",
  addressHouseDetail: "",
  addressLine: "",
};

function isEmergencyComplete(patient: PatientFormData): boolean {
  return Boolean(
    patient.emergencyName.trim() &&
      patient.emergencyPhone.trim() &&
      patient.emergencyRelationship,
  );
}

function buildConsultationReason(patient: PatientFormData): string {
  const workLabel =
    WORK_ON_OPTIONS.find((o) => o.value === patient.workOnFocus)?.label ??
    patient.workOnFocus;
  const focus =
    patient.workOnFocus === "otro" ? patient.workOnOther : workLabel;
  const wellbeing =
    WELLBEING_OPTIONS.find((o) => o.value === patient.wellbeingFeeling)
      ?.label ?? patient.wellbeingFeeling;
  const parts = [`Enfoque: ${focus}`, `Bienestar: ${wellbeing}`];
  if (patient.priorSupport === "yes" && patient.priorSupportDetail.trim()) {
    parts.push(`Apoyo previo: ${patient.priorSupportDetail.trim()}`);
  }
  if (patient.importantMentalHealthInfo.trim()) {
    parts.push(
      `Info relevante: ${patient.importantMentalHealthInfo.trim()}`,
    );
  }
  return parts.join(". ");
}

function relationshipLabel(value: string): string {
  return (
    RELATIONSHIP_OPTIONS.find((o) => o.value === value)?.label ?? value
  );
}

function isAddressComplete(address: AddressFormData): boolean {
  return Boolean(
    address.country &&
      address.department &&
      address.city &&
      address.addressStreetType &&
      address.addressNumber.trim() &&
      address.addressHouseDetail.trim(),
  );
}

function composeAddressLine(address: AddressFormData): string {
  return `${address.addressStreetType} ${address.addressNumber.trim()}, ${address.addressHouseDetail.trim()}`;
}

export function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const initialRole =
    searchParams.get("rol") === "psicologo" ? "psychologist" : null;

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role | null>(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAlias, setGeneratedAlias] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientFormData>(INITIAL_PATIENT);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [addressModalFor, setAddressModalFor] = useState<Role | null>(null);
  const [psychAddress, setPsychAddress] =
    useState<AddressFormData>(INITIAL_PSYCH_ADDRESS);
  const [showPsychSuccessModal, setShowPsychSuccessModal] = useState(false);

  const [psychBasic, setPsychBasic] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [psychProfile, setPsychProfile] = useState({
    specialtyCode: "",
    specialtyOther: "",
    bio: "",
  });
  const [psychAcceptTerms, setPsychAcceptTerms] = useState(false);
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [verificationDocuments, setVerificationDocuments] = useState<
    VerificationDocument[]
  >([]);
  const [showWorkExpModal, setShowWorkExpModal] = useState(false);
  const [workExpDraft, setWorkExpDraft] =
    useState<WorkExperience>(EMPTY_WORK_EXP);

  const totalSteps = role === "patient" ? 6 : 3;
  const patientEmailStatus = useEmailAvailability(patient.email);
  const psychEmailStatus = useEmailAvailability(psychBasic.email);

  const activeAddress =
    addressModalFor === "patient" ? patient : psychAddress;

  const departmentOptions = useMemo(() => {
    const list = CO_DEPARTMENTS[activeAddress.country] ?? [];
    return list.map((d) => ({ value: d.value, label: d.label }));
  }, [activeAddress.country]);

  const cityOptions = useMemo(() => {
    const list = CO_DEPARTMENTS[activeAddress.country] ?? [];
    const dept = list.find((d) => d.value === activeAddress.department);
    return dept?.cities ?? [];
  }, [activeAddress.country, activeAddress.department]);

  function validateEmailStep(
    status: ReturnType<typeof useEmailAvailability>,
  ): boolean {
    if (status === "taken") {
      setError("Este correo ya está registrado. Inicia sesión o usa otro correo.");
      return false;
    }
    if (status === "checking") {
      setError("Espera mientras verificamos el correo…");
      return false;
    }
    if (status === "invalid") {
      setError("Ingresa un correo electrónico válido.");
      return false;
    }
    setError(null);
    return true;
  }

  function updatePatient(fields: Partial<PatientFormData>) {
    setPatient((prev) => ({ ...prev, ...fields }));
  }

  function updateActiveAddress(fields: Partial<AddressFormData>) {
    if (addressModalFor === "patient") {
      updatePatient(fields);
      return;
    }
    if (addressModalFor === "psychologist") {
      setPsychAddress((prev) => ({ ...prev, ...fields }));
    }
  }

  function saveAddress(e: FormEvent) {
    e.preventDefault();
    if (!isAddressComplete(activeAddress)) {
      setError("Completa todos los datos de la dirección.");
      return;
    }
    updateActiveAddress({ addressLine: composeAddressLine(activeAddress) });
    setError(null);
    setAddressModalFor(null);
  }

  function saveEmergencyContact(e: FormEvent) {
    e.preventDefault();
    if (!isEmergencyComplete(patient)) {
      setError("Completa nombre, teléfono y parentesco del contacto de emergencia.");
      return;
    }
    setError(null);
    setShowEmergencyModal(false);
  }

  async function handleVerificationUpload(
    type: string,
    files: FileList | null,
  ) {
    if (!files?.length) return;
    const acceptedFiles = Array.from(files).filter((file) =>
      /\.(pdf|doc|docx)$/i.test(file.name),
    );
    if (acceptedFiles.length !== files.length) {
      setError("Solo se permiten archivos PDF, DOC o DOCX.");
      return;
    }

    const isUnique = type === "RETHUS" || type === "LICENSE";
    const currentSpecializations = verificationDocuments.filter(
      (doc) => doc.type === "SPECIALIZATION",
    ).length;
    const remaining =
      type === "SPECIALIZATION"
        ? MAX_SPECIALIZATION_FILES - currentSpecializations
        : 1;
    if (remaining <= 0) {
      setError(`Máximo ${MAX_SPECIALIZATION_FILES} archivos de especialización.`);
      return;
    }
    const slice = acceptedFiles.slice(0, remaining);
    const docs: VerificationDocument[] = slice.map((file) => ({
      type,
      fileName: file.name,
      file,
    }));
    setVerificationDocuments((prev) =>
      isUnique
        ? [...prev.filter((doc) => doc.type !== type), docs[0]]
        : [...prev, ...docs],
    );
    setError(null);
  }

  function removeVerificationDoc(index: number) {
    setVerificationDocuments((prev) => prev.filter((_, i) => i !== index));
  }

  function saveWorkExperience(e: FormEvent) {
    e.preventDefault();
    if (
      !workExpDraft.companyName.trim() ||
      !workExpDraft.roleTitle.trim() ||
      !workExpDraft.startDate
    ) {
      setError("Completa empresa, cargo y fecha de inicio.");
      return;
    }
    setWorkExperiences((prev) => [
      ...prev,
      {
        companyName: workExpDraft.companyName.trim(),
        roleTitle: workExpDraft.roleTitle.trim(),
        startDate: workExpDraft.startDate,
        endDate: workExpDraft.endDate?.trim() || undefined,
      },
    ]);
    setWorkExpDraft(EMPTY_WORK_EXP);
    setShowWorkExpModal(false);
    setError(null);
  }

  async function finishPatientRegistration() {
    if (loading) return;
    if (!patient.acceptTerms) {
      setError("Debes aceptar los términos");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await api.auth.registerPatient({
        fullName: patient.name,
        email: patient.email,
        password: patient.password,
        documentType: patient.documentType || undefined,
        documentNumber: patient.documentNumber || undefined,
        birthDate: patient.birthDate || undefined,
        gender: patient.gender || undefined,
        country: patient.country || undefined,
        department: patient.department || undefined,
        city: patient.city || undefined,
        addressLine: patient.addressLine || undefined,
        phone: patient.phone || undefined,
        emergencyContactDetail: {
          name: patient.emergencyName,
          phone: patient.emergencyPhone,
          relationship: patient.emergencyRelationship,
          email: patient.emergencyEmail || undefined,
        },
        consultationReason: buildConsultationReason(patient),
        wellbeingFeeling: patient.wellbeingFeeling,
        workOnFocus: patient.workOnFocus,
        workOnOther:
          patient.workOnFocus === "otro"
            ? patient.workOnOther || undefined
            : undefined,
        priorSupport: patient.priorSupport === "yes",
        priorSupportDetail:
          patient.priorSupport === "yes"
            ? patient.priorSupportDetail || undefined
            : undefined,
        importantMentalHealthInfo:
          patient.importantMentalHealthInfo || undefined,
        acceptTerms: patient.acceptTerms,
      });

      setSession(res.accessToken, normalizeAuthUser(res.user), res.refreshToken);
      setGeneratedAlias(res.alias);
      setStep(7);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(
          "Este correo ya está registrado. Inicia sesión o usa otro correo.",
        );
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : "No pudimos crear tu cuenta. Intenta de nuevo.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function finishPsychologist(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!role) return;
    if (!psychAcceptTerms) {
      setError("Debes aceptar los términos");
      return;
    }
    if (!psychBasic.phone.trim()) {
      setError("Ingresa un teléfono de contacto.");
      return;
    }
    if (!isAddressComplete(psychAddress)) {
      setError("Agrega una dirección de residencia completa.");
      return;
    }
    if (!psychProfile.specialtyCode) {
      setError("Selecciona una especialidad.");
      return;
    }
    if (
      psychProfile.specialtyCode === "OTHER" &&
      !psychProfile.specialtyOther.trim()
    ) {
      setError("Indica tu especialidad en el campo Otro.");
      return;
    }
    if (!psychProfile.bio.trim()) {
      setError("Escribe una breve biografía profesional.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const specialtyLabel =
        PSYCHOLOGIST_SPECIALTY_OPTIONS.find(
          (o) => o.value === psychProfile.specialtyCode,
        )?.label ?? psychProfile.specialtyOther;
      const res = await api.auth.registerPsychologist({
        fullName: psychBasic.name,
        email: psychBasic.email,
        password: psychBasic.password,
        phone: psychBasic.phone.trim(),
        country: psychAddress.country || undefined,
        department: psychAddress.department || undefined,
        city: psychAddress.city || undefined,
        addressLine: composeAddressLine(psychAddress),
        specialty:
          psychProfile.specialtyCode === "OTHER"
            ? psychProfile.specialtyOther.trim()
            : specialtyLabel,
        specialtyCode: psychProfile.specialtyCode,
        specialtyOther:
          psychProfile.specialtyCode === "OTHER"
            ? psychProfile.specialtyOther.trim()
            : undefined,
        bio: psychProfile.bio.trim(),
        acceptTerms: psychAcceptTerms,
        workExperiences:
          workExperiences.length > 0 ? workExperiences : undefined,
      });

      setSession(res.accessToken, normalizeAuthUser(res.user), res.refreshToken);

      // Subida real de documentos (multipart → disco local / futuro R2)
      for (const doc of verificationDocuments) {
        await api.verification.uploadDocument(
          res.accessToken,
          doc.type,
          doc.file,
        );
      }

      setShowPsychSuccessModal(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(
          "Este correo ya está registrado. Inicia sesión o usa otro correo.",
        );
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : "No pudimos crear tu cuenta. Intenta de nuevo.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  const verificationTypeLabels: Record<string, string> = {
    RETHUS: "RETHUS",
    LICENSE: "Tarjeta profesional",
    SPECIALIZATION: "Especialización",
  };

  return (
    <Card
      className={cn(
        "w-full",
        role === "patient" ? "max-w-lg" : "max-w-md",
      )}
    >
      {step <= totalSteps ? (
        <div
          className="mb-8 flex gap-2"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={`Paso ${step} de ${totalSteps}`}
        >
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                s <= step ? "bg-mu-primary" : "bg-mu-border",
              )}
            />
          ))}
        </div>
      ) : null}

      {error ? (
        <div
          className="mb-4 rounded-mu border border-mu-error/30 bg-mu-error/5 px-3 py-2 text-sm text-mu-error"
          role="alert"
        >
          <p>{error}</p>
          {error.includes("ya está registrado") ? (
            <Link
              href="/login"
              className="mt-2 inline-block font-medium text-mu-primary hover:underline"
            >
              Ir a iniciar sesión
            </Link>
          ) : null}
        </div>
      ) : null}

      {/* Paso 1: Rol */}
      {step === 1 && (
        <div>
          <h1 className="font-heading text-xl font-bold text-mu-text">
            ¿Cómo quieres usar Mente Unida?
          </h1>
          <p className="mt-1 text-sm text-mu-text-muted">Paso 1 — Elige tu camino</p>
          <div className="mt-6 grid gap-3">
            {(
              [
                {
                  id: "patient" as const,
                  title: "Busco apoyo",
                  desc: "Quiero encontrar acompañamiento profesional en un espacio seguro",
                },
                {
                  id: "psychologist" as const,
                  title: "Soy profesional de la salud mental",
                  desc: "Quiero desarrollar mi práctica y conectar con una comunidad",
                },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setRole(option.id)}
                className={cn(
                  "rounded-mu-lg border-2 p-4 text-left transition-colors",
                  role === option.id
                    ? "border-mu-primary bg-mu-accent"
                    : "border-mu-border hover:border-mu-primary/50",
                )}
                aria-pressed={role === option.id}
              >
                <p className="font-medium text-mu-text">{option.title}</p>
                <p className="text-sm text-mu-text-muted">{option.desc}</p>
              </button>
            ))}
          </div>
          {role === "patient" ? (
            <PrivacyNotice className="mt-4" />
          ) : null}
          <Button
            className="mt-6 w-full"
            disabled={!role}
            onClick={() => setStep(2)}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Paciente: Paso 2 — Información personal */}
      {step === 2 && role === "patient" && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isAddressComplete(patient)) {
              setError("Agrega una dirección de residencia completa.");
              return;
            }
            setError(null);
            setStep(3);
          }}
        >
          <h1 className="font-heading text-xl font-bold text-mu-text">
            Información personal
          </h1>
          <p className="text-sm text-mu-text-muted">Paso 2 de 6</p>

          <FormField
            name="name"
            label="Nombre completo"
            required
            value={patient.name}
            onChange={(e) => updatePatient({ name: e.target.value })}
            autoComplete="name"
          />

          <FormSelect
            name="documentType"
            label="Tipo de documento"
            required
            value={patient.documentType}
            onChange={(e) =>
              updatePatient({
                documentType: e.target.value as DocumentType,
              })
            }
            options={DOCUMENT_TYPE_OPTIONS}
            placeholder="Selecciona"
          />

          <FormField
            name="documentNumber"
            label="Número de documento"
            required
            value={patient.documentNumber}
            onChange={(e) =>
              updatePatient({ documentNumber: e.target.value })
            }
            inputMode="numeric"
          />

          <FormField
            name="birthDate"
            label="Fecha de nacimiento"
            type="date"
            required
            value={patient.birthDate}
            onChange={(e) => updatePatient({ birthDate: e.target.value })}
          />

          <FormSelect
            name="gender"
            label="Género"
            value={patient.gender}
            onChange={(e) =>
              updatePatient({ gender: e.target.value as Gender })
            }
            options={GENDER_OPTIONS}
            placeholder="Opcional"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-mu-text">
              Dirección de residencia
            </label>
            <button
              type="button"
              onClick={() => setAddressModalFor("patient")}
              className="flex w-full items-center justify-between rounded-mu border border-mu-border bg-white px-3 py-2.5 text-left text-sm transition-colors hover:border-mu-primary/50"
            >
              <span
                className={
                  isAddressComplete(patient)
                    ? "text-mu-text"
                    : "text-mu-text-muted"
                }
              >
                {isAddressComplete(patient)
                  ? `${patient.city}, ${patient.department} · ${patient.addressStreetType} ${patient.addressNumber}`
                  : "Haz clic para completar país, ciudad y dirección"}
              </span>
              <span className="shrink-0 text-xs font-medium text-mu-primary">
                {isAddressComplete(patient) ? "Editar" : "Agregar"}
              </span>
            </button>
            {isAddressComplete(patient) ? (
              <div className="rounded-mu border border-mu-border bg-mu-background px-3 py-3 text-sm text-mu-text-muted">
                <p>
                  País:{" "}
                  {COUNTRY_OPTIONS.find(
                    (option) => option.value === patient.country,
                  )?.label ?? patient.country}
                </p>
                <p>Departamento: {patient.department}</p>
                <p>Ciudad: {patient.city}</p>
                <p>
                  Dirección: {patient.addressStreetType} {patient.addressNumber}
                </p>
                <p>Descripción: {patient.addressHouseDetail}</p>
              </div>
            ) : (
              <p className="text-xs text-mu-text-muted">
                La dirección de residencia es obligatoria.
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              Atrás
            </Button>
            <Button type="submit" className="flex-1">
              Siguiente
            </Button>
          </div>
        </form>
      )}

      {/* Paciente: Paso 3 — Contacto */}
      {step === 3 && role === "patient" && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!validateEmailStep(patientEmailStatus)) return;
            if (!isEmergencyComplete(patient)) {
              setError(
                "Agrega un contacto de emergencia antes de continuar.",
              );
              return;
            }
            setStep(4);
          }}
        >
          <h1 className="font-heading text-xl font-bold text-mu-text">
            Información de contacto
          </h1>
          <p className="text-sm text-mu-text-muted">Paso 3 de 6</p>

          <FormField
            name="email"
            label="Correo electrónico"
            type="email"
            required
            value={patient.email}
            onChange={(e) => {
              updatePatient({ email: e.target.value });
              setError(null);
            }}
            autoComplete="email"
            error={
              patientEmailStatus === "taken"
                ? emailStatusMessage(patientEmailStatus) ?? undefined
                : undefined
            }
            hint={
              patientEmailStatus !== "taken"
                ? emailStatusMessage(patientEmailStatus) ?? undefined
                : undefined
            }
          />
          {patientEmailStatus === "taken" ? (
            <Link
              href="/login"
              className="text-sm font-medium text-mu-primary hover:underline"
            >
              Ya tengo cuenta — iniciar sesión
            </Link>
          ) : null}

          <FormField
            name="phone"
            label="Teléfono"
            type="tel"
            required
            value={patient.phone}
            onChange={(e) => updatePatient({ phone: e.target.value })}
            autoComplete="tel"
          />

          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowEmergencyModal(true)}
            >
              {isEmergencyComplete(patient)
                ? "Editar contacto de emergencia"
                : "Agregar contacto de emergencia"}
            </Button>

            {isEmergencyComplete(patient) ? (
              <div className="rounded-mu border border-mu-border bg-mu-background px-3 py-3 text-sm">
                <p className="text-mu-text">Nombre: {patient.emergencyName}</p>
                <p className="text-mu-text-muted">Teléfono: {patient.emergencyPhone}</p>
                <p className="text-mu-text-muted">Parentesco: {relationshipLabel(patient.emergencyRelationship)}</p>
                <p className="text-mu-text-muted">Correo: {patient.emergencyEmail || "No registrado"}</p>
              </div>
            ) : (
              <p className="text-xs text-mu-text-muted">
                Es obligatorio registrar un contacto de confianza.
              </p>
            )}
          </div>

          <PrivacyNotice variant="compact" />

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep(2)}>
              Atrás
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={
                patientEmailStatus === "taken" ||
                patientEmailStatus === "checking"
              }
            >
              Siguiente
            </Button>
          </div>
        </form>
      )}

      {/* Modal: contacto de emergencia */}
      <Dialog.Root
        open={showEmergencyModal}
        onOpenChange={setShowEmergencyModal}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-mu-lg border border-mu-border bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <Dialog.Title className="font-heading text-lg font-semibold text-mu-text">
                Contacto de emergencia
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-mu text-mu-text-muted hover:bg-mu-accent"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            <form className="space-y-4" onSubmit={saveEmergencyContact}>
              <FormField
                name="emergencyName"
                label="Nombre completo"
                required
                value={patient.emergencyName}
                onChange={(e) =>
                  updatePatient({ emergencyName: e.target.value })
                }
              />
              <FormField
                name="emergencyPhone"
                label="Teléfono"
                type="tel"
                required
                value={patient.emergencyPhone}
                onChange={(e) =>
                  updatePatient({ emergencyPhone: e.target.value })
                }
              />
              <FormSelect
                name="emergencyRelationship"
                label="Parentesco o relación"
                required
                value={patient.emergencyRelationship}
                onChange={(e) =>
                  updatePatient({ emergencyRelationship: e.target.value })
                }
                options={[...RELATIONSHIP_OPTIONS]}
                placeholder="Selecciona"
              />
              <FormField
                name="emergencyEmail"
                label="Correo electrónico"
                type="email"
                value={patient.emergencyEmail}
                onChange={(e) =>
                  updatePatient({ emergencyEmail: e.target.value })
                }
                hint="Opcional"
              />
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowEmergencyModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  Guardar contacto
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal: dirección de residencia */}
      <Dialog.Root
        open={addressModalFor !== null}
        onOpenChange={(open) => !open && setAddressModalFor(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-mu-lg border border-mu-border bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <Dialog.Title className="font-heading text-lg font-semibold text-mu-text">
                Dirección de residencia
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-mu text-mu-text-muted hover:bg-mu-accent"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            <form className="space-y-4" onSubmit={saveAddress}>
              <FormSelect
                name="addressCountry"
                label="País"
                required
                value={activeAddress.country}
                onChange={(e) =>
                  updateActiveAddress({
                    country: e.target.value,
                    department: "",
                    city: "",
                  })
                }
                options={[...COUNTRY_OPTIONS]}
                placeholder="Selecciona"
              />
              <FormSelect
                name="addressDepartment"
                label="Departamento"
                required
                value={activeAddress.department}
                onChange={(e) =>
                  updateActiveAddress({ department: e.target.value, city: "" })
                }
                options={departmentOptions}
                placeholder="Selecciona"
                disabled={!activeAddress.country}
              />
              <FormSelect
                name="addressCity"
                label="Ciudad"
                required
                value={activeAddress.city}
                onChange={(e) => updateActiveAddress({ city: e.target.value })}
                options={cityOptions}
                placeholder="Selecciona"
                disabled={!activeAddress.department}
              />
              <FormSelect
                name="addressStreetType"
                label="Tipo de vía"
                required
                value={activeAddress.addressStreetType}
                onChange={(e) =>
                  updateActiveAddress({ addressStreetType: e.target.value })
                }
                options={[...STREET_TYPE_OPTIONS]}
                placeholder="Selecciona"
              />
              <FormField
                name="addressNumber"
                label="Número / nomenclatura"
                required
                value={activeAddress.addressNumber}
                onChange={(e) =>
                  updateActiveAddress({ addressNumber: e.target.value })
                }
                placeholder="Ej: 15 # 23-45"
              />
              <FormField
                name="addressHouseDetail"
                label="Descripción de la casa"
                required
                value={activeAddress.addressHouseDetail}
                onChange={(e) =>
                  updateActiveAddress({ addressHouseDetail: e.target.value })
                }
                placeholder="Ej: Apto 301, casa blanca"
              />
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setAddressModalFor(null)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  Guardar dirección
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Paciente: Paso 4 — Seguridad */}
      {step === 4 && role === "patient" && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (patient.password !== patient.confirmPassword) {
              setError("Las contraseñas no coinciden");
              return;
            }
            setError(null);
            setStep(5);
          }}
        >
          <h1 className="font-heading text-xl font-bold text-mu-text">
            Seguridad
          </h1>
          <p className="text-sm text-mu-text-muted">Paso 4 de 6</p>

          <FormField
            name="password"
            label="Contraseña"
            type="password"
            required
            minLength={8}
            value={patient.password}
            onChange={(e) => updatePatient({ password: e.target.value })}
            autoComplete="new-password"
          />

          <FormField
            name="confirmPassword"
            label="Confirmar contraseña"
            type="password"
            required
            minLength={8}
            value={patient.confirmPassword}
            onChange={(e) =>
              updatePatient({ confirmPassword: e.target.value })
            }
            autoComplete="new-password"
          />

          <aside
            className="rounded-mu border border-mu-border bg-mu-background px-3 py-3 text-sm text-mu-text-muted"
            role="note"
          >
            <div className="flex items-center gap-2 font-medium text-mu-text">
              <Shield className="h-4 w-4 text-mu-primary" aria-hidden />
              Autenticación de dos factores (2FA)
            </div>
            <p className="mt-1">
              Próximamente podrás activar 2FA desde tu configuración para mayor
              protección de tu cuenta.
            </p>
          </aside>

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep(3)}>
              Atrás
            </Button>
            <Button type="submit" className="flex-1">
              Siguiente
            </Button>
          </div>
        </form>
      )}

      {/* Paciente: Paso 5 — Clínica inicial */}
      {step === 5 && role === "patient" && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (patient.workOnFocus === "otro" && !patient.workOnOther.trim()) {
              setError("Describe en qué te gustaría trabajar.");
              return;
            }
            if (patient.priorSupport === "yes" && !patient.priorSupportDetail.trim()) {
              setError("Cuéntanos sobre el apoyo psicológico previo.");
              return;
            }
            setError(null);
            setStep(6);
          }}
        >
          <h1 className="font-heading text-xl font-bold text-mu-text">
            Cuéntanos cómo podemos acompañarte
          </h1>
          <p className="text-sm text-mu-text-muted">Paso 5 de 6</p>

          <FormSelect
            name="wellbeingFeeling"
            label="¿Cómo te sientes respecto a tu bienestar en este momento?"
            required
            value={patient.wellbeingFeeling}
            onChange={(e) =>
              updatePatient({ wellbeingFeeling: e.target.value })
            }
            options={WELLBEING_OPTIONS}
            placeholder="Selecciona"
          />

          <FormSelect
            name="workOnFocus"
            label="¿En qué te gustaría trabajar o mejorar?"
            required
            value={patient.workOnFocus}
            onChange={(e) =>
              updatePatient({ workOnFocus: e.target.value })
            }
            options={WORK_ON_OPTIONS}
            placeholder="Selecciona"
          />

          {patient.workOnFocus === "otro" ? (
            <FormField
              name="workOnOther"
              label="Cuéntanos en qué te gustaría trabajar"
              required
              value={patient.workOnOther}
              onChange={(e) =>
                updatePatient({ workOnOther: e.target.value })
              }
              placeholder="Describe brevemente…"
            />
          ) : null}

          <fieldset className="space-y-2">
            <legend className="mb-1 block text-sm font-medium">
              ¿Has recibido apoyo psicológico anteriormente?
              <span className="text-mu-error" aria-hidden>
                {" "}
                *
              </span>
            </legend>
            <div className="flex gap-4">
              {(
                [
                  { value: "yes", label: "Sí" },
                  { value: "no", label: "No" },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 text-sm text-mu-text"
                >
                  <input
                    type="radio"
                    name="priorSupport"
                    value={opt.value}
                    checked={patient.priorSupport === opt.value}
                    onChange={() =>
                      updatePatient({
                        priorSupport: opt.value,
                        priorSupportDetail:
                          opt.value === "no" ? "" : patient.priorSupportDetail,
                      })
                    }
                    required
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          {patient.priorSupport === "yes" ? (
            <FormTextarea
              name="priorSupportDetail"
              label="Cuéntanos sobre ese apoyo previo"
              required
              value={patient.priorSupportDetail}
              onChange={(e) =>
                updatePatient({ priorSupportDetail: e.target.value })
              }
              placeholder="Breve descripción del proceso o acompañamiento…"
            />
          ) : null}

          <FormTextarea
            name="importantMentalHealthInfo"
            label="¿Hay información sobre tu salud emocional o mental que consideres importante compartir?"
            value={patient.importantMentalHealthInfo}
            onChange={(e) =>
              updatePatient({ importantMentalHealthInfo: e.target.value })
            }
            placeholder="Opcional — medicación, diagnósticos, situaciones relevantes…"
          />

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep(4)}>
              Atrás
            </Button>
            <Button type="submit" className="flex-1">
              Siguiente
            </Button>
          </div>
        </form>
      )}

      {/* Paciente: Paso 6 — Confirmación */}
      {step === 6 && role === "patient" && (
        <div className="space-y-4">
          <h1 className="font-heading text-xl font-bold text-mu-text">
            Confirma tu registro
          </h1>
          <p className="text-sm text-mu-text-muted">Paso 6 de 6</p>

          <div className="rounded-mu-lg border border-mu-primary/30 bg-mu-accent/40 p-4 text-center">
            <p className="text-sm text-mu-text-muted">
              Se te asignará un alias al crear la cuenta para proteger tu
              privacidad.
            </p>
            <p className="mt-2 text-xs text-mu-text-muted">
              Los profesionales verán ese alias durante las consultas, mensajes y
              videollamadas. Tu identidad real permanecerá protegida.
            </p>
          </div>

          <PrivacyNotice />

          <label
            htmlFor="terms"
            className="flex items-start gap-2 text-sm text-mu-text-muted"
          >
            <input
              type="checkbox"
              id="terms"
              className="mt-1"
              checked={patient.acceptTerms}
              onChange={(e) =>
                updatePatient({ acceptTerms: e.target.checked })
              }
            />
            Acepto términos, privacidad y tratamiento de datos de salud
          </label>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(5)}>
              Atrás
            </Button>
            <Button
              className="flex-1"
              loading={loading}
              onClick={finishPatientRegistration}
            >
              Crear cuenta
            </Button>
          </div>
        </div>
      )}

      {/* Paciente: Éxito con alias */}
      {step === 7 && role === "patient" && (
        <div className="space-y-4 text-center">
          <h1 className="font-heading text-xl font-bold text-mu-text">
            ¡Bienvenido/a a Mente Unida!
          </h1>
          <p className="text-sm text-mu-text-muted">
            Tu cuenta ha sido creada con éxito
          </p>

          <div className="rounded-mu-lg border border-mu-primary/30 bg-mu-accent/40 p-6">
            <p className="text-sm text-mu-text-muted">Tu alias en la plataforma es:</p>
            <p className="mt-2 font-heading text-3xl font-bold text-mu-primary">
              {generatedAlias}
            </p>
            <p className="mt-3 text-sm text-mu-text-muted">
              Los profesionales te identificarán con este alias en consultas,
              mensajes y videollamadas. Tu identidad real permanece protegida.
            </p>
          </div>

          <PrivacyNotice />

          <Button
            className="w-full"
            onClick={() => router.push("/app/paciente")}
          >
            Ir a mi espacio
          </Button>
        </div>
      )}

      {/* Psicólogo: Paso 2 — Datos básicos */}
      {step === 2 && role === "psychologist" && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!validateEmailStep(psychEmailStatus)) return;
            if (!psychBasic.phone.trim()) {
              setError("Ingresa un teléfono de contacto.");
              return;
            }
            if (!isAddressComplete(psychAddress)) {
              setError(
                "Agrega una dirección de residencia completa antes de continuar.",
              );
              return;
            }
            setError(null);
            setStep(3);
          }}
        >
          <h1 className="font-heading text-xl font-bold text-mu-text">
            Crear cuenta
          </h1>
          <p className="text-sm text-mu-text-muted">Paso 2 de 3</p>

          <FormField
            name="name"
            label="Nombre completo"
            required
            autoComplete="name"
            value={psychBasic.name}
            onChange={(e) =>
              setPsychBasic((p) => ({ ...p, name: e.target.value }))
            }
          />
          <FormField
            name="email"
            label="Correo electrónico"
            type="email"
            required
            autoComplete="email"
            value={psychBasic.email}
            onChange={(e) => {
              setPsychBasic((p) => ({ ...p, email: e.target.value }));
              setError(null);
            }}
            error={
              psychEmailStatus === "taken"
                ? emailStatusMessage(psychEmailStatus) ?? undefined
                : undefined
            }
            hint={
              psychEmailStatus !== "taken"
                ? emailStatusMessage(psychEmailStatus) ?? undefined
                : undefined
            }
          />
          {psychEmailStatus === "taken" ? (
            <Link
              href="/login"
              className="text-sm font-medium text-mu-primary hover:underline"
            >
              Ya tengo cuenta — iniciar sesión
            </Link>
          ) : null}
          <FormField
            name="phone"
            label="Teléfono"
            type="tel"
            required
            autoComplete="tel"
            value={psychBasic.phone}
            onChange={(e) =>
              setPsychBasic((p) => ({ ...p, phone: e.target.value }))
            }
            placeholder="300 123 4567"
          />
          <FormField
            name="password"
            label="Contraseña"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={psychBasic.password}
            onChange={(e) =>
              setPsychBasic((p) => ({ ...p, password: e.target.value }))
            }
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-mu-text">
              Dirección de residencia
            </label>
            <button
              type="button"
              onClick={() => setAddressModalFor("psychologist")}
              className="flex w-full items-center justify-between rounded-mu border border-mu-border bg-white px-3 py-2.5 text-left text-sm transition-colors hover:border-mu-primary/50"
            >
              <span
                className={
                  isAddressComplete(psychAddress)
                    ? "text-mu-text"
                    : "text-mu-text-muted"
                }
              >
                {isAddressComplete(psychAddress)
                  ? `${psychAddress.city}, ${psychAddress.department} · ${psychAddress.addressStreetType} ${psychAddress.addressNumber}`
                  : "Haz clic para completar país, ciudad y dirección"}
              </span>
              <span className="shrink-0 text-xs font-medium text-mu-primary">
                {isAddressComplete(psychAddress) ? "Editar" : "Agregar"}
              </span>
            </button>
            {isAddressComplete(psychAddress) ? (
              <div className="rounded-mu border border-mu-border bg-mu-background px-3 py-3 text-sm text-mu-text-muted">
                <p>
                  País:{" "}
                  {COUNTRY_OPTIONS.find(
                    (option) => option.value === psychAddress.country,
                  )?.label ?? psychAddress.country}
                </p>
                <p>Departamento: {psychAddress.department}</p>
                <p>Ciudad: {psychAddress.city}</p>
                <p>
                  Dirección: {psychAddress.addressStreetType}{" "}
                  {psychAddress.addressNumber}
                </p>
                <p>Descripción: {psychAddress.addressHouseDetail}</p>
              </div>
            ) : (
              <p className="text-xs text-mu-text-muted">
                La dirección de residencia es obligatoria.
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              Atrás
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={
                psychEmailStatus === "taken" || psychEmailStatus === "checking"
              }
            >
              Siguiente
            </Button>
          </div>
        </form>
      )}

      {/* Psicólogo: Paso 3 — Perfil profesional */}
      {step === 3 && role === "psychologist" && (
        <form className="space-y-4" onSubmit={finishPsychologist}>
          <h1 className="font-heading text-xl font-bold text-mu-text">
            Perfil profesional
          </h1>
          <p className="text-sm text-mu-text-muted">Paso 3 de 3</p>

          <FormSelect
            name="specialtyCode"
            label="Especialidad principal"
            required
            value={psychProfile.specialtyCode}
            onChange={(e) =>
              setPsychProfile((p) => ({
                ...p,
                specialtyCode: e.target.value,
                specialtyOther:
                  e.target.value === "OTHER" ? p.specialtyOther : "",
              }))
            }
            options={[...PSYCHOLOGIST_SPECIALTY_OPTIONS]}
            placeholder="Selecciona"
          />
          {psychProfile.specialtyCode === "OTHER" ? (
            <FormField
              name="specialtyOther"
              label="¿Cuál es tu especialidad?"
              required
              value={psychProfile.specialtyOther}
              onChange={(e) =>
                setPsychProfile((p) => ({
                  ...p,
                  specialtyOther: e.target.value,
                }))
              }
              placeholder="Escribe tu especialidad"
            />
          ) : null}

          <FormTextarea
            name="bio"
            label="Biografía profesional"
            required
            rows={4}
            value={psychProfile.bio}
            onChange={(e) =>
              setPsychProfile((p) => ({ ...p, bio: e.target.value }))
            }
            placeholder="Cuéntanos brevemente tu enfoque, trayectoria y cómo acompañas a tus pacientes."
          />

          <div className="space-y-3 rounded-mu border border-mu-border p-3">
            <p className="text-sm font-medium text-mu-text">
              Documentos de verificación
            </p>
            <p className="text-xs text-mu-text-muted">
              RETHUS y tarjeta profesional: un archivo cada uno. Puedes agregar
              hasta {MAX_SPECIALIZATION_FILES} archivos de especialización.
            </p>

            {(["RETHUS", "LICENSE"] as const).map((type) => {
              const doc = verificationDocuments.find((item) => item.type === type);
              const inputId = `psych-doc-${type.toLowerCase()}`;
              return (
                <div key={type} className="space-y-1">
                  <label
                    className="block text-sm text-mu-text-muted"
                    htmlFor={inputId}
                  >
                    {verificationTypeLabels[type]}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={doc?.fileName ?? ""}
                      placeholder="Ningún archivo seleccionado"
                      className="min-w-0 flex-1 rounded-mu border border-mu-border bg-mu-background px-3 py-2 text-sm text-mu-text"
                      aria-label={`Archivo ${verificationTypeLabels[type]}`}
                    />
                    <label
                      htmlFor={inputId}
                      className="inline-flex shrink-0 cursor-pointer items-center rounded-mu border border-mu-border bg-mu-accent px-3 py-2 text-sm font-medium text-mu-primary hover:bg-mu-accent/80"
                    >
                      {doc ? "Cambiar" : "Subir"}
                    </label>
                    <input
                      id={inputId}
                      type="file"
                      accept={ACCEPTED_DOCUMENT_TYPES}
                      className="sr-only"
                      onChange={(e) => {
                        void handleVerificationUpload(type, e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </div>
                  <p className="text-xs text-mu-text-muted">Solo .pdf o .doc</p>
                </div>
              );
            })}

            <div className="space-y-1">
              <label className="block text-sm text-mu-text-muted">
                Especialización
              </label>
              <input
                type="file"
                accept={ACCEPTED_DOCUMENT_TYPES}
                multiple
                disabled={
                  verificationDocuments.filter(
                    (doc) => doc.type === "SPECIALIZATION",
                  ).length >= MAX_SPECIALIZATION_FILES
                }
                onChange={(e) => {
                  void handleVerificationUpload("SPECIALIZATION", e.target.files);
                  e.target.value = "";
                }}
                className="block w-full text-sm text-mu-text-muted file:mr-3 file:rounded-mu file:border-0 file:bg-mu-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-mu-primary"
              />
            </div>

            {verificationDocuments.filter((doc) => doc.type === "SPECIALIZATION")
              .length > 0 ? (
              <ul className="space-y-1 text-sm">
                {verificationDocuments.map((doc, index) =>
                  doc.type === "SPECIALIZATION" ? (
                  <li
                    key={`${doc.type}-${doc.fileName}-${index}`}
                    className="flex items-center justify-between gap-2 rounded-mu bg-mu-background px-2 py-1"
                  >
                    <span className="truncate text-mu-text-muted">
                      {doc.fileName}
                    </span>
                    <button
                      type="button"
                      className="shrink-0 text-xs text-mu-error hover:underline"
                      onClick={() => removeVerificationDoc(index)}
                    >
                      Quitar
                    </button>
                  </li>
                  ) : null,
                )}
              </ul>
            ) : null}
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowWorkExpModal(true)}
            >
              Agregar experiencia laboral
            </Button>

            {workExperiences.length > 0 ? (
              <ul className="space-y-2">
                {workExperiences.map((exp, index) => (
                  <li
                    key={`${exp.companyName}-${exp.startDate}-${index}`}
                    className="rounded-mu border border-mu-border px-3 py-2 text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-mu-text">
                          {exp.companyName}
                        </p>
                        <p className="text-mu-text">
                          {exp.roleTitle}
                        </p>
                        <p className="text-mu-text-muted">
                          {exp.startDate}
                          {exp.endDate ? ` → ${exp.endDate}` : " → Actualidad"}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-mu-error hover:underline"
                        onClick={() =>
                          setWorkExperiences((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                      >
                        Quitar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <label
            htmlFor="psych-terms"
            className="flex items-start gap-2 text-sm text-mu-text-muted"
          >
            <input
              type="checkbox"
              id="psych-terms"
              className="mt-1"
              checked={psychAcceptTerms}
              onChange={(e) => setPsychAcceptTerms(e.target.checked)}
            />
            Acepto términos, privacidad y tratamiento de datos de salud
          </label>

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep(2)}>
              Atrás
            </Button>
            <Button type="submit" className="flex-1" loading={loading}>
              Finalizar
            </Button>
          </div>
        </form>
      )}

      {/* Modal: experiencia laboral (psicólogo) */}
      <Dialog.Root open={showWorkExpModal} onOpenChange={setShowWorkExpModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-mu-lg border border-mu-border bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <Dialog.Title className="font-heading text-lg font-semibold text-mu-text">
                Experiencia laboral
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-mu text-mu-text-muted hover:bg-mu-accent"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            <form className="space-y-4" onSubmit={saveWorkExperience}>
              <FormField
                name="companyName"
                label="Institución o empresa"
                required
                value={workExpDraft.companyName}
                onChange={(e) =>
                  setWorkExpDraft((d) => ({
                    ...d,
                    companyName: e.target.value,
                  }))
                }
              />
              <FormField
                name="roleTitle"
                label="Cargo"
                required
                value={workExpDraft.roleTitle}
                onChange={(e) =>
                  setWorkExpDraft((d) => ({
                    ...d,
                    roleTitle: e.target.value,
                  }))
                }
              />
              <FormField
                name="startDate"
                label="Fecha de inicio"
                type="date"
                required
                value={workExpDraft.startDate}
                onChange={(e) =>
                  setWorkExpDraft((d) => ({
                    ...d,
                    startDate: e.target.value,
                  }))
                }
              />
              <FormField
                name="endDate"
                label="Fecha de fin"
                type="date"
                value={workExpDraft.endDate ?? ""}
                onChange={(e) =>
                  setWorkExpDraft((d) => ({
                    ...d,
                    endDate: e.target.value,
                  }))
                }
                hint="Opcional — deja en blanco si es tu trabajo actual"
              />
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowWorkExpModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  Agregar
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={showPsychSuccessModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-mu-lg border border-mu-border bg-white p-6 shadow-xl">
            <Dialog.Title className="font-heading text-xl font-bold text-mu-text">
              Felicidades
            </Dialog.Title>
            <Dialog.Description className="mt-3 text-sm leading-6 text-mu-text-muted">
              Hemos recibido tu información. Ya podrás usar nuestra plataforma;
              mientras se evalúan tus datos podrás ir visualizando la plataforma.
            </Dialog.Description>
            <Button
              className="mt-6 w-full"
              onClick={() => router.push("/app/psicologo")}
            >
              Ir a mi espacio
            </Button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Card>
  );
}
