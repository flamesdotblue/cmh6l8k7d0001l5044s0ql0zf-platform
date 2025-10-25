import React, { useMemo, useState } from 'react';
import HeaderNav from './components/HeaderNav.jsx';
import HeroSplineCover from './components/HeroSplineCover.jsx';
import DashboardCards from './components/DashboardCards.jsx';
import OrdersTable from './components/OrdersTable.jsx';

function generateAWB(next = 1) {
  return `FP${String(100000 + next)}`;
}

function fakeRates(weightKg = 1) {
  const base = Math.max(1, weightKg);
  return [
    { code: 'ECON', name: 'Fast Parcel Economy', eta: '4-6 days', desc: 'Best value, consolidated line-hauls', price: 59 * base },
    { code: 'STND', name: 'Fast Parcel Standard', eta: '2-4 days', desc: 'Balanced speed and value', price: 89 * base },
    { code: 'PRIO', name: 'Fast Parcel Priority', eta: '1-2 days', desc: 'Fastest delivery, priority handling', price: 129 * base },
  ];
}

function seedOrders() {
  return [
    { id: 1, awb: 'FP100001', service: 'Fast Parcel Priority', status: 'Delivered', cost: 129, to: 'Mumbai, IN', from: 'Bengaluru, IN', createdAt: '2025-10-01', labelUrl: '#'},
    { id: 2, awb: 'FP100002', service: 'Fast Parcel Standard', status: 'In Transit', cost: 89, to: 'Delhi, IN', from: 'Bengaluru, IN', createdAt: '2025-10-03', labelUrl: '#'},
    { id: 3, awb: 'FP100003', service: 'Fast Parcel Economy', status: 'Booked', cost: 59, to: 'Pune, IN', from: 'Bengaluru, IN', createdAt: '2025-10-05', labelUrl: '#'},
  ];
}

