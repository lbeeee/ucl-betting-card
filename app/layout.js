import './globals.css';

export const metadata = {
  title: 'UCL R16 Betting Card — Live',
  description: 'Live Champions League Round of 16 betting card with real-time odds, scores, player props, and SGP tracking.',
  openGraph: {
    title: 'UCL R16 Betting Card — Live',
    description: 'Real-time Champions League betting card with live FanDuel odds, match scores, injury analysis, and $50 bankroll allocation.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anybody:wght@400;500;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
