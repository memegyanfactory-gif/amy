import { useEffect, useRef, useState } from 'react';

/**
 * Tiny hash router: #/ (site), #/app (dashboard), #/amy (mascot sheet). Works on any static host.
 * Hashes that don't start with "/" (like #how) are in-page anchors and leave the route alone.
 */
const read = () => {
  const h = location.hash.replace(/^#/, '');
  return h.startsWith('/') ? h.split('?')[0] : null;
};

export function useRoute() {
  const [route, setRoute] = useState(() => read() ?? '/');
  const last = useRef(route);
  useEffect(() => {
    const on = () => {
      const next = read();
      if (next === null || next === last.current) return;
      last.current = next;
      setRoute(next);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export const query = () => new URLSearchParams(location.hash.split('?')[1] ?? '');

export const go = (path: string) => {
  location.hash = path;
};
