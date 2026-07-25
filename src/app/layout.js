import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/providers/AuthProvider.jsx";
import PwaRegistrar from "@/components/shared/PwaRegistrar.jsx";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Nobles Credit Cooperative Society Limited",
  description: "Enterprise-grade core administration platform for co-operative societies, credit unions, and microfinance organizations.",
  manifest: "/manifest.webmanifest",
  applicationName: "Nobles Credit Cooperative Society Limited",
  appleWebApp: {
    capable: true,
    title: "Nobles Credit Cooperative Society Limited",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/app-icon.svg",
    apple: "/app-icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PwaRegistrar />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
