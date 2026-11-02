import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { uploadVerificationDocument, type RegisterPatientInput, type RegisterPsychologistInput } from "../api/auth";
import { apiErrorMessage } from "../api/client";
import { useAuth } from "../auth/AuthProvider";
import { passwordIssue } from "../auth/password";
import { Icon } from "../components/Icon";
import { Logo } from "../components/Logo";
import { Field, Modal, fieldClass } from "../components/ui";

type Role = "patient" | "psychologist";

type AddressDraft = {
  country: string;
  department: string;
  city: string;
  neighborhood: string;
  streetType: string;
  mainNumber: string;
  secondary: string;
};

const emptyAddress = (): AddressDraft => ({
  country: "Colombia",
  department: "",
  city: "",
  neighborhood: "",
  streetType: "Carrera",
  mainNumber: "",
  secondary: "",
});

function formatAddress(address: AddressDraft) {
  const street = [address.streetType, address.mainNumber].filter(Boolean).join(" ");
  const via = address.secondary ? `${street} / ${address.secondary}` : street;
  return [via, address.neighborhood, address.city, address.department, address.country].filter(Boolean).join(", ");
}

const patientLabels = ["Básica", "Contacto", "Acompañante", "Seguridad"];
const psychLabels = ["Básica", "Contacto", "Acreditación", "Credenciales"];

const assurances = [
  { icon: "lock", title: "Confidencialidad Total", text: "Protocolos de encriptación de grado médico protegiendo cada registro y sesión.", tone: "text-primary-container bg-primary-container/10" },
  { icon: "verified_user", title: "Psicólogos Validados", text: "Verificación estricta de tarjeta profesional y registro RETHUS oficial.", tone: "text-secondary bg-secondary/10" },
  { icon: "diversity_1", title: "Atención Humanizada", text: "Sin prisas ni estigmas: un puente cálido hacia tu salud integral.", tone: "text-primary-container bg-primary-container/10" },
];

const relationships = ["Padre", "Madre", "Hermano/a", "Tío/a"];

const documentTypes = [
  { value: "CC", label: "Cédula de ciudadanía" },
  { value: "CE", label: "Cédula de extranjería" },
  { value: "PASSPORT", label: "Pasaporte" },
  { value: "TI", label: "Tarjeta de identidad" },
  { value: "OTHER", label: "Otro" },
] as const;

const accreditationFiles = [
  { id: "university", icon: "school", label: "Universidad o institución de formación", type: "CERTIFICATION" },
  { id: "experience", icon: "work_history", label: "Experiencia profesional", type: "OTHER" },
  { id: "card", icon: "badge", label: "Soporte de la tarjeta profesional", type: "LICENSE" },
  { id: "rethus", icon: "verified", label: "Registro en RETHUS", type: "RETHUS" },
  { id: "studies", icon: "menu_book", label: "Especializaciones y estudios complementarios", type: "SPECIALIZATION" },
  { id: "diplomas", icon: "workspace_premium", label: "Certificados y diplomas", type: "OTHER" },
  { id: "identity", icon: "contact_page", label: "Documentos que acrediten su identidad y formación", type: "IDENTITY" },
];

function countryCode(value: string) {
  const trimmed = value.trim();
  if (!trimmed || /^colombia$/i.test(trimmed)) return "CO";
  return trimmed;
}

function addressLine(address: AddressDraft) {
  const street = [address.streetType, address.mainNumber].filter(Boolean).join(" ");
  const via = address.secondary ? `${street} / ${address.secondary}` : street;
  return [via, address.neighborhood].filter(Boolean).join(", ");
}

