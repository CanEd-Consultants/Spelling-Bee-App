import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Spelling Bee of Canada — Practice App",
  description:
    "Practice and study platform for Spelling Bee of Canada contestants. Study the official word list, practice spelling interactively, and track your progress.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fredoka:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-sboc-white text-sboc-dark font-body antialiased">
        {children}
      </body>
    </html>
  )
}
