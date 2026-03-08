import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bolton Digital | Soluciones de Marketing e IA de Alto Nivel",
  description: "Agencia boutique de marketing digital que fusiona estrategia de alto nivel con innovación en Inteligencia Artificial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
