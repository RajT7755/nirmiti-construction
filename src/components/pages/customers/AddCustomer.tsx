import { useState } from "react";
import { RefreshCw, AlertCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { flatData } from "@/lib/mockData";
import type { Customer, ProjectData } from "@/lib/types";

export function AddCustomer({ projects, customers, onBack, onSave }: { projects: ProjectData[]; customers: Customer[]; onBack?: () => void; onSave?: (c: Customer) => void }) {
  const projectNames = projects.length > 0
    ? projects.map(p => p.name)
    : ["Sunrise Heights", "Green Valley", "Blue Horizon"];

  // Grid navigation
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
  const [generatedSlab, setGeneratedSlab]   = useState<{ booking10: number; received: number } | null>(null);

  // Notes
  const [notes, setNotes]         = useState("");
  const [notesSaved, setNotesSaved] = useState(false);

  // Modal
  const [modalFlat, setModalFlat] = useState<{ number: string; type: string; status: string; floor: number; occupant?: string | null } | null>(null);

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
  const getMaxFloor = (bldg: string, wing: string) => {
    if (!activePrj) return 5;
    const floors = activePrj.units.filter(u => u.number.startsWith(`${bldg}-W${wing}-`)).map(u => u.floor);
    return floors.length > 0 ? Math.max(...floors) : 5;
  };

  const buildings = getBuildings();
  const selBldg   = buildings[Math.min(selBuildingIdx, buildings.length - 1)];
  const wings     = getWings(selBldg);
  const selWing   = wings[Math.min(selWingIdx, wings.length - 1)];
  const maxFloor  = getMaxFloor(selBldg, selWing);

  // Enrich units with customer occupant data
  const gridUnits = activePrj
    ? activePrj.units
        .filter(u => u.number.startsWith(`${selBldg}-W${selWing}-`) && (selFloor === 0 || u.floor === selFloor))
        .map(u => {
          const shortNum = String(u.number).split("-").pop() ?? u.number;
          const occupant = customers.find(c => c.flat.replace(/\s/g, "") === shortNum || u.number.includes(c.flat));
          return { number: u.number, type: u.bhkType ?? "Shop", status: u.status, floor: u.floor, occupant: occupant?.name ?? null };
        })
    : flatData
        .filter(f => selFloor === 0 || Math.floor(Number(f.number) / 100) === selFloor)
        .map(f => ({ number: String(f.number), type: f.type, status: f.status, floor: Math.floor(Number(f.number) / 100), occupant: (f.customer as string | null) ?? null }));

  function flatColorClass(s: string) {
    if (s === "booked")  return "bg-green-100 text-green-700 border-green-300";
    if (s === "overdue") return "bg-red-100 text-red-600 border-red-300";
    return "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer";
  }

  function handleGenerateSlab() {
    if (!totalCalc) return;
    setGeneratedSlab({ booking10: totalCalc * 0.1, received: totalCalc * 0.1 + gstCalc });
  }

  function handleSaveNotes() {
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-5 gap-6">

        {/* ── LEFT FORM ── */}
        <div className="col-span-3 space-y-5">

          {/* Customer Unique ID */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-3">Customer Unique ID</p>
            <div className="flex gap-2">
              <input readOnly defaultValue="CMS-2026-0149"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-700 focus:outline-none" />
              <button className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                <RefreshCw size={12} /> Generate
              </button>
            </div>
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
                <input type="text" value={flatNo} onChange={e => setFlatNo(e.target.value)} placeholder="e.g. A-204"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
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
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl space-y-2">
                <p className="text-[10px] text-green-700 font-semibold uppercase tracking-widest">Generated Booking Slab</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">10% Booking Amount</span>
                  <span className="font-bold text-[#0f1a35]">₹{generatedSlab.booking10.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-green-200 pt-2">
                  <span className="font-semibold text-gray-800">Received Amount</span>
                  <span className="text-base font-bold text-green-700">₹{generatedSlab.received.toLocaleString("en-IN")}</span>
                </div>
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

          {/* Actions */}
          <div className="flex gap-3 pb-6">
            <button className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              Register Customer
            </button>
            <button className="px-6 border border-gray-200 text-gray-500 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>

        {/* ── RIGHT: Booked Flats Grid ── */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-6">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-[#0f1a35]">Booked Flats Grid</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Navigate by Building → Wing → Floor</p>
            </div>

            {/* Building / Wing / Floor selectors — text field + +/− buttons */}
            <div className="px-4 pt-3 pb-3 border-b border-gray-100 space-y-2.5 bg-gray-50/60">
              {/* Building */}
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Building</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelBuildingIdx(i => Math.max(0, i - 1))}
                    disabled={selBuildingIdx === 0}
                    className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 font-bold text-base leading-none transition-colors">−</button>
                  <input
                    type="text"
                    value={selBldg}
                    onChange={e => {
                      const idx = buildings.indexOf(e.target.value);
                      if (idx >= 0) { setSelBuildingIdx(idx); setSelWingIdx(0); setSelFloor(0); }
                    }}
                    list="building-options"
                    placeholder="Type or use +/−"
                    className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center font-semibold text-[#0f1a35] bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <datalist id="building-options">
                    {buildings.map(b => <option key={b} value={b} />)}
                  </datalist>
                  <button
                    onClick={() => { setSelBuildingIdx(i => Math.min(buildings.length - 1, i + 1)); setSelWingIdx(0); setSelFloor(0); }}
                    disabled={selBuildingIdx >= buildings.length - 1}
                    className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 font-bold text-base leading-none transition-colors">+</button>
                </div>
              </div>

              {/* Wing */}
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Wing</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelWingIdx(i => Math.max(0, i - 1))}
                    disabled={selWingIdx === 0}
                    className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 font-bold text-base leading-none transition-colors">−</button>
                  <input
                    type="text"
                    value={selWing}
                    onChange={e => {
                      const idx = wings.indexOf(e.target.value);
                      if (idx >= 0) { setSelWingIdx(idx); setSelFloor(0); }
                    }}
                    list="wing-options"
                    placeholder="Type or use +/−"
                    className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center font-semibold text-[#0f1a35] bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <datalist id="wing-options">
                    {wings.map(w => <option key={w} value={w} />)}
                  </datalist>
                  <button
                    onClick={() => { setSelWingIdx(i => Math.min(wings.length - 1, i + 1)); setSelFloor(0); }}
                    disabled={selWingIdx >= wings.length - 1}
                    className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 font-bold text-base leading-none transition-colors">+</button>
                </div>
              </div>

              {/* Floor */}
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Floor</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelFloor(f => Math.max(0, f - 1))}
                    disabled={selFloor === 0}
                    className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 font-bold text-base leading-none transition-colors">−</button>
                  <input
                    type="text"
                    value={selFloor === 0 ? "" : String(selFloor)}
                    onChange={e => {
                      const val = e.target.value.trim();
                      if (val === "" || val === "0") { setSelFloor(0); return; }
                      const n = parseInt(val, 10);
                      if (!isNaN(n) && n >= 1 && n <= maxFloor) setSelFloor(n);
                    }}
                    placeholder="All floors"
                    className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center font-semibold text-[#0f1a35] bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <button
                    onClick={() => setSelFloor(f => Math.min(maxFloor, f + 1))}
                    disabled={selFloor >= maxFloor}
                    className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 font-bold text-base leading-none transition-colors">+</button>
                </div>
              </div>
            </div>

            {/* Clickable Floor Tabs */}
            {(() => {
              const availFloors: number[] = activePrj
                ? Array.from(new Set(
                    activePrj.units
                      .filter(u => u.number.startsWith(`${selBldg}-W${selWing}-`))
                      .map(u => u.floor)
                  )).sort((a, b) => a - b)
                : Array.from({ length: Math.max(maxFloor, 1) }, (_, i) => i + 1);
              return availFloors.length > 0 ? (
                <div className="flex gap-1.5 px-3 py-2 border-b border-gray-100 overflow-x-auto bg-white">
                  <button
                    onClick={() => setSelFloor(0)}
                    className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                      selFloor === 0 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                    }`}>All</button>
                  {availFloors.map(f => (
                    <button key={f}
                      onClick={() => setSelFloor(f)}
                      className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        selFloor === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                      }`}>F{f}</button>
                  ))}
                </div>
              ) : null;
            })()}

            {/* Legend */}
            <div className="flex gap-3 px-4 py-2 border-b border-gray-100 bg-gray-50 flex-wrap">
              {[
                { cls: "bg-green-100 border-green-300",  label: "Fully Booked / Paid" },
                { cls: "bg-red-100 border-red-300",      label: "Hold / No Payment"   },
                { cls: "bg-white border-gray-200",       label: "Available"            },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded border ${l.cls}`} />
                  <span className="text-[9px] text-gray-500">{l.label}</span>
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="p-3 grid grid-cols-4 gap-1.5 max-h-[380px] overflow-y-auto">
              {gridUnits.length === 0 && (
                <div className="col-span-4 text-center py-10 text-sm text-gray-400">No units for this selection.</div>
              )}
              {gridUnits.map((flat, idx) => (
                <button key={`${flat.number}-${idx}`}
                  onClick={() => setModalFlat({ number: flat.number, type: flat.type, status: flat.status, floor: flat.floor, occupant: flat.occupant })}
                  title={flat.occupant ? `${flat.occupant} · ${flat.status}` : flat.status}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg border text-[10px] font-semibold transition-all ${flatColorClass(flat.status)}`}>
                  <span className="text-[8px] opacity-60">F{flat.floor}</span>
                  <span>{String(flat.number).split("-").pop()}</span>
                  {flat.occupant
                    ? <span className="text-[7px] font-normal opacity-80 truncate w-full text-center px-0.5">{flat.occupant.split(" ")[0]}</span>
                    : <span className="text-[8px] font-normal opacity-60">{flat.type}</span>
                  }
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Flat detail modal */}
      {modalFlat && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setModalFlat(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-72 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-[#0f1a35]">Unit {String(modalFlat.number).split("-").pop()}</h3>
              <button onClick={() => setModalFlat(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X size={15} /></button>
            </div>
            <div className="space-y-3">
              {[
                { k: "Full No.", v: modalFlat.number },
                { k: "Type",    v: modalFlat.type    },
                { k: "Floor",   v: `Floor ${modalFlat.floor}` },
                ...(modalFlat.occupant ? [{ k: "Customer", v: modalFlat.occupant }] : []),
                { k: "Status",  v: null },
              ].map(row => (
                <div key={row.k} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                  <span className="text-gray-400">{row.k}</span>
                  {row.v ? <span className="font-semibold text-gray-800">{row.v}</span> : <Badge status={modalFlat.status} />}
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              {modalFlat.status === "available"
                ? <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">Book This Unit</button>
                : <button className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">View Details</button>
              }
              <button onClick={() => setModalFlat(null)} className="px-4 border border-gray-200 text-gray-500 py-2 rounded-lg text-sm hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
