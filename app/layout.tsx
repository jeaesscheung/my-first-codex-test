import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Film Director Cockpit',
  description: 'Cinematic AI director workstation demo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang='zh-CN'><body>{children}</body></html>;
}
