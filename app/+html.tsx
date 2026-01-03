/**
 * Custom HTML Head for Web
 * Add Inter font from Google Fonts
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

                {/* Inter Font from Google Fonts */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
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
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
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
