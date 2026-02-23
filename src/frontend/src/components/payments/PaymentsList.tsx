import { formatCurrency } from '../../lib/money';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';
import type { Payment } from '../../backend';

interface PaymentsListProps {
  receiptId: bigint;
}

export default function PaymentsList({ receiptId }: PaymentsListProps) {
  // Note: Payments are embedded in the receipt, so we get them from the parent
  // This component is designed to receive payments as a prop in a real implementation
  // For now, we'll show a placeholder since the backend stores payments in the receipt
  
  return (
    <div>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <DollarSign className="h-5 w-5" />
        Payment History
      </h3>
      <p className="text-sm text-muted-foreground">
        Payments are displayed in the receipt details above
      </p>
    </div>
  );
}
