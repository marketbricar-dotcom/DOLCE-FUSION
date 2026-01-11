
import React, { useState, useEffect, useRef } from 'react';
import { Product, Sale, View, SaleItem, PaymentMethod } from './types';
import { INITIAL_PRODUCTS, CATEGORIES, Icons } from './constants';
import POS from './components/POS';
import InventoryManager from './components/InventoryManager';
import SalesHistory from './components/SalesHistory';
import CurrencyCalculator from './components/CurrencyCalculator';
import DailyClose from './components/DailyClose';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

const NavItem: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`
      w-full flex items-center gap-4 px-5 py-3.5 text-sm font-black rounded-2xl transition-all duration-300 uppercase tracking-tight
      ${active 
        ? 'bg-[#d61c2e] text-white shadow-lg translate-x-1' 
        : 'text-black hover:bg-red-50 hover:text-[#d61c2e]'
      }
    `}
  >
    <span className={`${active ? 'text-white' : 'text-black'}`}>{icon}</span>
    {label}
  </button>
);

const App: React.FC = () => {
  // Tasa de cambio oficial de la app
  const [exchangeRate, setExchangeRate] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('dolce_exchange_rate');
      return saved ? parseFloat(saved) : 45.50;
    } catch (e) {
      return 45.50;
    }
  });

  // Estado temporal para el input de la tasa
  const [tempRate, setTempRate] = useState<string>(exchangeRate.toString());
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const [inventory, setInventory] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('chicha_inventory');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem('chicha_sales');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [logoUrl, setLogoUrl] = useState<string>(() => {
    return localStorage.getItem('dolce_fusion_logo') || "https://cdn-icons-png.flaticon.com/512/3130/3130432.png";
  });

  const [currentView, setCurrentView] = useState<View>(View.POS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('chicha_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('chicha_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('dolce_fusion_logo', logoUrl);
  }, [logoUrl]);

  // Manejador manual para actualizar la tasa
  const handleUpdateRate = () => {
    const newRate = parseFloat(tempRate);
    if (!isNaN(newRate) && newRate > 0) {
      setExchangeRate(newRate);
      localStorage.setItem('dolce_exchange_rate', newRate.toString());
      setShowSavedMsg(true);
      setTimeout(() => setShowSavedMsg(false), 3000);
    } else {
      alert("Por favor ingresa una tasa válida");
    }
  };

  const addProduct = (product: Product) => {
    setInventory(prev => [...prev, product]);
  };

  const updateProduct = (updated: Product) => {
    setInventory(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const deleteProduct = (id: string) => {
    setInventory(prev => prev.filter(p => p.id !== id));
  };

  const recordSale = (items: SaleItem[], totalUSD: number, paymentMethod: PaymentMethod, reference?: string) => {
    const newSale: Sale = {
      id: generateId(),
      timestamp: Date.now(),
      items,
      totalUSD,
      totalVES: totalUSD * exchangeRate,
      exchangeRate,
      paymentMethod,
      reference
    };
    setSales(prev => [newSale, ...prev]);
  };

  const deleteSale = (id: string) => {
    setSales(prev => prev.filter(sale => sale.id !== id));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatCurrency = (amount: number, currency: 'USD' | 'VES') => {
    return new Intl.NumberFormat(currency === 'VES' ? 'es-VE' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const Logo = ({ className = "" }: { className?: string }) => (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative group">
        <img 
          src={logoUrl} 
          alt="Dolce Fusión Logo" 
          className="w-32 h-32 object-cover mb-2 drop-shadow-md rounded-full border-4 border-white bg-white"
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer print:hidden"
        >
          <span className="text-white text-[10px] font-black uppercase tracking-widest">Cambiar</span>
        </button>
      </div>
      <div className="text-center">
        <span className="brand-font text-2xl font-black text-[#d61c2e] leading-none block">Dolce</span>
        <span className="brand-font text-xl font-black text-[#8b572a] leading-none block">Fusión</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5e6d8] flex flex-col md:flex-row print:bg-white text-black">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleLogoUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Mobile Header */}
      <div className="md:hidden bg-[#d61c2e] text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-0.5 overflow-hidden">
            <img src={logoUrl} className="w-full h-full object-cover rounded-full" alt="mini logo" />
          </div>
          <h1 className="brand-font text-xl font-extrabold tracking-tight">Dolce Fusión</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/20 rounded-lg text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 transition duration-300 ease-in-out z-40
        w-64 bg-white border-r border-amber-100 flex flex-col shadow-xl md:shadow-none print:hidden
      `}>
        <div className="p-8 hidden md:block border-b border-amber-50">
          <Logo />
        </div>

        <nav className="mt-6 flex-1 space-y-2 px-4">
          <NavItem active={currentView === View.POS} onClick={() => {setCurrentView(View.POS); setIsSidebarOpen(false)}} icon={<Icons.Cart />} label="Vender Ahora" />
          <NavItem active={currentView === View.INVENTORY} onClick={() => {setCurrentView(View.INVENTORY); setIsSidebarOpen(false)}} icon={<Icons.Inventory />} label="Menú Dolce" />
          <NavItem active={currentView === View.DAILY_CLOSE} onClick={() => {setCurrentView(View.DAILY_CLOSE); setIsSidebarOpen(false)}} icon={<Icons.Report />} label="Cierre de Caja" />
          <NavItem active={currentView === View.SALES} onClick={() => {setCurrentView(View.SALES); setIsSidebarOpen(false)}} icon={<Icons.History />} label="Historial" />
          <NavItem active={currentView === View.CALCULATOR} onClick={() => {setCurrentView(View.CALCULATOR); setIsSidebarOpen(false)}} icon={<Icons.Calculator />} label="Calculadora Bs." />
        </nav>

        <div className="p-6 bg-amber-50/50 border-t border-amber-100 mt-auto">
          <label className="block text-[10px] font-black text-black uppercase mb-2 text-center tracking-widest">Tasa del Día (Manual)</label>
          <div className="space-y-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black font-bold text-xs">Bs.</span>
              <input 
                type="number" 
                step="0.01"
                value={tempRate}
                onChange={(e) => setTempRate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-[#d61c2e] outline-none font-black text-lg text-center shadow-inner"
              />
            </div>
            <button 
              onClick={handleUpdateRate}
              className="w-full py-2.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-md"
            >
              Actualizar Tasa
            </button>
            {showSavedMsg && (
              <p className="text-[9px] text-green-600 font-bold text-center uppercase animate-pulse">¡Tasa Guardada!</p>
            )}
          </div>
          <p className="text-[8px] text-black/40 mt-3 text-center font-bold uppercase">La tasa NO cambiará hasta que presiones Actualizar</p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="hidden md:flex bg-white/80 backdrop-blur-md h-20 border-b border-amber-100 px-8 items-center justify-between shrink-0 print:hidden">
          <h2 className="text-xl font-black text-black uppercase tracking-tighter">
            {currentView === View.POS && 'Punto de Venta'}
            {currentView === View.INVENTORY && 'Gestión del Menú'}
            {currentView === View.DAILY_CLOSE && 'Resumen del Día'}
            {currentView === View.SALES && 'Todas las Ventas'}
            {currentView === View.CALCULATOR && 'Cambio a Bolívares'}
          </h2>
          <div className="flex items-center gap-4">
             <div className="bg-[#f5e6d8] text-black px-5 py-2 rounded-2xl text-sm font-black border border-amber-200 shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Tasa Activa: {formatCurrency(exchangeRate, 'VES')}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 print:p-0">
          {currentView === View.POS && (
            <POS inventory={inventory} exchangeRate={exchangeRate} onCompleteSale={recordSale} formatCurrency={formatCurrency} />
          )}
          {currentView === View.INVENTORY && (
            <InventoryManager 
              inventory={inventory} 
              onAdd={addProduct} 
              onUpdate={updateProduct} 
              onDelete={deleteProduct} 
              formatCurrency={formatCurrency} 
              exchangeRate={exchangeRate}
              logoUrl={logoUrl}
              onLogoChange={setLogoUrl}
            />
          )}
          {currentView === View.DAILY_CLOSE && (
            <DailyClose sales={sales} logoUrl={logoUrl} formatCurrency={formatCurrency} />
          )}
          {currentView === View.SALES && (
            <SalesHistory sales={sales} formatCurrency={formatCurrency} onDeleteSale={deleteSale} />
          )}
          {currentView === View.CALCULATOR && (
            <CurrencyCalculator exchangeRate={exchangeRate} formatCurrency={formatCurrency} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
