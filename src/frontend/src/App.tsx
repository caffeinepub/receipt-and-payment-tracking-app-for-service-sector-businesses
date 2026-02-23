import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useCurrentUserProfile';
import LandingPage from './pages/Landing/LandingPage';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import AppLayout from './components/layout/AppLayout';
import ReceiptsListPage from './pages/Receipts/ReceiptsListPage';
import ReceiptDetailPage from './pages/Receipts/ReceiptDetailPage';
import ReceiptFormPage from './pages/Receipts/ReceiptFormPage';
import { createRouter, RouterProvider, createRoute, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';

function RootComponent() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  
  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  if (showProfileSetup) {
    return <ProfileSetupModal />;
  }

  return <AppLayout />;
}

const rootRoute = createRootRoute({
  component: RootComponent
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ReceiptsListPage
});

const receiptDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/receipts/$receiptId',
  component: ReceiptDetailPage
});

const receiptNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/receipts/new',
  component: ReceiptFormPage
});

const receiptEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/receipts/$receiptId/edit',
  component: ReceiptFormPage
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  receiptDetailRoute,
  receiptNewRoute,
  receiptEditRoute
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
