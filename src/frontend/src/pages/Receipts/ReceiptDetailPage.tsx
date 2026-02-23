import { useMemo } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetReceipts } from '../../hooks/useReceipts';
import { useGetBusinessProfile } from '../../hooks/useBusinessProfile';
import { formatCurrency } from '../../lib/money';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Printer, DollarSign } from 'lucide-react';
import AddPaymentDialog from '../../components/payments/AddPaymentDialog';
import PaymentsList from '../../components/payments/PaymentsList';
import PrintableReceipt from '../../components/print/PrintableReceipt';

const statusLabels: Record<string, string> = {
  open: 'Unpaid',
  partial: 'Partially Paid',
  paid: 'Paid',
};

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  open: 'destructive',
  partial: 'secondary',
  paid: 'default',
};

export default function ReceiptDetailPage() {
  const { receiptId } = useParams({ from: '/receipts/$receiptId' });
  const navigate = useNavigate();
  const { data: receipts = [] } = useGetReceipts();
  const { data: businessProfile } = useGetBusinessProfile();

  const receipt = useMemo(() => {
    return receipts.find((r) => r.id.toString() === receiptId);
  }, [receipts, receiptId]);

  const handlePrint = () => {
    window.print();
  };

  if (!receipt) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Receipt not found</p>
        <Button onClick={() => navigate({ to: '/' })} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Receipts
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="print:hidden space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={() => navigate({ to: '/' })} variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <AddPaymentDialog receiptId={receipt.id} receiptTotal={receipt.total} currentBalance={receipt.balance} />
            <Button onClick={handlePrint} variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">Receipt {receipt.number}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(Number(receipt.date) / 1000000).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={statusVariants[receipt.status]} className="text-sm">
                {statusLabels[receipt.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Customer</h3>
              <p className="text-sm">{receipt.customer.name}</p>
              {receipt.customer.contact && (
                <p className="text-sm text-muted-foreground">{receipt.customer.contact}</p>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-4">Line Items</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipt.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.serviceItem.name}</TableCell>
                        <TableCell className="text-right">{item.quantity.toString()}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.serviceItem.price)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(receipt.total)}</span>
                </div>
                {receipt.balance > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>Balance Due:</span>
                    <span className="font-semibold">{formatCurrency(receipt.balance)}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <PaymentsList receiptId={receipt.id} />
          </CardContent>
        </Card>
      </div>

      <div className="hidden print:block">
        <PrintableReceipt receipt={receipt} businessProfile={businessProfile} />
      </div>
    </>
  );
}
