import type React from "react"
import type { Metadata } from "next"
import { Anek_Tamil } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { NotificationProvider } from "@/contexts/notification-context"
import "./globals.css"

const anekTamil = Anek_Tamil({ subsets: ["latin"], weight: ["400", "700"] })

export const metadata: Metadata = {
  title: "Outcruit",
  description: "Recruitment workflow automation",
  generator: "v0.app",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://outcruit-v2.vercel.app"),
  openGraph: {
    title: "Outcruit",
    description: "Recruitment workflow automation",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://outcruit-v2.vercel.app",
    siteName: "Outcruit",
    images: [{ url: "/opengraph-image" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Outcruit",
    description: "Recruitment workflow automation",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${anekTamil.className} antialiased`} suppressHydrationWarning>
        <NotificationProvider>
          {children}
        </NotificationProvider>
        <Analytics />
      </body>
    </html>
  )
}
