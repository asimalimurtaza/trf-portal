'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTRF } from '@/context/TRFContext';
import { AuditClaim, UserProfile } from '@/types/trf';
import { numberToWordsPKR, formatDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Printer, Download, Settings2, Check, UserCheck, ChevronDown, ChevronUp } from 'lucide-react';

interface ClaimFormPDFModalProps {
  claim: AuditClaim | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ClaimFormPDFModal({ claim, isOpen, onClose }: ClaimFormPDFModalProps) {
  const { members, activeHeadcount } = useTRF();
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Form custom state (defaulted to standard Vicenna TRF parameters)
  const [teamLeadName, setTeamLeadName] = useState('Taiba Sarfraz');
  const [projectName, setProjectName] = useState('HMIS / Almus Net');
  const [monthOf, setMonthOf] = useState('');
  const [claimDate, setClaimDate] = useState('');
  const [vendorName, setVendorName] = useState('TRF CLAIM');
  const [billNo, setBillNo] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [transferRecipientId, setTransferRecipientId] = useState<string>('');
  const [transferNoteText, setTransferNoteText] = useState('Please transfer TRF Amount in this account');
  const [showConfig, setShowConfig] = useState(false);

  // Populate data whenever claim changes
  useEffect(() => {
    if (claim) {
      setMonthOf(claim.monthYear || 'September 2026');
      setBillNo(claim.claimRefNumber || 'TRF-AUD-2026-09');
      setTotalAmount(claim.totalAmount || 0);
      
      const d = claim.submissionDate ? new Date(claim.submissionDate) : new Date();
      const formattedDate = !isNaN(d.getTime())
        ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
        : new Date().toLocaleDateString('en-GB');
      setClaimDate(formattedDate);

      // Default transfer recipient to an active manager or member (e.g., Muhammad Obaid Ali or first member)
      const defaultRecipient = members.find(
        (m) => m.name.toLowerCase().includes('obaid') || m.role === 'manager'
      );
      if (defaultRecipient) {
        setTransferRecipientId(defaultRecipient.id);
      } else if (members.length > 0) {
        setTransferRecipientId(members[0].id);
      }
    }
  }, [claim, members]);

  if (!claim) return null;

  // Active members list for the form
  const activeMembers = members.filter((m) => m.isActive);
  const displayCount = Math.max(activeMembers.length, claim.headcount || activeHeadcount || 10);
  
  // Create 10 numbered slots (or more if displayCount > 10)
  const totalSlots = Math.max(10, activeMembers.length);
  const rows = Array.from({ length: totalSlots }, (_, idx) => {
    const member = activeMembers[idx];
    return {
      index: idx + 1,
      member: member || null,
    };
  });

  const amountInWords = numberToWordsPKR(totalAmount);

  const handlePrint = () => {
    const printEl = printAreaRef.current;
    if (!printEl) {
      window.print();
      return;
    }

    // Create an isolated printing iframe with real dimensions (opacity 0) so the browser engine calculates full layout
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.style.zIndex = '-9999';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const headStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML)
      .join('\n');

    const htmlContent = printEl.outerHTML;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>TRF Claim Form - ${claim.monthYear}</title>
          ${headStyles}
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
              width: 100% !important;
              height: auto !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            #printable-trf-claim-form {
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
              width: 100% !important;
              max-width: 100% !important;
              background: #ffffff !important;
              color: #000000 !important;
            }
            #printable-trf-claim-form * {
              visibility: visible !important;
              opacity: 1 !important;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `);
    doc.close();

    const triggerPrint = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 3000);
      }, 350);
    };

    const img = iframe.contentDocument?.querySelector('img');
    if (img && !img.complete) {
      img.onload = triggerPrint;
      img.onerror = triggerPrint;
    } else {
      triggerPrint();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 print:p-0 print:max-w-none print:max-h-none print:shadow-none print:border-none print:overflow-visible">
        {/* Modal Controls Header (Hidden during print) */}
        <div className="print:hidden space-y-3 pb-3 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight">
                TRF Claim Form (Official Voucher)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Pixel-perfect Vicenna accounts reimbursement template auto-filled from Audit Claim
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfig(!showConfig)}
                className="gap-1.5 text-xs h-8"
              >
                <Settings2 className="h-3.5 w-3.5" />
                <span>{showConfig ? 'Hide Settings' : 'Customize Form'}</span>
                {showConfig ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>

              <Button
                size="sm"
                onClick={handlePrint}
                className="gap-1.5 text-xs h-8 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print / Save as PDF</span>
              </Button>
            </div>
          </div>

          {/* Quick Adjust Settings Drawer */}
          {showConfig && (
            <div className="p-3.5 rounded-lg border border-border bg-muted/30 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-in fade-in-50">
              <div className="space-y-1">
                <Label htmlFor="lead-name" className="text-[11px] font-medium">Team Lead Name</Label>
                <Input
                  id="lead-name"
                  value={teamLeadName}
                  onChange={(e) => setTeamLeadName(e.target.value)}
                  className="h-7 text-xs bg-background"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="proj-name" className="text-[11px] font-medium">Project Name</Label>
                <Input
                  id="proj-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="h-7 text-xs bg-background"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="month-of" className="text-[11px] font-medium">For The Month of</Label>
                <Input
                  id="month-of"
                  value={monthOf}
                  onChange={(e) => setMonthOf(e.target.value)}
                  className="h-7 text-xs bg-background"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="claim-date" className="text-[11px] font-medium">Date</Label>
                <Input
                  id="claim-date"
                  value={claimDate}
                  onChange={(e) => setClaimDate(e.target.value)}
                  className="h-7 text-xs bg-background"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="bill-no" className="text-[11px] font-medium">Bill No. / Ref</Label>
                <Input
                  id="bill-no"
                  value={billNo}
                  onChange={(e) => setBillNo(e.target.value)}
                  className="h-7 text-xs bg-background"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="transfer-recipient" className="text-[11px] font-medium">Transfer Account Beneficiary</Label>
                <select
                  id="transfer-recipient"
                  value={transferRecipientId}
                  onChange={(e) => setTransferRecipientId(e.target.value)}
                  className="w-full h-7 rounded-md border border-input bg-background px-2 py-0 text-xs shadow-xs focus-visible:outline-none"
                >
                  {activeMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.employeeId ? `(${m.employeeId})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            PRINTABLE SHEET: EXACT A4 DOCUMENT MATCHING VICENNA TRF CLAIM FORM
           ========================================================================= */}
        <div className="overflow-x-auto py-2 flex justify-center bg-zinc-100 dark:bg-zinc-950/60 p-2 sm:p-4 rounded-lg print:p-0 print:bg-white print:overflow-visible">
          <div
            id="printable-trf-claim-form"
            ref={printAreaRef}
            className="w-full max-w-[210mm] bg-white text-zinc-900 shadow-md print:shadow-none p-8 sm:p-12 print:p-0 font-sans text-xs leading-normal border border-zinc-200 print:border-none"
            style={{ color: '#000000', backgroundColor: '#ffffff' }}
          >
            {/* Header: Title & Vicenna Logo */}
            <div className="flex items-center justify-between mb-6 pb-2">
              <h1 className="text-2xl font-bold tracking-tight text-black">
                TRF Claim Form
              </h1>

              {/* Vicenna Brand Logo */}
              <div className="text-right flex items-center justify-end">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/vicenna-logo.png"
                  alt="Vicenna"
                  className="h-10 sm:h-11 w-auto object-contain"
                />
              </div>
            </div>

            {/* Top 2x2 Metadata Table */}
            <div className="border border-zinc-400 mb-4">
              <div className="grid grid-cols-2 divide-x divide-zinc-400 border-b border-zinc-400">
                {/* Team Lead Name */}
                <div className="p-2.5 min-h-[52px] flex flex-col justify-between">
                  <div className="font-medium text-[13px] text-black">
                    {teamLeadName}
                  </div>
                  <div className="text-[11px] text-zinc-700 border-t border-zinc-400 pt-1 mt-1">
                    Team Lead Name:
                  </div>
                </div>

                {/* Project Name */}
                <div className="p-2.5 min-h-[52px] flex flex-col justify-between">
                  <div className="font-medium text-[13px] text-black">
                    {projectName}
                  </div>
                  <div className="text-[11px] text-zinc-700 border-t border-zinc-400 pt-1 mt-1">
                    Project Name:
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-zinc-400">
                {/* For The Month of */}
                <div className="p-2.5 min-h-[52px] flex flex-col justify-between">
                  <div className="font-medium text-[13px] text-black">
                    {monthOf}
                  </div>
                  <div className="text-[11px] text-zinc-700 border-t border-zinc-400 pt-1 mt-1">
                    For The Month of:
                  </div>
                </div>

                {/* Date */}
                <div className="p-2.5 min-h-[52px] flex flex-col justify-between">
                  <div className="font-medium text-[13px] text-black">
                    {claimDate}
                  </div>
                  <div className="text-[11px] text-zinc-700 border-t border-zinc-400 pt-1 mt-1">
                    Date:
                  </div>
                </div>
              </div>
            </div>

            {/* Names of Team Members Section */}
            <div className="border border-zinc-400 mb-6">
              <div className="px-3 py-1.5 font-bold text-[12px] border-b border-zinc-400 bg-zinc-50 print:bg-white text-black">
                Names of Team Members
              </div>

              <div className="divide-y divide-zinc-300">
                {rows.map(({ index, member }) => {
                  const isRecipient = member && member.id === transferRecipientId;
                  const empTag = member?.employeeId ? ` (${member.employeeId})` : '';
                  const lineText = member
                    ? `${member.name}${empTag}${isRecipient ? ` (${transferNoteText})` : ''}`
                    : '';

                  return (
                    <div
                      key={index}
                      className="px-3 py-1 flex items-center min-h-[22px] text-[11px] text-black font-normal"
                    >
                      <span className="w-6 shrink-0">{index}.</span>
                      <span className="truncate">{lineText}</span>
                    </div>
                  );
                })}
              </div>

              {/* Total Team Members Row */}
              <div className="grid grid-cols-3 border-t border-zinc-400 text-[11px] font-bold">
                <div className="p-2 border-r border-zinc-400 text-black">
                  Total Team Members:
                </div>
                <div className="p-2 border-r border-zinc-400 text-black text-center font-bold">
                  {displayCount}
                </div>
                <div className="p-2"></div>
              </div>
            </div>

            {/* Expenses Section */}
            <div className="mb-6">
              <div className="font-bold text-[13px] text-black mb-1.5">
                Expenses:
              </div>

              <div className="border border-zinc-400">
                {/* Table Header */}
                <div className="grid grid-cols-12 divide-x divide-zinc-400 border-b border-zinc-400 text-[11px] font-bold text-center bg-zinc-50 print:bg-white text-black">
                  <div className="col-span-1 p-1.5">#</div>
                  <div className="col-span-3 p-1.5">Bill No.</div>
                  <div className="col-span-2 p-1.5">Date</div>
                  <div className="col-span-3 p-1.5">Vendor</div>
                  <div className="col-span-3 p-1.5">Amount (Rs)</div>
                </div>

                {/* Item Row 1 */}
                <div className="grid grid-cols-12 divide-x divide-zinc-400 border-b border-zinc-400 text-[11px] text-center text-black">
                  <div className="col-span-1 p-2">1</div>
                  <div className="col-span-3 p-2 font-mono text-[11px]">{billNo}</div>
                  <div className="col-span-2 p-2">{claimDate}</div>
                  <div className="col-span-3 p-2 font-medium">{vendorName}</div>
                  <div className="col-span-3 p-2 font-medium font-mono">{totalAmount.toLocaleString()}</div>
                </div>

                {/* Total Row */}
                <div className="grid grid-cols-12 divide-x divide-zinc-400 text-[11px] font-bold text-black">
                  <div className="col-span-9 p-2 text-center uppercase tracking-wide">
                    Total
                  </div>
                  <div className="col-span-3 p-2 text-center font-mono font-bold">
                    {totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Total Amount in Words */}
            <div className="mb-8">
              <div className="border-b border-zinc-400 pb-1 text-[12px] font-medium text-black capitalize">
                {amountInWords}
              </div>
              <div className="text-[11px] text-zinc-700 pt-1">
                Total Amount in Words
              </div>
            </div>

            {/* Signatures & Verification Section */}
            <div className="border border-zinc-400 text-[11px]">
              {/* Row 1: Team Lead Sign & Verification */}
              <div className="grid grid-cols-2 divide-x divide-zinc-400 border-b border-zinc-400">
                <div className="p-3 min-h-[65px] flex items-end justify-between">
                  <span className="text-zinc-800">Signature of Team Lead :</span>
                  <span className="text-zinc-800">Date: ____________</span>
                </div>
                <div className="p-3 min-h-[65px] flex items-end">
                  <span className="text-zinc-800">Verification: ________________________________</span>
                </div>
              </div>

              {/* Row 2: Amount Received & Received By */}
              <div className="grid grid-cols-2 divide-x divide-zinc-400">
                <div className="p-3 min-h-[50px] flex items-end">
                  <span className="text-zinc-800">Amount Received: ___________________________</span>
                </div>
                <div className="p-3 min-h-[50px] flex items-end">
                  <span className="text-zinc-800">Received By: ________________________________</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
