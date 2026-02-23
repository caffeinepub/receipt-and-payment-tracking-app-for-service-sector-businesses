import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Plus, Receipt } from 'lucide-react';

export default function ReceiptsEmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-48 h-48 relative mb-8">
          <img
            src="/assets/generated/hero-illustration.dim_1600x900.png"
            alt="Get started"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">No receipts yet</h2>
          <p className="text-muted-foreground">
            Create your first receipt to start tracking payments and managing your service business
          </p>
        </div>
        <Button onClick={() => navigate({ to: '/receipts/new' })} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Create First Receipt
        </Button>
      </div>
    </div>
  );
}
