import type { ReactNode } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { RequireSession } from "./auth/RequireSession";
import { AdminLayout } from "./components/AdminShell";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { ScrollManager } from "./components/ScrollManager";
import { ClinicProvider } from "./portal/clinic";
import { ResetPasswordPage, VerifyEmailPage } from "./pages/AuthTokenPages";
import { InfoPage } from "./pages/InfoPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { AdminCommunityPage } from "./pages/admin/CommunityPage";
import { AdminDashboardPage } from "./pages/admin/DashboardPage";
import { AdminMetricsPage } from "./pages/admin/MetricsPage";
import { AdminSettingsPage } from "./pages/admin/SettingsPage";
import { AdminUsersPage } from "./pages/admin/UsersPage";
import { AdminValidationPage } from "./pages/admin/ValidationPage";
import { PatientAppointmentsPage, PatientBookPage, PatientHomePage } from "./pages/portal/PatientPages";
import { PatientChartPage } from "./pages/portal/PatientChartPage";
import { PsychAgendaPage, PsychBookPage, PsychHomePage, PsychPatientsPage } from "./pages/portal/PsychPages";
import { EscuchaderoPage, VideoRoomPage } from "./pages/portal/Rooms";
import { RegisterPage } from "./pages/RegisterPage";

function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface pt-16 md:pt-20">{children}</main>
      <Footer />
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <ClinicProvider>
      <ScrollManager />
      <Routes>
        <Route
          path="/"
          element={
            <MarketingLayout>
              <LandingPage />
            </MarketingLayout>
          }
        />
        <Route
          path="/recursos"
          element={
            <MarketingLayout>
              <InfoPage kind="resources" />
            </MarketingLayout>
          }
        />
        <Route
          path="/privacidad"
          element={
            <MarketingLayout>
              <InfoPage kind="privacy" />
            </MarketingLayout>
          }
        />
        <Route
          path="/terminos"
          element={
            <MarketingLayout>
              <InfoPage kind="terms" />
            </MarketingLayout>
          }
        />
        <Route path="/iniciar-sesion" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/verificar-correo" element={<VerifyEmailPage />} />
        <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />
        <Route path="/paciente" element={<RequireSession role="PATIENT"><PatientHomePage /></RequireSession>} />
        <Route path="/paciente/citas" element={<RequireSession role="PATIENT"><PatientAppointmentsPage /></RequireSession>} />
        <Route path="/paciente/agendar" element={<RequireSession role="PATIENT"><PatientBookPage /></RequireSession>} />
        <Route path="/paciente/escuchadero" element={<RequireSession role="PATIENT"><EscuchaderoPage role="patient" /></RequireSession>} />
        <Route path="/paciente/sala" element={<RequireSession role="PATIENT"><VideoRoomPage role="patient" /></RequireSession>} />
        <Route path="/psicologo" element={<RequireSession role="PSYCHOLOGIST"><PsychHomePage /></RequireSession>} />
        <Route path="/psicologo/agenda" element={<RequireSession role="PSYCHOLOGIST"><PsychAgendaPage /></RequireSession>} />
        <Route path="/psicologo/pacientes" element={<RequireSession role="PSYCHOLOGIST"><PsychPatientsPage /></RequireSession>} />
        <Route path="/psicologo/pacientes/:patientId" element={<RequireSession role="PSYCHOLOGIST"><PatientChartPage /></RequireSession>} />
        <Route path="/psicologo/agendar" element={<RequireSession role="PSYCHOLOGIST"><PsychBookPage /></RequireSession>} />
        <Route path="/psicologo/escuchadero" element={<RequireSession role="PSYCHOLOGIST"><EscuchaderoPage role="psychologist" /></RequireSession>} />
        <Route path="/psicologo/sala" element={<RequireSession role="PSYCHOLOGIST"><VideoRoomPage role="psychologist" /></RequireSession>} />
        <Route path="/admin" element={<RequireSession role="ADMIN"><AdminLayout /></RequireSession>}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="validacion" element={<AdminValidationPage />} />
          <Route path="usuarios" element={<AdminUsersPage />} />
          <Route path="comunidad" element={<AdminCommunityPage />} />
          <Route path="metricas" element={<AdminMetricsPage />} />
          <Route path="configuracion" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
      </ClinicProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