function omitBlank<T extends Record<string, unknown>>(input: T) {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string") {
      if (value.trim()) output[key] = value.trim();
      continue;
    }
    output[key] = value;
  }
  return output as T;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { registerPatient, registerPsychologist } = useAuth();
  const reduce = useReducedMotion();
  const [role, setRole] = useState<Role>("patient");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [patientAddress, setPatientAddress] = useState<AddressDraft>(emptyAddress);
  const [psychAddress, setPsychAddress] = useState<AddressDraft>(emptyAddress);
  const [patient, setPatient] = useState({
    firstName: "",
    lastName: "",
    docType: "CC",
    docNumber: "",
    birthDate: "",
    mobile: "",
    email: "",
    address: "",
    companionName: "",
    companionPhone: "",
    companionEmail: "",
    relationship: "",
    companionBirthDate: "",
    password: "",
    passwordConfirm: "",
    terms: false,
  });
  const [psych, setPsych] = useState({
    firstName: "",
    lastName: "",
    docNumber: "",
    mobile: "",
    email: "",
    address: "",
    licenseNumber: "",
    files: {} as Record<string, File>,
    password: "",
    passwordConfirm: "",
    terms: false,
  });

  const labels = role === "patient" ? patientLabels : psychLabels;
  const address = role === "patient" ? patientAddress : psychAddress;
  const setAddress = role === "patient" ? setPatientAddress : setPsychAddress;
  const preview = formatAddress(address);

  function updatePatient<K extends keyof typeof patient>(key: K, value: (typeof patient)[K]) {
    setPatient((current) => ({ ...current, [key]: value }));
  }

  function updatePsych<K extends keyof typeof psych>(key: K, value: (typeof psych)[K]) {
    setPsych((current) => ({ ...current, [key]: value }));
  }

  function switchRole(next: Role) {
    setRole(next);
    setStep(1);
    setError("");
  }

  function validate(target = step) {
    if (role === "patient") {
      if (target === 1 && (!patient.firstName || !patient.lastName || !patient.docType || !patient.docNumber || !patient.birthDate)) {
        return "Completa nombres, tipo y número de identificación, y fecha de nacimiento.";
      }
      if (target === 2 && (!patient.mobile || !patient.email || !patient.address)) {
        return "Necesitamos celular, correo y una dirección guardada.";
      }
      if (target === 3 && (!patient.companionName || !patient.companionPhone || !patient.companionEmail || !patient.relationship || !patient.companionBirthDate)) {
        return "Completa nombre, teléfono, correo, parentesco y fecha de nacimiento del acompañante.";
      }
      if (target === 4) {
        const issue = passwordIssue(patient.password, patient.passwordConfirm);
        if (issue) return issue;
        if (!patient.terms) return "Acepta los términos y condiciones de la plataforma.";
      }
    } else {
      if (target === 1 && (!psych.firstName || !psych.lastName || !psych.docNumber)) {
        return "Completa nombres y número de identificación.";
      }
      if (target === 2 && (!psych.mobile || !psych.email || !psych.address)) {
        return "Necesitamos celular, correo y una dirección guardada.";
      }
      if (target === 3 && !psych.licenseNumber.trim()) {
        return "Escribe el número de tarjeta profesional.";
      }
      if (target === 3 && accreditationFiles.some((file) => !psych.files[file.id])) {
        return "Adjunta el soporte de cada dato de acreditación.";
      }
      if (target === 4) {
        const issue = passwordIssue(psych.password, psych.passwordConfirm);
        if (issue) return issue;
        if (!psych.terms) return "Acepta los términos y condiciones de la plataforma.";
      }
    }
    return "";
  }

  function patientPayload(): RegisterPatientInput {
    const email = patient.companionEmail.trim();
    return omitBlank({
      name: `${patient.firstName} ${patient.lastName}`.trim(),
      email: patient.email.trim(),
      password: patient.password,
      acceptTerms: true,
      documentType: patient.docType === "CE" || patient.docType === "PASSPORT" || patient.docType === "TI" || patient.docType === "OTHER" ? patient.docType : "CC",
      documentNumber: patient.docNumber.trim(),
      birthDate: patient.birthDate,
      phone: patient.mobile.trim(),
      country: countryCode(patientAddress.country),
      department: patientAddress.department.trim(),
      city: patientAddress.city.trim(),
      addressLine: addressLine(patientAddress),
      emergencyContactDetail: {
        name: patient.companionName.trim(),
        phone: patient.companionPhone.trim(),
        relationship: patient.relationship,
        ...(email ? { email } : {}),
      },
    });
  }

  function psychologistPayload(): RegisterPsychologistInput {
    return omitBlank({
      name: `${psych.firstName} ${psych.lastName}`.trim(),
      email: psych.email.trim(),
      password: psych.password,
      licenseNumber: psych.licenseNumber.trim(),
      acceptTerms: true,
      phone: psych.mobile.trim(),
      country: countryCode(psychAddress.country),
      department: psychAddress.department.trim(),
      city: psychAddress.city.trim(),
      addressLine: addressLine(psychAddress),
    });
  }

  async function next() {
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    setError("");
    if (step < 4) {
      setStep((current) => current + 1);
      return;
    }
    setSubmitting(true);
    try {
      if (role === "patient") {
        await registerPatient(patientPayload());
        navigate("/paciente", { replace: true });
        return;
      }
      await registerPsychologist(psychologistPayload());
      const failures: string[] = [];
      for (const item of accreditationFiles) {
        const file = psych.files[item.id];
        if (!file) continue;
        try {
          await uploadVerificationDocument(file, item.type);
        } catch (caught) {
          failures.push(`${item.label}: ${apiErrorMessage(caught, "no se pudo guardar")}`);
        }
      }
      navigate("/psicologo", {
        replace: true,
        state: {
          notice: failures.length
            ? `Tu cuenta quedó creada. Estos documentos no se guardaron: ${failures.join(" · ")}`
            : "Tu cuenta quedó creada. La verificación profesional sigue pendiente hasta que un administrador la apruebe.",
        },
      });
    } catch (caught) {
      setError(apiErrorMessage(caught, "No pudimos crear la cuenta."));
    } finally {
      setSubmitting(false);
    }
  }

  function saveAddress() {
    if (!address.country || !address.department || !address.city || !address.neighborhood || !address.streetType || !address.mainNumber || !address.secondary) {
      setAddressError("Completa país, departamento, ciudad, barrio y los dos números de la dirección.");
      return;
    }
    const formatted = formatAddress(address);
    if (role === "patient") updatePatient("address", formatted);
    else updatePsych("address", formatted);
    setAddressError("");
    setError("");
    setAddressOpen(false);
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-8 sm:px-6 md:py-12">
      <motion.div
        className="mx-auto w-full max-w-[1240px]"
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-primary-container hover:underline">
          <Icon name="arrow_back" className="text-[18px]" />
          Volver al inicio
        </Link>
        <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center text-center">
          <Logo size="lg" className="mb-6" />
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-container/20 bg-primary-container/10 px-3.5 py-1.5 font-display text-sm font-semibold text-primary-container">
            <Icon name="spa" filled className="text-[16px]" />
            Espacio Seguro & Confiable
          </span>
          <h1 className="font-display text-[1.7rem] leading-tight font-semibold tracking-tight sm:text-3xl md:text-[40px] md:leading-[48px]">Crea tu cuenta en Mente Unida</h1>
          <p className="mt-2 text-ink-soft">Un entorno empático donde tu bienestar emocional y tu labor clínica se encuentran con dignidad.</p>
        </div>

        <div className="mx-auto mb-12 max-w-3xl overflow-hidden rounded-2xl border border-surface-high bg-white shadow-xl">
          <div className="flex flex-col gap-2 border-b border-surface-high bg-surface-low p-3 sm:flex-row sm:items-center sm:justify-center">
            <Tab active={role === "patient"} icon="sentiment_satisfied" label="Soy Usuario / Paciente" onClick={() => switchRole("patient")} />
            <Tab active={role === "psychologist"} icon="psychology" label="Soy Profesional / Psicólogo" onClick={() => switchRole("psychologist")} />
          </div>
          <div className="px-4 pt-6 pb-4 sm:px-6 sm:pt-8 md:px-12">
            <div className="relative flex items-center justify-between">
              <div className="absolute top-5 right-0 left-0 h-1 -translate-y-1/2 bg-surface-mid" />
              <div
                className="absolute top-5 left-0 h-1 -translate-y-1/2 bg-primary-container transition-all duration-300"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              />
              {labels.map((label, index) => {
                const number = index + 1;
                const done = number < step;
                const current = number === step;
                return (
                  <button key={label} type="button" onClick={() => number <= step && setStep(number)} className="relative z-10 flex flex-col items-center">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-semibold transition ${
                        current
                          ? "bg-primary-container text-white shadow-md ring-4 ring-primary-container/20"
                          : done
                            ? "bg-primary-container text-white"
                            : "bg-surface-mid text-ink-soft"
                      }`}
                    >
                      {done ? <Icon name="check" className="text-[18px]" /> : number}
                    </span>
                    <span className={`mt-2 hidden max-w-[6.5rem] text-center text-sm leading-5 md:block ${number <= step ? "font-semibold text-ink" : "text-ink-soft"}`}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-4 pt-4 pb-8 sm:px-6 md:px-12 md:pb-10">
            <motion.div
              key={`${role}-${step}`}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.28 }}
              className="space-y-6"
            >
              {role === "patient" ? (
                <PatientSteps step={step} data={patient} onChange={updatePatient} onAddress={() => setAddressOpen(true)} />
              ) : (
                <PsychSteps step={step} data={psych} onChange={updatePsych} onFile={(id, file) => updatePsych("files", { ...psych.files, [id]: file })} onAddress={() => setAddressOpen(true)} />
              )}
            </motion.div>

            {error ? (
              <p className="mt-4 text-sm text-error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col items-stretch justify-between gap-3 border-t border-surface-high pt-8 md:flex-row md:items-center">
              <button
                type="button"
                disabled={step === 1}
                onClick={() => {
                  setError("");
                  setStep((current) => Math.max(1, current - 1));
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-surface-mid px-6 py-3 font-display text-sm font-semibold shadow-sm transition hover:bg-surface-highest disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
              >
                <Icon name="arrow_back" className="text-[18px]" />
                Anterior
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void next()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-container px-6 py-3 text-center font-display text-sm font-semibold text-white shadow-md transition hover:bg-primary disabled:opacity-60 md:w-auto md:px-8"
              >
                {submitting ? "Creando tu cuenta…" : step < 4 ? "Siguiente paso" : role === "patient" ? "Completar Registro" : "Enviar Solicitud de Acreditación"}
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </div>
            <p className="pt-6 text-center text-sm text-ink-soft">
              ¿Ya tienes una cuenta registrada?
              <Link to="/iniciar-sesion" className="ml-1 font-semibold text-primary-container hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
          {assurances.map((item) => (
            <article key={item.title} className="flex items-start gap-4 rounded-2xl border border-surface-high bg-white p-6 shadow-sm">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.tone}`}>
                <Icon name={item.icon} />
              </span>
              <div>
                <h2 className="mb-1 font-display text-lg font-semibold">{item.title}</h2>
                <p className="text-xs leading-5 text-ink-soft">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </motion.div>

      {addressOpen ? (
        <Modal
          title="Ingresar Dirección"
          subtitle="País, ciudad y la vía con sus dos números"
          onClose={() => setAddressOpen(false)}
          footer={
            <>
              <button type="button" onClick={() => setAddressOpen(false)} className="rounded-lg bg-surface-mid px-4 py-2.5 font-display text-sm font-semibold">
                Cancelar
              </button>
              <button type="button" onClick={saveAddress} className="rounded-lg bg-primary-container px-6 py-2.5 font-display text-sm font-semibold text-white hover:bg-primary">
                Guardar Dirección
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="País" required>
                <input className={fieldClass} value={address.country} onChange={(event) => setAddress({ ...address, country: event.target.value })} />
              </Field>
              <Field label="Departamento" required>
                <input className={fieldClass} placeholder="Ej. Antioquia" value={address.department} onChange={(event) => setAddress({ ...address, department: event.target.value })} />
              </Field>
            </div>
            <Field label="Ciudad" required>
              <input className={fieldClass} placeholder="Ej. Medellín" value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} />
            </Field>
            <Field label="Dirección" required>
              <select className={fieldClass} value={address.streetType} onChange={(event) => setAddress({ ...address, streetType: event.target.value })}>
                {["Carrera", "Calle", "Avenida"].map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Número" required>
                <input className={fieldClass} placeholder="Ej. 43A" value={address.mainNumber} onChange={(event) => setAddress({ ...address, mainNumber: event.target.value })} />
              </Field>
              <Field label="Segundo número" required hint="Se muestra después de la barra: Carrera 43A / 18-45">
                <input className={fieldClass} placeholder="Ej. 18-45" value={address.secondary} onChange={(event) => setAddress({ ...address, secondary: event.target.value })} />
              </Field>
            </div>
            <Field label="Barrio" required>
              <input className={fieldClass} placeholder="Ej. El Poblado" value={address.neighborhood} onChange={(event) => setAddress({ ...address, neighborhood: event.target.value })} />
            </Field>
            <div className="rounded-xl border border-line-soft/40 bg-surface-mid p-3.5">
              <span className="mb-1 block text-sm text-ink-soft">Así se verá en contacto:</span>
              <span className="font-display text-sm font-medium leading-6 text-primary">{preview || "Completa los campos para ver la dirección."}</span>
            </div>
            {addressError ? (
              <p className="text-sm text-error" role="alert">
                {addressError}
              </p>
            ) : null}
          </div>
        </Modal>
      ) : null}

    </main>
  );
}

function Tab({ active, icon, label, onClick }: { active: boolean; icon: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-center font-display text-sm leading-5 font-semibold transition sm:max-w-xs sm:flex-1 ${active ? "bg-primary-container text-white shadow-sm" : "text-ink-soft hover:bg-surface-mid hover:text-ink"}`}
    >
      <Icon name={icon} className="shrink-0 text-[18px]" />
      <span>{label}</span>
    </button>
  );
}

function StepHeading({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-surface-high pb-2">
      <span className="h-6 w-2 rounded-full bg-primary-container" />
      <div>
        <h2 className="font-display text-lg font-semibold sm:text-[22px]">{title}</h2>
        <p className="text-sm leading-6 text-ink-soft">{text}</p>
      </div>
    </div>
  );
}

function PasswordPair({
  password,
  confirm,
  onPassword,
  onConfirm,
}: {
  password: string;
  confirm: string;
  onPassword: (value: string) => void;
  onConfirm: (value: string) => void;
}) {
  return (
    <div className="grid gap-4">
      <SecretField label="Contraseña" value={password} onChange={onPassword} placeholder="Mayúscula, minúscula y número" />
      <SecretField label="Confirmación de contraseña" value={confirm} onChange={onConfirm} placeholder="Repite tu contraseña" />
    </div>
  );
}

function SecretField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} required>
      <span className="relative">
        <input type={visible ? "text" : "password"} className={`${fieldClass} pr-11`} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} autoComplete="new-password" />
        <button type="button" className="absolute top-3.5 right-3.5 text-ink-soft" aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setVisible((current) => !current)}>
          <Icon name={visible ? "visibility_off" : "visibility"} className="text-[18px]" />
        </button>
      </span>
    </Field>
  );
}

function PatientSteps({
  step,
  data,
  onChange,
  onAddress,
}: {
  step: number;
  data: {
    firstName: string;
    lastName: string;
    docType: string;
    docNumber: string;
    birthDate: string;
    mobile: string;
    email: string;
    address: string;
    companionName: string;
    companionPhone: string;
    companionEmail: string;
    relationship: string;
    companionBirthDate: string;
    password: string;
    passwordConfirm: string;
    terms: boolean;
  };
  onChange: <K extends keyof typeof data>(key: K, value: (typeof data)[K]) => void;
  onAddress: () => void;
}) {
  if (step === 1) {
    return (
      <>
        <StepHeading title="Información básica" text="Cuéntanos quién eres para abrir tu ficha." />
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Nombres" required>
            <input className={fieldClass} placeholder="Ej. Mariana Sofía" value={data.firstName} onChange={(event) => onChange("firstName", event.target.value)} />
          </Field>
          <Field label="Apellidos" required>
            <input className={fieldClass} placeholder="Ej. Gómez Restrepo" value={data.lastName} onChange={(event) => onChange("lastName", event.target.value)} />
          </Field>
        </div>
        <Field label="Tipo de identificación" required>
          <select className={fieldClass} value={data.docType} onChange={(event) => onChange("docType", event.target.value)}>
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Número de identificación" required>
          <input className={fieldClass} placeholder="Número de documento sin puntos" value={data.docNumber} onChange={(event) => onChange("docNumber", event.target.value)} />
        </Field>
        <Field label="Fecha de nacimiento" required>
          <input type="date" className={fieldClass} value={data.birthDate} onChange={(event) => onChange("birthDate", event.target.value)} />
        </Field>
      </>
    );
  }

  if (step === 2) {
    return (
      <>
        <StepHeading title="Contacto" text="Celular, correo y la dirección donde podamos ubicarte." />
        <Field label="Número de celular" required>
          <input className={fieldClass} inputMode="tel" placeholder="Ej. 312 458 9201" value={data.mobile} onChange={(event) => onChange("mobile", event.target.value)} />
        </Field>
        <Field label="Correo electrónico" required>
          <input type="email" className={fieldClass} placeholder="ejemplo@correo.com" value={data.email} onChange={(event) => onChange("email", event.target.value)} />
        </Field>
        <AddressBox value={data.address} onOpen={onAddress} />
      </>
    );
  }

  if (step === 3) {
    return (
      <>
        <StepHeading title="Contacto del acompañante o contacto de emergencia" text="Persona de confianza a quien recurrir si hace falta apoyo." />
        <Field label="Nombre del contacto" required>
          <input className={fieldClass} placeholder="Ej. Carlos Alberto Gómez" value={data.companionName} onChange={(event) => onChange("companionName", event.target.value)} />
        </Field>
        <Field label="Teléfono" required>
          <input className={fieldClass} inputMode="tel" placeholder="Ej. 310 987 6543" value={data.companionPhone} onChange={(event) => onChange("companionPhone", event.target.value)} />
        </Field>
        <Field label="Correo electrónico" required>
          <input type="email" className={fieldClass} placeholder="contacto@correo.com" value={data.companionEmail} onChange={(event) => onChange("companionEmail", event.target.value)} />
        </Field>
        <Field label="Parentesco" required>
          <select className={fieldClass} value={data.relationship} onChange={(event) => onChange("relationship", event.target.value)}>
            <option value="">Selecciona el parentesco</option>
            {relationships.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fecha de nacimiento" required>
          <input type="date" className={fieldClass} value={data.companionBirthDate} onChange={(event) => onChange("companionBirthDate", event.target.value)} />
        </Field>
      </>
    );
  }

  return (
    <>
      <StepHeading title="Seguridad de tu cuenta" text="Crea tu contraseña y acepta las condiciones para terminar." />
      <WelcomeNote />
      <PasswordPair password={data.password} confirm={data.passwordConfirm} onPassword={(value) => onChange("password", value)} onConfirm={(value) => onChange("passwordConfirm", value)} />
      <label className="flex items-start gap-3 rounded-xl border border-primary-container/20 bg-surface-low p-4 text-sm leading-6">
        <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-primary-container" checked={data.terms} onChange={(event) => onChange("terms", event.target.checked)} />
        <span>
          Acepto los <Link to="/terminos" className="font-semibold text-primary-container hover:underline">términos y condiciones</Link> de la plataforma.
        </span>
      </label>
    </>
  );
}

function WelcomeNote() {
  return (
    <div className="space-y-3 rounded-2xl border border-primary-container/30 bg-surface-low p-5 text-sm leading-6 text-ink shadow-sm sm:p-6">
      <h3 className="font-display text-lg font-semibold text-primary-container">💚 ¡Bienvenido a Mente Unida!</h3>
      <p>Nos alegra mucho que estés aquí y que hayas decidido dar este paso. Sabemos que no siempre es fácil reconocer que necesitamos apoyo, pero queremos que sepas algo muy importante: no tienes que afrontar todo lo que estás viviendo a solas.</p>
      <p>En Mente Unida creemos que tu bienestar importa, que tus emociones merecen ser escuchadas y que tú eres mucho más que las dificultades que estás atravesando.</p>
      <p>Tu salud mental no es un juego, y tú tampoco eres alguien que deba dejarse para después. Mereces atención, respeto, comprensión y un espacio seguro donde puedas expresarte sin miedo a ser juzgado.</p>
      <p>Estamos aquí para acompañarte en este camino, recordándote que pedir ayuda no es una señal de debilidad, sino un paso valioso hacia tu bienestar.</p>
      <p className="font-semibold text-primary">💚 Tú importas. Tu historia importa. Tu salud mental importa.</p>
      <p>Gracias por confiar en Mente Unida. Nos alegra ser parte de este camino contigo.</p>
    </div>
  );
}

function PsychSteps({
  step,
  data,
  onChange,
  onFile,
  onAddress,
}: {
  step: number;
  data: {
    firstName: string;
    lastName: string;
    docNumber: string;
    mobile: string;
    email: string;
    address: string;
    licenseNumber: string;
    files: Record<string, File>;
    password: string;
    passwordConfirm: string;
    terms: boolean;
  };
  onChange: <K extends keyof typeof data>(key: K, value: (typeof data)[K]) => void;
  onFile: (id: string, file: File) => void;
  onAddress: () => void;
}) {
  const [fileError, setFileError] = useState("");

  if (step === 1) {
    return (
      <>
        <StepHeading title="Información básica" text="Datos de quien solicita unirse como profesional." />
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Nombres" required>
            <input className={fieldClass} placeholder="Ej. Alejandro" value={data.firstName} onChange={(event) => onChange("firstName", event.target.value)} />
          </Field>
          <Field label="Apellidos" required>
            <input className={fieldClass} placeholder="Ej. Morales Vargas" value={data.lastName} onChange={(event) => onChange("lastName", event.target.value)} />
          </Field>
        </div>
        <Field label="Número de identificación" required>
          <input className={fieldClass} placeholder="Número de documento sin puntos" value={data.docNumber} onChange={(event) => onChange("docNumber", event.target.value)} />
        </Field>
      </>
    );
  }

  if (step === 2) {
    return (
      <>
        <StepHeading title="Contacto" text="Celular, correo y la dirección de atención." />
        <Field label="Número de celular" required>
          <input className={fieldClass} inputMode="tel" placeholder="Ej. 310 000 0000" value={data.mobile} onChange={(event) => onChange("mobile", event.target.value)} />
        </Field>
        <Field label="Correo electrónico" required>
          <input type="email" className={fieldClass} placeholder="profesional@correo.com" value={data.email} onChange={(event) => onChange("email", event.target.value)} />
        </Field>
        <AddressBox value={data.address} onOpen={onAddress} />
      </>
    );
  }

  if (step === 3) {
    return (
      <>
        <StepHeading title="Información y acreditación profesional" text="Escribe tu tarjeta profesional y adjunta el soporte de cada dato. PDF, JPG o PNG, hasta 8 MB." />
        <Field label="Número de tarjeta profesional" required hint="Este número queda en tu cuenta. El archivo de abajo es el soporte.">
          <input className={fieldClass} placeholder="Ej. PSI-12345" value={data.licenseNumber} onChange={(event) => onChange("licenseNumber", event.target.value)} />
        </Field>
        <div className="grid gap-4">
          {accreditationFiles.map((file) => (
            <div key={file.id} className="flex flex-col gap-3 rounded-xl border border-line-soft/40 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <Icon name={file.icon} className="mt-0.5 text-[24px] text-primary-container" />
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold">{file.label} *</p>
                  <p className={`text-sm leading-5 ${data.files[file.id] ? "font-semibold text-primary-container" : "text-ink-soft"}`}>
                    {data.files[file.id] ? data.files[file.id].name : "Ningún archivo cargado"}
                  </p>
                </div>
              </div>
              <label className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-line-soft/50 bg-surface-mid px-4 py-2.5 font-display text-sm font-semibold sm:w-auto">
                <Icon name="upload_file" className="text-[18px]" />
                Subir archivo
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  className="sr-only"
                  onChange={(event) => {
                    const selected = event.target.files?.[0];
                    if (!selected) return;
                    if (selected.size > 8 * 1024 * 1024) {
                      setFileError("Cada archivo debe pesar 8 MB o menos.");
                      return;
                    }
                    setFileError("");
                    onFile(file.id, selected);
                  }}
                />
              </label>
            </div>
          ))}
        </div>
        {fileError ? <p className="text-sm text-error">{fileError}</p> : null}
      </>
    );
  }

  return (
    <>
      <StepHeading title="Credenciales de acceso" text="Define tu contraseña y acepta las condiciones para enviar la solicitud." />
      <div className="space-y-3 rounded-2xl border border-primary-container/30 bg-surface-low p-5 text-sm leading-6 text-ink shadow-sm sm:p-6">
        <h3 className="font-display text-lg font-semibold text-primary">¡Felicitaciones!</h3>
        <p>Hemos recibido tu solicitud de registro en Mente Unida.</p>
        <p>Nuestro equipo revisará tus datos y credenciales profesionales para validar tu información. Una vez aprobada tu solicitud, podrás acceder a los servicios y herramientas que Mente Unida tiene para ti.</p>
        <p>Te notificaremos cuando el proceso de verificación haya finalizado.</p>
        <p className="font-semibold text-primary">Gracias por querer formar parte de Mente Unida. 💚</p>
      </div>
      <PasswordPair password={data.password} confirm={data.passwordConfirm} onPassword={(value) => onChange("password", value)} onConfirm={(value) => onChange("passwordConfirm", value)} />
      <label className="flex items-start gap-3 rounded-xl border border-line-soft/40 bg-surface-mid p-4 text-sm leading-6">
        <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-primary-container" checked={data.terms} onChange={(event) => onChange("terms", event.target.checked)} />
        <span>
          Acepto los <Link to="/terminos" className="font-semibold text-primary-container hover:underline">términos y condiciones</Link> de la plataforma.
        </span>
      </label>
    </>
  );
}

function AddressBox({ value, onOpen }: { value: string; onOpen: () => void }) {
  return (
    <div className="space-y-3 rounded-xl border border-primary-container/30 bg-surface-low p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <span className="font-display text-sm font-semibold">Dirección *</span>
          <span className="mt-1 block text-sm leading-6 text-ink-soft">Abre el formulario para armar la dirección. Al guardar, aparecerá aquí.</span>
        </div>
        <button type="button" onClick={onOpen} className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-secondary px-4 py-2.5 font-display text-sm font-semibold text-white sm:w-auto">
          <Icon name={value ? "edit_location_alt" : "home_pin"} className="text-[18px]" />
          {value ? "Modificar dirección" : "Ingresar dirección"}
        </button>
      </div>
      <input readOnly aria-label="Dirección guardada" className={`${fieldClass} cursor-default`} value={value} placeholder="Ninguna dirección guardada aún." />
    </div>
  );
}
