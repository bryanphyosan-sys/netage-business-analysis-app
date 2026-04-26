import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const DailySaleTracker = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemName, setItemName] = useState('');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');

  useEffect(() => {
    fetchSales();
  }, [date]);

  const fetchSales = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('daily_sales')
      .select('*')
      .eq('date', date)
      .order('created_at', { ascending: false });
    
    if (!error) setSales(data || []);
    setLoading(false);
  };

  const handleAddSale = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const newSale = {
      date: date,
      item_name: itemName.trim(),
      buying_price: Number(buyingPrice),
      selling_price: Number(sellingPrice)
    };

    const { data, error } = await supabase
      .from('daily_sales')
      .insert([newSale])
      .select();

    if (error) {
      alert('အရောင်းစာရင်း သွင်းရာတွင် အမှားဖြစ်နေပါသည်။');
    } else {
      setSales([data[0], ...sales]);
      setItemName('');
      setBuyingPrice('');
      setSellingPrice('');
    }
    setIsSaving(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span>💰</span> နေ့စဉ် အရောင်းစာရင်း သွင်းရန်
      </h2>

      <div className="mb-6 flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm w-max">
        <label className="font-semibold text-gray-600">ရက်စွဲ ရွေးရန် :</label>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 font-bold text-blue-600"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-blue-600">
        <form onSubmit={handleAddSale} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-600 mb-1">ပစ္စည်းအမည်</label>
            <input type="text" required value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500" placeholder="ဥပမာ - Mouse" />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-600 mb-1">ဝယ်ရင်းဈေး (Ks)</label>
            <input type="number" min="0" required value={buyingPrice} onChange={(e) => setBuyingPrice(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500" placeholder="0" />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-600 mb-1">ရောင်းဈေး (Ks)</label>
            <input type="number" min="0" required value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500" placeholder="0" />
          </div>

          <div className="md:col-span-1 mt-2">
            <button type="submit" disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded shadow transition disabled:opacity-50">
              {isSaving ? 'သိမ်းဆည်းနေသည်...' : '+ ရောင်းမည်'}
            </button>
          </div>

        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-bold text-gray-700">ယနေ့ ရောင်းရသော စာရင်း ({sales.length} မှု)</h3>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-gray-500 font-semibold animate-pulse">ဒေတာများ ဆွဲယူနေပါသည်...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider">
                  <th className="p-4 border-b font-bold text-center w-12">စဉ်</th>
                  <th className="p-4 border-b font-bold">ပစ္စည်းအမည်</th>
                  <th className="p-4 border-b font-bold text-right">ဝယ်ရင်းဈေး</th>
                  <th className="p-4 border-b font-bold text-right">ရောင်းရငွေ</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-500">ယနေ့အတွက် အရောင်းစာရင်း မရှိသေးပါ။</td></tr>
                ) : (
                  sales.map((sale, index) => (
                    <tr key={sale.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-center text-sm font-bold text-gray-500">{index + 1}</td>
                      <td className="p-4 text-sm font-semibold text-gray-800">{sale.item_name}</td>
                      <td className="p-4 text-right text-sm text-gray-600">{Number(sale.buying_price).toLocaleString()} Ks</td>
                      <td className="p-4 text-right text-sm font-bold text-blue-600">{Number(sale.selling_price).toLocaleString()} Ks</td>
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

export default DailySaleTracker;