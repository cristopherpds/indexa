import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Indexa+",
  description: "Conversor de Unidades Indexadas, Reajustables y Previsionales",
  openGraph: {
    title: "Indexa+",
    description:
      "Conversor de Unidades Indexadas, Reajustables y Previsionales con cotizaciones oficiales del Banco Central del Uruguay",
    type: "website",
    locale: "es_UY",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indexa+",
    description:
      "Conversor de Unidades Indexadas, Reajustables y Previsionales con cotizaciones oficiales del Banco Central del Uruguay",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.className}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
