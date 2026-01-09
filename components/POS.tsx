
import React, { useState, useMemo } from 'react';
import { Product, SaleItem, PaymentMethod } from '../types';
import { Icons, CATEGORIES } from '../constants';

const CategoryButton: React.FC<{active: boolean, onClick: () => void, label: string}> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all border uppercase tracking-widest
      ${active ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-black border-amber-100 hover:bg-gray-50'}`}
  >
    {label}
  </button>
);

const PaymentBtn: React.FC<{active: boolean, onClick: () => void, label: string}> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-3 py-3 rounded-2xl text-[10px] font-black transition-all border uppercase leading-none tracking-tighter
      ${active ? 'bg-black text-white border-black shadow-md' : 'bg-white text-black border-amber-100 hover:border-black'}`}
  >
    {label}
  </button>
);

interface POSProps {
  inventory: Product[];
  exchangeRate: number;
  onCompleteSale: (items: SaleItem[], totalUSD: number, method: PaymentMethod, reference?: string) => void;
  formatCurrency: (amount: number, currency: 'USD' | 'VES') => string;
}

const POS: React.FC<POSProps> = ({ inventory, exchangeRate, onCompleteSale, formatCurrency }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_USD');
  const [reference, setReference] = useState('');

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return inventory;
    return inventory.filter(p => p.category === activeCategory);
  }, [inventory, activeCategory]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, totalUSD: (item.quantity + 1) * item.priceUSD }
          : item
        );
      }
      return [...prev, { 
        productId: product.id, 
        name: product.name, 
        quantity: 1, 
        priceUSD: product.priceUSD, 
        totalUSD: product.priceUSD 
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, totalUSD: newQty * item.priceUSD };
      }
      return item;
    }));
  };

  const totalUSD = cart.reduce((sum, item) => sum + item.totalUSD, 0);
  const totalVES = totalUSD * exchangeRate;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    onCompleteSale(cart, totalUSD, paymentMethod, paymentMethod === 'PAGO_MOVIL' ? reference : undefined);
    setCart([]);
    setReference('');
    alert("¡Venta procesada con éxito en Dolce Fusión!");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full max-h-full animate-in fade-in duration-500 text-black">
      {/* Products Selection */}
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0">
          <CategoryButton active={activeCategory === 'All'} onClick={() => setActiveCategory('All')} label="Todos" />
          {CATEGORIES.map(cat => (
            <CategoryButton key={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)} label={cat} />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-4 rounded-3xl border border-amber-100 shadow-sm hover:shadow-xl hover:border-[#d61c2e] transition-all text-left flex flex-col group active:scale-[0.97] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-12 h-12 bg-red-50/50 rounded-bl-full flex items-center justify-center translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
                <span className="text-[#d61c2e] font-bold">+</span>
              </div>
              <span className="text-[10px] font-black text-black opacity-60 uppercase tracking-widest mb-1">{product.category}</span>
              <h3 className="font-black text-black text-sm mb-2 line-clamp-2 leading-tight flex-1">{product.name}</h3>
              <div className="mt-auto border-t border-amber-50 pt-2">
                <p className="text-xl font-black text-black">{formatCurrency(product.priceUSD, 'USD')}</p>
                <p className="text-[10px] text-black opacity-50 font-black tracking-tighter uppercase">Equivale a {formatCurrency(product.priceUSD * exchangeRate, 'VES')}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Summary */}
      <div className="w-full lg:w-96 shrink-0 flex flex-col bg-white rounded-[2.5rem] border border-amber-200 shadow-2xl overflow-hidden">
        <div className="p-6 bg-[#f5e6d8] border-b border-amber-200">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-black flex items-center gap-2 uppercase tracking-tight">
              <Icons.Cart /> Detalle Pedido
            </h3>
            <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-black shadow-md">
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[250px] bg-white text-black text-black">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-black/30">
              <img src="https://cdn-icons-png.flaticon.com/512/3130/3130432.png" className="w-20 h-20 opacity-20 mb-4 grayscale" alt="empty" />
              <p className="text-sm font-black uppercase tracking-widest text-center">¡Elige un sabor de Dolce Fusión!</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="flex justify-between items-center group bg-amber-50/30 p-3 rounded-2xl border border-amber-50">
                <div className="flex-1 mr-3">
                  <h4 className="text-xs font-black text-black leading-tight uppercase">{item.name}</h4>
                  <p className="text-[10px] text-black font-bold">{formatCurrency(item.priceUSD, 'USD')} c/u</p>
                </div>
                <div className="flex items-center bg-white border border-amber-100 rounded-xl p-1.5 shadow-sm">
                  <button onClick={() => updateQuantity(item.productId, -1)} className="w-6 h-6 flex items-center justify-center text-black hover:bg-gray-100 rounded-lg font-black">-</button>
                  <span className="px-3 text-sm font-black w-8 text-center text-black">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, 1)} className="w-6 h-6 flex items-center justify-center text-black hover:bg-gray-100 rounded-lg font-black">+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-5 bg-amber-50/50 border-t border-amber-100">
          <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-3 text-center">¿Cómo paga el cliente?</label>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <PaymentBtn active={paymentMethod === 'CASH_USD'} onClick={() => {setPaymentMethod('CASH_USD'); setReference('');}} label="Divisas $" />
            <PaymentBtn active={paymentMethod === 'CASH_VES'} onClick={() => {setPaymentMethod('CASH_VES'); setReference('');}} label="Efectivo Bs." />
            <PaymentBtn active={paymentMethod === 'PAGO_MOVIL'} onClick={() => setPaymentMethod('PAGO_MOVIL')} label="Pago Móvil" />
            <PaymentBtn active={paymentMethod === 'CARD'} onClick={() => {setPaymentMethod('CARD'); setReference('');}} label="Punto de Venta" />
          </div>

          {paymentMethod === 'PAGO_MOVIL' && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="block text-[9px] font-black text-black uppercase tracking-widest mb-1.5 ml-1">Referencia del Pago</label>
              <input 
                type="text"
                placeholder="Ej: 4567..."
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-black outline-none font-bold text-xs"
              />
            </div>
          )}
        </div>

        <div className="p-8 bg-white border-t border-amber-100 mt-auto text-black">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-[10px] font-black text-black/60 uppercase tracking-widest">A pagar en USD</p>
              <h2 className="text-4xl font-black text-black leading-none tracking-tighter">{formatCurrency(totalUSD, 'USD')}</h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-black/60 uppercase tracking-widest">En Bolívares</p>
              <p className="text-lg font-black text-black">{formatCurrency(totalVES, 'VES')}</p>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-xl active:scale-[0.98]
              ${cart.length === 0 
                ? 'bg-amber-100 text-black/30 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-900'
              }`}
          >
            Confirmar Venta
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
