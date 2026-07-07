import { useState } from "react";
import { X, ArrowRight, ChevronDown, ChevronUp, UserX } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MarkInactiveModal } from "./MarkInactiveModal";
import { fmt } from "@/lib/utils";
import {
  getCustomerTotalPaid,
  getCustomerSlabPaid,
} from "@/lib/customers/paymentDistribution";
import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";

interface CustomerDetailsPanelProps {
  customer: CustomerDetailProfile;
  onClose: () => void;
  onProceed?: (customer: CustomerDetailProfile) => void;
  onMarkInactive?: (customer: CustomerDetailProfile, reason: string) => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">{title}</p>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 font-semibold uppercase">{label}</p>
      <p className="text-sm text-gray-800 mt-0.5">{value || "—"}</p>
    </div>
  );
}

export function CustomerDetailsPanel({ customer, onClose, onProceed, onMarkInactive }: CustomerDetailsPanelProps) {
  const [loanOpen, setLoanOpen] = useState(false);
  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const isTemporary = customer.bookingType === "temporary";
  const isInactive = customer.status === "inactive";
  const totalPaid = getCustomerTotalPaid(customer);
  const slabPaid = getCustomerSlabPaid(customer);
  const flatRemaining = Math.max(0, customer.amount - totalPaid);
  const isAadhar = customer.idProof.toLowerCase().includes("aadhar");

  return (
    <div className="absolute right-0 top-0 bottom-0 w-[420px] bg-white border-l border-gray-200 shadow-2xl z-20 flex flex-col">
      <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between shrink-0">
        <div>
          <h3 className="text-lg font-bold text-[#0f1a35]">{customer.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{customer.id}</p>
          <div className="flex gap-2 mt-2">
            <Badge status={customer.status} />
            {customer.bookingType && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isTemporary ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
              }`}>
                {isTemporary ? "Temporary Booking" : "Payment Booking"}
              </span>
            )}
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-600 mb-2">
            Total Payment Done
          </p>
          <p className="text-2xl font-bold text-[#0f1a35]">{fmt(totalPaid)}</p>
          <div className="grid grid-cols-3 gap-2 mt-3 text-[11px]">
            <div>
              <p className="text-gray-400">Slab Paid</p>
              <p className="font-semibold text-green-700">{fmt(slabPaid)}</p>
            </div>
            <div>
              <p className="text-gray-400">Grand Total</p>
              <p className="font-semibold text-[#1e3a5f]">{fmt(customer.amount)}</p>
            </div>
            <div>
              <p className="text-gray-400">Remaining</p>
              <p className="font-semibold text-orange-600">{fmt(flatRemaining)}</p>
            </div>
          </div>
        </div>

        <Section title="Personal">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" value={customer.phone} />
            <Field label="Email" value={customer.email} />
          </div>
          <Field label="Address" value={customer.address} />
          {isAadhar ? (
            <>
              <Field label="Aadhar Number" value={customer.idNumber} />
              <Field label="ID Proof" value={customer.idProof} />
            </>
          ) : (
            <Field label="ID Proof" value={`${customer.idProof} — ${customer.idNumber}`} />
          )}
        </Section>

        <Section title="Unit Location">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Project" value={customer.project} />
            <Field label="Building / Wing" value={`${customer.building} / Wing ${customer.wing}`} />
            <Field label="Flat" value={`${customer.flat} (${customer.flatType})`} />
            <Field label="Area" value={`${customer.area} sq.ft.`} />
            <Field label="Floor" value={customer.floor} />
            <Field label="Parking" value={customer.parking === "no" ? "None" : customer.parking} />
          </div>
        </Section>

        {customer.loanStatus !== "No" && (
          <div className="border border-blue-100 rounded-xl overflow-hidden">
            <button
              onClick={() => setLoanOpen(!loanOpen)}
              className="w-full px-4 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center justify-between"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-600">
                Loan Details ({customer.loanStatus})
              </p>
              {loanOpen ? <ChevronUp size={14} className="text-blue-500" /> : <ChevronDown size={14} className="text-blue-500" />}
            </button>
            {loanOpen && (
              <div className="p-4 grid grid-cols-2 gap-3">
                <Field label="Bank" value={customer.bankName} />
                <Field label="Branch" value={customer.branchName} />
                <Field label="Loan Amount" value={customer.loanAmount ? fmt(customer.loanAmount) : "—"} />
                <Field label="Bank Email" value={customer.bankEmail} />
              </div>
            )}
          </div>
        )}

        {isTemporary && customer.holdingDueDate && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <p className="text-[10px] font-semibold uppercase text-orange-600">Holding Due Date</p>
            <p className="text-sm font-bold text-orange-800 mt-1">{customer.holdingDueDate}</p>
            <p className="text-[11px] text-orange-600 mt-1">Flat releases automatically after due date if not proceeded.</p>
          </div>
        )}

        <Section title="Pricing">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Base</span><span className="font-medium">{fmt(customer.pricing.baseAmount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">GST ({customer.pricing.gstPct}%)</span><span className="font-medium">{fmt(customer.pricing.gstAmount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Stamp Duty</span><span className="font-medium">{fmt(customer.pricing.stampDuty)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Agreement</span><span className="font-medium">{fmt(customer.pricing.agreementPrice)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Electrical</span><span className="font-medium">{fmt(customer.pricing.electricalBill)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Parking</span><span className="font-medium">{fmt(customer.pricing.parkingAmount)}</span></div>
          </div>
          <div className="flex justify-between pt-3 mt-2 border-t border-gray-200">
            <span className="text-sm font-semibold text-[#0f1a35]">Grand Total</span>
            <span className="text-base font-bold text-blue-700">{fmt(customer.pricing.grandTotal)}</span>
          </div>
        </Section>

        {customer.bookingSlab10 && (
          <Section title="10% Booking Slab">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">10% Amount</span>
              <span className="font-bold">{fmt(customer.bookingSlab10.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Received at Booking</span>
              <span className="font-bold text-green-700">{fmt(customer.bookingSlab10.received)}</span>
            </div>
          </Section>
        )}

        {customer.slabLedger.length > 0 && (
          <Section title="Slab Payment Ledger">
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-left text-gray-400 uppercase">
                    <th className="pb-2 pr-2">#</th>
                    <th className="pb-2 pr-2">Stage</th>
                    <th className="pb-2 pr-2">Amount</th>
                    <th className="pb-2 pr-2">Paid</th>
                    <th className="pb-2 pr-2">Left</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customer.slabLedger.map((s) => (
                    <tr key={s.slabNo}>
                      <td className="py-2 pr-2 font-mono font-bold">{s.slabNo}</td>
                      <td className="py-2 pr-2">{s.stage}</td>
                      <td className="py-2 pr-2">{fmt(s.slabAmount)}</td>
                      <td className="py-2 pr-2 text-green-700">{fmt(s.paidAmount)}</td>
                      <td className="py-2 pr-2 text-orange-600 font-semibold">{fmt(s.remainingAmount)}</td>
                      <td className="py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          s.status === "received" ? "bg-green-100 text-green-700"
                          : s.status === "partial" ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-500"
                        }`}>
                          {s.autoSettled ? "Auto" : s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        <Section title="Payment Categories">
          <div className="space-y-2">
            {customer.categories.map((cat) => (
              <div key={cat.key} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                <span className="text-gray-600">{cat.label}</span>
                <div className="text-right text-[11px]">
                  <span className="text-gray-400">Due {fmt(cat.due)} · </span>
                  <span className="text-green-600">Paid {fmt(cat.paid)} · </span>
                  <span className="text-orange-600 font-semibold">Left {fmt(cat.remaining)}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {isInactive && customer.inactiveReason && (
          <div className="p-4 bg-gray-100 border border-gray-300 rounded-xl">
            <p className="text-[10px] font-semibold uppercase text-gray-500">Discontinued</p>
            <p className="text-sm text-gray-800 mt-1">{customer.inactiveReason}</p>
            {customer.inactiveDate && (
              <p className="text-[11px] text-gray-500 mt-1">Date: {customer.inactiveDate}</p>
            )}
            <p className="text-[11px] text-green-700 font-semibold mt-2">Flat released — available for booking</p>
          </div>
        )}

        {customer.notes && (
          <Section title="Notes">
            <p className="text-sm text-gray-600 leading-relaxed">{customer.notes}</p>
          </Section>
        )}
      </div>

      {!isInactive && onMarkInactive && (
        <div className="px-5 py-3 border-t border-gray-100 shrink-0">
          <button
            onClick={() => setShowInactiveModal(true)}
            className="w-full flex items-center justify-center gap-2 border-2 border-red-300 text-red-700 text-sm font-semibold py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <UserX size={16} />
            Mark as Inactive
          </button>
        </div>
      )}

      {showInactiveModal && (
        <MarkInactiveModal
          customerName={customer.name}
          flatNo={customer.flat}
          isTemporary={isTemporary}
          onClose={() => setShowInactiveModal(false)}
          onConfirm={(reason) => {
            onMarkInactive?.(customer, reason);
            setShowInactiveModal(false);
            onClose();
          }}
        />
      )}

      {isTemporary && onProceed && !isInactive && (
        <div className="p-5 border-t border-gray-100 shrink-0 bg-orange-50/50">
          <button
            onClick={() => onProceed(customer)}
            className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            Proceed to Full Registration
            <ArrowRight size={16} />
          </button>
          <p className="text-[10px] text-orange-600 text-center mt-2">
            Opens Add Customer with all details pre-filled
          </p>
        </div>
      )}
    </div>
  );
}