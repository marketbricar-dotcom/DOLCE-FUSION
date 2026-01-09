
import React, { useMemo } from 'react';
import { Sale, PaymentMethod } from '../types';

const SummaryCard: React.FC<{label: string, value: string, sub: string, icon?: string}> = ({ label, value, sub, icon }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-amber-100 shadow-md relative overflow-hidden group transition-all text-black">
    <div className="absolute -top-2 -right-2 text-4xl opacity-10">{icon}</div>
    <h4 className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-1">{label}</h4>
    <p className="text-2xl font-black text-black">{value}</p>
    <p className="text-[9px] text-black/60 font-bold uppercase mt-1">{sub}</p>
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
  logoUrl?: string;
  formatCurrency: (amount: number, currency: 'USD' | 'VES') => string;
}

const DailyClose: React.FC<Props> = ({ sales, logoUrl, formatCurrency }) => {
  const dailySummary = useMemo(() => {
    const today = new Date().toDateString();
    const todaySales = sales.filter(sale => new Date(sale.timestamp).toDateString() === today);
    
    const productMap: Record<string, { name: string, quantity: number, totalUSD: number, totalVES: number }> = {};
    const paymentMap: Record<PaymentMethod, { totalUSD: number, totalVES: number, count: number }> = {
      'CASH_USD': { totalUSD: 0, totalVES: 0, count: 0 },
      'CASH_VES': { totalUSD: 0, totalVES: 0, count: 0 },
      'PAGO_MOVIL': { totalUSD: 0, totalVES: 0, count: 0 },
      'CARD': { totalUSD: 0, totalVES: 0, count: 0 }
    };

    let grandTotalUSD = 0;
    let grandTotalVES = 0;

    todaySales.forEach(sale => {
      grandTotalUSD += sale.totalUSD;
      grandTotalVES += sale.totalVES;
      paymentMap[sale.paymentMethod].totalUSD += sale.totalUSD;
      paymentMap[sale.paymentMethod].totalVES += sale.totalVES;
      paymentMap[sale.paymentMethod].count += 1;

      sale.items.forEach(item => {
        if (!productMap[item.productId]) {
          productMap[item.productId] = { name: item.name, quantity: 0, totalUSD: 0, totalVES: 0 };
        }
        productMap[item.productId].quantity += item.quantity;
        productMap[item.productId].totalUSD += item.totalUSD;
        productMap[item.productId].totalVES += item.totalUSD * sale.exchangeRate;
      });
    });

    return { products: Object.values(productMap).sort((a, b) => b.quantity - a.quantity), payments: paymentMap, grandTotalUSD, grandTotalVES, totalSales: todaySales.length };
  }, [sales]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 text-black">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {logoUrl && <img src={logoUrl} className="w-16 h-16 object-cover rounded-full border-2 border-amber-100 bg-white" alt="Report Logo" />}
          <div>
            <h2 className="text-3xl font-black text-black tracking-tight">Cierre de Caja</h2>
            <p className="text-black/60 font-bold uppercase text-[10px] tracking-widest mt-1">Dolce Fusión Report</p>
          </div>
        </div>
        <button onClick={() => window.print()} className="bg-black text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-900 transition-all shadow-sm print:hidden">
          Imprimir Reporte
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-black">
        <SummaryCard label="Ventas Totales" value={dailySummary.totalSales.toString()} sub="Operaciones" icon="📦" />
        <SummaryCard label="Total USD" value={formatCurrency(dailySummary.grandTotalUSD, 'USD')} sub="En Caja" icon="💵" />
        <SummaryCard label="Total Bs." value={formatCurrency(dailySummary.grandTotalVES, 'VES')} sub="En Bolívares" icon="🇻🇪" />
        <SummaryCard label="Venta Promedio" value={formatCurrency(dailySummary.totalSales > 0 ? dailySummary.grandTotalUSD / dailySummary.totalSales : 0, 'USD')} sub="Ticket" icon="📈" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-black text-black uppercase tracking-widest text-[10px] ml-2">Ingresos por Método</h3>
          <div className="bg-white rounded-[2rem] border border-amber-100 overflow-hidden shadow-lg">
            <div className="divide-y divide-amber-50">
              {(Object.keys(dailySummary.payments) as PaymentMethod[]).map(method => (
                <div key={method} className="p-5 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-black/40 uppercase mb-0.5">{getPaymentLabel(method)}</p>
                    <p className="font-black text-black">{formatCurrency(dailySummary.payments[method].totalUSD, 'USD')}</p>
                  </div>
                  <span className="bg-black text-white px-2 py-0.5 rounded-full text-[9px] font-black">
                    {dailySummary.payments[method].count} ops
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-black text-black uppercase tracking-widest text-[10px] ml-2">Ventas por Producto</h3>
          <div className="bg-white rounded-[2rem] border border-amber-100 overflow-hidden shadow-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-amber-50/20 border-b border-amber-100">
                  <th className="px-6 py-4 text-[10px] font-black text-black uppercase">Bebida</th>
                  <th className="px-6 py-4 text-[10px] font-black text-black uppercase text-center">Cant.</th>
                  <th className="px-6 py-4 text-[10px] font-black text-black uppercase text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {dailySummary.products.map((item, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/10">
                    <td className="px-6 py-4 text-sm font-bold text-black uppercase">{item.name}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-black text-white px-2.5 py-0.5 rounded-full text-xs font-black">{item.quantity}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-black text-black text-sm">{formatCurrency(item.totalUSD, 'USD')}</div>
                      <div className="text-[9px] text-black/40 font-bold tracking-tighter uppercase">{formatCurrency(item.totalVES, 'VES')}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyClose;
