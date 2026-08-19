import React from 'react';
import QRCode from 'react-qr-code';
import { Invoice } from '@/shared/api/billingApiV2';

// A clean, formal, print-only invoice layout — separate from the app's
// dark dashboard chrome. Rendered off-screen (see the wrapper's
// className below) and only made visible by the print stylesheet in
// index.css, so a plain window.print() call shows just this document
// instead of the whole dashboard UI. Used by both the provider
// InvoicesPage and the patient BillingPatientPage so the two "print an
// invoice" paths produce an identical document.

function fmt(n: number) {
  return `₦${(n || 0).toLocaleString('en-NG')}`;
}

function patientLabel(p: Invoice['patientId']) {
  if (typeof p === 'string') return p;
  return p?.fullName || p?.wrId || 'Unknown patient';
}

function orgLabel(o: Invoice['organizationId']) {
  if (typeof o === 'string') return o;
  return o?.organizationName || 'Provider';
}

export function InvoicePrintDocument({ invoice }: { invoice: Invoice }) {
  return (
    <div id="invoice-print-area" className="hidden print:block bg-white text-black p-10 max-w-[800px] mx-auto">
      <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-6">
        <div>
          <div className="text-2xl font-black">WelliRecord</div>
          <div className="text-sm text-slate-600 mt-1">{orgLabel(invoice.organizationId)}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">INVOICE</div>
          <div className="font-mono text-sm">{invoice.invoiceNumber}</div>
          <div className="text-xs text-slate-500 mt-1">
            {new Date(invoice.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="flex justify-between mb-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Billed to</div>
          <div className="text-base font-bold mt-1">{patientLabel(invoice.patientId)}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Status</div>
          <div className="text-base font-bold mt-1 capitalize">{invoice.status.replace('-', ' ')}</div>
        </div>
      </div>

      <table className="w-full text-sm mb-6 border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-900">
            <th className="text-left py-2">Description</th>
            <th className="text-right py-2">Qty</th>
            <th className="text-right py-2">Unit Price</th>
            <th className="text-right py-2">Discount</th>
            <th className="text-right py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lineItems.map((li) => (
            <tr key={li.id} className="border-b border-slate-200">
              <td className="py-2">{li.description}</td>
              <td className="text-right py-2">{li.quantity}</td>
              <td className="text-right py-2">{fmt(li.unitPrice)}</td>
              <td className="text-right py-2">{li.discount > 0 ? `-${fmt(li.discount)}` : '—'}</td>
              <td className="text-right py-2 font-semibold">{fmt(li.lineTotal || li.quantity * li.unitPrice - li.discount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span>{fmt(invoice.subtotal)}</span></div>
          {invoice.discountTotal > 0 && <div className="flex justify-between"><span className="text-slate-600">Discount</span><span>-{fmt(invoice.discountTotal)}</span></div>}
          {invoice.taxTotal > 0 && <div className="flex justify-between"><span className="text-slate-600">Tax</span><span>{fmt(invoice.taxTotal)}</span></div>}
          <div className="flex justify-between text-base font-bold border-t border-slate-300 pt-1.5"><span>Total</span><span>{fmt(invoice.totalAmount)}</span></div>
          {invoice.hmoContribution > 0 && <div className="flex justify-between"><span className="text-slate-600">HMO covers</span><span>-{fmt(invoice.hmoContribution)}</span></div>}
          <div className="flex justify-between text-base font-bold"><span>Patient responsibility</span><span>{fmt(invoice.patientResponsibility)}</span></div>
          <div className="flex justify-between text-slate-600"><span>Paid</span><span>{fmt(invoice.amountPaid)}</span></div>
          <div className="flex justify-between font-bold border-t border-slate-300 pt-1.5"><span>Balance due</span><span>{fmt(Math.max(0, invoice.totalAmount - invoice.amountPaid))}</span></div>
        </div>
      </div>

      <div className="flex items-end justify-between border-t border-slate-300 pt-4">
        <div className="text-[10px] text-slate-500 max-w-sm">
          This is a WelliRecord invoice. Payment is currently collected in person or by bank transfer directly with the provider —
          online payment is not yet available. Scan the code to verify this invoice is genuine.
        </div>
        <div className="flex flex-col items-center gap-1">
          <QRCode value={`${window.location.origin}/verify/${invoice.invoiceNumber}`} size={64} />
          <span className="text-[9px] text-slate-400">Verify</span>
        </div>
      </div>
    </div>
  );
}
