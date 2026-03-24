"use client";

import AuthForm from "@/components/AuthForm";

export default function CrearCuentaPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)", padding: "1.5rem" }}>
      <AuthForm initialMode="signup" backPath="/" />
    </div>
  );
}
