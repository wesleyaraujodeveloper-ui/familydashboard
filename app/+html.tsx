import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * This file is web-only and used to configure the root HTML for every web page during static rendering.
 * The contents of this function only run in Node.js environments and do not have access to the DOM or browser APIs.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, viewport-fit=cover" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* PWA iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mural" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* PWA Android */}
        <meta name="theme-color" content="#e06d53" />
        
        {/* Setup ScrollView styles */}
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
