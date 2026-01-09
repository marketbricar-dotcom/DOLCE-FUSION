
import React, { useState, useEffect } from 'react';

interface Props {
  exchangeRate: number;
  formatCurrency: (amount: number, currency: 'USD' | 'VES') => string;
}

const CurrencyCalculator: React.FC<Props> = ({ exchangeRate, formatCurrency }) => {
  const [usdVal, setUsdVal] = useState<string>('1');
  const [vesVal, setVesVal] = useState<string>(exchangeRate.toString());

  // Sincronizar cuando cambia la tasa global
  useEffect(() => {
    const num = parseFloat(usdVal) || 0;
    setVesVal((num * exchangeRate).toFixed(2));
  }, [exchangeRate]);

  const handleUsdChange = (val: string) => {
    setUsdVal(val);
    const num = parseFloat(val) || 0;
    setVesVal((num * exchangeRate).toFixed(2));
  };

  const handleVesChange = (val: string) => {
    setVesVal(val);
    const num = parseFloat(val) || 0;
    setUsdVal((num / exchangeRate).toFixed(2));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-black">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-black tracking-tight mb-1">Cambio Dolce Fusión</h2>
        <p className="text-black/60 font-bold uppercase text-xs tracking-widest">Conversión instantánea Bs. {exchangeRate}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-black">
        {/* USD Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-amber-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center font-black text-2xl mb-6 shadow-lg">$</div>
          <label className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-4">Monto en Divisas (USD)</label>
          <input 
            type="number"
            value={usdVal}
            onChange={(e) => handleUsdChange(e.target.value)}
            className="w-full text-center text-4xl font-black text-black border-b-4 border-amber-100 pb-2 focus:border-black outline-none transition-all bg-transparent"
          />
        </div>

        {/* VES Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-amber-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center font-black text-2xl mb-6 shadow-lg">Bs</div>
          <label className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-4">Monto en Bolívares (VES)</label>
          <input 
            type="number"
            value={vesVal}
            onChange={(e) => handleVesChange(e.target.value)}
            className="w-full text-center text-4xl font-black text-black border-b-4 border-amber-100 pb-2 focus:border-black outline-none transition-all bg-transparent"
          />
        </div>
      </div>

      <div className="bg-black text-white p-8 rounded-3xl mt-12 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-black uppercase tracking-tight">Referencia de Cambio</h3>
            <p className="text-white/60 font-bold text-xs uppercase tracking-widest mt-1">Calculado con la tasa configurada</p>
          </div>
          <div className="bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/20">
            <span className="text-[10px] font-bold uppercase block opacity-60 tracking-widest">Tasa del Día</span>
            <span className="text-2xl font-black">{exchangeRate} Bs / 1$</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyCalculator;
