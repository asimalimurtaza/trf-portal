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

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const { addMember } = useTRF();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'member' | 'manager'>('member');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('');
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [joiningFeeAmount, setJoiningFeeAmount] = useState('1000');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    addMember({
      name: name.trim(),
      email: email.trim(),
      role,
      department,
      designation: designation.trim() || 'Software Engineer',
      birthDate,
      phone: phone.trim() || undefined,
      joiningFeeAmount: parseFloat(joiningFeeAmount) || 1000,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Register member profile and record required joining fee dues
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
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
              <Label htmlFor="mem-fee">Joining Fee (PKR)</Label>
              <Input
                id="mem-fee"
                type="number"
                value={joiningFeeAmount}
                onChange={(e) => setJoiningFeeAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mem-role">System Role</Label>
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
            <div className="space-y-1.5">
              <Label htmlFor="mem-phone">Phone / WhatsApp</Label>
              <Input
                id="mem-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Register Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
