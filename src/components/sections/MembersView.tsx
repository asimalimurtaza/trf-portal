'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatDate } from '@/lib/utils';
import { UserPlus, Check, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const { members, isManager, updateMemberJoiningFee, activeHeadcount } = useTRF();

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
            Team & Joining Fees
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {activeHeadcount} team members • Standard joining fee: PKR 1,000 per new member
          </p>
        </div>

        {isManager && (
          <Button
            size="sm"
            onClick={onOpenAddMember}
            className="gap-1.5 self-start sm:self-auto"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add Member</span>
          </Button>
        )}
      </div>

      {/* Roster Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Birthday</TableHead>
                <TableHead>Joining Fee</TableHead>
                {isManager && <TableHead className="text-right">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const isPaid = member.joiningFeeStatus === 'paid';
                const isPending = member.joiningFeeStatus === 'pending';

                return (
                  <TableRow key={member.id}>
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
                          <div className="font-medium text-xs text-zinc-900 dark:text-zinc-100">
                            {member.name}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {member.designation}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Department */}
                    <TableCell className="text-xs text-zinc-500">
                      {member.department}
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <Badge
                        variant={member.role === 'manager' ? 'default' : 'secondary'}
                        className="text-[10px]"
                      >
                        {member.role === 'manager' ? 'Admin' : 'Member'}
                      </Badge>
                    </TableCell>

                    {/* Birthday */}
                    <TableCell className="text-xs text-zinc-500 whitespace-nowrap">
                      {formatDate(member.birthDate)}
                    </TableCell>

                    {/* Joining Fee */}
                    <TableCell>
                      {isPaid ? (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-medium">
                          <Check className="h-3.5 w-3.5 text-zinc-500" />
                          <span>Paid</span>
                        </div>
                      ) : isPending ? (
                        <Badge variant="outline" className="text-[10px] font-normal gap-1 border-dashed">
                          <Clock className="h-3 w-3 text-zinc-400" />
                          <span>Pending (1,000 PKR)</span>
                        </Badge>
                      ) : (
                        <span className="text-xs text-zinc-400">Waived</span>
                      )}
                    </TableCell>

                    {/* Action */}
                    {isManager && (
                      <TableCell className="text-right">
                        {isPending && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => updateMemberJoiningFee(member.id, 'paid')}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
