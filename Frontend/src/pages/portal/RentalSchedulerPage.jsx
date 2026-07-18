import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Edit2, Info, ListFilter } from 'lucide-react';
import { orderService } from '../../api/orderService';

// Seed schedule events for the calendar (defaulting to January 2026 for demonstration matching the design, but dynamic)
const SEED_EVENTS = {
  // Key format: YYYY-MM-DD
  '2026-01-04': [
    { id: 'wf_1', orderNumber: 'SO0001', product: 'Projector', customer: 'Smith Black', qty: 1, type: 'PICKUP', status: 'Available' },
    { id: 'wf_2', orderNumber: 'SO0005', product: 'Printer', customer: 'John Doe', qty: 1, type: 'BOOKED', status: 'Available' }
  ],
  '2026-01-05': [
    { id: 'wf_3', orderNumber: 'SO0002', product: 'Car', customer: 'Sam', qty: 1, type: 'LATE_PICKUP', status: 'Reserved' },
    { id: 'wf_4', orderNumber: 'SO0003', product: 'Printer', customer: 'John Dow', qty: 1, type: 'PICKUP', status: 'Available' }
  ],
  '2026-01-06': [
    { id: 'wf_5', orderNumber: 'SO0001', product: 'Projector', customer: 'Smith Black', qty: 1, type: 'PICKUP', status: 'Available' },
    { id: 'wf_6', orderNumber: 'SO0008', product: 'Printer', customer: 'John Dow', qty: 1, type: 'PICKUP', status: 'Available' },
    { id: 'wf_7', orderNumber: 'SO0013', product: 'Laptop', customer: 'Mack', qty: 2, type: 'BOOKED', status: 'Booked' },
    { id: 'wf_8', orderNumber: 'SO0014', product: 'Monitor', customer: 'Sam', qty: 1, type: 'PICKUP', status: 'Available' }
  ],
  '2026-01-08': [
    { id: 'wf_9', orderNumber: 'SO0001', product: 'Projector', customer: 'Smith Black', qty: 1, type: 'PICKUP', status: 'Available' },
    { id: 'wf_10', orderNumber: 'SO0013', product: 'Laptop', customer: 'Mack', qty: 2, type: 'BOOKED', status: 'Booked' },
    { id: 'wf_11', orderNumber: 'SO0014', product: 'Monitor', customer: 'Sam', qty: 1, type: 'PICKUP', status: 'Available' }
  ],
  '2026-01-14': [
    { id: 'wf_12', orderNumber: 'SO0012', product: 'Projector', customer: 'Tom', qty: 1, type: 'LATE_DELIVERY', status: 'Reserved' },
    { id: 'wf_13', orderNumber: 'SO0015', product: 'Car', customer: 'Sam', qty: 1, type: 'BOOKED', status: 'Reserved' }
  ],
  '2026-01-21': [
    { id: 'wf_14', orderNumber: 'SO0009', product: 'Printer', customer: 'Mark Wood', qty: 1, type: 'BOOKED', status: 'Reserved' },
    { id: 'wf_15', orderNumber: 'SO0015', product: 'Car', customer: 'Sam', qty: 1, type: 'LATE_DELIVERY', status: 'Reserved' },
    { id: 'wf_16', orderNumber: 'SO0020', product: 'Projector', customer: 'Sam', qty: 1, type: 'PICKUP', status: 'Available' }
  ],
  '2026-01-28': [
    { id: 'wf_17', orderNumber: 'SO0016', product: 'Generator', customer: 'Bruce Wayne', qty: 1, type: 'LATE_PICKUP', status: 'Reserved' }
  ]
};

