import { useState, useEffect, useRef } from "react";
import { RefreshCw, AlertCircle, ArrowLeft } from "lucide-react";
import { generateCustomerId } from "@/lib/customers/generateCustomerId";
import type { AddCustomerFormInput } from "@/lib/customers/buildCustomerProfile";
import type { CustomerDetailProfile } from "@/lib/customers/customerDetailTypes";
import { BookedFlatsGrid } from "./BookedFlatsGrid";
import type { ProjectData } from "@/lib/types";

interface GeneratedSlab {
  booking10: number;
  received: number;
  method: string;
  date: string;
}

export function AddCustomer({
  projects,
  customerProfiles = [],
  onBack,
  onRegister,
  initialData,
  proceedMode,
  checkFlatReleased,
}: {
  projects: ProjectData[];
  customerProfiles?: CustomerDetailProfile[];
  onBack?: () => void;
  onRegister?: (
    input: AddCustomerFormInput,
    initialPayment?: { amount: number; method: string; date: string },
    options?: { proceedExisting?: boolean }
  ) => void;
  initialData?: CustomerDetailProfile | null;
  proceedMode?: boolean;
  checkFlatReleased?: (flatNo: string) => boolean;
}) {
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const projectNames = projects.length > 0
    ? projects.map(p => p.name)
    : ["Sunrise Heights", "Green Valley", "Blue Horizo"];

  // book flat Grid navigation
  const [selProject, setSelProject]     = useState(projectNames[0]);
  const [selBuildingIdx, setSelBuildingIdx] = useState(0);
  const [selWingIdx, setSelWingIdx]     = useState(0);
  const [selFloor, setSelFloor]         = useState(0);

  // Unit location
  const [unitType, setUnitType]   = useState("Residential");
  const [flatType, setFlatType]   = useState("1BHK");
  const [flatNo, setFlatNo]       = useState("");
  const [area, setArea]           = useState("");
  const [floorName, setFloorName] = useState("");
  const [parking, setParking]     = useState<"open" | "closed" | "no">("no");

  // Personal info
  const [custName, setCustName]   = useState("");
  const [address, setAddress]     = useState("");
  const [phone, setPhone]         = useState("");
  const [email, setEmail]         = useState("");
  const [idProof, setIdProof]     = useState("Aadhar ID");
  const [idNumber, setIdNumber]   = useState("");
  const [loanStatus, setLoanStatus] = useState<"No" | "Yes" | "Maybe">("No");

  // Loan details (conditional)
  const [bankName, setBankName]       = useState("");
  const [branchName, setBranchName]   = useState("");
  const [bankAddress, setBankAddress] = useState("");
  const [loanAmount, setLoanAmount]   = useState("");
  const [bankEmail, setBankEmail]     = useState("");

  // Booking type
  const [bookingType, setBookingType]       = useState<"payment" | "temporary" | null>(null);
  const [holdingDueDate, setHoldingDueDate] = useState("");

  // Payment slab generator
  const [slabArea, setSlabArea]             = useState("");
  const [slabRate, setSlabRate]             = useState("");
  const [gstPct, setGstPct]                 = useState("");
  const [stampDuty, setStampDuty]           = useState("");
  const [agreementPrice, setAgreementPrice] = useState("");
  const [electricalBill, setElectricalBill] = useState("");
  const [parkingAmount, setParkingAmount]   = useState("");
  const [generatedSlab, setGeneratedSlab]   = useState<GeneratedSlab | null>(null);
  const [customerId, setCustomerId]         = useState("");

  // Notes
  const [notes, setNotes]         = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const flatNoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initialData) return;
    setSelProject(initialData.project);
    setCustName(initialData.name);
    setAddress(initialData.address);
    setPhone(initialData.phone);
    setEmail(initialData.email);
    setIdProof(initialData.idProof);
    setIdNumber(initialData.idNumber);
    setUnitType(initialData.unitType);
    setFlatType(initialData.flatType);
    setFlatNo(initialData.flat);
    setArea(initialData.area);
    setParking(initialData.parking);
    setLoanStatus(initialData.loanStatus);
    setBankName(initialData.bankName ?? "");
    setBranchName(initialData.branchName ?? "");
    setBankAddress(initialData.bankAddress ?? "");
    setLoanAmount(initialData.loanAmount ? String(initialData.loanAmount) : "");
    setBankEmail(initialData.bankEmail ?? "");
    setBookingType("payment");
    setSlabArea(initialData.area);
    setSlabRate(String(Math.round(initialData.pricing.baseAmount / (Number(initialData.area) || 1))));
    setGstPct(String(initialData.pricing.gstPct));
    setStampDuty(String(initialData.pricing.stampDuty));
    setAgreementPrice(String(initialData.pricing.agreementPrice));
    setElectricalBill(String(initialData.pricing.electricalBill));
    setParkingAmount(String(initialData.pricing.parkingAmount));
    setNotes(initialData.notes);
    setCustomerId(initialData.id);
    setFloorName(String(initialData.floor));
    setSelFloor(initialData.floor);
  }, [initialData]);

  const activePrj = projects.find(p => p.name === selProject);

  const totalCalc  = slabArea && slabRate ? Number(slabArea) * Number(slabRate) : 0;
  const gstCalc    = totalCalc && gstPct  ? (totalCalc * Number(gstPct)) / 100  : 0;
  const grandTotal = totalCalc + gstCalc
    + (Number(stampDuty) || 0)
    + (Number(electricalBill) || 0)
    + (parking !== "no" ? (Number(parkingAmount) || 0) : 0);
  const hasParking = parking === "open" || parking === "closed";
  const showLoan   = loanStatus === "Yes" || loanStatus === "Maybe";

  // Derive buildings/wings from unit numbers ("Bldg-WX-101" format)
  const getBuildings = () => {
    if (!activePrj) return ["Block A", "Block B"];
    const set = new Set(activePrj.units.map(u => {
      const idx = u.number.indexOf("-W");
      return idx >= 0 ? u.number.substring(0, idx) : u.number.split("-")[0];
    }));
    return set.size > 0 ? Array.from(set) : ["Block A"];
  };
  const getWings = (bldg: string) => {
    if (!activePrj) return ["A", "B"];
    const set = new Set(
      activePrj.units
        .filter(u => u.number.startsWith(bldg + "-W"))
        .map(u => u.number.substring(bldg.length + 2).split("-")[0])
    );
    return set.size > 0 ? Array.from(set) : ["A"];
  };
  const buildings = getBuildings();
  const selBldg   = buildings[Math.min(selBuildingIdx, buildings.length - 1)];
  const wings     = getWings(selBldg);
  const selWing   = wings[Math.min(selWingIdx, wings.length - 1)];
  const floorNum  = selFloor || (floorName ? parseInt(floorName, 10) || 0 : 0);

  useEffect(() => {
    if (proceedMode && initialData) return;
    const id = generateCustomerId(selProject, selBldg, floorNum, flatNo);
    if (id) setCustomerId(id);
  }, [selProject, selBldg, floorNum, flatNo, proceedMode, initialData]);

  function handleGenerateSlab() {
    if (!totalCalc) return;
    const booking10 = totalCalc * 0.1;
    setGeneratedSlab({
      booking10,
      received: booking10 + gstCalc,
      method: "cash",
      date: "",
    });
  }

  function handleRegenerateId() {
    const id = generateCustomerId(selProject, selBldg, floorNum, flatNo);
    if (id) setCustomerId(id);
  }

  function handleRegister() {
    setRegisterError(null);
    if (!custName.trim() || !phone || phone.length !== 10 || !flatNo || !bookingType) {
      setRegisterError("Fill name, 10-digit phone, flat no., and booking type.");
      return;
    }
    if (!customerId) {
      setRegisterError("Customer ID could not be generated — check unit fields.");
      return;
    }

    const input: AddCustomerFormInput = {
      id: customerId,
      name: custName.trim(),
      phone,
      email,
      address,
      idProof,
      idNumber,
      project: selProject,
      unitType,
      flatType,
      building: selBldg,
      wing: selWing,
      flat: flatNo,
      floor: floorNum,
      area,
      parking,
      loanStatus,
      bankName: bankName || undefined,
      branchName: branchName || undefined,
      bankAddress: bankAddress || undefined,
      loanAmount: loanAmount ? Number(loanAmount) : undefined,
      bankEmail: bankEmail || undefined,
      bookingType,
      holdingDueDate: holdingDueDate || undefined,
      baseAmount: totalCalc,
      gstPct: Number(gstPct) || 0,
      gstAmount: gstCalc,
      stampDuty: Number(stampDuty) || 0,
      agreementPrice: Number(agreementPrice) || 0,
      electricalBill: Number(electricalBill) || 0,
      parkingAmount: parking !== "no" ? Number(parkingAmount) || 0 : 0,
      grandTotal,
      notes,
      booking10Received:
        bookingType === "payment" && generatedSlab ? generatedSlab.received : undefined,
    };

    const initialPayment =
      bookingType === "payment" && generatedSlab && generatedSlab.received > 0
        ? {
            amount: generatedSlab.received,
            method: generatedSlab.method,
            date: generatedSlab.date || new Date().toISOString().slice(0, 10),
          }
        : undefined;

    onRegister?.(input, initialPayment, { proceedExisting: proceedMode && !!initialData });
    setRegisterSuccess(true);
    setTimeout(() => {
      setRegisterSuccess(false);
      onBack?.();
    }, 1200);
  }

  function handleSaveNotes() {
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  }

  return (
    <div className="p-6">
      {proceedMode && initialData && (
        <div className="mb-5 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-orange-800">
              Converting temporary booking — {initialData.name}
            </p>
            <p className="text-[11px] text-orange-600 mt-0.5">
              All details pre-filled from temporary hold. Complete payment registration below.
            </p>
          </div>
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-1 text-xs text-orange-700 hover:underline shrink-0">
              <ArrowLeft size={12} /> Back
            </button>
          )}
        </div>
      )}
      <div className="grid grid-cols-5 gap-6">

        {/* ── LEFT FORM ── */}
        <div className="col-span-3 space-y-5">

          {/* Customer Unique ID */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-3">Customer Unique ID</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={customerId || "Fill project, building, floor & flat"}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-700 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleRegenerateId}
                disabled={!flatNo}
                className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40"
              >
                <RefreshCw size={12} /> Generate
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">Format: project + building + floor + flat (e.g. SHB2B204)</p>
          </div>

          {/* B. Unit Location */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-4">Unit Location</p>
            <div className="grid grid-cols-2 gap-3">
              {/* Row 1 — Project + Type */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Project / Site</label>
                <select value={selProject}
                  onChange={e => { setSelProject(e.target.value); setSelBuildingIdx(0); setSelWingIdx(0); setSelFloor(0); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                  {projectNames.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Type</label>
                <select value={unitType} onChange={e => setUnitType(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option>Residential</option><option>Commercial</option>
                </select>
              </div>

              {/* Row 2 — Building + Wing (connected to project data & syncs the grid) */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Building</label>
                <select
                  value={selBldg}
                  onChange={e => { setSelBuildingIdx(buildings.indexOf(e.target.value)); setSelWingIdx(0); setSelFloor(0); }}
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                  {buildings.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                {buildings.length <= 1 && !activePrj && (
                  <p className="text-[10px] text-gray-400 mt-1">Create a project to see buildings</p>
                )}
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Wing</label>
                <select
                  value={selWing}
                  onChange={e => { setSelWingIdx(wings.indexOf(e.target.value)); setSelFloor(0); }}
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                  {wings.map(w => <option key={w} value={w}>Wing {w}</option>)}
                </select>
              </div>

              {/* Row 3 — Flat Type + Flat No */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Flat Type</label>
                <select value={flatType} onChange={e => setFlatType(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option>1BHK</option><option>2BHK</option><option>3BHK</option><option>4BHK</option><option>Shop</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Shop / Flat No.</label>
                <input
                  ref={flatNoInputRef}
                  type="text"
                  value={flatNo}
                  onChange={e => setFlatNo(e.target.value)}
                  placeholder="e.g. A-204"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              {/* Row 4 — Area + Floor Name */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Area (sq.ft.)</label>
                <input type="text" value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. 850"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Floor Name</label>
                <input type="text" value={floorName} onChange={e => setFloorName(e.target.value)} placeholder="e.g. 2nd Floor"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-[11px] font-semibold text-gray-500 block mb-2">Parking</label>
              <div className="flex gap-5">
                {([["open","Yes – Open"],["closed","Yes – Closed"],["no","No"]] as const).map(([val, lbl]) => (
                  <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="parking" value={val} checked={parking === val}
                      onChange={() => setParking(val)} className="accent-blue-600" />
                    <span className="text-sm text-gray-700">{lbl}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* C. Personal Information */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-4">Personal Information</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Name</label>
                <input type="text" value={custName} onChange={e => setCustName(e.target.value)} placeholder="Full name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Phone No.</label>
                <input type="tel" value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit number"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${phone.length > 0 && phone.length !== 10 ? "border-red-300 focus:ring-red-300" : "border-gray-200 focus:ring-blue-300"}`} />
                <p className={`text-[10px] mt-1 ${phone.length > 0 && phone.length !== 10 ? "text-red-500" : "text-gray-400"}`}>Must be 10 digits</p>
              </div>
              <div className="col-span-2">
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Address</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, City, State"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@gmail.com"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${email.length > 0 && !email.includes("@") ? "border-red-300 focus:ring-red-300" : "border-gray-200 focus:ring-blue-300"}`} />
                <p className={`text-[10px] mt-1 ${email.length > 0 && !email.includes("@") ? "text-red-500" : "text-gray-400"}`}>Must include @gmail.com or valid domain</p>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">ID Proof</label>
                <select value={idProof} onChange={e => setIdProof(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option>Aadhar ID</option><option>PAN ID</option><option>Driving Licence</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">ID Number</label>
                <input type="text" value={idNumber} onChange={e => setIdNumber(e.target.value)} placeholder="Enter ID number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-[11px] font-semibold text-gray-500 block mb-2">
                Loan Status <span className="text-gray-300 font-normal ml-1">(optional)</span>
              </label>
              <div className="flex gap-5">
                {(["No","Yes","Maybe"] as const).map(opt => (
                  <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="loanStatus" value={opt} checked={loanStatus === opt}
                      onChange={() => setLoanStatus(opt)} className="accent-blue-600" />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* D. Loan Section — conditional */}
          {showLoan && (
            <div className="bg-blue-50 rounded-xl border border-blue-200 shadow-sm p-5">
              <p className="text-[10px] text-blue-700 font-semibold uppercase tracking-widest mb-4">Loan Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 block mb-1">Bank Name</label>
                  <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. SBI"
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 block mb-1">Branch Name</label>
                  <input type="text" value={branchName} onChange={e => setBranchName(e.target.value)} placeholder="Branch"
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-gray-500 block mb-1">Bank Address</label>
                  <input type="text" value={bankAddress} onChange={e => setBankAddress(e.target.value)} placeholder="Full bank address"
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 block mb-1">Loan Amount (₹)</label>
                  <input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} placeholder="e.g. 2500000"
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 block mb-1">Bank Email</label>
                  <input type="email" value={bankEmail} onChange={e => setBankEmail(e.target.value)} placeholder="bank@sbi.co.in"
                    className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>
            </div>
          )}

          {/* E. Booking Type Checklist */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-4">Booking Type</p>
            <div className="space-y-3">
              <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${bookingType === "payment" ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-200"}`}>
                <input type="checkbox" checked={bookingType === "payment"}
                  onChange={() => setBookingType(bookingType === "payment" ? null : "payment")}
                  className="accent-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Proceed for a Payment</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Customer is ready to make payment now</p>
                </div>
              </label>
              <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${bookingType === "temporary" ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-orange-200"}`}>
                <input type="checkbox" checked={bookingType === "temporary"}
                  onChange={() => setBookingType(bookingType === "temporary" ? null : "temporary")}
                  className="accent-orange-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Just Temporary Booking</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Hold the flat temporarily without payment</p>
                </div>
              </label>
              {bookingType === "temporary" && (
                <div className="ml-9">
                  <label className="text-[11px] font-semibold text-gray-500 block mb-1">Due Date of Holding</label>
                  <input type="date" value={holdingDueDate} onChange={e => setHoldingDueDate(e.target.value)}
                    className="w-full border border-orange-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300" />
                  <p className="text-[10px] text-orange-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={10} className="shrink-0" />
                    Flat automatically turns into a Free Flat after Due Date.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* F. Payment Slab Generator */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-4">Payment Slab Generator</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Area (sq.ft.)</label>
                <input type="number" value={slabArea} onChange={e => setSlabArea(e.target.value)} placeholder="e.g. 850"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Rate per sq.ft. (₹)</label>
                <input type="number" value={slabRate} onChange={e => setSlabRate(e.target.value)} placeholder="e.g. 5500"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                  Total Amount (₹) <span className="text-[10px] text-blue-500 font-normal">Auto</span>
                </label>
                <input readOnly value={totalCalc > 0 ? totalCalc.toLocaleString("en-IN") : ""}
                  placeholder="Area × Rate (auto-calculated)"
                  className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">GST (%)</label>
                <input type="number" value={gstPct} onChange={e => setGstPct(e.target.value)} placeholder="e.g. 5"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                  GST Amount (₹) <span className="text-[10px] text-blue-500 font-normal">Auto</span>
                </label>
                <input readOnly value={gstCalc > 0 ? gstCalc.toLocaleString("en-IN") : ""}
                  placeholder="Auto-generated"
                  className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Stamp Duty (₹)</label>
                <input type="number" value={stampDuty} onChange={e => setStampDuty(e.target.value)} placeholder="e.g. 50000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Agreement Price (₹)</label>
                <input type="number" value={agreementPrice} onChange={e => setAgreementPrice(e.target.value)} placeholder="e.g. 4700000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 block mb-1">Total Amt + Electrical Bill (₹)</label>
                <input type="number" value={electricalBill} onChange={e => setElectricalBill(e.target.value)} placeholder="e.g. 4560000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              {hasParking && (
                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-gray-500 block mb-1">
                    Parking Amount (₹) <span className="text-[10px] text-orange-500 font-normal">({parking === "open" ? "Open" : "Closed"} parking selected)</span>
                  </label>
                  <input type="number" value={parkingAmount} onChange={e => setParkingAmount(e.target.value)} placeholder="e.g. 100000"
                    className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              )}

              {/* Grand Total — auto-sum of all payment components */}
              <div className="col-span-2 pt-3 border-t border-gray-200">
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                  Grand Total (₹) <span className="text-[10px] text-blue-500 font-normal">Auto</span>
                </label>
                <input readOnly
                  value={grandTotal > 0 ? grandTotal.toLocaleString("en-IN") : ""}
                  placeholder="Sum of Base + GST + Stamp Duty + Electrical Bill + Parking"
                  className="w-full border-2 border-blue-200 rounded-lg px-3 py-2.5 text-sm bg-blue-50 text-blue-900 font-semibold cursor-not-allowed focus:outline-none" />
                <p className="text-[10px] text-gray-400 mt-1">
                  Base Amount + GST + Stamp Duty + Electrical Bill{hasParking ? " + Parking" : ""}
                </p>
              </div>
            </div>
            <button onClick={handleGenerateSlab} disabled={!totalCalc}
              className="mt-5 w-full flex items-center justify-center gap-2 bg-[#0f1a35] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#1e3a5f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Generate Booking Slab (10%)
            </button>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">
              Only 10% Booking slab with Received Amount generated here. Remaining slabs are created in Sales.
            </p>
            {generatedSlab && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
                <p className="text-[10px] text-green-700 font-semibold uppercase tracking-widest">Generated Booking Slab</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">10% Booking Amount</span>
                  <span className="font-bold text-[#0f1a35]">₹{generatedSlab.booking10.toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">Received Amount (₹)</label>
                  <input
                    type="number"
                    value={generatedSlab.received}
                    onChange={(e) =>
                      setGeneratedSlab((s) =>
                        s ? { ...s, received: Number(e.target.value) || 0 } : s
                      )
                    }
                    className="w-full border border-green-300 rounded-lg px-3 py-2 text-sm font-bold text-green-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">Payment Method</label>
                    <select
                      value={generatedSlab.method}
                      onChange={(e) =>
                        setGeneratedSlab((s) => (s ? { ...s, method: e.target.value } : s))
                      }
                      className="w-full border border-green-200 rounded-lg px-3 py-2 text-sm bg-white"
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">Date Received</label>
                    <input
                      type="date"
                      value={generatedSlab.date}
                      onChange={(e) =>
                        setGeneratedSlab((s) => (s ? { ...s, date: e.target.value } : s))
                      }
                      className="w-full border border-green-200 rounded-lg px-3 py-2 text-sm bg-white"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-green-600">
                  Saved to Received Payments on register.
                </p>
              </div>
            )}
          </div>

          {/* Notes / Remarks */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Notes / Remarks</p>
              <button onClick={handleSaveNotes}
                className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all ${notesSaved ? "bg-green-100 text-green-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                {notesSaved ? "✓ Saved" : "Save Notes"}
              </button>
            </div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Add any remarks or notes about this customer booking…"
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300" />
            <p className="text-[10px] text-gray-400 text-right mt-1">
              {notes.trim() === "" ? 0 : notes.trim().split(/\s+/).length} words
            </p>
          </div>

          {registerError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{registerError}</p>
          )}
          {registerSuccess && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 font-semibold">
              Customer registered and saved.
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pb-6">
            <button
              onClick={handleRegister}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Register Customer
            </button>
            <button className="px-6 border border-gray-200 text-gray-500 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>

        {/* ── RIGHT: Booked Flats Grid ── */}
        <div className="col-span-2">
          <BookedFlatsGrid
            projects={projects}
            customerProfiles={customerProfiles}
            checkFlatReleased={checkFlatReleased}
            controlledNavigation={{
              project: selProject,
              buildingIdx: selBuildingIdx,
              wingIdx: selWingIdx,
              floor: selFloor,
            }}
            onNavigationChange={(nav) => {
              setSelProject(nav.project);
              setSelBuildingIdx(nav.buildingIdx);
              setSelWingIdx(nav.wingIdx);
              setSelFloor(nav.floor);
            }}
            onBookUnit={(unit) => {
              setFlatNo(unit.number);
              setFloorName(`Floor ${unit.floor}`);
              if (["1BHK", "2BHK", "3BHK", "4BHK", "Shop"].includes(unit.type)) {
                setFlatType(unit.type);
              }
              setSelFloor(unit.floor);
              requestAnimationFrame(() => {
                flatNoInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                flatNoInputRef.current?.focus();
              });
            }}
            className="sticky top-6"
          />
        </div>
      </div>
    </div>
  );
}
