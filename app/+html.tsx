/**
 * Custom HTML Head for Web
 * Load DM Sans, Cormorant Garamond, JetBrains Mono from Google Fonts
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Google Fonts: DM Sans + Cormorant Garamond + JetBrains Mono */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />

        {/* Base styles for web */}
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              box-sizing: border-box;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }

            input:focus, textarea:focus, select:focus {
              outline: none !important;
              box-shadow: none !important;
            }

            body {
              font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              margin: 0;
              padding: 0;
              overflow-x: hidden;
            }

            html, body, #root {
              height: 100%;
              width: 100%;
            }
          `
        }} />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
