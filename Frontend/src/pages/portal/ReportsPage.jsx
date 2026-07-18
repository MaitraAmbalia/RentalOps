import { useState, useEffect } from 'react';
import { 
  BarChart2, TrendingUp, ShoppingBag, RefreshCw, Download, Printer, ChevronDown
} from 'lucide-react';
import { orderService } from '../../api/orderService';

function RupeeIcon({ className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M6 3h12" />
      <path d="M6 8h12" />
      <path d="m6 13 8.5 8" />
      <path d="M6 13h3" />
      <path d="M9 13c3.667 0 6-1.833 6-5s-2.333-5-6-5" />
    </svg>
  );
}

function LineChart({ data, title, isCurrency }) {
  const height = 220;
  const width = 500;
  const paddingLeft = 65;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  
  // Ticks for Y axis
  const ticks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

  // Helper to format values
  const formatYValue = (val) => {
    if (isCurrency) {
      return `₹${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  // Generate SVG path coordinates
  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.value / maxVal) * chartHeight;
    return { x, y, value: d.value, label: d.label };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  // Generate a unique ID for gradients so they don't clash
  const gradientId = `grad-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="bg-bg-card p-5 rounded-2xl border border-border-main flex-1 min-w-[300px] shadow-sm">
      <h3 className="text-sm font-bold text-text-main mb-4 tracking-tight flex items-center justify-between">
        <span>{title}</span>
        <span className="text-[10px] text-text-muted font-bold bg-bg-main px-2 py-0.5 rounded-lg border border-border-main">
          {isCurrency ? 'INR (₹)' : 'Count'}
        </span>
      </h3>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y axis labels */}
          {ticks.map((tick, i) => {
            const y = paddingTop + chartHeight - (tick / maxVal) * chartHeight;
            return (
              <g key={i}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  className="stroke-border-main/50" 
                  strokeWidth="1" 
                  strokeDasharray="4 4"
                />
                <text 
                  x={paddingLeft - 10} 
                  y={y + 4} 
                  textAnchor="end" 
                  className="fill-text-muted text-[10px] font-semibold"
                >
                  {formatYValue(tick)}
                </text>
              </g>
            );
          })}

          {/* Y Axis Solid Line */}
          <line 
            x1={paddingLeft} 
            y1={paddingTop} 
            x2={paddingLeft} 
            y2={paddingTop + chartHeight} 
            className="stroke-border-main" 
            strokeWidth="1.5"
          />

          {/* X Axis Solid Line */}
          <line 
            x1={paddingLeft} 
            y1={paddingTop + chartHeight} 
            x2={width - paddingRight} 
            y2={paddingTop + chartHeight} 
            className="stroke-border-main" 
            strokeWidth="1.5"
          />

          {/* X axis labels */}
          {points.map((p, i) => (
            <text 
              key={i} 
              x={p.x} 
              y={height - 10} 
              textAnchor="middle" 
              className="fill-text-muted text-[10px] font-semibold"
            >
              {p.label}
            </text>
          ))}

          {/* Area under the line */}
          {points.length > 0 && (
            <path 
              d={areaPath} 
              fill={`url(#${gradientId})`} 
              className="transition-all duration-500 ease-in-out"
            />
          )}

          {/* The line itself */}
          {points.length > 0 && (
            <path 
              d={linePath} 
              fill="none" 
              stroke="#2563eb" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="transition-all duration-500 ease-in-out"
            />
          )}

          {/* Data point dots */}
          {points.map((p, i) => (
            <g key={i} className="group/dot cursor-pointer">
              {/* Tooltip trigger area */}
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="10" 
                fill="transparent" 
              />
              {/* Visible dot */}
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="4.5" 
                fill="var(--color-bg-card)" 
                stroke="#2563eb" 
                strokeWidth="2.5"
                className="transition-all duration-200 group-hover/dot:r-6"
              />
              {/* Tooltip text */}
              <title>
                {p.label}: {isCurrency ? `₹${p.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `${p.value} Orders`}
              </title>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const headers = ['Order Number', 'Date', 'Status', 'Total Amount (₹)'];
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
  const getChartData = (metricType) => {
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
        
        dataPoints.push({ label: dateLabel, value: metricType === 'REVENUE' ? revenue : count });
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
        
        dataPoints.push({ label: weekLabel, value: metricType === 'REVENUE' ? revenue : count });
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
        
        dataPoints.push({ label: monthLabel, value: metricType === 'REVENUE' ? revenue : count });
      }
    }
    
    return dataPoints;
  };

  const revenueData = getChartData('REVENUE');
  const frequencyData = getChartData('RENTAL_COUNT');

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
        <div className="bg-bg-card p-6 rounded-2xl border border-border-main flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">Total Sales Revenue</span>
            <span className="text-2xl font-extrabold text-text-main block">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse">
            <RupeeIcon className="h-6 w-6 text-primary" />
          </div>
        </div>

        <div className="bg-bg-card p-6 rounded-2xl border border-border-main flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">Active Fleet Rentals</span>
            <span className="text-2xl font-extrabold text-emerald-555 block">{activeRentals}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-555/10 flex items-center justify-center border border-emerald-555/20">
            <TrendingUp className="h-6 w-6 text-emerald-555" />
          </div>
        </div>

        <div className="bg-bg-card p-6 rounded-2xl border border-border-main flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">Orders Processed</span>
            <span className="text-2xl font-extrabold text-cyan-555 block">{totalRentalsCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-555/10 flex items-center justify-center border border-cyan-555/20">
            <ShoppingBag className="h-6 w-6 text-cyan-555" />
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="bg-bg-card p-6 rounded-2xl border border-border-main space-y-6 shadow-sm">
        
        {/* Chart Configuration Selectors */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main pb-4">
          <div>
            <h2 className="text-base font-bold text-text-main">Historical Ledger Statistics</h2>
            <p className="text-xs text-text-muted mt-0.5">Comparing sales revenue and order counts over time.</p>
          </div>

          <div className="relative flex items-center">
            <select
              value={timespan}
              onChange={(e) => setTimespan(e.target.value)}
              className="bg-bg-card text-text-main text-xs border border-border-main rounded-xl pl-4 pr-10 py-2.5 font-bold transition-all hover:bg-bg-main/80 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm appearance-none"
            >
              <option value="WEEK">Last 7 Days</option>
              <option value="MONTH">Last 4 Weeks</option>
              <option value="YEAR">Last 6 Months</option>
            </select>
            <ChevronDown className="h-4 w-4 text-text-muted absolute right-3 pointer-events-none" />
          </div>
        </div>

        {/* Both charts side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LineChart data={revenueData} title="Sales Value" isCurrency={true} />
          <LineChart data={frequencyData} title="Order Frequencies" isCurrency={false} />
        </div>

      </div>
    </div>
  );
}
