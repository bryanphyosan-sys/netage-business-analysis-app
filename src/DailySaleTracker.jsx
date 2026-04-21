import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; 

const DailySaleTracker = () => {
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Filter အတွက် State (လအလိုက် ရွေးချယ်ရန်)
  const [filterMonth, setFilterMonth] = useState(''); // ဥပမာ - '2024-03'

  // Form အတွက် State များ
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Laptops');
  const [buyingPrice, setBuyingPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');

  // Component စတင်ပေါ်လာချိန်တွင် Database မှ Data များ လှမ်းယူခြင်း
  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('daily_sales')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Data ယူရာတွင် အမှားဖြစ်နေပါသည်:", error);
    } else {
      setSalesData(data || []);
    }
    setIsLoading(false);
  };

  // Database သို့ အချက်အလက် အသစ် သိမ်းဆည်းခြင်း
  const handleAddSale = async (e) => {
    e.preventDefault();
    if (!itemName || !buyingPrice || !sellingPrice) {
      alert('ကျေးဇူးပြု၍ အချက်အလက်များကို ပြည့်စုံစွာ ထည့်ပါ။');
      return;
    }

    setIsSaving(true);
    
    const profit = Number(sellingPrice) - Number(buyingPrice);

    const newSale = {
      date: date,
      item_name: itemName,
      category: category,
      buying_price: Number(buyingPrice),
      selling_price: Number(sellingPrice),
      profit: profit
    };

    const { data, error } = await supabase
      .from('daily_sales')
      .insert([newSale])
      .select();

    if (error) {
      console.error("Data သိမ်းရာတွင် အမှားဖြစ်နေပါသည်:", error);
      alert('စာရင်းသွင်းရာတွင် အမှားအယွင်းဖြစ်ပွားခဲ့ပါသည်။');
    } else {
      setSalesData([data[0], ...salesData]);
      setItemName('');
      setBuyingPrice('');
      setSellingPrice('');
      alert('စာရင်းသိမ်းဆည်းခြင်း အောင်မြင်ပါသည်။');
    }
    setIsSaving(false);
  };

  // Database မှ အချက်အလက် ဖျက်ခြင်း
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("ဒီစာရင်းကို တကယ်ဖျက်မှာ သေချာပြီလား?");
    if (confirmDelete) {
      const { error } = await supabase
        .from('daily_sales')
        .delete()
        .eq('id', id);

      if (error) {
        alert('ဖျက်ရာတွင် အမှားအယွင်းဖြစ်ပွားခဲ့ပါသည်။');
      } else {
        setSalesData(salesData.filter(sale => sale.id !== id));
      }
    }
  };

  // ရွေးချယ်ထားသော လအလိုက် Data များကို စစ်ထုတ်ခြင်း (Filtering)
  const displayedSales = filterMonth 
    ? salesData.filter(sale => sale.date.substring(0, 7) === filterMonth) 
    : salesData;

  // စစ်ထုတ်ထားသော Data များပေါ်မူတည်၍ စုစုပေါင်း တွက်ချက်မှုများ ပြုလုပ်ခြင်း
  const totalRevenue = displayedSales.reduce((sum, sale) => sum + Number(sale.selling_price), 0);
  const totalProfit = displayedSales.reduce((sum, sale) => sum + Number(sale.profit), 0);
  const totalItemsSold = displayedSales.length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span>💰</span> နေ့စဉ် အရောင်းမှတ်တမ်း
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500 transition-all duration-300">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">
            {filterMonth ? 'ရွေးချယ်ထားသောလ၏ ရောင်းရငွေ' : 'စုစုပေါင်း ရောင်းရငွေ'}
          </h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">{totalRevenue.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500 transition-all duration-300">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">
            {filterMonth ? 'ရွေးချယ်ထားသောလ၏ အမြတ်ငွေ' : 'စုစုပေါင်း အမြတ်ငွေ'}
          </h3>
          <p className="text-2xl font-bold text-green-600 mt-2">{totalProfit.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-gray-600 transition-all duration-300">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">
            {filterMonth ? 'ရောင်းရသည့် အရေအတွက် (လအလိုက်)' : 'ရောင်းရသည့် အရေအတွက်'}
          </h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">{totalItemsSold} ခု</p>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-gray-800">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">အရောင်းစာရင်း အသစ်ထည့်ရန်</h3>
        <form onSubmit={handleAddSale} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-600 mb-1">ရက်စွဲ</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-600 mb-1">ပစ္စည်းအမည်</label>
            <input type="text" required placeholder="ဥပမာ - Dell Latitude 7490" value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500" />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-600 mb-1">အမျိုးအစား</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 bg-white">
              <option value="Laptops">Laptops</option>
              <option value="Desktops">Desktops</option>
              <option value="Accessories">Accessories</option>
              <option value="Components">Components</option>
              <option value="Services">Services</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-600 mb-1">ဝယ်ရင်းဈေး (Ks)</label>
            <input type="number" min="0" required placeholder="0" value={buyingPrice} onChange={(e) => setBuyingPrice(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500" />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-600 mb-1">ရောင်းဈေး (Ks)</label>
            <input type="number" min="0" required placeholder="0" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500" />
          </div>

          <div className="md:col-span-6 mt-2">
            <button type="submit" disabled={isSaving} className="w-full md:w-auto bg-gray-800 hover:bg-black text-white font-bold py-2.5 px-8 rounded shadow transition disabled:opacity-50">
              {isSaving ? 'သိမ်းဆည်းနေသည်...' : '+ စာရင်းသွင်းမည်'}
            </button>
          </div>
        </form>
      </div>

      {/* Filter Section & Data Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        
        {/* Month Filter UI */}
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-700 mb-3 sm:mb-0">အရောင်းမှတ်တမ်းများ</h3>
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-600 whitespace-nowrap">လအလိုက်ကြည့်ရန်:</label>
            <input 
              type="month" 
              value={filterMonth} 
              onChange={(e) => setFilterMonth(e.target.value)} 
              className="border border-gray-300 p-1.5 rounded focus:outline-none focus:border-blue-500 text-sm cursor-pointer"
            />
            {filterMonth && (
              <button 
                onClick={() => setFilterMonth('')} 
                className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-3 py-2 rounded transition whitespace-nowrap"
              >
                ✖ အားလုံးပြပါ
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-10 text-center text-gray-500 font-semibold animate-pulse">
              Database မှ အချက်အလက်များကို ဆွဲယူနေပါသည်...
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider">
                  <th className="p-4 border-b font-bold">ရက်စွဲ</th>
                  <th className="p-4 border-b font-bold">ပစ္စည်းအမည်</th>
                  <th className="p-4 border-b font-bold">အမျိုးအစား</th>
                  <th className="p-4 border-b font-bold text-right">ဝယ်ရင်းဈေး</th>
                  <th className="p-4 border-b font-bold text-right">ရောင်းဈေး</th>
                  <th className="p-4 border-b font-bold text-right">အမြတ်ငွေ</th>
                  <th className="p-4 border-b font-bold text-center">လုပ်ဆောင်ချက်</th>
                </tr>
              </thead>
              <tbody>
                {displayedSales.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500 bg-gray-50">
                      {filterMonth ? 'ရွေးချယ်ထားသော လအတွက် အရောင်းမှတ်တမ်း မရှိသေးပါ။' : 'လက်ရှိတွင် အရောင်းမှတ်တမ်း မရှိသေးပါ။ အထက်ပါ ဖောင်တွင် စတင်ရေးသွင်းပါ။'}
                    </td>
                  </tr>
                ) : (
                  displayedSales.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-4 text-sm text-gray-600">{row.date}</td>
                      <td className="p-4 text-sm font-semibold text-gray-800">{row.item_name}</td>
                      <td className="p-4 text-sm">
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">{row.category}</span>
                      </td>
                      <td className="p-4 text-right text-sm text-gray-500">{Number(row.buying_price).toLocaleString()}</td>
                      <td className="p-4 text-right text-sm font-semibold text-blue-600">{Number(row.selling_price).toLocaleString()}</td>
                      <td className="p-4 text-right text-sm font-bold text-green-600">{Number(row.profit).toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition text-xs font-semibold">
                          ဖျက်မည်
                        </button>
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

export default DailySaleTracker;