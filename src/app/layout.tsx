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
  title: "Raat Ki Mehfil",
  description: "ek raat, ek mehfil, ek gaana — a digital night salon.",
  openGraph: {
    title: "Raat Ki Mehfil",
    description: "ek raat, ek mehfil, ek gaana — a digital night salon.",
    url: "https://raat-ki-mehfil.vercel.app", // Placeholder URL
    siteName: "Raat Ki Mehfil",
    images: [
      {
        url: "/bg.png",
        width: 1200,
        height: 630,
        alt: "Raat Ki Mehfil Background",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Raat Ki Mehfil",
    description: "ek raat, ek mehfil, ek gaana — a digital night salon.",
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
