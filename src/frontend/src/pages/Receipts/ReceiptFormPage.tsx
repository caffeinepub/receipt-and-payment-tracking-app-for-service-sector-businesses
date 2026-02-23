import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCustomers, useAddCustomer } from '../../hooks/useCustomers';
import { useGetServiceItems, useAddServiceItem } from '../../hooks/useServiceItems';
import { useCreateReceipt } from '../../hooks/useReceipts';
import { formatCurrency, parseCurrency, calculateLineItemTotal, calculateReceiptTotal } from '../../lib/money';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Customer, ServiceItem, LineItem } from '../../backend';

interface LineItemForm {
  serviceItem: ServiceItem | null;
  quantity: string;
  total: bigint;
}

export default function ReceiptFormPage() {
  const navigate = useNavigate();
  const { data: customers = [] } = useGetCustomers();
  const { data: serviceItems = [] } = useGetServiceItems();
  const addCustomer = useAddCustomer();
  const addServiceItem = useAddServiceItem();
  const createReceipt = useCreateReceipt();

  const [receiptNumber, setReceiptNumber] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [lineItems, setLineItems] = useState<LineItemForm[]>([]);

  // New customer dialog
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerContact, setNewCustomerContact] = useState('');
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);

  // New service item dialog
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [showNewServiceDialog, setShowNewServiceDialog] = useState(false);

  useEffect(() => {
    // Generate receipt number
    const timestamp = Date.now();
    setReceiptNumber(`RCP-${timestamp}`);
  }, []);

  const handleAddCustomer = async () => {
    if (!newCustomerName.trim()) return;
    
    const customer: Customer = {
      name: newCustomerName.trim(),
      contact: newCustomerContact.trim(),
    };

    try {
      await addCustomer.mutateAsync(customer);
      setSelectedCustomer(customer);
      setNewCustomerName('');
      setNewCustomerContact('');
      setShowNewCustomerDialog(false);
      toast.success('Customer added successfully');
    } catch (error) {
      toast.error('Failed to add customer');
    }
  };

  const handleAddServiceItem = async () => {
    if (!newServiceName.trim() || !newServicePrice) return;

    const item: ServiceItem = {
      name: newServiceName.trim(),
      price: parseCurrency(newServicePrice),
    };

    try {
      await addServiceItem.mutateAsync(item);
      setNewServiceName('');
      setNewServicePrice('');
      setShowNewServiceDialog(false);
      toast.success('Service item added successfully');
    } catch (error) {
      toast.error('Failed to add service item');
    }
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { serviceItem: null, quantity: '1', total: BigInt(0) }]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, field: keyof LineItemForm, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'serviceItem' || field === 'quantity') {
      const item = updated[index];
      if (item.serviceItem && item.quantity) {
        const qty = BigInt(parseInt(item.quantity) || 0);
        item.total = calculateLineItemTotal(qty, item.serviceItem.price);
      }
    }

    setLineItems(updated);
  };

  const total = useMemo(() => {
    return calculateReceiptTotal(lineItems);
  }, [lineItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }

    if (lineItems.length === 0) {
      toast.error('Please add at least one line item');
      return;
    }

    const validLineItems = lineItems.filter((item) => item.serviceItem !== null);
    if (validLineItems.length === 0) {
      toast.error('Please select services for all line items');
      return;
    }

    const receiptLineItems: LineItem[] = validLineItems.map((item) => ({
      serviceItem: item.serviceItem!,
      quantity: BigInt(parseInt(item.quantity) || 0),
      total: item.total,
    }));

    try {
      await createReceipt.mutateAsync({
        number: receiptNumber,
        customer: selectedCustomer,
        items: receiptLineItems,
        total,
      });
      toast.success('Receipt created successfully');
      navigate({ to: '/' });
    } catch (error) {
      toast.error('Failed to create receipt');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate({ to: '/' })} variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">New Receipt</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Receipt Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Receipt Number</Label>
                <Input value={receiptNumber} disabled />
              </div>
              <div className="space-y-2">
                <Label>Customer *</Label>
                <div className="flex gap-2">
                  <Select
                    value={selectedCustomer?.name || ''}
                    onValueChange={(value) => {
                      const customer = customers.find((c) => c.name === value);
                      setSelectedCustomer(customer || null);
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer, index) => (
                        <SelectItem key={index} value={customer.name}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Customer</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input
                            value={newCustomerName}
                            onChange={(e) => setNewCustomerName(e.target.value)}
                            placeholder="Customer name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Contact</Label>
                          <Input
                            value={newCustomerContact}
                            onChange={(e) => setNewCustomerContact(e.target.value)}
                            placeholder="Phone or email"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={handleAddCustomer}
                          disabled={!newCustomerName.trim() || addCustomer.isPending}
                          className="w-full"
                        >
                          {addCustomer.isPending ? 'Adding...' : 'Add Customer'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Line Items *</Label>
                <Button type="button" onClick={handleAddLineItem} variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {lineItems.length > 0 && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead className="w-32">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lineItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex gap-2">
                              <Select
                                value={item.serviceItem?.name || ''}
                                onValueChange={(value) => {
                                  const service = serviceItems.find((s) => s.name === value);
                                  handleLineItemChange(index, 'serviceItem', service || null);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select service" />
                                </SelectTrigger>
                                <SelectContent>
                                  {serviceItems.map((service, idx) => (
                                    <SelectItem key={idx} value={service.name}>
                                      {service.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Dialog open={showNewServiceDialog} onOpenChange={setShowNewServiceDialog}>
                                <DialogTrigger asChild>
                                  <Button type="button" variant="outline" size="icon">
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Add New Service</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label>Service Name *</Label>
                                      <Input
                                        value={newServiceName}
                                        onChange={(e) => setNewServiceName(e.target.value)}
                                        placeholder="Service name"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Price *</Label>
                                      <Input
                                        value={newServicePrice}
                                        onChange={(e) => setNewServicePrice(e.target.value)}
                                        placeholder="0.00"
                                        type="number"
                                        step="0.01"
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      onClick={handleAddServiceItem}
                                      disabled={!newServiceName.trim() || !newServicePrice || addServiceItem.isPending}
                                      className="w-full"
                                    >
                                      {addServiceItem.isPending ? 'Adding...' : 'Add Service'}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            {item.serviceItem ? formatCurrency(item.serviceItem.price) : '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.total)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveLineItem(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate({ to: '/' })}>
                Cancel
              </Button>
              <Button type="submit" disabled={createReceipt.isPending}>
                {createReceipt.isPending ? 'Creating...' : 'Create Receipt'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
