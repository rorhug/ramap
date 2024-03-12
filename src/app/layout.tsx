import "~/styles/globals.css"

import { Inter } from "next/font/google"

import { TRPCReactProvider } from "~/trpc/react"
import NextTopLoader from "nextjs-toploader"

import { Analytics } from "@vercel/analytics/react"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "RA Map",
  description: "Find raves near you :)",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <NextTopLoader />
        {/* <ThemeProvider> */}
        <TRPCReactProvider>{children}</TRPCReactProvider>
        {/* </ThemeProvider> */}

        <Analytics />
      </body>
    </html>
  )
}
