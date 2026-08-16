import type { Metadata } from "next";
import { Geist, Geist_Mono, Inknut_Antiqua, Saira, Poppins } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inknutAntiqua = Inknut_Antiqua({
  variable: "--font-inknut",
  subsets: ["devanagari", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const saira = Saira({
  variable: "--font-saira",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://raat-ki-mehfil.vercel.app"),
  title: "Aap Ki Mehfil",
  description: "ek mehfil, ek ehsaas, ek gaana — a digital salon.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
  },
  openGraph: {
    title: "Aap Ki Mehfil",
    description: "ek mehfil, ek ehsaas, ek gaana — a digital salon.",
    url: "https://raat-ki-mehfil.vercel.app",
    siteName: "Aap Ki Mehfil",
    images: [
      {
        url: "/bg.png",
        width: 1200,
        height: 630,
        alt: "Aap Ki Mehfil Background",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aap Ki Mehfil",
    description: "ek mehfil, ek ehsaas, ek gaana — a digital salon.",
    images: ["/bg.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inknutAntiqua.variable} ${saira.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
