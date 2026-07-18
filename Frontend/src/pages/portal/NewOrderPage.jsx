import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Save, Send, Check, Search, Calendar, FileText, ShoppingBag
} from 'lucide-react';
import { productService } from '../../api/productService';
import { quotationService } from '../../api/quotationService';
import { orderService } from '../../api/orderService';

// Seed clients in case there are none in the order history yet
const SEED_CLIENTS = [
  { id: 'c90ebdb5-c2cf-4b95-a8df-ea5f25bf6031', firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '9876543210', shippingAddress: '123 Main St, New York, NY' },
  { id: 'd08acdf9-e58f-4d6d-8691-14ebafbcf602', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '9876543211', shippingAddress: '456 Oak Rd, San Francisco, CA' },
  { id: 'f17bcaf2-c78c-4f9c-8761-12ebafbcf803', firstName: 'Mark', lastName: 'Wood', email: 'mark@example.com', phone: '9876543212', shippingAddress: '789 Pine Ave, Seattle, WA' }
];

export default function NewOrderPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState(SEED_CLIENTS);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [selectedClientId, setSelectedClientId] = useState('');
  const [invoiceAddress, setInvoiceAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [rentalStart, setRentalStart] = useState('');
  const [rentalEnd, setRentalEnd] = useState('');
  const [orderSource, setOrderSource] = useState('OFFLINE');
  const [fulfillmentType, setFulfillmentType] = useState('HOME_DELIVERY');
  const [priceList, setPriceList] = useState('DEFAULT');
  const [taxPercent, setTaxPercent] = useState(18); // Default GST

  const [orderLines, setOrderLines] = useState([
    { productId: '', quantity: 1, unit: 'Units', unitPrice: 0, taxPercent: 18, amount: 0 }
  ]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Set addresses when client changes
  useEffect(() => {
    if (selectedClientId) {
      const client = clients.find(c => c.id === selectedClientId);
      if (client) {
        setInvoiceAddress(client.shippingAddress || '');
        setDeliveryAddress(client.shippingAddress || '');
      }
    }
  }, [selectedClientId, clients]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch products
      const prods = await productService.getProducts();
      setProducts(Array.isArray(prods) ? prods : []);

      // 2. Fetch unique clients from existing orders and quotations to expand the options
      const [ordersList, quotesList] = await Promise.all([
        orderService.getOrders().catch(() => []),
        quotationService.getQuotations().catch(() => [])
      ]);

      const extractedClients = {};
      
      // Seed default ones first
      SEED_CLIENTS.forEach(c => {
        extractedClients[c.id] = c;
      });

      // Extract from orders
      if (Array.isArray(ordersList)) {
        ordersList.forEach(o => {
          if (o.client && o.client.id) {
            extractedClients[o.client.id] = {
              id: o.client.id,
              firstName: o.client.firstName,
              lastName: o.client.lastName,
              email: o.client.email || '',
              phone: o.client.phone || '',
              shippingAddress: o.client.shippingAddress || ''
            };
          }
        });
      }

      // Extract from quotations
      if (Array.isArray(quotesList)) {
        quotesList.forEach(q => {
          if (q.client && q.client.id) {
            extractedClients[q.client.id] = {
              id: q.client.id,
              firstName: q.client.firstName,
              lastName: q.client.lastName,
              email: q.client.email || '',
              phone: q.client.phone || '',
              shippingAddress: q.client.shippingAddress || ''
            };
          }
        });
      }

      setClients(Object.values(extractedClients));
    } catch (err) {
      console.error(err);
      setError('Error pre-populating page data.');
    } finally {
      setLoading(false);
    }
  };

  // Recalculate line amount on changes
  const updateLine = (index, field, value) => {
    const updated = [...orderLines];
    updated[index][field] = value;

    // Handle product auto-fill
    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      if (prod) {
        // use dailyCharge or rentalPrice
        const rate = parseFloat(prod.dailyCharge || prod.rentalPrice || 0);
        updated[index].unitPrice = rate;
      }
    }

    // Recalculate amount
    const qty = parseFloat(updated[index].quantity || 0);
    const price = parseFloat(updated[index].unitPrice || 0);
    
    // Rental amount = qty * price * duration
    let durationDays = 1;
    if (rentalStart && rentalEnd) {
      const start = new Date(rentalStart);
      const end = new Date(rentalEnd);
      const diffTime = Math.abs(end - start);
      durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }
    
    updated[index].amount = qty * price * durationDays;
    setOrderLines(updated);
  };

  const addLine = () => {
    setOrderLines([...orderLines, { productId: '', quantity: 1, unit: 'Units', unitPrice: 0, taxPercent: 18, amount: 0 }]);
  };

  const removeLine = (index) => {
    if (orderLines.length === 1) return;
    setOrderLines(orderLines.filter((_, i) => i !== index));
  };

  // Recalculate all amounts if dates change
  useEffect(() => {
    if (rentalStart && rentalEnd) {
      const start = new Date(rentalStart);
      const end = new Date(rentalEnd);
      const diffTime = end - start;
      const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      setOrderLines(prev => prev.map(line => ({
        ...line,
        amount: parseFloat(line.quantity || 0) * parseFloat(line.unitPrice || 0) * durationDays
      })));
    }
  }, [rentalStart, rentalEnd]);

  // Aggregate Calculations
  const untaxedAmount = orderLines.reduce((sum, line) => sum + parseFloat(line.amount || 0), 0);
  const taxAmount = (untaxedAmount * taxPercent) / 100;
  const totalAmount = untaxedAmount + taxAmount;
  // Security deposit calculation: 2x the estimated rental price
  const securityDepositAmount = untaxedAmount * 2;

  const getDurationDays = () => {
    if (!rentalStart || !rentalEnd) return 1;
    const start = new Date(rentalStart);
    const end = new Date(rentalEnd);
    const diffTime = Math.abs(end - start);
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const handleSubmit = async (targetStatus) => {
    if (!selectedClientId) {
      setError('Please select a customer first.');
      window.scrollTo(0, 0);
      return;
    }
    if (!rentalStart || !rentalEnd) {
      setError('Please select rental start and end dates.');
      window.scrollTo(0, 0);
      return;
    }
    if (orderLines.some(line => !line.productId)) {
      setError('Please select a product for all order lines.');
      window.scrollTo(0, 0);
      return;
    }

    setSubmitLoading(true);
    setError('');
    setSuccess('');

    try {
      const duration = getDurationDays();
      
      if (targetStatus === 'DRAFT' || targetStatus === 'SENT') {
        // Create Quotation
        const quotePayload = {
          clientId: selectedClientId,
          quotationValidityDays: 7,
          paymentTermsPercent: 100,
          items: orderLines.map(line => ({
            productId: line.productId,
            quantity: parseInt(line.quantity),
            unit: line.unit,
            rentalStart: new Date(rentalStart).toISOString(),
            rentalEnd: new Date(rentalEnd).toISOString()
          }))
        };

        const res = await quotationService.createQuotation(quotePayload);
        
        if (targetStatus === 'SENT') {
          await quotationService.updateQuotationStatus(res.id, 'SENT');
        }

        setSuccess(`Quotation ${targetStatus === 'SENT' ? 'sent' : 'saved as draft'} successfully!`);
        setTimeout(() => navigate('/vendor/orders'), 1500);

      } else if (targetStatus === 'CONFIRMED') {
        // Create Sale Order
        const orderPayload = {
          clientId: selectedClientId,
          fulfillmentType,
          orderSource,
          rentalStartDate: new Date(rentalStart).toISOString(),
          scheduledReturnDate: new Date(rentalEnd).toISOString(),
          untaxedAmount,
          taxPercent,
          taxAmount,
          totalAmount,
          securityDepositAmount,
          items: orderLines.map(line => ({
            productId: line.productId,
            quantity: parseFloat(line.quantity),
            unitPrice: line.unitPrice,
            amount: line.amount,
            rentalStart: new Date(rentalStart).toISOString(),
            rentalEnd: new Date(rentalEnd).toISOString()
          }))
        };

        await orderService.createOrder(orderPayload);
        setSuccess('Sale Order confirmed and saved successfully!');
        setTimeout(() => navigate('/vendor/orders'), 1500);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error processing the order. Check required parameters.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/vendor/orders')}
            className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Create New Quotation / Order</h1>
            <p className="text-sm text-slate-400 mt-1">Draft quotations or confirm instant sale orders.</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSubmit('DRAFT')}
            disabled={submitLoading}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 text-sm font-semibold rounded-xl transition-all flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => handleSubmit('SENT')}
            disabled={submitLoading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-all flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>Send Quotation</span>
          </button>
          <button
            onClick={() => handleSubmit('CONFIRMED')}
            disabled={submitLoading}
            className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition-all flex items-center space-x-2 shadow-lg shadow-primary/20"
          >
            <Check className="h-4 w-4" />
            <span>Confirm Order</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-semibold">
          {success}
        </div>
      )}

      {/* Primary Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>General Information</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Customer</label>
              <div className="relative">
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none transition-colors appearance-none cursor-pointer pr-10"
                >
                  <option value="">Select a Customer...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName} ({client.email})
                    </option>
                  ))}
                </select>
                <Search className="absolute right-3.5 top-3.5 h-4.5 w-4.5 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Price List</label>
              <select
                value={priceList}
                onChange={(e) => setPriceList(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none transition-colors"
              >
                <option value="DEFAULT">Default Price List (All Products)</option>
                <option value="WHOLESALE">Wholesale 10% Discount</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Invoice Address</label>
              <input
                type="text"
                value={invoiceAddress}
                onChange={(e) => setInvoiceAddress(e.target.value)}
                placeholder="Invoice Billing Address"
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Delivery Address</label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Delivery Shipping Address"
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Side Metadata Settings */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Rental Schedule</span>
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
              <input
                type="datetime-local"
                value={rentalStart}
                onChange={(e) => setRentalStart(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">End Date</label>
              <input
                type="datetime-local"
                value={rentalEnd}
                onChange={(e) => setRentalEnd(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Order Source</label>
              <select
                value={orderSource}
                onChange={(e) => setOrderSource(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:border-primary"
              >
                <option value="OFFLINE">Offline (In-Store / Phone)</option>
                <option value="ONLINE">Online (Client Portal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Fulfillment Mode</label>
              <select
                value={fulfillmentType}
                onChange={(e) => setFulfillmentType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:border-primary"
              >
                <option value="HOME_DELIVERY">Home Delivery</option>
                <option value="COLLECT_FROM_STORE">Collect from Store</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Order Lines Form */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <span>Order Lines</span>
          </h2>
          <button
            onClick={addLine}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Product Line</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="pb-3 w-1/3">Product</th>
                <th className="pb-3 px-3">Quantity</th>
                <th className="pb-3 px-3">Unit</th>
                <th className="pb-3 px-3">Unit Price (Daily)</th>
                <th className="pb-3 px-3">Taxes</th>
                <th className="pb-3 px-3 text-right">Subtotal</th>
                <th className="pb-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {orderLines.map((line, index) => (
                <tr key={index} className="group">
                  <td className="py-3 pr-4">
                    <select
                      value={line.productId}
                      onChange={(e) => updateLine(index, 'productId', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="">Select a rentable product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} disabled={p.currentStatus !== 'AVAILABLE'}>
                          {p.name} {p.currentStatus !== 'AVAILABLE' ? '(Rented/Maintenance)' : `(Daily: $${p.dailyCharge || p.rentalPrice})`}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) => updateLine(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-20 bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2 text-center focus:outline-none focus:border-primary"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="text"
                      value={line.unit}
                      onChange={(e) => updateLine(index, 'unit', e.target.value)}
                      className="w-20 bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2 text-center"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-500">$</span>
                      <input
                        type="number"
                        min="0"
                        value={line.unitPrice}
                        onChange={(e) => updateLine(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-28 bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl pl-6 pr-3 py-2 focus:outline-none focus:border-primary"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-2 text-sm text-slate-300 font-semibold">
                    {line.taxPercent}% (GST)
                  </td>
                  <td className="py-3 px-2 text-right text-sm text-slate-100 font-bold">
                    ${parseFloat(line.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => removeLine(index)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aggregate calculations display */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 text-slate-400 text-xs max-w-md">
          <p className="font-semibold text-slate-300 mb-1">Rental Period Calculations:</p>
          <p>The total duration is <span className="text-white font-bold">{getDurationDays()} days</span>. Line subtotals are calculated as: <span className="font-mono text-white">Quantity × Daily Price × Duration</span>.</p>
          <p className="mt-2 font-semibold text-slate-300">Security Deposit Settlement Policy:</p>
          <p>A deposit of <span className="text-white font-bold">200%</span> (2× total rental) is captured for security assurance at order placement.</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 w-full md:w-96 space-y-3 self-stretch md:self-auto">
          <div className="flex justify-between text-sm text-slate-400">
            <span>Untaxed Amount:</span>
            <span className="text-slate-200">${untaxedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-400">
            <span>Taxes ({taxPercent}%):</span>
            <span className="text-slate-200">${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-3 text-sm text-slate-400">
            <span>Security Deposit (2x):</span>
            <span className="text-cyan-400 font-semibold">${securityDepositAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-lg font-extrabold text-white pt-2">
            <span>Total:</span>
            <span className="text-primary">${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
