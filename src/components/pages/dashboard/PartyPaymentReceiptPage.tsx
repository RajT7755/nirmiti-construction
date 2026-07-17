import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Printer } from "lucide-react";
import { useAppDataContext } from "@/app/AppDataContext";
import { Button } from "@/components/ui/Button";
import { PartyPaymentReceiptDocument } from "@/components/partyPayments/PartyPaymentReceiptDocument";
import { resolveBusinessProfile } from "@/lib/settings/defaultSettings";
import type { PartyReceivedPayment } from "@/lib/inventory/partyPaymentTypes";
import "@/components/partyPayments/partyPaymentPrint.css";

/** Fill address/GST from party master when receipt snapshot is missing (older payments). */
function enrichPaymentForReceipt(
  payment: PartyReceivedPayment,
  suppliers: { id: string; address?: string; pinCode?: string; gstin?: string }[],
  contractors: { id: string; address?: string; pinCode?: string; gstin?: string }[]
): PartyReceivedPayment {
  if (payment.partyAddress && payment.partyGstin) return payment;
  const party =
    payment.partyType === "supplier"
      ? suppliers.find((s) => s.id === payment.partyId)
      : contractors.find((c) => c.id === payment.partyId);
  if (!party) return payment;
  const liveAddress = [party.address, party.pinCode].filter(Boolean).join(", ");
  return {
    ...payment,
    partyAddress: payment.partyAddress || liveAddress || undefined,
    partyGstin: payment.partyGstin || party.gstin || undefined,
  };
}

export function PartyPaymentReceiptPage() {
  const { paymentId = "" } = useParams();
  const navigate = useNavigate();
  const { getPartyPaymentById, businessProfile, suppliers, contractors } =
    useAppDataContext();
  const payment = getPartyPaymentById(paymentId);
  const profile = resolveBusinessProfile(businessProfile);

  const displayPayment = useMemo(() => {
    if (!payment) return null;
    return enrichPaymentForReceipt(payment, suppliers, contractors);
  }, [payment, suppliers, contractors]);

  if (!displayPayment) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Payment receipt not found.</p>
        <button
          type="button"
          className="mt-4 text-sm text-blue-600 font-medium"
          onClick={() => navigate("/dashboard/party-payments")}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 print:p-0">
      <div className="party-pay-no-print flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => navigate("/dashboard/party-payments")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0f1a35]"
        >
          <ArrowLeft size={16} /> Back to payment log
        </button>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => window.print()}
        >
          <Printer size={16} /> Print
        </Button>
      </div>
      <div id="party-pay-print-root">
        <PartyPaymentReceiptDocument
          payment={displayPayment}
          businessProfile={profile}
        />
      </div>
    </div>
  );
}
