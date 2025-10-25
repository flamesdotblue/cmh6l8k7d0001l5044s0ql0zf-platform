import React, { useEffect, useMemo, useRef } from 'react';

export default function DashboardCards({ total, delivered, inTransit, wallet }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = (canvas.width = canvas.clientWidth);
    const h = (canvas.height = canvas.clientHeight);
    ctx.clearRect(0,0,w,h);
    const bars = 12;
    for (let i=0;i<bars;i++) {
      const x = (i+1) * (w/(bars+1));
      const barH = Math.round((Math.sin(i*0.6)+1)/2 * (h*0.7)) + h*0.1;
      ctx.fillStyle = i%3===0 ? '#2563eb' : '#93c5fd';
      const radius = 6;
      const rx = x-10;
      const ry = h-barH;
      const rw = 20;
      const rh = barH;
      ctx.beginPath();
      ctx.moveTo(rx + radius, ry);
      ctx.lineTo(rx + rw - radius, ry);
      ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius);
      ctx.lineTo(rx + rw, ry + rh);
      ctx.lineTo(rx, ry + rh);
      ctx.lineTo(rx, ry + radius);
      ctx.quadraticCurveTo(rx, ry, rx + radius, ry);
      ctx.closePath();
      ctx.fill();
    }
  }, [total, delivered, inTransit, wallet]);

  const cards = useMemo(() => ([
    { label: 'Total Orders', value: total },
    { label: 'Delivered', value: delivered },
    { label: 'In Transit', value: inTransit },
    { label: 'Wallet Balance', value: `₹ ${wallet.toFixed(2)}` },
  ]), [total, delivered, inTransit, wallet]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="text-sm text-slate-600">{c.label}</div>
          <div className="text-2xl font-semibold mt-1">{c.value}</div>
          {i===0 && (
            <div className="mt-4 h-28 w-full rounded-lg bg-slate-50 border border-slate-100 overflow-hidden">
              <canvas ref={canvasRef} className="h-full w-full" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
