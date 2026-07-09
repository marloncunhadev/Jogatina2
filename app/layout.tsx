import type {Metadata} from 'next';
import {Sora, Hanken_Grotesk, JetBrains_Mono} from 'next/font/google';
import './globals.css'; // Global styles

const hankenSans = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '600', '700'],
  display: 'swap',
});

const soraDisplay = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '700', '800'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FLIP7 Scoreboard',
  description: 'Marcador de pontos oficial e dinâmico para o jogo de cartas FLIP7.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${hankenSans.variable} ${soraDisplay.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-background text-on-background font-sans min-h-screen antialiased selection:bg-primary-container selection:text-on-primary-container" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
