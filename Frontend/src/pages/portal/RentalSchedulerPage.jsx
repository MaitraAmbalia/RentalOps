import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Edit2, Info, ListFilter } from 'lucide-react';
import { orderService } from '../../api/orderService';
import { workflowService } from '../../api/workflowService';

export default function RentalSchedulerPage() {
  const navigate = useNavigate();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDateStr, setSelectedDateStr] = useState(today.toISOString().split('T')[0]);
  const [schedulerEvents, setSchedulerEvents] = useState({});
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrdersData();
  }, []);

  const fetchOrdersData = async () => {
    try {
      const [list, wfs] = await Promise.all([
        orderService.getOrders().catch(() => []),
        workflowService.getWorkflows().catch(() => [])
      ]);
      
      const updatedEvents = {};

      if (Array.isArray(list)) {
        setOrders(list);
        list.forEach(order => {
          if (order.rentalStartDate) {
            const startKey = new Date(order.rentalStartDate).toISOString().split('T')[0];
            const eventType = order.status === 'OVERDUE' ? 'LATE_DELIVERY' : 'BOOKED';
            const statusLabel = order.status === 'PROCESSING' ? 'Available' : order.status === 'RENTED' ? 'Booked' : 'Reserved';
            
            const eventObj = {
              id: order.id,
              orderNumber: order.orderNumber || 'SO0000',
              product: order.items?.[0]?.product?.name || 'Equipment',
              customer: order.client ? `${order.client.firstName} ${order.client.lastName}` : 'Customer',
              qty: order.quantity || 1,
              type: eventType,
              status: statusLabel,
              isRealOrder: true
            };
            
            if (!updatedEvents[startKey]) {
              updatedEvents[startKey] = [];
            }
            if (!updatedEvents[startKey].some(e => e.id === order.id)) {
              updatedEvents[startKey].push(eventObj);
            }
          }
        });
      }

      if (Array.isArray(wfs)) {
        wfs.forEach(wf => {
          if (wf.scheduledDate) {
            const key = new Date(wf.scheduledDate).toISOString().split('T')[0];
            const eventType = wf.workflowType === 'PICKUP' ? 'PICKUP' : 'LATE_PICKUP';
            const eventObj = {
              id: wf.id,
              orderNumber: wf.orderNumber || wf.order?.orderNumber || 'SO0000',
              product: wf.order?.items?.[0]?.product?.name || 'Equipment',
              customer: wf.order?.client ? `${wf.order.client.firstName} ${wf.order.client.lastName}` : 'Customer',
              qty: 1,
              type: eventType,
              status: wf.workflowStatus,
              isRealOrder: false,
              workflowId: wf.id
            };

            if (!updatedEvents[key]) {
              updatedEvents[key] = [];
            }
            if (!updatedEvents[key].some(e => e.id === wf.id)) {
              updatedEvents[key].push(eventObj);
            }
          }
        });
      }

      setSchedulerEvents(updatedEvents);
    } catch (err) {
      console.error("Error loading order logs for calendar:", err);
    }
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const currentYear = today.getFullYear();
  const yearsList = [];
  for (let y = currentYear - 5; y <= currentYear + 5; y++) {
    yearsList.push(y);
  }

  const handleMonthSelect = (e) => {
    const mVal = parseInt(e.target.value);
    setCurrentDate(prev => new Date(prev.getFullYear(), mVal, 1));
  };

  const handleYearSelect = (e) => {
    const yVal = parseInt(e.target.value);
    setCurrentDate(prev => new Date(yVal, prev.getMonth(), 1));
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const year = prev.getFullYear();
      const month = prev.getMonth();
      return new Date(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, 1);
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const year = prev.getFullYear();
      const month = prev.getMonth();
      return new Date(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, 1);
    });
  };

  const handleDateClick = (dayNum) => {
    const y = currentDate.getFullYear();
    const m = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const d = dayNum.toString().padStart(2, '0');
    setSelectedDateStr(`${y}-${m}-${d}`);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Generate blank calendar squares for padding
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push(i);
  }

  // Get active day events list
  const selectedDayEvents = schedulerEvents[selectedDateStr] || [];

  const getEventClass = (type) => {
    switch (type) {
      case 'BOOKED': return 'bg-emerald-500';
      case 'PICKUP': return 'bg-red-500';
      case 'LATE_PICKUP': return 'bg-amber-500';
      case 'LATE_DELIVERY': return 'bg-rose-500 border border-double border-rose-300 ring-2 ring-rose-500/30';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-text-main">Rental Scheduler Calendar</h1>
        <p className="text-sm text-text-muted mt-1">Visually inspect rental schedules, bookings, and late returns.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Monthly Calendar Grid */}
        <div className="lg:col-span-2 bg-bg-card p-6 rounded-2xl border border-border-main space-y-4">
          <div className="flex items-center justify-between border-b border-border-main pb-3">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-5 w-5 text-primary shrink-0" />
              <div className="flex items-center space-x-1.5">
                <select
                  value={month}
                  onChange={handleMonthSelect}
                  className="bg-bg-main border border-border-main text-text-main rounded-lg px-2 py-0.5 text-sm font-bold focus:outline-none focus:border-primary cursor-pointer hover:bg-bg-card transition-colors"
                >
                  {monthsList.map((mName, idx) => (
                    <option key={idx} value={idx}>{mName}</option>
                  ))}
                </select>
                <select
                  value={year}
                  onChange={handleYearSelect}
                  className="bg-bg-main border border-border-main text-text-main rounded-lg px-2 py-0.5 text-sm font-bold focus:outline-none focus:border-primary cursor-pointer hover:bg-bg-card transition-colors"
                >
                  {yearsList.map((yNum) => (
                    <option key={yNum} value={yNum}>{yNum}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button 
                onClick={handlePrevMonth}
                className="p-1.5 text-text-muted hover:text-text-main hover:bg-bg-main border border-border-main rounded-lg transition-all"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1.5 text-text-muted hover:text-text-main hover:bg-bg-main border border-border-main rounded-lg transition-all"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Calendar Table */}
          <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs">
            {/* Weekdays */}
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <span key={idx} className="text-text-muted py-2 uppercase tracking-widest">{day}</span>
            ))}

            {/* Days Cells */}
            {calendarCells.map((day, index) => {
              if (day === null) {
                return <div key={index} className="h-16"></div>;
              }

              const formattedDay = day.toString().padStart(2, '0');
              const cellDateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${formattedDay}`;
              const isSelected = selectedDateStr === cellDateStr;
              const cellEvents = schedulerEvents[cellDateStr] || [];

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className={`h-16 flex flex-col justify-between items-center p-1.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-primary/20 border-primary text-text-main font-extrabold shadow-md'
                      : 'bg-bg-main border-border-main hover:bg-bg-card hover:border-text-muted text-text-main'
                  }`}
                >
                  <span className="self-start text-[11px] text-text-muted">{day}</span>
                  
                  {/* Event indicators dots */}
                  <div className="flex flex-wrap gap-1 justify-center max-w-full">
                    {cellEvents.map((evt, idx) => (
                      <span 
                        key={idx} 
                        className={`w-2 h-2 rounded-full ${getEventClass(evt.type)}`}
                        title={`${evt.product} (${evt.type})`}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Color Legend indicators */}
          <div className="flex flex-wrap items-center gap-4 border-t border-border-main pt-4 text-xs font-semibold text-text-muted">
            <span className="text-[10px] text-text-muted uppercase tracking-wider mr-2">Legend:</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Booked</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>Pick up</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Late pick up</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-double border-rose-300 ring-2 ring-rose-500/20"></span>
              <span>Late Delivery (Overdue)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Details Side Panel */}
        <div className="bg-bg-card p-6 rounded-2xl border border-border-main flex flex-col justify-between self-stretch">
          <div className="space-y-4">
            <div className="border-b border-border-main pb-3">
              <span className="text-xs text-text-muted font-bold block uppercase tracking-wider">Scheduled Orders</span>
              <span className="text-lg font-black text-text-main">{new Date(selectedDateStr).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {selectedDayEvents.map(evt => (
                <div 
                  key={evt.id} 
                  className="bg-bg-main p-4 rounded-xl border border-border-main flex justify-between items-center transition-all hover:border-text-muted"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-text-main text-sm">#{evt.orderNumber}</span>
                      <span className={`inline-flex px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold ${
                        evt.type === 'BOOKED' ? 'bg-emerald-500/10 text-emerald-400' :
                        evt.type === 'PICKUP' ? 'bg-red-500/10 text-red-400' :
                        evt.type === 'LATE_PICKUP' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {evt.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-text-main font-semibold">{evt.product} ({evt.qty} Unit)</p>
                    <p className="text-text-muted font-medium">Cust: {evt.customer}</p>
                    <p className="text-[10px] text-text-muted font-semibold">Status: <span className="text-primary">{evt.status}</span></p>
                  </div>

                  <button 
                    onClick={() => {
                      if (evt.isRealOrder) {
                        navigate(`/vendor/orders/${evt.id}`);
                      } else {
                        navigate(`/vendor/workflows`);
                      }
                    }}
                    className="p-2 text-text-muted hover:text-text-main bg-bg-card border border-border-main hover:border-text-muted rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {selectedDayEvents.length === 0 && (
                <div className="text-center p-8 bg-bg-main/40 border border-border-main text-text-muted text-xs font-semibold rounded-xl space-y-2">
                  <Info className="h-6 w-6 text-text-muted mx-auto" />
                  <p>No rentals or logistics schedules registered for this date.</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-border-main pt-4 mt-4">
            <button
              onClick={() => navigate('/vendor/workflows')}
              className="w-full py-2 bg-bg-main hover:bg-bg-card border border-border-main text-text-main rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
            >
              <ListFilter className="h-4 w-4 text-text-muted" />
              <span>Switch to List-based Workflow Tasks</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
