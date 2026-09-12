import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ဗုဒ္ဓဓမ္မ Studio",
  description: "တရားတော်များမှ တရားအနှစ်ချုပ် Clip များနှင့် Video များ ဖန်တီးရာနေရာ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="my">
      <body className="antialiased">{children}</body>
    </html>
  );
}
