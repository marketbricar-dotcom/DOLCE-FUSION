
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { CATEGORIES, Icons } from '../constants';
import { getCreativeDescription } from '../services/geminiService';

// Función interna de generación de ID para máxima compatibilidad
const safeGenerateId = () => {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

interface Props {
  inventory: Product[];
  onAdd: (product: Product) => void;
  onUpdate: (product: Product) => void;
  onDelete: (id: string) => void;
  formatCurrency: (amount: number, currency: 'USD' | 'VES') => string;
  exchangeRate: number;
  logoUrl: string;
  onLogoChange: (newLogo: string) => void;
}

const InventoryManager: React.FC<Props> = ({ 
  inventory, 
  onAdd, 
  onUpdate, 
  onDelete, 
  formatCurrency, 
  exchangeRate,
  logoUrl,
  onLogoChange
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    priceUSD: 0,
    category: CATEGORIES[0],
    description: ''
  });
  
  const [priceInput, setPriceInput] = useState<number>(0);
  const [inputCurrency, setInputCurrency] = useState<'USD' | 'VES'>('USD');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronización controlada del precio
  useEffect(() => {
    if (isModalOpen) {
      const calculatedUSD = inputCurrency === 'USD' 
        ? priceInput 
        : (exchangeRate > 0 ? priceInput / exchangeRate : 0);
      
      setFormData(prev => ({ ...prev, priceUSD: calculatedUSD }));
    }
  }, [priceInput, inputCurrency, exchangeRate, isModalOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || (formData.priceUSD || 0) <= 0) return;

    if (editingId) {
      onUpdate({ ...formData as Product, id: editingId });
    } else {
      onAdd({ 
        ...formData as Product, 
        id: safeGenerateId() 
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', priceUSD: 0, category: CATEGORIES[0], description: '' });
    setPriceInput(0);
    setInputCurrency('USD');
    setEditingId(null);
    setIsModalOpen(false);
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData(product);
    setPriceInput(product.priceUSD);
    setInputCurrency('USD');
    setIsModalOpen(true);
  };

  const handleGeminiGen = async () => {
    if (!formData.name) return;
    setIsGeneratingDesc(true);
    try {
      const desc = await getCreativeDescription(formData.name);
      setFormData(prev => ({ ...prev, description: desc }));
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 text-black animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-[2.5rem] border border-amber-200 shadow-md flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <img 
            src={logoUrl} 
            alt="Logo Actual" 
            className="w-32 h-32 object-cover rounded-full border-4 border-[#f5e6d8] shadow-lg bg-white"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <span className="text-white text-[10px] font-black uppercase">Cambiar</span>
          </button>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-black text-black uppercase tracking-tight mb-2">Imagen de Marca</h3>
          <p className="text-sm text-black/60 font-medium mb-4">Sube el logo o foto de perfil de Dolce Fusión.</p>
          <input type="file" ref={fileInputRef} onChange={(e) => {
             const file = e.target.files?.[0];
             if (file) {
               const reader = new FileReader();
               reader.onloadend = () => onLogoChange(reader.result as string);
               reader.readAsDataURL(file);
             }
          }} accept="image/*" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="bg-black text-white px-8 py-3 rounded-2xl font-black text-xs uppercase hover:bg-gray-800 transition-all shadow-md">Subir Nueva Foto</button>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div>
          <h2 className="text-2xl font-black text-black tracking-tight">Lista de Productos</h2>
          <p className="text-black/60 font-medium">Gestiona el menú de tu evento.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-900 transition-all shadow-lg">
          <Icons.Plus /> Agregar Item
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-black uppercase tracking-widest">Bebida / Item</th>
              <th className="px-6 py-4 text-xs font-bold text-black uppercase tracking-widest">Categoría</th>
              <th className="px-6 py-4 text-xs font-bold text-black uppercase tracking-widest">Precio USD</th>
              <th className="px-6 py-4 text-xs font-bold text-black uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventory.map(product => (
              <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="font-bold text-black">{product.name}</div>
                  <div className="text-xs text-black/50 mt-0.5 line-clamp-1 italic">{product.description || 'Sin descripción'}</div>
                </td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1 bg-gray-100 text-black rounded-full text-[10px] font-black uppercase">{product.category}</span>
                </td>
                <td className="px-6 py-5">
                  <div className="font-mono font-bold text-black">{formatCurrency(product.priceUSD, 'USD')}</div>
                  <div className="text-[10px] text-black/40 font-bold uppercase tracking-tight">≈ {formatCurrency(product.priceUSD * exchangeRate, 'VES')}</div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2 text-black">
                    <button onClick={() => startEdit(product)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Icons.Edit /></button>
                    <button onClick={() => { if(confirm('¿Borrar este item?')) onDelete(product.id) }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Icons.Trash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {inventory.length === 0 && <div className="p-20 text-center text-black/30"><p>No hay items registrados</p></div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="px-8 pt-8 pb-4">
              <h3 className="text-2xl font-black text-black mb-1">{editingId ? 'Editar Item' : 'Nueva Bebida'}</h3>
              <p className="text-black/50 text-sm font-medium">Ingresa los detalles del producto</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1.5 ml-1">Nombre</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej: Chicha Tradicional" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-black outline-none font-medium text-black" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-black uppercase ml-1">Precio</label>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button type="button" onClick={() => setInputCurrency('USD')} className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${inputCurrency === 'USD' ? 'bg-black text-white' : 'text-black/40'}`}>USD ($)</button>
                      <button type="button" onClick={() => setInputCurrency('VES')} className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${inputCurrency === 'VES' ? 'bg-black text-white' : 'text-black/40'}`}>BSF (Bs)</button>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-black/30">{inputCurrency === 'USD' ? '$' : 'Bs.'}</span>
                    <input required type="number" step="0.01" value={priceInput} onChange={e => setPriceInput(parseFloat(e.target.value) || 0)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-black outline-none font-bold text-black" />
                  </div>
                  <p className="text-[10px] text-black/50 font-bold uppercase tracking-tight ml-1">
                    {inputCurrency === 'VES' ? `Equivale a ${formatCurrency(formData.priceUSD || 0, 'USD')}` : `Equivale a ${formatCurrency(priceInput * exchangeRate, 'VES')}`}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1.5 ml-1">Categoría</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-black outline-none font-bold text-black">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5 ml-1">
                    <label className="text-xs font-bold text-black uppercase">Descripción IA</label>
                    <button type="button" onClick={handleGeminiGen} disabled={!formData.name || isGeneratingDesc} className="text-[10px] font-black text-white bg-black px-2 py-0.5 rounded-full hover:bg-gray-800 disabled:opacity-50">✨ IA</button>
                  </div>
                  <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-black outline-none font-medium text-sm text-black" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 py-4 text-black font-bold hover:bg-gray-50 rounded-2xl">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-black text-white font-black uppercase tracking-widest rounded-2xl hover:bg-gray-900 shadow-lg active:scale-95 transition-all">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;
