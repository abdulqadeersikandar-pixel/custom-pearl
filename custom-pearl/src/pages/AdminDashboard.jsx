import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import WhatsAppStatusCard from '../components/WhatsAppStatusCard';
const INACTIVITY_MS = 2 * 60 * 1000;
const TABS = ['All Orders', 'Manage Products', 'Settings', 'WhatsApp Bot'];
const Banner = ({ type, msg }) => {
  if (!msg) return null;
  const s = {
    error:   'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    success: 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    info:    'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return <div className={`border rounded-lg px-4 py-3 text-sm font-medium mb-4 ${s[type]||s.info}`}>{msg}</div>;
};

const AdminDashboard = () => {
  const navigate   = useNavigate();
  const timerRef   = useRef(null);

  // ── Inactivity auto-logout ─────────────────────────────────────────────────
  const resetTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      await signOut(auth);
      navigate('/login', { state: { message: 'You were logged out due to inactivity.' } });
    }, INACTIVITY_MS);
  }, [navigate]);

  useEffect(() => {
    const events = ['mousemove','mousedown','keydown','touchstart','scroll','click'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();
    return () => { events.forEach(e => window.removeEventListener(e, resetTimer)); clearTimeout(timerRef.current); };
  }, [resetTimer]);

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]           = useState('All Orders');
  const [customOrders, setCustomOrders]     = useState([]);
  const [checkoutOrders, setCheckoutOrders] = useState([]);
  const [products, setProducts]             = useState([]);
  const [paySettings, setPaySettings]       = useState([]);
  const [loading, setLoading]               = useState(true);

  // Orders
  const [orderFilter, setOrderFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');

  // Product form
  const [showForm, setShowForm] = useState(false);
  const [editId,  setEditId]   = useState(null);
  const [pName,  setPName]     = useState('');
  const [pPrice, setPPrice]    = useState('');
  const [pDesc,  setPDesc]     = useState('');
  const [pCat,   setPCat]      = useState('Pearls');
  const [pImg,   setPImg]      = useState(null);
  const [pSaving,setPSaving]   = useState(false);

  // Password
  const [oldPw,  setOldPw]    = useState('');
  const [newPw,  setNewPw]    = useState('');
  const [confPw, setConfPw]   = useState('');
  const [pwBanner, setPwBanner] = useState({ type:'', msg:'' });

  // Payment settings
  const [payEdits,  setPayEdits]  = useState({});
  const [payBanner, setPayBanner] = useState({ type:'', msg:'' });

  // Business info (localStorage)
  const [bizInfo, setBizInfo]     = useState({ email:'', phone:'', whatsapp:'', insta:'', facebook:'', address:'' });
  const [bizBanner, setBizBanner] = useState({ type:'', msg:'' });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [c, ch, p, pay] = await Promise.all([
        axios.get('http://localhost:5000/api/custom-orders'),
        axios.get('http://localhost:5000/api/checkout-orders'),
        axios.get('http://localhost:5000/api/products'),
        axios.get('http://localhost:5000/api/payment-settings'),
      ]);
      setCustomOrders(c.data);
      setCheckoutOrders(ch.data);
      setProducts(p.data);
      setPaySettings(pay.data);
      const edits = {};
      pay.data.forEach(pm => {
        edits[pm.MethodKey] = {
          accountTitle:  pm.AccountTitle  || '',
          accountNumber: pm.AccountNumber || '',
          bankName:      pm.BankName      || '',
          isActive:      pm.IsActive,
        };
      });
      setPayEdits(edits);
    } catch (err) { console.error('Fetch error:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAll();
    const saved = localStorage.getItem('cpBizInfo');
    if (saved) setBizInfo(JSON.parse(saved));
  }, []);

  const handleLogout = async () => { await signOut(auth); navigate('/login'); };

  // ── Orders Status Logic ────────────────────────────────────────────────────
  const handleStatusChange = async (id, type, newStatus) => {
    try {
      const endpoint = type === 'Custom'
        ? `http://localhost:5000/api/custom-orders/${id}/status`
        : `http://localhost:5000/api/checkout-orders/${id}/status`;

      await axios.put(endpoint, { status: newStatus });
      fetchAll(); // Refresh data to show new status
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update order status.");
    }
  };

  const getStatusOptions = (type) => {
    if (type === 'Custom') {
      return ['Pending', 'Pending Quotation', 'Quotation Sent', 'Confirmed', 'In Production', 'Ready', 'Shipped', 'Delivered', 'Cancelled'];
    }
    return ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  };

  // ── Orders Rendering ───────────────────────────────────────────────────────
  const allOrders = [
    ...customOrders.map(o  => ({ ...o, _type:'Custom'   })),
    ...checkoutOrders.map(o => ({ ...o, _type:'Checkout' })),
  ].sort((a,b) => new Date(b.OrderDate||0) - new Date(a.OrderDate||0));

  const filteredOrders = allOrders.filter(o => {
    const matchType   = orderFilter==='All' || o._type===orderFilter;
    const q           = orderSearch.toLowerCase();
    const matchSearch = !q || [o.CustomerName,o.CustomerPhone,o.TrackingId,o.OrderChannel]
      .some(v => (v||'').toLowerCase().includes(q));
    return matchType && matchSearch;
  });

  const fmtDate = d => d ? new Date(d).toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';

  const channelBadge = ch => {
    const m = { WhatsApp:'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', Instagram:'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', Website:'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
    const ic = { WhatsApp:'💬', Instagram:'📸', Website:'🌐' };
    return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m[ch]||'bg-gray-100 text-gray-600'}`}>{ic[ch]||'📦'} {ch||'Website'}</span>;
  };

  // ── Excel Export Logic ────────────────────────────────────────────────────
  const handleExportExcel = () => {
    const headers = ['Order Date', 'Type', 'Tracking ID', 'Customer Name', 'Phone', 'Status', 'Total Amount', 'Payment Method'];

    const csvData = filteredOrders.map(order => {
      const date = order.OrderDate ? new Date(order.OrderDate).toLocaleDateString('en-GB') : '-';
      const amount = order.TotalAmount || order.EstimatedPrice || 0;
      const payment = order.PaymentMethod === 'cod' ? 'Cash on Delivery' : order.PaymentMethod || '-';
      
      return [
        date,
        order._type,
        order.TrackingId || '-',
        `"${order.CustomerName}"`, 
        `"${order.CustomerPhone}"`,
        order.OrderStatus || 'Pending',
        amount,
        payment
      ].join(',');
    });

    const csvString = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'Orders_Report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Products ───────────────────────────────────────────────────────────────
  const resetForm = () => { setPName('');setPPrice('');setPDesc('');setPCat('Pearls');setPImg(null);setEditId(null);setShowForm(false); };

  const handleProductSave = async (e) => {
    e.preventDefault();
    if (!pName||!pPrice) return;
    setPSaving(true);
    const fd = new FormData();
    fd.append('name',pName); fd.append('price',pPrice); fd.append('description',pDesc); fd.append('category',pCat);
    if (pImg) fd.append('image',pImg);
    try {
      if (editId) await axios.put(`http://localhost:5000/api/products/${editId}`,fd,{headers:{'Content-Type':'multipart/form-data'}});
      else        await axios.post('http://localhost:5000/api/products',fd,{headers:{'Content-Type':'multipart/form-data'}});
      resetForm(); fetchAll();
    } catch { alert('Failed to save product.'); }
    finally { setPSaving(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this product?')) return;
    await axios.delete(`http://localhost:5000/api/products/${id}`);
    fetchAll();
  };

  const startEdit = p => { setEditId(p.Id);setPName(p.Name);setPPrice(p.Price);setPDesc(p.Description||'');setPCat(p.Category||'Pearls');setShowForm(true); };
  const getImg = p => { if (p.Images?.length>0) { const i=p.Images[0]; return i.startsWith('http')?i:`http://localhost:5000${i}`; } return null; };

  // ── Password ───────────────────────────────────────────────────────────────
  const handleChangePassword = async e => {
    e.preventDefault(); setPwBanner({ type:'', msg:'' });
    if (!oldPw)         { setPwBanner({ type:'error', msg:'Please enter your current password.' }); return; }
    if (newPw.length<6) { setPwBanner({ type:'error', msg:'New password must be at least 6 characters.' }); return; }
    if (newPw!==confPw) { setPwBanner({ type:'error', msg:'New passwords do not match.' }); return; }
    try {
      const user = auth.currentUser;
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, oldPw));
      await updatePassword(user, newPw);
      setPwBanner({ type:'success', msg:'Password updated successfully!' });
      setOldPw(''); setNewPw(''); setConfPw('');
    } catch (err) {
      setPwBanner({ type:'error', msg: err.code==='auth/wrong-password'||err.code==='auth/invalid-credential'
        ? 'Current password is incorrect.' : 'Error updating password. Please try again.' });
    }
  };

  // ── Payment settings ───────────────────────────────────────────────────────
  const savePayMethod = async key => {
    setPayBanner({ type:'', msg:'' });
    try {
      await axios.put(`http://localhost:5000/api/payment-settings/${key}`, payEdits[key]);
      setPayBanner({ type:'success', msg:`${key} settings saved!` });
      setTimeout(() => setPayBanner({ type:'', msg:'' }), 3000);
    } catch { setPayBanner({ type:'error', msg:'Failed to save. Try again.' }); }
  };

  const updatePayEdit = (key, field, value) => setPayEdits(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  const PM_ICONS = { jazzcash:'📱', easypaisa:'💚', bank:'🏦' };

  // ── Business info ──────────────────────────────────────────────────────────
  const saveBizInfo = () => {
    localStorage.setItem('cpBizInfo', JSON.stringify(bizInfo));
    setBizBanner({ type:'success', msg:'Business information saved!' });
    setTimeout(() => setBizBanner({ type:'', msg:'' }), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Custom Pearl — Order Management</p>
          </div>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition">
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label:'Total Orders',    value:allOrders.length,      color:'text-blue-600'   },
            { label:'Custom Orders',   value:customOrders.length,   color:'text-pink-600'   },
            { label:'Checkout Orders', value:checkoutOrders.length, color:'text-purple-600' },
            { label:'Products',        value:products.length,       color:'text-green-600'  },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-200 dark:bg-gray-800 p-1 rounded-xl mb-6 w-fit flex-wrap">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${activeTab===tab?'bg-white dark:bg-gray-900 text-pink-600 shadow-sm':'text-gray-600 dark:text-gray-300'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ══ ALL ORDERS ══════════════════════════════════════════════════ */}
        {activeTab==='All Orders' && (
          <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-5 justify-between items-center">
              <div className="flex gap-3 w-full sm:w-auto flex-col sm:flex-row">
                <div className="flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                  {['All','Custom','Checkout'].map(f => (
                    <button key={f} onClick={() => setOrderFilter(f)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${orderFilter===f?'bg-pink-600 text-white':'text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                      {f}
                    </button>
                  ))}
                </div>
                {/* ⬇️ Naya Export Button Yahan Hai ⬇️ */}
                <button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2">
                  <span>📊</span> Export to Excel
                </button>
              </div>

              <div className="relative w-full sm:max-w-sm mt-3 sm:mt-0">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input type="text" placeholder="Search by name, phone or tracking ID…"
                  value={orderSearch} onChange={e => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400" />
              </div>
            </div>

            {loading ? (
              <p className="text-center text-gray-400 py-10">Loading orders…</p>
            ) : filteredOrders.length===0 ? (
              <p className="text-center text-gray-400 py-10">No orders found.</p>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order,idx) => (
                  <div key={`${order._type}-${order.Id}-${idx}`}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">

                    {/* Top row */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${order._type==='Custom'?'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400':'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                            {order._type==='Custom'?'✨ Custom':'🛒 Shop Order'}
                          </span>
                          {channelBadge(order.OrderChannel)}
                          {order.TrackingId && (
                            <span className="text-xs text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                              {order.TrackingId}
                            </span>
                          )}
                        </div>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">{order.CustomerName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{order.CustomerPhone}</p>
                      </div>
                      
                      {/* LIVE STATUS DROPDOWN ADDED HERE */}
                      <div className="text-right text-xs text-gray-400">
                        <p>{fmtDate(order.OrderDate)}</p>
                        <select 
                          value={order.OrderStatus || 'Pending'} 
                          onChange={(e) => handleStatusChange(order.Id, order._type, e.target.value)}
                          className="mt-2 px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white font-medium text-xs focus:outline-none focus:ring-1 focus:ring-pink-500 cursor-pointer"
                        >
                          {getStatusOptions(order._type).map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                    </div>

                    {/* Custom details */}
                    {order._type==='Custom' && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        {[
                          { l:'Category',   v:order.SelectedCategory },
                          { l:'Bag Type',   v:order.BagType },
                          { l:'Size',       v:order.BagSize },
                          { l:'Colour',     v:order.PearlColor },
                          { l:'Dimensions', v:order.Dimensions },
                        ].filter(f=>f.v).map(f => (
                          <div key={f.l} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                            <p className="text-xs text-gray-400">{f.l}</p>
                            <p className="font-semibold text-gray-800 dark:text-white truncate">{f.v}</p>
                          </div>
                        ))}
                        {order.OrderDescription && (
                          <div className="col-span-2 sm:col-span-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                            <p className="text-xs text-gray-400">Description</p>
                            <p className="text-sm text-gray-700 dark:text-gray-200">{order.OrderDescription}</p>
                          </div>
                        )}
                        {order.InspirationImage && (
                          <div className="col-span-2 sm:col-span-4">
                            <p className="text-xs text-gray-400 mb-1">Inspiration Image</p>
                            <img
                              src={order.InspirationImage.startsWith('http')?order.InspirationImage:`http://localhost:5000${order.InspirationImage}`}
                              alt="Inspiration" className="h-24 w-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Checkout details */}
                    {order._type==='Checkout' && (
                      <div className="mt-1 space-y-2">
                        {order.ShippingAddress && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Address: </span>{order.ShippingAddress}
                          </p>
                        )}
                        {order.PaymentMethod && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Payment: </span>
                            {{'cod':'💵 Cash on Delivery','jazzcash':'📱 JazzCash','easypaisa':'💚 EasyPaisa','bank':'🏦 Bank Transfer'}[order.PaymentMethod]||order.PaymentMethod}
                            {order.TransactionId && <span className="text-gray-400 ml-2 text-xs">TXN: {order.TransactionId}</span>}
                          </p>
                        )}
                        {order.CartItems?.length>0 && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1 font-medium">Items</p>
                            <div className="space-y-1">
                              {order.CartItems.map((item,i) => (
                                <div key={i} className="flex justify-between text-sm bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-1.5">
                                  <span className="text-gray-700 dark:text-gray-200">{item.Name} × {item.qty}</span>
                                  <span className="font-semibold text-pink-600">{item.Price>0?`Rs. ${(Number(item.Price)*item.qty).toLocaleString()}`:'TBD'}</span>
                                </div>
                              ))}
                            </div>
                            {order.TotalAmount>0 && (
                              <div className="flex justify-between font-bold text-sm border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
                                <span className="text-gray-700 dark:text-gray-200">Total</span>
                                <span className="text-pink-600">Rs. {Number(order.TotalAmount).toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ MANAGE PRODUCTS ════════════════════════════════════════════ */}
        {activeTab==='Manage Products' && (
          <div>
            {!showForm ? (
              <>
                <button onClick={() => setShowForm(true)}
                  className="mb-5 bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition">
                  + Add New Product
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map(p => {
                    const imgSrc = getImg(p);
                    return (
                      <div key={p.Id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                        <div className="h-40 bg-pink-50 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                          {imgSrc ? <img src={imgSrc} alt={p.Name} className="w-full h-full object-cover" onError={e=>{e.target.style.display='none';}} /> : <span className="text-4xl">👜</span>}
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-gray-800 dark:text-white">{p.Name}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.Category==='Crochet'?'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400':'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'}`}>
                              {p.Category}
                            </span>
                          </div>
                          {p.Description && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{p.Description}</p>}
                          <p className="text-pink-600 font-bold mb-3">Rs. {p.Price}</p>
                          <div className="flex gap-2">
                            <button onClick={()=>startEdit(p)} className="flex-1 py-1.5 text-sm border border-blue-300 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium transition">Edit</button>
                            <button onClick={()=>handleDelete(p.Id)} className="flex-1 py-1.5 text-sm border border-red-300 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition">Delete</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 dark:text-white mb-4">{editId?'Edit Product':'Add New Product'}</h3>
                <form onSubmit={handleProductSave} className="space-y-3">
                  <input type="text" placeholder="Product name" value={pName} onChange={e=>setPName(e.target.value)} required className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400" />
                  <input type="number" placeholder="Price (Rs.)" value={pPrice} onChange={e=>setPPrice(e.target.value)} required className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400" />
                  <textarea placeholder="Description (optional)" value={pDesc} onChange={e=>setPDesc(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 h-20" />
                  <select value={pCat} onChange={e=>setPCat(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400">
                    <option value="Pearls">Pearls</option>
                    <option value="Crochet">Crochet</option>
                  </select>
                  <div>
                    <input type="file" accept="image/*" onChange={e=>setPImg(e.target.files[0])} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white" />
                    {editId && <p className="text-xs text-gray-400 mt-1">Leave empty to keep existing image.</p>}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={pSaving} className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-50">
                      {pSaving?'Saving…':'Save Product'}
                    </button>
                    <button type="button" onClick={resetForm} className="flex-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-300 transition">Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ══ SETTINGS ════════════════════════════════════════════════════ */}
        {activeTab==='Settings' && (
          <div className="space-y-6 max-w-2xl">

            {/* Business Info */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 dark:text-white mb-1">🏪 Business Information</h3>
              <p className="text-xs text-gray-400 mb-4">Update your contact details shown on the website and order messages.</p>
              <Banner type={bizBanner.type} msg={bizBanner.msg} />
              <div className="space-y-3">
                {[
                  { key:'email',    label:'Email Address',    icon:'📧', ph:'info@custompearl.com'            },
                  { key:'phone',    label:'Contact Phone',    icon:'📞', ph:'03001234567'                     },
                  { key:'whatsapp', label:'WhatsApp Number',  icon:'💬', ph:'923001234567 (with country code)' },
                  { key:'insta',    label:'Instagram Handle', icon:'📸', ph:'custompearl'                     },
                  { key:'facebook', label:'Facebook Page',    icon:'👤', ph:'custompearl'                     },
                  { key:'address',  label:'Shop Address',     icon:'📍', ph:'Street, City, Pakistan'          },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{f.icon} {f.label}</label>
                    <input type="text" value={bizInfo[f.key]} onChange={e => setBizInfo(prev=>({...prev,[f.key]:e.target.value}))}
                      placeholder={f.ph}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400" />
                  </div>
                ))}
                <button onClick={saveBizInfo}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-lg font-bold text-sm transition mt-2">
                  Save Business Info
                </button>
              </div>
            </div>

            {/* Payment Settings */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 dark:text-white mb-1">💳 Payment Method Settings</h3>
              <p className="text-xs text-gray-400 mb-4">Update account numbers shown to customers during checkout.</p>
              <Banner type={payBanner.type} msg={payBanner.msg} />
              <div className="space-y-5">
                {paySettings.map(pm => (
                  <div key={pm.MethodKey} className="border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800 dark:text-white text-sm">
                        {PM_ICONS[pm.MethodKey]||'💳'} {pm.MethodLabel}
                      </h4>
                      {/* Toggle */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Active</span>
                        <div className="relative" onClick={() => updatePayEdit(pm.MethodKey,'isActive', payEdits[pm.MethodKey]?.isActive ? 0 : 1)}>
                          <div className={`w-9 h-5 rounded-full transition-colors ${payEdits[pm.MethodKey]?.isActive?'bg-pink-600':'bg-gray-300 dark:bg-gray-600'}`} />
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${payEdits[pm.MethodKey]?.isActive?'translate-x-4':''}`} />
                        </div>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Account Title</label>
                        <input type="text" value={payEdits[pm.MethodKey]?.accountTitle||''}
                          onChange={e => updatePayEdit(pm.MethodKey,'accountTitle',e.target.value)}
                          placeholder="e.g. Custom Pearl"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                          {pm.MethodKey==='bank'?'IBAN / Account Number':'Mobile Number'}
                        </label>
                        <input type="text" value={payEdits[pm.MethodKey]?.accountNumber||''}
                          onChange={e => updatePayEdit(pm.MethodKey,'accountNumber',e.target.value)}
                          placeholder={pm.MethodKey==='bank'?'PK00XXXX…':'03XXXXXXXXX'}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400" />
                      </div>
                      {pm.MethodKey==='bank' && (
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Bank Name</label>
                          <input type="text" value={payEdits[pm.MethodKey]?.bankName||''}
                            onChange={e => updatePayEdit(pm.MethodKey,'bankName',e.target.value)}
                            placeholder="e.g. HBL, Meezan, UBL"
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400" />
                        </div>
                      )}
                      <button onClick={() => savePayMethod(pm.MethodKey)}
                        className="w-full bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-semibold transition mt-1">
                        Save {pm.MethodLabel}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Password */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 dark:text-white mb-1">🔑 Change Password</h3>
              <p className="text-xs text-gray-400 mb-4">You must enter your current password to set a new one.</p>
              <Banner type={pwBanner.type} msg={pwBanner.msg} />
              <form onSubmit={handleChangePassword} className="space-y-3">
                {[
                  { val:oldPw,  set:setOldPw,  label:'Current Password',    ph:'Enter your current password' },
                  { val:newPw,  set:setNewPw,  label:'New Password',         ph:'Minimum 6 characters'       },
                  { val:confPw, set:setConfPw, label:'Confirm New Password', ph:'Re-enter new password'       },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{f.label} <span className="text-pink-500">*</span></label>
                    <input type="password" value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph} required
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400" />
                  </div>
                ))}
                <button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-lg font-bold text-sm transition mt-1">
                  Update Password
                </button>
              </form>
            </div>

            {/* Session */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 dark:text-white mb-1">⏱ Session</h3>
              <p className="text-xs text-gray-400 mb-4">You are automatically logged out after 2 minutes of inactivity.</p>
              <button onClick={handleLogout}
                className="w-full border border-red-300 text-red-600 dark:text-red-400 py-2.5 rounded-lg font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                Logout Now
              </button>
            </div>

          </div>
        )}
        {/* Yeh line wahan paste karein jahan baqi tabs ka content hai */}
{activeTab === 'WhatsApp Bot' && (
  <div className="flex justify-center p-4">
    <WhatsAppStatusCard />
  </div>
)}
      </div>
    </div>
  );
};

export default AdminDashboard;