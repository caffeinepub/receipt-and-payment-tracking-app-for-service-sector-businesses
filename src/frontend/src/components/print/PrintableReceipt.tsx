import { formatCurrency } from '../../lib/money';
import type { Receipt, BusinessProfile } from '../../backend';

interface PrintableReceiptProps {
  receipt: Receipt;
  businessProfile: BusinessProfile | null | undefined;
}

const getPaymentMethodLabel = (method: any): string => {
  if (method.__kind__ === 'cash') return 'Cash';
  if (method.__kind__ === 'card') return 'Card';
  if (method.__kind__ === 'bankTransfer') return 'Bank Transfer';
  if (method.__kind__ === 'other') return method.other || 'Other';
  return 'Unknown';
};

export default function PrintableReceipt({ receipt, businessProfile }: PrintableReceiptProps) {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-black">
      {businessProfile && (
        <div className="mb-8 text-center border-b pb-6">
          <h1 className="text-2xl font-bold mb-2">{businessProfile.name}</h1>
          {businessProfile.address && <p className="text-sm">{businessProfile.address}</p>}
          <div className="flex justify-center gap-4 text-sm mt-2">
            {businessProfile.phone && <span>Phone: {businessProfile.phone}</span>}
            {businessProfile.email && <span>Email: {businessProfile.email}</span>}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Receipt</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold">Receipt Number:</p>
            <p>{receipt.number}</p>
          </div>
          <div>
            <p className="font-semibold">Date:</p>
            <p>{new Date(Number(receipt.date) / 1000000).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="font-semibold">Customer:</p>
            <p>{receipt.customer.name}</p>
            {receipt.customer.contact && <p className="text-xs">{receipt.customer.contact}</p>}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-2">Service</th>
              <th className="text-right py-2">Qty</th>
              <th className="text-right py-2">Unit Price</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">{item.serviceItem.name}</td>
                <td className="text-right py-2">{item.quantity.toString()}</td>
                <td className="text-right py-2">{formatCurrency(item.serviceItem.price)}</td>
                <td className="text-right py-2">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="flex justify-between py-2 text-lg font-bold border-t-2 border-black">
            <span>Total:</span>
            <span>{formatCurrency(receipt.total)}</span>
          </div>
        </div>
      </div>

      {receipt.payments.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Payments Received</h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Method</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {receipt.payments.map((payment, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{new Date(Number(payment.date) / 1000000).toLocaleDateString()}</td>
                  <td className="py-2">{getPaymentMethodLabel(payment.method)}</td>
                  <td className="text-right py-2">{formatCurrency(payment.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end mt-4">
            <div className="w-64">
              {receipt.balance > 0 ? (
                <div className="flex justify-between py-2 font-semibold">
                  <span>Balance Due:</span>
                  <span>{formatCurrency(receipt.balance)}</span>
                </div>
              ) : (
                <div className="flex justify-between py-2 font-semibold text-green-700">
                  <span>Status:</span>
                  <span>PAID IN FULL</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 pt-6 border-t text-center text-xs text-gray-600">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
}
