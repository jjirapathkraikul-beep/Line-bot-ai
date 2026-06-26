import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LINE AI Chatbot — ผู้ช่วยจิราวัฒน์',
  description: 'ผู้ช่วยจิราวัฒน์ จิรพัชร์ไกรกุล โตเกียวมารีนประกันชีวิต',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
