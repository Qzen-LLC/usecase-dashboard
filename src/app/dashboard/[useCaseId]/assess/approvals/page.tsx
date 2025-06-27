"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useParams } from "next/navigation";

const statusOptions = ["Approved", "Rejected", "Pending"];
const businessFunctions = ["Function A", "Function B", "Function C"];
const finalQualifications = [
  "Operational Enhancer",
  "Productivity Driver",
  "Revenue Acceleration",
];

export default function ApprovalsPage() {
  const params = useParams();
  const useCaseId = params.useCaseId as string;
  const [form, setForm] = useState({
    governanceName: "",
    governanceStatus: "",
    governanceComment: "",
    riskName: "",
    riskStatus: "",
    riskComment: "",
    legalName: "",
    legalStatus: "",
    legalComment: "",
    businessFunction: "",
    businessName: "",
    businessStatus: "",
    businessComment: "",
    finalQualification: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!useCaseId) return;
    setLoading(true);
    fetch(`/api/read-approvals?useCaseId=${useCaseId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) setForm(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [useCaseId]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      await fetch("/api/write-approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useCaseId, ...form }),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to save");
      setTimeout(() => setError("") , 3000);
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold mb-8 text-[#9461fd]">Approvals</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">Data saved/updated successfully!</div>}
        {/* Final Usecase Qualification */}
        <Card className="mb-6 p-6">
          <h3 className="font-semibold text-lg mb-4">Final Usecase Qualification</h3>
          <select value={form.finalQualification} onChange={e => setForm(f => ({ ...f, finalQualification: e.target.value }))} className="mb-2 border rounded px-3 py-2">
            <option value="">Select Qualification</option>
            {finalQualifications.map(opt => <option key={opt}>{opt}</option>)}
          </select>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Governance */}
          <Card className="mb-6 p-6">
            <h3 className="font-semibold text-lg mb-4">Governance</h3>
            <Input placeholder="Approver Name" value={form.governanceName} onChange={e => setForm(f => ({ ...f, governanceName: e.target.value }))} className="mb-2" />
            <select value={form.governanceStatus} onChange={e => setForm(f => ({ ...f, governanceStatus: e.target.value }))} className="mb-2 border rounded px-3 py-2">
              <option value="">Select Status</option>
              {statusOptions.map(opt => <option key={opt}>{opt}</option>)}
            </select>
            <Input placeholder="Comments" value={form.governanceComment} onChange={e => setForm(f => ({ ...f, governanceComment: e.target.value }))} />
          </Card>
          {/* Risk Management */}
          <Card className="mb-6 p-6">
            <h3 className="font-semibold text-lg mb-4">Risk Management</h3>
            <Input placeholder="Approver Name" value={form.riskName} onChange={e => setForm(f => ({ ...f, riskName: e.target.value }))} className="mb-2" />
            <select value={form.riskStatus} onChange={e => setForm(f => ({ ...f, riskStatus: e.target.value }))} className="mb-2 border rounded px-3 py-2">
              <option value="">Select Status</option>
              {statusOptions.map(opt => <option key={opt}>{opt}</option>)}
            </select>
            <Input placeholder="Comments" value={form.riskComment} onChange={e => setForm(f => ({ ...f, riskComment: e.target.value }))} />
          </Card>
          {/* Legal */}
          <Card className="mb-6 p-6">
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <Input placeholder="Approver Name" value={form.legalName} onChange={e => setForm(f => ({ ...f, legalName: e.target.value }))} className="mb-2" />
            <select value={form.legalStatus} onChange={e => setForm(f => ({ ...f, legalStatus: e.target.value }))} className="mb-2 border rounded px-3 py-2">
              <option value="">Select Status</option>
              {statusOptions.map(opt => <option key={opt}>{opt}</option>)}
            </select>
            <Input placeholder="Comments" value={form.legalComment} onChange={e => setForm(f => ({ ...f, legalComment: e.target.value }))} />
          </Card>
          {/* Business Function */}
          <Card className="mb-6 p-6">
            <h3 className="font-semibold text-lg mb-4">Business Function</h3>
            <select value={form.businessFunction} onChange={e => setForm(f => ({ ...f, businessFunction: e.target.value }))} className="mb-2 border rounded px-3 py-2">
              <option value="">Select Function</option>
              {businessFunctions.map(opt => <option key={opt}>{opt}</option>)}
            </select>
            <Input placeholder="Approver Name" value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} className="mb-2" />
            <select value={form.businessStatus} onChange={e => setForm(f => ({ ...f, businessStatus: e.target.value }))} className="mb-2 border rounded px-3 py-2">
              <option value="">Select Status</option>
              {statusOptions.map(opt => <option key={opt}>{opt}</option>)}
            </select>
            <Input placeholder="Comments" value={form.businessComment} onChange={e => setForm(f => ({ ...f, businessComment: e.target.value }))} />
          </Card>
        </div>
        <Button className="mt-6 w-full bg-gradient-to-r from-[#8f4fff] via-[#b84fff] to-[#ff4fa3] text-white px-6 py-3 rounded-xl shadow-lg font-semibold text-lg transition" onClick={handleSave} disabled={saving}>Complete Assessment</Button>
      </div>
    </div>
  );
} 