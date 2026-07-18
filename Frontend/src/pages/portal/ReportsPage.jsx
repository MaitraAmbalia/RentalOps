import { useState, useEffect } from 'react';
import { 
  BarChart2, TrendingUp, Calendar, DollarSign, ShoppingBag, Eye, RefreshCw, Download, Printer 
} from 'lucide-react';
import { orderService } from '../../api/orderService';

export default function ReportsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState('REVENUE'); // 'REVENUE', 'RENTAL_COUNT'
  const [timespan, setTimespan] = useState('MONTH'); // 'WEEK', 'MONTH', 'YEAR'

  useEffect(() => {
    fetchOrdersData();
  }, []);

  const fetchOrdersData = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching order logs for reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Order Number', 'Date', 'Status', 'Total Amount ($)'];
    const rows = orders.map(o => [
      `"${o.orderNumber || o.id}"`,
      `"${new Date(o.createdAt || Date.now()).toLocaleDateString()}"`,
      `"${o.status}"`,
      o.totalAmount || 0
    ]);
    const csvString = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rental_report_${timespan.toLowerCase()}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  // Helper: group orders by date and calculate total values
  const getChartData = () => {
    const dataPoints = [];
    const now = new Date();
    
    if (timespan === 'WEEK') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toDateString();
        const dateLabel = d.toLocaleDateString(undefined, { weekday: 'short' });
        
        // Find matching orders
        const dayOrders = orders.filter(o => new Date(o.createdAt || Date.now()).toDateString() === dateStr);
        const revenue = dayOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
        const count = dayOrders.length;
        
        dataPoints.push({ label: dateLabel, value: metric === 'REVENUE' ? revenue : count });
      }
    } else if (timespan === 'MONTH') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekLabel = `Wk ${4 - i}`;
        const start = new Date();
        start.setDate(now.getDate() - (i + 1) * 7);
        const end = new Date();
        end.setDate(now.getDate() - i * 7);
        
        const weekOrders = orders.filter(o => {
          const od = new Date(o.createdAt || Date.now());
          return od >= start && od <= end;
        });
        
        const revenue = weekOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
        const count = weekOrders.length;
        
        dataPoints.push({ label: weekLabel, value: metric === 'REVENUE' ? revenue : count });
      }
    } else {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        const monthLabel = d.toLocaleDateString(undefined, { month: 'short' });
        const monthVal = d.getMonth();
        const yearVal = d.getFullYear();
        
        const monthOrders = orders.filter(o => {
          const od = new Date(o.createdAt || Date.now());
          return od.getMonth() === monthVal && od.getFullYear() === yearVal;
        });
        
        const revenue = monthOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
        const count = monthOrders.length;
        
        dataPoints.push({ label: monthLabel, value: metric === 'REVENUE' ? revenue : count });
      }
    }
    
    return dataPoints;
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  // Stats aggregate
  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
  const totalRentalsCount = orders.length;
  const activeRentals = orders.filter(o => o.status === 'RENTED' || o.status === 'OVERDUE').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-text-main flex items-center space-x-2">
            <BarChart2 className="h-6 w-6 text-primary" />
            <span>Fulfillment Performance Reports</span>
          </h1>
          <p className="text-sm text-text-muted mt-1">Review ledger statistics and item renting frequencies.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-3.5 py-2 text-xs font-bold text-text-main bg-bg-card border border-border-main rounded-xl hover:bg-bg-main transition-colors shadow-sm"
            title="Export CSV"
          >
            <Download className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center space-x-2 px-3.5 py-2 text-xs font-bold text-text-main bg-bg-card border border-border-main rounded-xl hover:bg-bg-main transition-colors shadow-sm"
            title="Print / PDF"
          >
            <Printer className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Print Report</span>
          </button>
          <button
            onClick={fetchOrdersData}
            className="p-2 text-text-muted hover:text-text-main bg-bg-card border border-border-main rounded-xl hover:bg-bg-main transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-card p-6 rounded-2xl border border-border-main flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">Total Sales Revenue</span>
            <span className="text-2xl font-extrabold text-text-main block">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
        </div>

        <div className="bg-bg-card p-6 rounded-2xl border border-border-main flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">Active Fleet Rentals</span>
            <span className="text-2xl font-extrabold text-emerald-555 block">{activeRentals}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-555/10 flex items-center justify-center border border-emerald-555/20">
            <TrendingUp className="h-6 w-6 text-emerald-555" />
          </div>
        </div>

        <div className="bg-bg-card p-6 rounded-2xl border border-border-main flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">Orders Processed</span>
            <span className="text-2xl font-extrabold text-cyan-555 block">{totalRentalsCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-555/10 flex items-center justify-center border border-cyan-555/20">
            <ShoppingBag className="h-6 w-6 text-cyan-555" />
          </div>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="bg-bg-card p-6 rounded-2xl border border-border-main space-y-6">
        
        {/* Chart Configuration Selectors */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main pb-4">
          <div className="flex space-x-2 bg-bg-main p-1 rounded-xl">
            <button
              onClick={() => setMetric('REVENUE')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                metric === 'REVENUE' ? 'bg-bg-card text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'
              }`}
            >
              Sales Value ($)
            </button>
            <button
              onClick={() => setMetric('RENTAL_COUNT')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                metric === 'RENTAL_COUNT' ? 'bg-bg-card text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'
              }`}
            >
              Order Frequencies
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-4.5 w-4.5 text-text-muted" />
            <select
              value={timespan}
              onChange={(e) => setTimespan(e.target.value)}
              className="bg-bg-main text-text-main text-xs border border-border-main rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="WEEK">Last 7 Days</option>
              <option value="MONTH">Last 4 Weeks (Monthly)</option>
              <option value="YEAR">Last 6 Months</option>
            </select>
          </div>
        </div>

        {/* Premium SVG Bar Chart */}
        <div className="space-y-4">
          <div className="flex items-end justify-between h-72 pt-4 bg-bg-main/30 rounded-2xl border border-border-main p-6">
            {chartData.map((data, index) => {
              const percentage = (data.value / maxValue) * 100;
              return (
                <div key={index} className="flex flex-col items-center flex-1 space-y-3 group h-full justify-end">
                  {/* Tooltip value */}
                  <div className="opacity-0 group-hover:opacity-100 bg-bg-card text-[10px] text-primary border border-border-main font-bold px-2 py-1 rounded transition-opacity duration-150 shadow-lg pointer-events-none mb-1">
                    {metric === 'REVENUE' ? `$${data.value.toFixed(2)}` : `${data.value} Orders`}
                  </div>
                  
                  {/* Bar */}
                  <div 
                    style={{ height: `${percentage}%` }}
                    className="w-12 bg-gradient-to-t from-primary/40 to-primary border-t border-x border-primary/80 rounded-t-lg transition-all duration-500 hover:brightness-110 shadow-lg shadow-primary/10 relative"
                  >
                    {/* Inner highlight */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-white/20 rounded-t-lg" />
                  </div>
                  
                  {/* Label */}
                  <span className="text-xs text-text-muted font-semibold truncate max-w-[80px]">
                    {data.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[10px] text-text-muted font-semibold px-2 uppercase tracking-wider">
            <span>Chart Metric: {metric === 'REVENUE' ? 'Gross Revenue Earnings (USD)' : 'Total Rent Invoices Created'}</span>
            <span>Scale Max: {metric === 'REVENUE' ? `$${maxValue.toFixed(0)}` : `${maxValue} Counts`}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