export default function App() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState({ email: '', name: 'Fast Parcel User' });
  const [wallet, setWallet] = useState(1000);
  const [orders, setOrders] = useState([]);
  const [nextId, setNextId] = useState(4);

  const [trackOrder, setTrackOrder] = useState(null);

  const [showNewShipment, setShowNewShipment] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    sender: { name: '', phone: '', address: '' },
    receiver: { name: '', phone: '', address: '' },
    pkg: { weight: 1, length: 10, width: 10, height: 10, contents: '', value: 100 },
    pickup: { date: '', slot: '10:00-13:00' },
    service: null,
  });

  const [kyc, setKyc] = useState({ status: 'Not Submitted', businessName: '', regNum: '', address: '', files: {}, termsAcceptedAt: null });

  const invoices = useMemo(() => ([
    { id: 'INV-2025-001', period: 'Oct 2025', url: '#' },
    { id: 'INV-2025-002', period: 'Sep 2025', url: '#' },
  ]), []);

  function handleLogin(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    if (email && password) {
      setIsAuthed(true);
      setUser({ ...user, email });
      setOrders(seedOrders());
      setWallet(1000);
      setCurrentView('dashboard');
    }
  }

  function logout() {
    setIsAuthed(false);
    setUser({ email: '', name: 'Fast Parcel User' });
    setOrders([]);
    setWallet(0);
    setCurrentView('dashboard');
  }

  function onCancelOrder(awb) {
    setOrders(prev => prev.map(o => o.awb === awb ? { ...o, status: 'Cancelled' } : o));
  }

  function onTrack(awb) {
    const o = orders.find(x => x.awb === awb);
    setTrackOrder(o || null);
  }

  function onViewLabel(awb) {
    alert(`Open label for ${awb}. In production, this would download from R2.`);
  }

  function resetShipmentForm() {
    setStep(1);
    setForm({
      sender: { name: '', phone: '', address: '' },
      receiver: { name: '', phone: '', address: '' },
      pkg: { weight: 1, length: 10, width: 10, height: 10, contents: '', value: 100 },
      pickup: { date: '', slot: '10:00-13:00' },
      service: null,
    });
  }

  function shipNow() {
    if (!form.service) return;
    const price = form.service.price;
    if (wallet < price) {
      alert('Insufficient wallet balance');
      return;
    }
    const newAwb = generateAWB(100000 + nextId);
    const newOrder = {
      id: nextId,
      awb: newAwb,
      service: form.service.name,
      status: 'Booked',
      cost: price,
      to: form.receiver.address || 'Destination',
      from: form.sender.address || 'Origin',
      createdAt: new Date().toISOString().slice(0,10),
      labelUrl: '#',
    };
    setOrders(prev => [newOrder, ...prev]);
    setWallet(w => w - price);
    setNextId(id => id + 1);
    setShowNewShipment(false);
    resetShipmentForm();
    alert(`Shipment Created. AWB: ${newAwb}`);
  }

  function downloadCSV() {
    const rows = [
      ['AWB','Service','Status','Cost','From','To','Date'],
      ...orders.map(o => [o.awb,o.service,o.status,o.cost,o.from,o.to,o.createdAt])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Shipping Summary.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const totals = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter(o => o.status === 'Delivered').length;
    const inTransit = orders.filter(o => o.status === 'In Transit').length;
    return { total, delivered, inTransit };
  }, [orders]);

  if (!isAuthed) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white text-slate-900">
        <div className="h-[40vh] w-full">
          <HeroSplineCover />
        </div>
        <div className="max-w-5xl mx-auto -mt-24 relative z-10 px-4">
          <div className="bg-white/80 backdrop-blur shadow-xl rounded-2xl p-8 border border-slate-100">
            <h1 className="text-3xl font-semibold tracking-tight">Fast Parcel</h1>
            <p className="text-slate-600 mt-1">Cloud-native shipping and logistics platform</p>
            <form onSubmit={handleLogin} className="grid grid-cols-1 gap-4 mt-6">
              <input name="email" type="email" placeholder="Email" className="h-11 px-4 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              <input name="password" type="password" placeholder="Password" className="h-11 px-4 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              <div className="flex items-center justify-between text-sm">
                <button type="button" className="text-blue-600 hover:underline">Create account</button>
                <button type="button" className="text-slate-600 hover:underline">Forgot password?</button>
              </div>
              <button className="h-11 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition">Sign in</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <HeaderNav currentView={currentView} onNavigate={setCurrentView} wallet={wallet} onNewBooking={() => { setShowNewShipment(true); }} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentView === 'dashboard' && (
          <>
            <DashboardCards total={totals.total} delivered={totals.delivered} inTransit={totals.inTransit} wallet={wallet} />
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Shipments</h3>
                <button onClick={() => setCurrentView('orders')} className="text-blue-600 hover:underline text-sm">View all</button>
              </div>
              <OrdersTable orders={orders.slice(0,5)} onTrack={onTrack} onCancel={onCancelOrder} onViewLabel={onViewLabel} />
            </div>
          </>
        )}

        {currentView === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Shipments</h2>
              <div className="flex gap-2">
                <input placeholder="Filter by destination" className="h-10 px-3 rounded-lg border border-slate-200" />
                <select className="h-10 px-3 rounded-lg border border-slate-200">
                  <option>All Status</option>
                  <option>Booked</option>
                  <option>Picked Up</option>
                  <option>In Transit</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <OrdersTable orders={orders} onTrack={onTrack} onCancel={onCancelOrder} onViewLabel={onViewLabel} />
            </div>
          </div>
        )}

        {currentView === 'wallet' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-semibold">Wallet</h2>
            <p className="text-slate-600 mt-1">Manage your shipping balance and transactions</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-slate-100 bg-slate-50">
                <div className="text-sm text-slate-600">Balance</div>
                <div className="text-3xl font-semibold mt-1">₹ {wallet.toFixed(2)}</div>
                <button disabled className="mt-4 h-10 px-4 rounded-lg bg-slate-200 text-slate-600">Top up (coming soon)</button>
              </div>
              <div className="md:col-span-2 p-4 rounded-lg border border-slate-100">
                <div className="text-sm font-medium mb-2">Transactions</div>
                <ul className="space-y-2 max-h-64 overflow-auto">
                  {orders.map(o => (
                    <li key={o.awb} className="flex items-center justify-between p-3 rounded-md bg-white border border-slate-100">
                      <div className="text-sm">Shipment {o.awb} • {o.service}</div>
                      <div className="text-sm font-medium text-rose-600">-₹ {o.cost.toFixed(2)}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {currentView === 'kyc' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-semibold">KYC & Business Verification</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={kyc.businessName} onChange={e => setKyc(k => ({...k, businessName: e.target.value}))} placeholder="Business name" className="h-11 px-3 rounded-lg border border-slate-200" />
              <input value={kyc.regNum} onChange={e => setKyc(k => ({...k, regNum: e.target.value}))} placeholder="Registration number" className="h-11 px-3 rounded-lg border border-slate-200" />
              <input value={kyc.address} onChange={e => setKyc(k => ({...k, address: e.target.value}))} placeholder="Registered address" className="md:col-span-2 h-11 px-3 rounded-lg border border-slate-200" />
              <div className="space-y-3 md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <label className="flex items-center gap-2 text-sm">GST <input type="file" onChange={e => setKyc(k => ({...k, files: {...k.files, gst: e.target.files?.[0]?.name}}))} /></label>
                  <label className="flex items-center gap-2 text-sm">PAN <input type="file" onChange={e => setKyc(k => ({...k, files: {...k.files, pan: e.target.files?.[0]?.name}}))} /></label>
                  <label className="flex items-center gap-2 text-sm">IEC <input type="file" onChange={e => setKyc(k => ({...k, files: {...k.files, iec: e.target.files?.[0]?.name}}))} /></label>
                  <label className="flex items-center gap-2 text-sm">Aadhaar <input type="file" onChange={e => setKyc(k => ({...k, files: {...k.files, aadhaar: e.target.files?.[0]?.name}}))} /></label>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!kyc.termsAcceptedAt} onChange={e => setKyc(k => ({...k, termsAcceptedAt: e.target.checked ? new Date().toISOString() : null}))} />
                  I accept the Terms. {kyc.termsAcceptedAt ? `(accepted at ${new Date(kyc.termsAcceptedAt).toLocaleString()})` : ''}
                </label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setKyc(k => ({...k, status: 'Pending'}))} className="h-10 px-4 rounded-lg bg-blue-600 text-white">Submit for Verification</button>
                  <button onClick={() => setKyc(k => ({...k, status: 'Verified'}))} className="h-10 px-4 rounded-lg border border-emerald-300 text-emerald-700 bg-emerald-50">Mark Verified (demo)</button>
                  <span className="text-sm text-slate-600">Status: <span className="font-medium">{kyc.status}</span></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'reports' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-semibold">Reports & Downloads</h2>
              <p className="text-slate-600 mt-1">Export order history and billing summaries</p>
              <div className="mt-4 flex items-center gap-3">
                <button onClick={downloadCSV} className="h-10 px-4 rounded-lg bg-blue-600 text-white">Download Shipping Summary.csv</button>
                <button className="h-10 px-4 rounded-lg border border-slate-200">Generate Billing Report</button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-semibold mb-3">Invoices</h3>
              <ul className="divide-y divide-slate-100">
                {invoices.map(inv => (
                  <li key={inv.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-medium">{inv.id}</div>
                      <div className="text-sm text-slate-600">{inv.period}</div>
                    </div>
                    <a href={inv.url} className="text-blue-600 hover:underline">View</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {currentView === 'admin' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-100">
                <div className="text-sm text-slate-600">Total Shipments</div>
                <div className="text-2xl font-semibold mt-1">{orders.length}</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-100">
                <div className="text-sm text-slate-600">Delivered</div>
                <div className="text-2xl font-semibold mt-1">{orders.filter(o=>o.status==='Delivered').length}</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-100">
                <div className="text-sm text-slate-600">Revenue (dummy)</div>
                <div className="text-2xl font-semibold mt-1">₹ {(orders.reduce((a,b)=>a+b.cost,0)).toFixed(2)}</div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-100">
                <div className="text-sm text-slate-600">Wallets Total</div>
                <div className="text-2xl font-semibold mt-1">₹ {wallet.toFixed(2)}</div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-6">
              <h3 className="font-semibold mb-3">Courier Rate Cards</h3>
              <div className="overflow-auto">
                <table className="min-w-[600px] w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-600">
                      <th className="py-2">Service</th>
                      <th>Base Rate</th>
                      <th>ETA</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fakeRates(1).map(r => (
                      <tr key={r.code} className="border-t border-slate-100">
                        <td className="py-2">{r.name}</td>
                        <td>₹ {r.price}</td>
                        <td>{r.eta}</td>
                        <td className="text-slate-600">{r.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-100 p-6">
                <h3 className="font-semibold mb-3">Users</h3>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center justify-between"><span>{user.email}</span><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span></li>
                  <li className="flex items-center justify-between"><span>ops@fastparcel.in</span><span className="px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200">Viewer</span></li>
                </ul>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-6">
                <h3 className="font-semibold mb-3">KYC Verifications</h3>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center justify-between"><span>{kyc.businessName || 'Your Business'}</span><span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">{kyc.status}</span></li>
                  <li className="flex items-center justify-between"><span>Acme Logistics</span><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Verified</span></li>
                </ul>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-6">
              <h3 className="font-semibold mb-3">Audit Logs</h3>
              <ul className="text-sm space-y-1 text-slate-600">
                <li>[{new Date().toLocaleString()}] Login success for {user.email}</li>
                <li>[{new Date(Date.now()-3600_000).toLocaleString()}] Rate card viewed</li>
                <li>[{new Date(Date.now()-7200_000).toLocaleString()}] Wallet balance checked</li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {trackOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Tracking • {trackOrder.awb}</h3>
              <button className="text-slate-500" onClick={() => setTrackOrder(null)}>Close</button>
            </div>
            <ol className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span><div><div className="font-medium">Shipment Booked</div><div className="text-slate-600">{trackOrder.createdAt} • {trackOrder.from}</div></div></li>
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-blue-500"></span><div><div className="font-medium">Picked Up</div><div className="text-slate-600">Hub Scan</div></div></li>
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-indigo-500"></span><div><div className="font-medium">In Transit</div><div className="text-slate-600">Line-haul movement</div></div></li>
              <li className="flex items-start gap-3"><span className={`${trackOrder.status==='Delivered'?'mt-1 h-2 w-2 rounded-full bg-emerald-600':'mt-1 h-2 w-2 rounded-full bg-slate-300'}`}></span><div><div className="font-medium">Delivered</div><div className="text-slate-600">{trackOrder.to}</div></div></li>
            </ol>
          </div>
        </div>
      )}

      {showNewShipment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold">New Booking</h3>
              <button onClick={() => { setShowNewShipment(false); resetShipmentForm(); }} className="text-slate-500">Close</button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className={`${step>=1?'px-2 py-1 rounded bg-blue-50 text-blue-700':'px-2 py-1 rounded bg-slate-100'}`}>1. Parties</span>
                <span className={`${step>=2?'px-2 py-1 rounded bg-blue-50 text-blue-700':'px-2 py-1 rounded bg-slate-100'}`}>2. Package</span>
                <span className={`${step>=3?'px-2 py-1 rounded bg-blue-50 text-blue-700':'px-2 py-1 rounded bg-slate-100'}`}>3. Pickup</span>
                <span className={`${step>=4?'px-2 py-1 rounded bg-blue-50 text-blue-700':'px-2 py-1 rounded bg-slate-100'}`}>4. Rates</span>
                <span className={`${step>=5?'px-2 py-1 rounded bg-blue-50 text-blue-700':'px-2 py-1 rounded bg-slate-100'}`}>5. Pay</span>
              </div>

              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 rounded-lg border border-slate-100">
                    <div className="font-medium mb-2">Sender</div>
                    <input value={form.sender.name} onChange={e=>setForm(f=>({...f, sender:{...f.sender, name:e.target.value}}))} placeholder="Name" className="h-10 px-3 w-full rounded border border-slate-200 mb-2" />
                    <input value={form.sender.phone} onChange={e=>setForm(f=>({...f, sender:{...f.sender, phone:e.target.value}}))} placeholder="Phone" className="h-10 px-3 w-full rounded border border-slate-200 mb-2" />
                    <input value={form.sender.address} onChange={e=>setForm(f=>({...f, sender:{...f.sender, address:e.target.value}}))} placeholder="Address" className="h-10 px-3 w-full rounded border border-slate-200" />
                  </div>
                  <div className="p-4 rounded-lg border border-slate-100">
                    <div className="font-medium mb-2">Receiver</div>
                    <input value={form.receiver.name} onChange={e=>setForm(f=>({...f, receiver:{...f.receiver, name:e.target.value}}))} placeholder="Name" className="h-10 px-3 w-full rounded border border-slate-200 mb-2" />
                    <input value={form.receiver.phone} onChange={e=>setForm(f=>({...f, receiver:{...f.receiver, phone:e.target.value}}))} placeholder="Phone" className="h-10 px-3 w-full rounded border border-slate-200 mb-2" />
                    <input value={form.receiver.address} onChange={e=>setForm(f=>({...f, receiver:{...f.receiver, address:e.target.value}}))} placeholder="Address" className="h-10 px-3 w-full rounded border border-slate-200" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-4">
                  <div className="md:col-span-2">
                    <label className="text-sm text-slate-600">Weight (kg)</label>
                    <input type="number" value={form.pkg.weight} min={0.1} step={0.1} onChange={e=>setForm(f=>({...f, pkg:{...f.pkg, weight: parseFloat(e.target.value)||0}}))} className="h-10 px-3 w-full rounded border border-slate-200" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">L (cm)</label>
                    <input type="number" value={form.pkg.length} onChange={e=>setForm(f=>({...f, pkg:{...f.pkg, length: parseInt(e.target.value)||0}}))} className="h-10 px-3 w-full rounded border border-slate-200" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">W (cm)</label>
                    <input type="number" value={form.pkg.width} onChange={e=>setForm(f=>({...f, pkg:{...f.pkg, width: parseInt(e.target.value)||0}}))} className="h-10 px-3 w-full rounded border border-slate-200" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">H (cm)</label>
                    <input type="number" value={form.pkg.height} onChange={e=>setForm(f=>({...f, pkg:{...f.pkg, height: parseInt(e.target.value)||0}}))} className="h-10 px-3 w-full rounded border border-slate-200" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-sm text-slate-600">Contents</label>
                    <input value={form.pkg.contents} onChange={e=>setForm(f=>({...f, pkg:{...f.pkg, contents: e.target.value}}))} className="h-10 px-3 w-full rounded border border-slate-200" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-sm text-slate-600">Declared Value (₹)</label>
                    <input type="number" value={form.pkg.value} onChange={e=>setForm(f=>({...f, pkg:{...f.pkg, value: parseFloat(e.target.value)||0}}))} className="h-10 px-3 w-full rounded border border-slate-200" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="md:col-span-2">
                    <label className="text-sm text-slate-600">Pickup date</label>
                    <input type="date" value={form.pickup.date} onChange={e=>setForm(f=>({...f, pickup:{...f.pickup, date:e.target.value}}))} className="h-10 px-3 w-full rounded border border-slate-200" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Slot</label>
                    <select value={form.pickup.slot} onChange={e=>setForm(f=>({...f, pickup:{...f.pickup, slot:e.target.value}}))} className="h-10 px-3 w-full rounded border border-slate-200">
                      <option>10:00-13:00</option>
                      <option>13:00-16:00</option>
                      <option>16:00-19:00</option>
                    </select>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {fakeRates(form.pkg.weight).map(rate => (
                    <button key={rate.code} onClick={() => setForm(f => ({...f, service: rate}))} className={`${form.service?.code===rate.code?'text-left p-4 rounded-xl border border-blue-500 ring-2 ring-blue-100 bg-white hover:border-blue-300':'text-left p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300'}`}> 
                      <div className="font-medium">{rate.name}</div>
                      <div className="text-sm text-slate-600">{rate.desc}</div>
                      <div className="mt-2 text-sm">ETA: <span className="font-medium">{rate.eta}</span></div>
                      <div className="mt-1 text-lg font-semibold">₹ {rate.price}</div>
                    </button>
                  ))}
                </div>
              )}

              {step === 5 && (
                <div className="mt-4 p-4 rounded-lg border border-slate-100">
                  <div className="font-medium mb-2">Payment Summary</div>
                  <div className="text-sm text-slate-700">Service: {form.service?.name || '-'}</div>
                  <div className="text-sm text-slate-700">Amount: ₹ {form.service?.price || 0}</div>
                  <div className="text-sm text-slate-700">Wallet balance after payment: ₹ {(wallet - (form.service?.price || 0)).toFixed(2)}</div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <button disabled={step===1} onClick={()=>setStep(s=>s-1)} className={`${step===1?'h-10 px-4 rounded-lg border opacity-50':'h-10 px-4 rounded-lg border border-slate-200'}`}>Back</button>
                {step < 5 && (
                  <button onClick={()=>setStep(s=>s+1)} className="h-10 px-4 rounded-lg bg-blue-600 text-white">Next</button>
                )}
                {step === 5 && (
                  <button onClick={shipNow} className="h-10 px-4 rounded-lg bg-emerald-600 text-white">Ship Now</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
