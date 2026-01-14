'use client'

import * as React from 'react'
import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import { useServerInsertedHTML } from 'next/navigation'
import { renderToString } from 'react-dom/server'
import createCache from '@emotion/cache';

function createEmotionCache() {
  return createCache({ key: 'mui', prepend: true });
}


export default function StyledRegistry({ children }: { children: React.ReactNode }) {
  const cache = React.useMemo(() => {
    return typeof window === 'undefined' ? createEmotionCache() : createEmotionCache();
  }, []);

  const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache as any);

  useServerInsertedHTML(() => {
    try {
      const html = renderToString(
        <CacheProvider value={cache}>{children}</CacheProvider>
      );
      const emotionChunks = extractCriticalToChunks(html);
      return <>{constructStyleTagsFromChunks(emotionChunks)}</>;
    } catch (e) {
      return null;
    }
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>
}

