import type { Metadata, Viewport } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "cashix.fun - The Goodest Coin",
  description: "Join the cashix.fun army. Live charts, tokenomics, and exclusive community.",
  keywords: ["Meme Coin", "Cashix", "Crypto", "Web3", "Binance", "Solana", "Raydium"],
  authors: [{ name: "Cashix Team" }],
  openGraph: {
    title: "cashix.fun - The Goodest Coin",
    description: "Join the cashix.fun army. Live charts, tokenomics, and exclusive community.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "cashix.fun - The Goodest Coin",
    description: "Join the cashix.fun army. Live charts, tokenomics, and exclusive community.",
  },
};

export const viewport: Viewport = {
  themeColor: "#07090E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col bg-[#060913] text-[#FFFFFF] premium-mesh-bg">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

