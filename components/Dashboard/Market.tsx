import React from 'react';
import { Icons } from '../layout/Icons';
import { ProductItem } from '../../types';

const products: ProductItem[] = [
  { id: '1', name: 'Comprehensive WelliBio Check', priceWelli: 1500, category: 'Services', image: 'https://picsum.photos/200/200?random=1' },
  { id: '2', name: 'Vitamin C Complex', priceWelli: 300, category: 'Pharmacy', image: 'https://picsum.photos/200/200?random=2' },
  { id: '3', name: 'WelliBit Glucose Monitor', priceWelli: 850, category: 'Devices', image: 'https://picsum.photos/200/200?random=3' },
  { id: '4', name: 'Telemedicine Consult (GP)', priceWelli: 500, category: 'WelliCare', image: 'https://picsum.photos/200/200?random=4' },
  { id: '5', name: 'Smart Fitness Band', priceWelli: 2500, category: 'Devices', image: 'https://picsum.photos/200/200?random=5' },
  { id: '6', name: 'WelliRecord Access Card', priceWelli: 100, category: 'Identity', image: 'https://picsum.photos/200/200?random=6' },
];

export const MarketComponent: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">WelliMarket™</h2>
          <p className="text-slate-500 text-sm mt-1">Trusted health products backed by WakaTask logistics.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Icons.ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
                type="text" 
                placeholder="Search medicines, devices..." 
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-welli-500"
            />
          </div>
          <button className="bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors font-medium text-sm">
            Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-welli-100/30 transition-all duration-300 group cursor-pointer">
            <div className="h-48 overflow-hidden relative">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-700 uppercase tracking-wide">
                {product.category}
              </div>
              <button className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full text-slate-700 hover:text-welli-600 transition-colors">
                 <Icons.Heart className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-slate-900 mb-2 truncate text-lg">{product.name}</h3>
              <div className="flex items-end justify-between mt-4">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold">Price</span>
                  <div className="text-welli-600 font-bold text-xl">{product.priceWelli} <span className="text-xs text-welli-400">WELLI</span></div>
                </div>
                <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};