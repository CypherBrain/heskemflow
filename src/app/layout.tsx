import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { heIL } from "@clerk/localizations"
import { Heebo, Assistant } from "next/font/google"
import "./globals.css"

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-heebo",
  display: "swap",
})

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-assistant",
  display: "swap",
})

export const metadata: Metadata = {
  title: "HeskemFlow | מערכת חוזים",
  description:
    "מערכת ניהול חוזים חכמה לעסקים - ניהול תבניות, תהליכי חתימה, ומעקב אחר חוזים במקום אחד",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} ${assistant.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans antialiased">
        <ClerkProvider localization={heIL}>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
