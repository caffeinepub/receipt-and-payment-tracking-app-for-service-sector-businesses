import { useState, useMemo } from 'react';
import { useGetReceipts } from '../../hooks/useReceipts';
import { useNavigate } from '@tanstack/react-router';
import { formatCurrency } from '../../lib/money';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, FileText } from 'lucide-react';
import ReceiptsEmptyState from './ReceiptsEmptyState';
import type { Receipt, ReceiptStatus } from '../../backend';

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

export default function ReceiptsListPage() {
  const { data: receipts = [], isLoading } = useGetReceipts();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      const matchesSearch =
        searchTerm === '' ||
        receipt.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.customer.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [receipts, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading receipts...</p>
      </div>
    );
  }

  if (receipts.length === 0) {
    return <ReceiptsEmptyState />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Receipts</h1>
        <p className="text-muted-foreground">Manage and track all your receipts</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by receipt number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'open' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('open')}
                size="sm"
              >
                Unpaid
              </Button>
              <Button
                variant={statusFilter === 'partial' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('partial')}
                size="sm"
              >
                Partial
              </Button>
              <Button
                variant={statusFilter === 'paid' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('paid')}
                size="sm"
              >
                Paid
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No receipts found matching your criteria</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceipts.map((receipt) => (
                    <TableRow
                      key={receipt.id.toString()}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate({ to: '/receipts/$receiptId', params: { receiptId: receipt.id.toString() } })}
                    >
                      <TableCell className="font-medium">{receipt.number}</TableCell>
                      <TableCell>{new Date(Number(receipt.date) / 1000000).toLocaleDateString()}</TableCell>
                      <TableCell>{receipt.customer.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(receipt.total)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(receipt.balance)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[receipt.status]}>
                          {statusLabels[receipt.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
