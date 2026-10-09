'use client';

import React, { useState, useEffect } from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR, formatDate } from '@/lib/utils';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ShieldCheck, User, Check, Clock } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { currentUser, isManager, updateProfile, treatEvents } = useTRF();

  const [employeeId, setEmployeeId] = useState(currentUser.employeeId || '');
  const [name, setName] = useState(currentUser.name);
  const [designation, setDesignation] = useState(currentUser.designation);
  const [department, setDepartment] = useState(currentUser.department);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [birthDate, setBirthDate] = useState(currentUser.birthDate || '2000-01-01');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmployeeId(currentUser.employeeId || '');
      setName(currentUser.name);
      setDesignation(currentUser.designation);
      setDepartment(currentUser.department);
      setPhone(currentUser.phone || '');
      setBirthDate(currentUser.birthDate || '2000-01-01');
      setAvatarUrl(currentUser.avatarUrl || '');
      setIsSaved(false);
    }
  }, [isOpen, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(currentUser.id, {
      employeeId: employeeId.trim() || undefined,
      name: name.trim(),
      designation: designation.trim(),
      department: department.trim(),
      phone: phone.trim() || undefined,
      birthDate,
      avatarUrl: avatarUrl.trim() || undefined,
    });
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  // Personal treat count
  const myTreats = treatEvents.filter((t) => t.memberId === currentUser.id);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>
            Manage your personal profile, employee ID, contact information, and view membership dues
          </DialogDescription>
        </DialogHeader>

        {/* Account Overview Header */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/40">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={avatarUrl || currentUser.avatarUrl} alt={name} />
              <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">{currentUser.name}</span>
                {currentUser.employeeId && (
                  <span className="font-mono text-[10px] bg-background text-foreground px-1.5 py-0.5 rounded border border-border">
                    {currentUser.employeeId}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground">{currentUser.email}</div>
            </div>
          </div>

          <Badge variant={isManager ? 'default' : 'secondary'} className="text-[10px] gap-1">
            {isManager ? (
              <>
                <ShieldCheck className="h-3 w-3" />
                <span>TRF Manager</span>
              </>
            ) : (
              <>
                <User className="h-3 w-3" />
                <span>Team Member</span>
              </>
            )}
          </Badge>
        </div>

        {/* Dues & TRF Status Summary */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg border border-border bg-muted/20">
            <div className="text-[10px] text-muted-foreground">Joining Fee Status</div>
            <div className="mt-1 flex items-center gap-1.5 font-medium">
              {currentUser.joiningFeeStatus === 'paid' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
                  <span>Paid ({formatPKR(currentUser.joiningFeeAmount)})</span>
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Pending ({formatPKR(currentUser.joiningFeeAmount)})</span>
                </>
              )}
            </div>
          </div>

          <div className="p-2.5 rounded-lg border border-border bg-muted/20">
            <div className="text-[10px] text-muted-foreground">Declared Treats</div>
            <div className="mt-1 font-mono font-medium">
              {myTreats.length} {myTreats.length === 1 ? 'Event' : 'Events'}
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prof-empid">Employee ID (Emp ID) *</Label>
              <Input
                id="prof-empid"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. TL-1001"
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prof-name">Full Name</Label>
              <Input
                id="prof-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prof-dept">Department</Label>
              <Input
                id="prof-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prof-desig">Designation</Label>
              <Input
                id="prof-desig"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prof-bday">Birth Date</Label>
              <Input
                id="prof-bday"
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prof-phone">Phone / WhatsApp</Label>
              <Input
                id="prof-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prof-avatar">Avatar Photo URL</Label>
            <Input
              id="prof-avatar"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isSaved ? 'Saved ✓' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
