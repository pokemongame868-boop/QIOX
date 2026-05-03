// app/layout.tsx
import type { Metadata } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/lib/hooks/useToast';

const syne   = Syne({ subsets: ['latin'], variable: '--font-syne',   weight: ['400','500','600','700','800'] });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', weight: ['300','400','500','600'] });

export const metadata: Metadata = {
  title:       'QIOX — Электроника нового поколения',
  description: 'Смартфоны, ноутбуки, бытовая техника. Официальные гарантии.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <body className={`${syne.variable} ${dmSans.variable} font-body bg-dark-bg text-white antialiased`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
