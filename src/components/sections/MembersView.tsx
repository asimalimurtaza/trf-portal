'use client';

import React, { useState } from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatDate } from '@/lib/utils';
import { UserPlus, Check, Clock, Search, ShieldCheck, User, ShieldAlert, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { motion } from 'framer-motion';

interface MembersViewProps {
  onOpenAddMember: () => void;
}

export function MembersView({ onOpenAddMember }: MembersViewProps) {
  const {
    members,
    transactions,
    currentUser,
    isManager,
    updateMemberJoiningFee,
    updateUserRole,
    toggleUserActive,
    deleteMember,
    activeHeadcount,
  } = useTRF();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'manager' | 'member' | 'pending_dues'>('all');

  const filteredMembers = members.filter((m) => {
    if (roleFilter === 'manager' && m.role !== 'manager') return false;
    if (roleFilter === 'member' && m.role !== 'member') return false;
    if (roleFilter === 'pending_dues' && m.joiningFeeStatus !== 'pending') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Team & User Management
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {activeHeadcount} active members • {isManager ? 'Manager access: provision users, assign RBAC roles, track dues' : 'Team roster and contact directory'}
          </p>
        </div>

        {isManager && (
          <Button
            size="sm"
            onClick={onOpenAddMember}
            className="gap-1.5 self-start sm:self-auto"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Provision User</span>
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, department..."
            className="pl-9 h-8 text-xs"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant={roleFilter === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setRoleFilter('all')}
            className="h-8 text-xs"
          >
            All ({members.length})
          </Button>
          <Button
            variant={roleFilter === 'manager' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setRoleFilter('manager')}
            className="h-8 text-xs"
          >
            Managers
          </Button>
          <Button
            variant={roleFilter === 'member' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setRoleFilter('member')}
            className="h-8 text-xs"
          >
            Members
          </Button>
          <Button
            variant={roleFilter === 'pending_dues' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setRoleFilter('pending_dues')}
            className="h-8 text-xs"
          >
            Pending Dues
          </Button>
        </div>
      </div>

      {/* Roster & User Management Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Profile</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>RBAC Role</TableHead>
                <TableHead>Birthday</TableHead>
                <TableHead>Joining Fee (PKR 1,000)</TableHead>
                {isManager && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isManager ? 6 : 5} className="h-24 text-center text-xs text-zinc-500">
                    No matching users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => {
                  const hasJoiningTx = transactions.some(
                    (t) =>
                      t.category === 'joining_fee' &&
                      (t.relatedMemberId === member.id ||
                        t.title.toLowerCase().includes(member.name.toLowerCase()))
                  );
                  const effectiveJoiningStatus = hasJoiningTx ? 'paid' : member.joiningFeeStatus;
                  const isPaid = effectiveJoiningStatus === 'paid';
                  const isPending = effectiveJoiningStatus === 'pending';
                  const isCurrentUser = member.id === currentUser.id;

                  return (
                    <TableRow key={member.id} className={!member.isActive ? 'opacity-50' : ''}>
                      {/* Member */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatarUrl} alt={member.name} />
                            <AvatarFallback className="text-[10px] uppercase">
                              {member.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                              <span>{member.name}</span>
                              {isCurrentUser && (
                                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                                  You
                                </Badge>
                              )}
                              {!member.isActive && (
                                <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400">
                              {member.email} • {member.designation}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Department */}
                      <TableCell className="text-xs text-zinc-500">
                        {member.department}
                      </TableCell>

                      {/* RBAC Role */}
                      <TableCell>
                        {isManager && !isCurrentUser ? (
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant={member.role === 'manager' ? 'default' : 'secondary'}
                              className="text-[10px]"
                            >
                              {member.role === 'manager' ? 'Admin' : 'Member'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-1.5 text-[10px] text-zinc-500 hover:text-foreground"
                              onClick={() =>
                                updateUserRole(
                                  member.id,
                                  member.role === 'manager' ? 'member' : 'manager'
                                )
                              }
                              title={`Change role to ${member.role === 'manager' ? 'Member' : 'Admin'}`}
                            >
                              Change Role
                            </Button>
                          </div>
                        ) : (
                          <Badge
                            variant={member.role === 'manager' ? 'default' : 'secondary'}
                            className="text-[10px]"
                          >
                            {member.role === 'manager' ? 'Admin' : 'Member'}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Birthday */}
                      <TableCell className="text-xs text-zinc-500 whitespace-nowrap">
                        {formatDate(member.birthDate)}
                      </TableCell>

                      {/* Joining Fee */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isManager ? (
                            <select
                              value={effectiveJoiningStatus}
                              onChange={(e) =>
                                updateMemberJoiningFee(
                                  member.id,
                                  e.target.value as 'paid' | 'pending' | 'waived'
                                )
                              }
                              className={`h-6 text-[11px] rounded border px-1.5 bg-transparent cursor-pointer ${
                                isPaid
                                  ? 'border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold'
                                  : isPending
                                  ? 'border-dashed border-amber-400 dark:border-amber-600 text-amber-600 dark:text-amber-400 font-medium'
                                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
                              }`}
                              title="Update member joining fee payment status"
                            >
                              <option value="paid" className="bg-background text-foreground">Paid</option>
                              <option value="pending" className="bg-background text-foreground">Pending</option>
                              <option value="waived" className="bg-background text-foreground">Waived</option>
                            </select>
                          ) : (
                            <div>
                              {isPaid ? (
                                <div className="flex items-center gap-1 text-xs text-zinc-900 dark:text-zinc-100 font-medium">
                                  <Check className="h-3.5 w-3.5 text-zinc-500" />
                                  <span>Paid</span>
                                </div>
                              ) : isPending ? (
                                <Badge variant="outline" className="text-[10px] font-normal gap-1 border-dashed text-amber-600 dark:text-amber-400">
                                  <Clock className="h-3 w-3" />
                                  <span>Pending</span>
                                </Badge>
                              ) : (
                                <span className="text-xs text-zinc-400">Waived</span>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Actions (Manager only) */}
                      {isManager && (
                        <TableCell className="text-right whitespace-nowrap">
                          {!isCurrentUser && (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => toggleUserActive(member.id)}
                              >
                                {member.isActive ? 'Deactivate' : 'Activate'}
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-zinc-400 hover:text-red-600"
                                onClick={() => {
                                  if (confirm(`Remove ${member.name} from team portal?`)) {
                                    deleteMember(member.id);
                                  }
                                }}
                                title="Delete user"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
