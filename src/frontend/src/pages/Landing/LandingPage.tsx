import LoginButton from '../../components/auth/LoginButton';
import { Receipt, DollarSign, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/assets/generated/app-logo.dim_512x512.png" alt="Logo" className="h-10 w-10" />
            <span className="text-xl font-semibold">Receipt Manager</span>
          </div>
          <LoginButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Manage Receipts & Payments for Your Service Business
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Track receipts, record payments, and manage customer transactions with ease. 
                Perfect for service-sector professionals who need simple, effective billing.
              </p>
              <LoginButton />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img 
                src="/assets/generated/hero-illustration.dim_1600x900.png" 
                alt="Service professional managing receipts" 
                className="w-full h-auto"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Receipt className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Receipts</h3>
              <p className="text-muted-foreground">
                Generate professional receipts with line items, quantities, and pricing
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Payments</h3>
              <p className="text-muted-foreground">
                Record payments by cash, card, or bank transfer and monitor balances
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Manage Customers</h3>
              <p className="text-muted-foreground">
                Keep track of customer information and transaction history
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t bg-card py-6 mt-16">
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
