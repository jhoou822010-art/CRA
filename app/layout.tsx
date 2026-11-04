import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Compras Rápidas — Encontre boas escolhas", description: "Uma vitrine de boas escolhas." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html>; }
