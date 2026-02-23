import { useState } from 'react';
import { useAddPayment } from '../../hooks/usePayments';
import { formatCurrency, parseCurrency } from '../../lib/money';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import type { Payment, PaymentMethod } from '../../backend';

interface AddPaymentDialogProps {
  receiptId: bigint;
  receiptTotal: bigint;
  currentBalance: bigint;
}

export default function AddPaymentDialog({ receiptId, receiptTotal, currentBalance }: AddPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<string>('cash');
  const [otherMethod, setOtherMethod] = useState('');
  const [notes, setNotes] = useState('');
  const addPayment = useAddPayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const paymentAmount = parseCurrency(amount);
    if (paymentAmount > currentBalance) {
      toast.error('Payment amount cannot exceed balance due');
      return;
    }

    let paymentMethod: PaymentMethod;
    if (method === 'cash') {
      paymentMethod = { __kind__: 'cash', cash: null };
    } else if (method === 'card') {
      paymentMethod = { __kind__: 'card', card: null };
    } else if (method === 'bankTransfer') {
      paymentMethod = { __kind__: 'bankTransfer', bankTransfer: null };
    } else {
      paymentMethod = { __kind__: 'other', other: otherMethod || 'Other' };
    }

    const payment: Payment = {
      id: BigInt(Date.now()),
      amount: paymentAmount,
      date: BigInt(Date.now() * 1000000),
      method: paymentMethod,
      notes: notes.trim(),
    };

    try {
      await addPayment.mutateAsync({ receiptId, payment });
      toast.success('Payment recorded successfully');
      setOpen(false);
      setAmount('');
      setMethod('cash');
      setOtherMethod('');
      setNotes('');
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <DollarSign className="h-4 w-4" />
          Add Payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Amount *</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              max={Number(currentBalance) / 100}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
            <p className="text-xs text-muted-foreground">
              Balance due: {formatCurrency(currentBalance)}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Payment Method *</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bankTransfer">Bank Transfer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {method === 'other' && (
            <div className="space-y-2">
              <Label>Specify Method</Label>
              <Input
                value={otherMethod}
                onChange={(e) => setOtherMethod(e.target.value)}
                placeholder="e.g., Check, Mobile Payment"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this payment"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addPayment.isPending}>
              {addPayment.isPending ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
