'use client';

import { useAuth } from '@/components/auth-provider';
import { AppShell } from '@/components/app-shell';
import { LoadingScreen } from '@/components/loading-screen';

export default function Home() {
  const { user, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // If not authenticated, don't render the app shell
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Disciplina</h1>
          <p className="text-muted-foreground">Por favor inicia sesión para continuar</p>
        </div>
      </div>
    );
  }

  // If authenticated, render the app shell
  return <AppShell />;
}
