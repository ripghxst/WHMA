import type { Metadata } from "next";
import { Cardo, Josefin_Sans } from "next/font/google";
import "./globals.css";

const cardo = Cardo({
  variable: "--font-cardo",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const josefinSans = Josefin_Sans({
  variable: "--font-josefin-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WHMA Horse Registry",
    template: "%s · WHMA Horse Registry",
  },
  description:
    "The official horse registry of the Wild Horse & Mustang Association.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cardo.variable} ${josefinSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
