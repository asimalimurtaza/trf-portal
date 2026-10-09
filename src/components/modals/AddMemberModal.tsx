'use client';

import React, { useState } from 'react';
import { useTRF } from '@/context/TRFContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Key } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const { addMember, defaultJoiningFee } = useTRF();

  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('TRFPass2026!');
  const [role, setRole] = useState<'member' | 'manager'>('member');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('');
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [joiningFeeAmount, setJoiningFeeAmount] = useState(defaultJoiningFee.toString());
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setJoiningFeeAmount(defaultJoiningFee.toString());
    }
  }, [isOpen, defaultJoiningFee]);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pwd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !employeeId.trim()) {
      setErrorMsg('Name, Email, and Employee ID are required.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    const res = await addMember({
      employeeId: employeeId.trim(),
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      department,
      designation: designation.trim() || 'Software Engineer',
      birthDate,
      phone: phone.trim() || undefined,
      joiningFeeAmount: parseFloat(joiningFeeAmount) || 1000,
    });
    setIsSubmitting(false);

    if (res.success) {
      setName('');
      setEmployeeId('');
      setEmail('');
      setDesignation('');
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to create member.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Provision Team Member Account</DialogTitle>
          <DialogDescription>
            Admin user provisioning: sets up credentials, role permissions, and records joining fee dues
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mem-empid">Employee ID (Emp ID) *</Label>
              <Input
                id="mem-empid"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. TL-1042"
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mem-name">Full Name *</Label>
              <Input
                id="mem-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Daniyal Qureshi"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mem-email">Email Address *</Label>
            <Input
              id="mem-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="daniyal@company.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="mem-pass">Initial Password</Label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[10px] text-zinc-500 hover:text-foreground flex items-center gap-1 cursor-pointer"
                >
                  <Key className="h-2.5 w-2.5" />
                  <span>Generate</span>
                </button>
              </div>
              <Input
                id="mem-pass"
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mem-role">System Role (RBAC)</Label>
              <select
                id="mem-role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'member' | 'manager')}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="member" className="bg-background">Standard Member</option>
                <option value="manager" className="bg-background">TRF Manager (Admin)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mem-desig">Designation *</Label>
              <Input
                id="mem-desig"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Software Engineer"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mem-dept">Department</Label>
              <select
                id="mem-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Engineering" className="bg-background">Engineering</option>
                <option value="UI/UX" className="bg-background">UI/UX Design</option>
                <option value="QA & Testing" className="bg-background">QA & Testing</option>
                <option value="Product" className="bg-background">Product Management</option>
                <option value="DevOps" className="bg-background">DevOps & Cloud</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mem-bday">Birth Date *</Label>
              <Input
                id="mem-bday"
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mem-fee">Joining Fee Due (PKR)</Label>
              <Input
                id="mem-fee"
                type="number"
                min="0"
                step="any"
                value={joiningFeeAmount}
                onChange={(e) => setJoiningFeeAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mem-phone">Phone / WhatsApp</Label>
            <Input
              id="mem-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92 300 1234567"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Provisioning...' : 'Provision Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
