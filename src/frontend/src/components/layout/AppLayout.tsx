import { Outlet } from '@tanstack/react-router';
import { Link, useNavigate } from '@tanstack/react-router';
import LoginButton from '../auth/LoginButton';
import { Receipt, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-semibold">
            <Receipt className="h-6 w-6" />
            <span>Receipt Manager</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate({ to: '/receipts/new' })} className="gap-2">
              <Plus className="h-4 w-4" />
              New Receipt
            </Button>
            <LoginButton />
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t bg-card py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} · Built with love using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
