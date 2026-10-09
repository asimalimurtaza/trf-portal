'use client';

import React, { useState } from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR, formatDate } from '@/lib/utils';
import {
  Gift,
  Plus,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  SlidersHorizontal,
  Settings2
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MemberTreatEvent, ContributionRule } from '@/types/trf';
import { EditTreatModal } from '@/components/modals/EditTreatModal';
import { AddEditRuleModal } from '@/components/modals/AddEditRuleModal';
import { SystemRatesModal } from '@/components/modals/SystemRatesModal';
import { motion } from 'framer-motion';

interface RulesTreatsViewProps {
  onOpenNewTreat: () => void;
}

export function RulesTreatsView({ onOpenNewTreat }: RulesTreatsViewProps) {
  const {
    rules,
    treatEvents,
    currentUser,
    isManager,
    collectTreatPayment,
    deleteTreatEvent,
    pendingMemberDuesAmount,
    monthlyPerHeadRate,
    defaultJoiningFee,
  } = useTRF();

  const [editingTreat, setEditingTreat] = useState<MemberTreatEvent | null>(null);
  const [editingRule, setEditingRule] = useState<ContributionRule | null>(null);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-6"
    >
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Treats & Contribution Rules
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage contribution rules, set custom amounts, and track milestone treat declarations
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {isManager && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRatesModalOpen(true)}
                className="gap-1.5 text-xs"
                title="Configure monthly per-head rate & joining fee"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Rates & Policies</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddRuleOpen(true)}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Rule</span>
              </Button>
            </>
          )}

          <Button
            size="sm"
            onClick={onOpenNewTreat}
            className="gap-1.5"
          >
            <Gift className="h-3.5 w-3.5" />
            <span>Declare Treat</span>
          </Button>
        </div>
      </div>

      {/* Guidelines & Configured Rules Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Contribution Guidelines & Rates ({rules.length})
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Base rates: {formatPKR(monthlyPerHeadRate)}/head monthly allowance • {formatPKR(defaultJoiningFee)} default joining fee
            </p>
          </div>

          {isManager && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddRuleOpen(true)}
              className="text-xs gap-1 h-7 text-zinc-600 dark:text-zinc-400"
            >
              <Plus className="h-3 w-3" />
              <span>New Rule</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {rules.map((rule) => (
            <Card key={rule.id} className="flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={rule.isMandatory ? 'default' : 'secondary'} className="text-[10px]">
                    {rule.isMandatory ? 'Mandatory' : 'Milestone Treat'}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {formatPKR(rule.suggestedAmount)}
                  </span>
                </div>
                <CardTitle className="text-sm mt-2">{rule.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {rule.description}
                </CardDescription>
              </CardHeader>

              <CardFooter className="pt-0 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60 p-3 bg-zinc-50/50 dark:bg-zinc-900/30">
                <span className="text-[11px] text-zinc-400 font-mono">
                  {rule.isMandatory ? 'Fixed fine/fee' : 'Suggested treat'}
                </span>

                <div className="flex items-center gap-1.5">
                  {isManager && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingRule(rule)}
                      className="h-7 text-xs gap-1 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                      title="Edit rule amount and details"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit Amount</span>
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onOpenNewTreat}
                    className="h-7 text-xs gap-1"
                    title="Declare treat"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Use</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Treat Log Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-semibold">Treat Declarations & Dues</CardTitle>
            <CardDescription className="text-xs">
              Contributions declared by teammates towards the fund pool
            </CardDescription>
          </div>
          {pendingMemberDuesAmount > 0 && (
            <Badge variant="outline" className="text-xs font-mono border-dashed">
              Pending: {formatPKR(pendingMemberDuesAmount)}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Occasion</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {treatEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-xs text-zinc-500">
                    No treats declared yet. Click "Declare Treat" above to add one.
                  </TableCell>
                </TableRow>
              ) : (
                treatEvents.map((treat) => {
                  const canEdit = isManager || treat.memberId === currentUser.id;

                  return (
                    <TableRow key={treat.id}>
                      <TableCell className="font-medium text-xs text-zinc-900 dark:text-zinc-100">
                        {treat.memberName}
                      </TableCell>

                      <TableCell>
                        <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                          {treat.ruleTitle}
                        </div>
                        {treat.details && (
                          <div className="text-[11px] text-zinc-400 line-clamp-1">
                            {treat.details}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="font-mono font-medium text-xs text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        +{formatPKR(treat.amount)}
                      </TableCell>

                      <TableCell className="text-xs text-zinc-500 whitespace-nowrap">
                        {formatDate(treat.date)}
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        {treat.status === 'collected' ? (
                          <Badge variant="secondary" className="text-[10px] gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Collected</span>
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] gap-1 border-dashed">
                            <Clock className="h-3 w-3" />
                            <span>Pending</span>
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isManager && treat.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => collectTreatPayment(treat.id)}
                            >
                              Collect
                            </Button>
                          )}

                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs gap-1"
                              onClick={() => setEditingTreat(treat)}
                            >
                              <Edit2 className="h-3 w-3" />
                              <span>Edit</span>
                            </Button>
                          )}

                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-zinc-400 hover:text-red-600"
                              onClick={() => {
                                if (confirm(`Delete treat declaration for "${treat.ruleTitle}"?`)) {
                                  deleteTreatEvent(treat.id);
                                }
                              }}
                              title="Delete Treat Request"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Treat Dialog */}
      <EditTreatModal
        treat={editingTreat}
        isOpen={Boolean(editingTreat)}
        onClose={() => setEditingTreat(null)}
      />

      {/* Add / Edit Rule Modal */}
      <AddEditRuleModal
        isOpen={isAddRuleOpen || Boolean(editingRule)}
        onClose={() => {
          setIsAddRuleOpen(false);
          setEditingRule(null);
        }}
        ruleToEdit={editingRule}
      />

      {/* System Rates & Policy Modal */}
      <SystemRatesModal
        isOpen={isRatesModalOpen}
        onClose={() => setIsRatesModalOpen(false)}
      />
    </motion.div>
  );
}