export default function RentalSchedulerPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // Default Jan 2026
  const [selectedDateStr, setSelectedDateStr] = useState('2026-01-08');
  const [schedulerEvents, setSchedulerEvents] = useState(SEED_EVENTS);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrdersData();
  }, []);

  const fetchOrdersData = async () => {
    try {
      const list = await orderService.getOrders();
      if (Array.isArray(list)) {
        setOrders(list);
        
        // Merge real order schedules into calendar events
        const updatedEvents = { ...SEED_EVENTS };
        list.forEach(order => {
          if (order.rentalStartDate) {
            const startKey = new Date(order.rentalStartDate).toISOString().split('T')[0];
            const eventType = order.status === 'OVERDUE' ? 'LATE_DELIVERY' : 'BOOKED';
            const statusLabel = order.status === 'PROCESSING' ? 'Available' : order.status === 'RENTED' ? 'Booked' : 'Reserved';
            
            const eventObj = {
              id: order.id,
              orderNumber: order.orderNumber || 'SO0000',
              product: order.product?.name || 'Equipment',
              customer: order.client ? `${order.client.firstName} ${order.client.lastName}` : 'Customer',
              qty: order.quantity || 1,
              type: eventType,
              status: statusLabel,
              isRealOrder: true
            };
            
            if (!updatedEvents[startKey]) {
              updatedEvents[startKey] = [];
            }
            // Avoid duplicate additions
            if (!updatedEvents[startKey].some(e => e.id === order.id)) {
              updatedEvents[startKey].push(eventObj);
            }
          }
        });
        setSchedulerEvents(updatedEvents);
      }
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Rental Scheduler Calendar</h1>
        <p className="text-sm text-slate-400 mt-1">Visually inspect rental schedules, bookings, and late returns.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Monthly Calendar Grid */}
        <div className="lg:col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <span className="text-lg font-bold text-white flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <span>{monthName} {year}</span>
            </span>
            <div className="flex items-center space-x-1">
              <button 
                onClick={handlePrevMonth}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 rounded-lg transition-all"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 rounded-lg transition-all"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Calendar Table */}
          <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs">
            {/* Weekdays */}
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <span key={idx} className="text-slate-500 py-2 uppercase tracking-widest">{day}</span>
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
                      ? 'bg-primary/20 border-primary text-white font-extrabold shadow-md'
                      : 'bg-slate-900/60 border-slate-850 hover:bg-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="self-start text-[11px]">{day}</span>
                  
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
          <div className="flex flex-wrap items-center gap-4 border-t border-slate-900 pt-4 text-xs font-semibold text-slate-400">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-2">Legend:</span>
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
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between self-stretch">
          <div className="space-y-4">
            <div className="border-b border-slate-900 pb-3">
              <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Scheduled Orders</span>
              <span className="text-lg font-black text-white">{new Date(selectedDateStr).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {selectedDayEvents.map(evt => (
                <div 
                  key={evt.id} 
                  className="bg-slate-900 p-4 rounded-xl border border-slate-850 flex justify-between items-center transition-all hover:border-slate-700"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">#{evt.orderNumber}</span>
                      <span className={`inline-flex px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold ${
                        evt.type === 'BOOKED' ? 'bg-emerald-500/10 text-emerald-400' :
                        evt.type === 'PICKUP' ? 'bg-red-500/10 text-red-400' :
                        evt.type === 'LATE_PICKUP' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {evt.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-300 font-semibold">{evt.product} ({evt.qty} Unit)</p>
                    <p className="text-slate-500">Cust: {evt.customer}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Availability: <span className="text-primary">{evt.status}</span></p>
                  </div>

                  <button 
                    onClick={() => {
                      if (evt.isRealOrder) {
                        navigate(`/vendor/orders/${evt.id}`);
                      } else {
                        alert(`Mock event ID: ${evt.id}. Complete order details in Orders tab.`);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {selectedDayEvents.length === 0 && (
                <div className="text-center p-8 bg-slate-900/40 border border-slate-900 text-slate-500 text-xs font-semibold rounded-xl space-y-2">
                  <Info className="h-6 w-6 text-slate-600 mx-auto" />
                  <p>No rentals or logistics schedules registered for this date.</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-900 pt-4 mt-4">
            <button
              onClick={() => navigate('/vendor/workflows')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
            >
              <ListFilter className="h-4 w-4 text-slate-400" />
              <span>Switch to List-based Workflow Tasks</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
