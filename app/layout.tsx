import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Bolton Digital | Crecimiento Inteligente",
  description: "Plataforma de crecimiento automático para profesionales. Traduce datos en acción.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --font-inter: 'Inter', sans-serif;
            --font-outfit: 'Outfit', sans-serif;
          }
          h1, h2, h3 { font-family: var(--font-outfit); }
        ` }} />
      </head>
      <body>
        <Navbar />
        <main style={{ paddingTop: "6rem" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
