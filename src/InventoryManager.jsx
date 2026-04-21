import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const InventoryManager = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Computer Accessories');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stockQty, setStockQty] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('item_name', { ascending: true });
    
    if (!error) setInventory(data || []);
    setLoading(false);
  };

  // ပစ္စည်းအသစ် ထည့်ခြင်း
  const handleAddItem = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const newItem = {
      item_name: itemName.trim(),
      category: category,
      buying_price: Number(buyingPrice),
      selling_price: Number(sellingPrice),
      stock_qty: Number(stockQty)
    };

    const { data, error } = await supabase.from('inventory').insert([newItem]).select();

    if (error) {
      if (error.code === '23505') {
        alert('ဤပစ္စည်းအမည်မှာ စာရင်းထဲတွင် ရှိပြီးသားဖြစ်ပါသည်။ နာမည်ခွဲခြားပေးပါ။');
      } else {
        alert('စာရင်းသွင်းရာတွင် အမှားဖြစ်နေပါသည်။');
      }
    } else {
      setInventory([...inventory, data[0]].sort((a, b) => a.item_name.localeCompare(b.item_name)));
      setItemName(''); setBuyingPrice(''); setSellingPrice(''); setStockQty('');
      alert('ပစ္စည်းသစ် ထည့်သွင်းခြင်း အောင်မြင်ပါသည်။');
    }
    setIsSaving(false);
  };

  // အရေအတွက် အတိုး/အလျော့ ပြုလုပ်ခြင်း (Quick Update)
  const updateStock = async (id, currentQty, amount) => {
    const newQty = currentQty + amount;
    if (newQty < 0) return; // သုညအောက် မရောက်စေရန်

    const { error } = await supabase.from('inventory').update({ stock_qty: newQty, last_updated: new Date() }).eq('id', id);
    
    if (!error) {
      setInventory(inventory.map(item => item.id === id ? { ...item, stock_qty: newQty } : item));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span>📦</span> ပစ္စည်းလက်ကျန် စီမံခန့်ခွဲမှု (Inventory Management)
      </h2>

      {/* အသစ်ထည့်ရန် Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-blue-800">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">ပစ္စည်းအသစ် မှတ်တမ်းတင်ရန်</h3>
        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-600 mb-1">ပစ္စည်းအမည်</label>
            <input type="text" required value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500" placeholder="ဥပမာ - Wireless Mouse (Logitech)" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-600 mb-1">ဝယ်ရင်းဈေး (Ks)</label>
            <input type="number" min="0" required value={buyingPrice} onChange={(e) => setBuyingPrice(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-600 mb-1">ရောင်းဈေး (Ks)</label>
            <input type="number" min="0" required value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-600 mb-1">အစပျိုး လက်ကျန် (Qty)</label>
            <input type="number" min="0" required value={stockQty} onChange={(e) => setStockQty(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500" placeholder="0" />
          </div>
          <div className="md:col-span-5 mt-2">
            <button type="submit" disabled={isSaving} className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-2.5 px-6 rounded shadow transition disabled:opacity-50">
              {isSaving ? 'သိမ်းနေသည်...' : '+ ပစ္စည်းသစ် ထည့်မည်'}
            </button>
          </div>
        </form>
      </div>

      {/* လက်ကျန်စာရင်း Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-700">လက်ရှိ ပစ္စည်းစာရင်းများ</h3>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-gray-500 font-semibold animate-pulse">ဒေတာများ ဆွဲယူနေပါသည်...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider">
                  <th className="p-4 border-b font-bold">ပစ္စည်းအမည်</th>
                  <th className="p-4 border-b font-bold text-right">ဝယ်ရင်းဈေး</th>
                  <th className="p-4 border-b font-bold text-right">ရောင်းဈေး</th>
                  <th className="p-4 border-b font-bold text-center">လက်ကျန် (Stock)</th>
                </tr>
              </thead>
              <tbody>
                {inventory.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-500">ပစ္စည်းစာရင်း မရှိသေးပါ။</td></tr>
                ) : (
                  inventory.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-sm font-bold text-gray-800">{item.item_name}</td>
                      <td className="p-4 text-right text-sm text-gray-600">{Number(item.buying_price).toLocaleString()}</td>
                      <td className="p-4 text-right text-sm font-semibold text-blue-700">{Number(item.selling_price).toLocaleString()}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => updateStock(item.id, item.stock_qty, -1)} className="bg-red-100 text-red-600 hover:bg-red-200 w-8 h-8 rounded-full font-bold transition">-</button>
                          <span className={`text-lg font-black w-10 text-center ${item.stock_qty <= 3 ? 'text-red-600' : 'text-gray-800'}`}>
                            {item.stock_qty}
                          </span>
                          <button onClick={() => updateStock(item.id, item.stock_qty, 1)} className="bg-green-100 text-green-600 hover:bg-green-200 w-8 h-8 rounded-full font-bold transition">+</button>
                        </div>
                        {item.stock_qty <= 3 && <p className="text-[10px] text-red-500 text-center mt-1 font-bold">Low Stock!</p>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;