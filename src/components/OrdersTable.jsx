import React from 'react';
import { Truck, FileText, XCircle } from 'lucide-react';

export default function OrdersTable({ orders, onTrack, onCancel, onViewLabel }) {
  return (
    <div className="overflow-auto">
      <table className="min-w-[800px] w-full text-sm">
        <thead>
          <tr className="text-left text-slate-600">
            <th className="py-2">AWB</th>
            <th>Service</th>
            <th>Status</th>
            <th>Cost</th>
            <th>From</th>
            <th>To</th>
            <th>Date</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.awb} className="border-t border-slate-100">
              <td className="py-2 font-medium">{o.awb}</td>
              <td>{o.service}</td>
              <td>
                <span className={`${o.status==='Delivered'?'px-2 py-1 rounded text-xs border bg-emerald-50 text-emerald-700 border-emerald-200': o.status==='In Transit'?'px-2 py-1 rounded text-xs border bg-indigo-50 text-indigo-700 border-indigo-200': o.status==='Booked'?'px-2 py-1 rounded text-xs border bg-amber-50 text-amber-700 border-amber-200': o.status==='Cancelled'?'px-2 py-1 rounded text-xs border bg-rose-50 text-rose-700 border-rose-200':'px-2 py-1 rounded text-xs border bg-slate-50 text-slate-700 border-slate-200'}`}>{o.status}</span>
              </td>
              <td>₹ {o.cost}</td>
              <td className="text-slate-600">{o.from}</td>
              <td className="text-slate-600">{o.to}</td>
              <td className="text-slate-600">{o.createdAt}</td>
              <td className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => onViewLabel(o.awb)} className="h-9 px-2 rounded-lg border border-slate-200 flex items-center gap-2"><FileText size={16}/> Label</button>
                  <button onClick={() => onTrack(o.awb)} className="h-9 px-2 rounded-lg border border-slate-200 flex items-center gap-2"><Truck size={16}/> Track</button>
                  {o.status !== 'Cancelled' && (
                    <button onClick={() => onCancel(o.awb)} className="h-9 px-2 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 flex items-center gap-2"><XCircle size={16}/> Cancel</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
