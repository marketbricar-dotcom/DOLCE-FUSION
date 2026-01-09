
import React, { useMemo, useState } from 'react';
import { Sale, PaymentMethod } from '../types';
import { Icons } from '../constants';

const StatCard: React.FC<{label: string, value: string, sub: string}> = ({ label, value, sub }) => (
  <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm text-black">
    <h4 className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-1">{label}</h4>
    <p className="text-2xl font-black text-black">{value}</p>
    <p className="text-[10px] text-[#8b572a] font-bold uppercase tracking-tighter">{sub}</p>
  </div>
);

const getPaymentLabel = (method: PaymentMethod) => {
  switch (method) {
    case 'CASH_USD': return 'Divisas $';
    case 'CASH_VES': return 'Efectivo Bs.';
    case 'PAGO_MOVIL': return 'Pago Móvil';
    case 'CARD': return 'Punto Venta';
    default: return 'Otro';
  }
};

interface Props {
  sales: Sale[];
  formatCurrency: (amount: number, currency: 'USD' | 'VES') => string;
  onDeleteSale: (id: string) => void;
}

const SalesHistory: React.FC<Props> = ({ sales, formatCurrency, onDeleteSale }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Filtrado de ventas por búsqueda, método y rango de fechas
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      // Búsqueda por nombre o referencia
      const matchesSearch = sale.items.some(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) || (sale.reference?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtro por método
      const matchesMethod = filterMethod === 'ALL' || sale.paymentMethod === filterMethod;
      
      // Filtro por rango de fechas
      const saleDate = new Date(sale.timestamp);
      saleDate.setHours(0, 0, 0, 0);
      
      let matchesDate = true;
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (saleDate < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        if (saleDate > end) matchesDate = false;
      }

      return matchesSearch && matchesMethod && matchesDate;
    });
  }, [sales, searchTerm, filterMethod, startDate, endDate]);

  const stats = useMemo(() => {
    return {
      totalUSD: filteredSales.reduce((sum, s) => sum + s.totalUSD, 0),
      totalVES: filteredSales.reduce((sum, s) => sum + s.totalVES, 0),
      count: filteredSales.length
    };
  }, [filteredSales]);

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta venta? Esta acción no se puede deshacer.')) {
      onDeleteSale(id);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(timestamp));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterMethod('ALL');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-black animate-in fade-in duration-500">
      {/* Panel de Filtros Avanzado */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-amber-100 shadow-md space-y-6 text-black">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Búsqueda */}
          <div className="relative flex-1 w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
            <input 
              type="text"
              placeholder="Buscar bebida o referencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-black outline-none font-bold text-sm transition-all"
            />
          </div>
          
          {/* Métodos de Pago */}
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <button 
              onClick={() => setFilterMethod('ALL')}
              className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${filterMethod === 'ALL' ? 'bg-black text-white border-black shadow-md' : 'bg-white text-black border-amber-100 hover:border-black'}`}
            >
              Todos
            </button>
            {(['CASH_USD', 'PAGO_MOVIL', 'CASH_VES', 'CARD'] as PaymentMethod[]).map(method => (
              <button 
                key={method}
                onClick={() => setFilterMethod(method)}
                className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${filterMethod === method ? 'bg-black text-white border-black shadow-md' : 'bg-white text-black border-amber-100 hover:border-black'}`}
              >
                {getPaymentLabel(method)}
              </button>
            ))}
          </div>
        </div>

        {/* Rango de Fechas */}
        <div className="flex flex-col md:flex-row items-end gap-4 border-t border-amber-50 pt-6">
          <div className="w-full md:w-auto flex-1 space-y-1.5">
            <label className="text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Desde</label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-black outline-none font-bold text-sm text-black"
            />
          </div>
          <div className="w-full md:w-auto flex-1 space-y-1.5">
            <label className="text-[10px] font-black text-black/40 uppercase tracking-widest ml-1">Hasta</label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-black outline-none font-bold text-sm text-black"
            />
          </div>
          <button 
            onClick={clearFilters}
            className="w-full md:w-auto px-6 py-3.5 bg-amber-50 text-black hover:bg-amber-100 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Stats Cards dinámicos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Operaciones Encontradas" value={stats.count.toString()} sub="Ventas filtradas" />
        <StatCard label="Total USD Filtrado" value={formatCurrency(stats.totalUSD, 'USD')} sub="Suma del período" />
        <StatCard label="Total VES Filtrado" value={formatCurrency(stats.totalVES, 'VES')} sub="Suma del período" />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-amber-100 overflow-hidden shadow-sm text-black">
        <div className="p-6 border-b border-amber-100 flex justify-between items-center bg-amber-50/10">
          <h3 className="font-black text-black uppercase tracking-widest text-xs">Registro de Transacciones</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            Mostrando {filteredSales.length} de {sales.length}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-amber-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-black uppercase tracking-widest">Fecha / Hora</th>
                <th className="px-6 py-4 text-[10px] font-black text-black uppercase tracking-widest">Productos</th>
                <th className="px-6 py-4 text-[10px] font-black text-black uppercase tracking-widest text-center">Pago</th>
                <th className="px-6 py-4 text-[10px] font-black text-black uppercase tracking-widest text-center">Tasa</th>
                <th className="px-6 py-4 text-[10px] font-black text-black uppercase tracking-widest text-right">Total</th>
                <th className="px-6 py-4 text-[10px] font-black text-black uppercase tracking-widest text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map(sale => (
                <tr key={sale.id} className="hover:bg-amber-50/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-black text-black text-xs uppercase">
                      {formatDate(sale.timestamp)}
                    </div>
                    <div className="text-[10px] text-[#d61c2e] font-black uppercase tracking-tight">
                      {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {sale.items.map((item, idx) => (
                        <div key={idx} className="text-[10px] font-bold text-black/80 uppercase flex items-center gap-1">
                          <span className="inline-flex items-center justify-center bg-amber-100 text-amber-900 w-5 h-5 rounded-md font-black text-[9px] mr-1">{item.quantity}</span> 
                          {item.name}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`inline-block px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm
                        ${sale.paymentMethod === 'CASH_USD' ? 'bg-green-100 text-green-800' : 
                          sale.paymentMethod === 'PAGO_MOVIL' ? 'bg-blue-100 text-blue-800' : 
                          'bg-slate-800 text-white'}
                      `}>
                        {getPaymentLabel(sale.paymentMethod)}
                      </span>
                      {sale.reference && (
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          Ref: {sale.reference}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                      Bs. {sale.exchangeRate.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-black text-black text-sm">{formatCurrency(sale.totalUSD, 'USD')}</div>
                    <div className="text-[9px] text-slate-400 font-bold tracking-tighter uppercase">
                      {formatCurrency(sale.totalVES, 'VES')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleDelete(sale.id)}
                      className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Eliminar registro"
                    >
                      <Icons.Trash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSales.length === 0 && (
            <div className="p-24 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-4">
                <Icons.History />
              </div>
              <p className="font-black uppercase tracking-widest text-[10px] text-slate-400">No se encontraron ventas con los criterios seleccionados</p>
              <button 
                onClick={clearFilters}
                className="mt-4 text-[10px] font-black text-[#d61c2e] uppercase underline tracking-widest"
              >
                Resetear todos los filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;
