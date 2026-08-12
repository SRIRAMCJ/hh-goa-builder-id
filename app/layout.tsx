import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HH Goa 2026 — Builder ID',
  description: 'Create your HH Goa 2026 Builder ID. #FrameInGoa',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}