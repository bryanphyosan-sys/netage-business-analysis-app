import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const DailySaleTracker = () => {
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]); // Inventory ဒေတာများ သိမ်းရန်
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedItemId, setSelectedItemId] = useState(''); // ရွေးချယ်ထားသော ပစ္စည်း ID
  const [sellQty, setSellQty] = useState(1);

  // ရွေးချယ်ထားသော ပစ္စည်း၏ အချက်အလက်များကို ရှာဖွေခြင်း
  const selectedItem = inventory.find(item => item.id === selectedItemId);

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    setLoading(true);
    
    // ၁။ ဒီနေ့ အရောင်းစာရင်းများကို ဆွဲယူခြင်း
    const { data: salesData } = await supabase
      .from('daily_sales')
      .select('*')
      .eq('date', date)
      .order('created_at', { ascending: false });
    
    // ၂။ Inventory မှ လက်ကျန်ရှိသော ပစ္စည်းများကိုသာ ဆွဲယူခြင်း
    const { data: invData } = await supabase
      .from('inventory')
      .select('*')
      .filter('stock_qty', 'gt', 0) // အရေအတွက် 0 ထက်ကြီးမှသာ ပြမည်
      .order('item_name', { ascending: true });

    setSales(salesData || []);
    setInventory(invData || []);
    setLoading(false);
  };

  const handleAddSale = async (e) => {
    e.preventDefault();
    if (!selectedItem) {
      alert("ကျေးဇူးပြု၍ ရောင်းချမည့် ပစ္စည်းကို ရွေးချယ်ပါ။");
      return;
    }
    
    if (sellQty > selectedItem.stock_qty) {
      alert(`ပစ္စည်းလက်ကျန် မလောက်ပါ။ လက်ရှိလက်ကျန်: ${selectedItem.stock_qty} ခု`);
      return;
    }

    setIsSaving(true);

    // ၁။ အရောင်းစာရင်းထဲသို့ ထည့်ခြင်း (အရေအတွက်အလိုက် ဈေးနှုန်းမြှောက်ပါမည်)
    const newSale = {
      date: date,
      item_name: selectedItem.item_name,
      buying_price: Number(selectedItem.buying_price) * sellQty,
      selling_price: Number(selectedItem.selling_price) * sellQty
    };

    const { data: insertedSale, error: saleError } = await supabase
      .from('daily_sales')
      .insert([newSale])
      .select();

    if (saleError) {
      alert('အရောင်းစာရင်း သွင်းရာတွင် အမှားဖြစ်နေပါသည်။');
      setIsSaving(false);
      return;
    }

    // ၂။ Inventory ထဲမှ အရေအတွက်ကို အလိုအလျောက် နှုတ်ခြင်း (Auto-Deduct)
    const newStockQty = selectedItem.stock_qty - sellQty;
    const { error: invError } = await supabase
      .from('inventory')
      .update({ stock_qty: newStockQty, last_updated: new Date() })
      .eq('id', selectedItemId);

    if (!invError) {
      // စခရင်ပေါ်ရှိ ဒေတာများကို ချက်ချင်း အသစ်ပြန်ပြောင်းပေးခြင်း
      setSales([insertedSale[0], ...sales]);
      setInventory(inventory.map(item => item.id === selectedItemId ? { ...item, stock_qty: newStockQty } : item));
      setSelectedItemId('');
      setSellQty(1);
    }

    setIsSaving(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span>💰</span> နေ့စဉ် အရောင်းစာရင်း သွင်းရန်
      </h2>

      {/* Date Picker */}
      <div className="mb-6 flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm w-max">
        <label className="font-semibold text-gray-600">ရက်စွဲ ရွေးရန် :</label>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 font-bold text-blue-600"
        />
      </div>

      {/* အရောင်းစာရင်းသွင်းရန် Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-blue-600">
        <form onSubmit={handleAddSale} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-600 mb-1">ပစ္စည်း ရွေးချယ်ပါ</label>
            <select 
              required 
              value={selectedItemId} 
              onChange={(e) => setSelectedItemId(e.target.value)} 
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="" disabled>-- ပစ္စည်း ရွေးပါ --</option>
              {inventory.map(item => (
                <option key={item.id} value={item.id}>
                  {item.item_name} (လက်ကျန်: {item.stock_qty})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-600 mb-1">အရေအတွက်</label>
            <input 
              type="number" 
              min="1" 
              required 
              value={sellQty} 
              onChange={(e) => setSellQty(Number(e.target.value))} 
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500" 
            />
          </div>

          <div className="md:col-span-1 mt-2">
            <button type="submit" disabled={isSaving || !selectedItemId} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded shadow transition disabled:opacity-50">
              {isSaving ? 'သိမ်းဆည်းနေသည်...' : '+ ရောင်းမည်'}
            </button>
          </div>

        </form>

        {/* ရွေးချယ်ထားသော ပစ္စည်း၏ ဈေးနှုန်းကို ကြိုတင်ပြသခြင်း */}
        {selectedItem && (
          <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800 font-medium flex gap-6">
            <p>ရောင်းဈေး (၁) ခု: <span className="font-bold">{Number(selectedItem.selling_price).toLocaleString()} Ks</span></p>
            <p>စုစုပေါင်း ဝင်ငွေ: <span className="font-bold">{(Number(selectedItem.selling_price) * sellQty).toLocaleString()} Ks</span></p>
          </div>
        )}
      </div>

      {/* ယနေ့ အရောင်းစာရင်း Table */}
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
                  <th className="p-4 border-b font-bold text-right">ရောင်းရငွေစုစုပေါင်း</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr><td colSpan="3" className="p-8 text-center text-gray-500">ယနေ့အတွက် အရောင်းစာရင်း မရှိသေးပါ။</td></tr>
                ) : (
                  sales.map((sale, index) => (
                    <tr key={sale.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-center text-sm font-bold text-gray-500">{index + 1}</td>
                      <td className="p-4 text-sm font-semibold text-gray-800">{sale.item_name}</td>
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