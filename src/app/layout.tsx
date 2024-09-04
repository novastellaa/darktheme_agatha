import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'

import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {/* <ThemeProvider > */}
            {children}
            <Toaster />
          {/* </ThemeProvider> */}

        </body>
      </html>
    </ClerkProvider>
  )
}