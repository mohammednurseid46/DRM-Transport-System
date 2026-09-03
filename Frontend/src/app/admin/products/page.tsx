"use client";

import React, { useState } from "react";
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  MoreVertical
} from "lucide-react";
import { RIDE_PRODUCTS, RideProduct } from "@/lib/constants/ride-products";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<RideProduct[]>(RIDE_PRODUCTS);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 rounded-md">
            <Package size={20} className="text-orange-600 dark:text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">Ride Products</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage vehicle tiers, pricing, and availability</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 dark:bg-orange-600 hover:bg-orange-500 dark:bg-orange-600-hover text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white rounded-control text-sm font-bold transition-colors">
          <Plus size={16} />
          ADD PRODUCT
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map((product) => {
          const Icon = product.icon;
          return (
            <div key={product.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-card overflow-hidden flex flex-col group">
              {/* Product Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 relative">
                {product.recommended && (
                  <div className="absolute top-4 right-4 bg-orange-500 dark:bg-orange-600/20 text-orange-600 dark:text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded-badge uppercase">
                    Default Selection
                  </div>
                )}
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-md ${product.isActive ? 'bg-orange-500 dark:bg-orange-600/10' : 'bg-gray-800'}`}>
                    <Icon size={24} className={product.isActive ? 'text-orange-600 dark:text-orange-500' : 'text-slate-500 dark:text-slate-500'} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{product.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {product.isActive ? (
                        <><CheckCircle2 size={12} className="text-green-500"/><span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Active</span></>
                      ) : (
                        <><XCircle size={12} className="text-slate-500 dark:text-slate-500"/><span className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Inactive</span></>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">{product.description}</p>
              </div>

              {/* Product Pricing Details */}
              <div className="p-5 bg-slate-100 dark:bg-slate-900 flex-1 grid grid-cols-2 gap-y-4 gap-x-2">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">Base Fare</div>
                  <div className="text-base font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">${product.baseFare.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">Minimum Fare</div>
                  <div className="text-base font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">${product.minimumFare.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">Per KM Rate</div>
                  <div className="text-base font-medium text-slate-500 dark:text-slate-400">${product.perKmRate.toFixed(2)}/km</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">Per Min Rate</div>
                  <div className="text-base font-medium text-slate-500 dark:text-slate-400">${product.perMinuteRate.toFixed(2)}/min</div>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700 mt-1 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">Platform Commission</div>
                    <div className="text-base font-medium text-orange-600 dark:text-orange-500">{product.commissionPercentage}%</div>
                  </div>
                  <div className="text-right">
                     <div className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">Max Seats</div>
                     <div className="text-base font-medium text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white">{product.seats}</div>
                  </div>
                </div>
              </div>

              {/* Product Actions */}
              <div className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                 <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors" title="Edit Product">
                    <Edit2 size={16} />
                 </button>
                 <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-400 transition-colors" title="Delete Product">
                    <Trash2 size={16} />
                 </button>
                 <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-slate-900 dark:text-white transition-colors">
                    <MoreVertical size={16} />
                 </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
