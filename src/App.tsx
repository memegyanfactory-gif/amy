import { lazy, Suspense } from 'react';
import { useRoute } from './router';
import { RegionProvider } from './region';

const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MascotSheet = lazy(() => import('./pages/MascotSheet'));

export default function App() {
  const route = useRoute();
  const Page = route.startsWith('/app') ? Dashboard : route.startsWith('/amy') ? MascotSheet : Landing;
  return (
    <RegionProvider>
      <Suspense fallback={<div className="min-h-dvh" />}>
        <Page />
      </Suspense>
    </RegionProvider>
  );
}
