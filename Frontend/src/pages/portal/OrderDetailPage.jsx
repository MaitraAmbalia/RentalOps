import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Info, ShieldAlert, CheckCircle2, AlertTriangle, Printer } from 'lucide-react';
import { orderService } from '../../api/orderService';
import { depositInvoiceService } from '../../api/depositInvoiceService';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [deposit, setDeposit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const [ord, dep] = await Promise.all([
        orderService.getOrderById(id),
        depositInvoiceService.getDepositSummary(id).catch(() => null)
      ]);
      setOrder(ord);
      setDeposit(dep);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch detailed order records.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-20 text-slate-500 font-bold space-y-4">
        <p>{error || 'Order record not found.'}</p>
        <button onClick={() => navigate('/orders')} className="text-blue-600 hover:underline">Back to orders history</button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PROCESSING': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'RENTED': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'OVERDUE': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'RETURNED': return 'bg-slate-100 text-slate-700 border border-slate-200';
      case 'CANCELLED': return 'bg-rose-100 text-rose-700 border border-rose-200';
      default: return 'bg-slate-100 text-slate-655 border';
    }
  };

  const getDepositStatusColor = (status) => {
    switch (status) {
      case 'HELD': return 'text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200';
      case 'REFUNDED': return 'text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200';
      case 'SETTLED': return 'text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-700 font-sans">
      
      {/* Header toolbar */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/orders')}
            className="p-2 text-slate-400 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Order #{order.orderNumber || order.id.slice(0, 8)}</h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Storefront Rental Detail Sheet</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition-all flex items-center space-x-1 text-xs font-bold"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print Receipt</span>
          </button>
          
          <button
            onClick={() => navigate('/account/support', { state: { orderId: order.id, orderNumber: order.orderNumber } })}
            className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Lodge Dispute Ticket</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left main details */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Summary Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 block uppercase">Product Hired</span>
                <span className="font-extrabold text-slate-900 text-lg">{order.product?.name || 'Rent Equipment'}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusBadge(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[9px] mb-0.5">Rental Start Date</span>
                <span className="font-bold text-slate-855">{new Date(order.rentalStartDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[9px] mb-0.5">Scheduled Return</span>
                <span className="font-bold text-slate-855">{new Date(order.scheduledReturnDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Deposit Invoice Summary details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-xs text-slate-450 border-b border-slate-100 pb-2">Security Deposit Ledger</h3>
            
            {deposit ? (
              <div className="space-y-4 text-xs text-slate-500">
                <div className="flex justify-between items-center">
                  <span>Deposit Escrow Status:</span>
                  <span className={getDepositStatusColor(deposit.status)}>{deposit.status}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                  <div>
                    <span className="text-slate-400 block">Total Deposit Escrowed:</span>
                    <span className="font-bold text-slate-900 text-sm">${deposit.amount?.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Refund Amount:</span>
                    <span className="font-bold text-emerald-600 text-sm">
                      {deposit.refundAmount ? `$${deposit.refundAmount.toFixed(2)}` : 'Pending return inspection'}
                    </span>
                  </div>
                </div>

                {deposit.settlementNotes && (
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-500 border border-slate-150 italic leading-relaxed">
                    "Settlement inspection feedback: {deposit.settlementNotes}"
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 text-xs text-slate-500 leading-relaxed">
                <Info className="h-4 w-4 text-slate-400 inline mr-2 shrink-0" />
                Security deposit invoice summary details are pending verification processes.
              </div>
            )}
          </div>

        </div>

        {/* Right ledger calculations column */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 self-start text-xs text-slate-500">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-100 pb-2">Charges Summary</h3>
          
          <div className="space-y-3.5">
            <div className="flex justify-between">
              <span>Hiring Charges:</span>
              <span className="font-semibold text-slate-800">${Number(order.totalAmount || order.estimatedRentalPrice).toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Security Deposit (held):</span>
              <span className="font-semibold text-slate-800">${Number(order.securityDepositAmount || 0).toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-slate-100 pt-3">
              <span>Total Paid:</span>
              <span className="text-blue-600 font-black">
                ${(Number(order.totalAmount || order.estimatedRentalPrice) + Number(order.securityDepositAmount || 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
