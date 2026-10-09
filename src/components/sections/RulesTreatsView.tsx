'use client';

import React from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR, formatDate } from '@/lib/utils';
import {
  Gift,
  Plus,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { motion } from 'framer-motion';

interface RulesTreatsViewProps {
  onOpenNewTreat: () => void;
}

export function RulesTreatsView({ onOpenNewTreat }: RulesTreatsViewProps) {
  const { rules, treatEvents, isManager, collectTreatPayment, pendingMemberDuesAmount } = useTRF();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-4"
    >
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Treats & Contribution Rules
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Milestone treats (gadgets, appraisals, weddings) and penalty contributions
          </p>
        </div>

        <Button
          size="sm"
          onClick={onOpenNewTreat}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Declare Treat</span>
        </Button>
      </div>

      {/* Guidelines Grid */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Contribution Guidelines
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rules.map((rule) => (
            <Card key={rule.id} className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant={rule.isMandatory ? 'default' : 'secondary'} className="text-[10px]">
                    {rule.isMandatory ? 'Mandatory' : 'Milestone Treat'}
                  </Badge>
                  <span className="text-xs font-mono font-medium text-zinc-900 dark:text-zinc-100">
                    {formatPKR(rule.suggestedAmount)}
                  </span>
                </div>
                <CardTitle className="text-sm mt-2">{rule.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {rule.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Treat Log Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-semibold">Treat Declarations</CardTitle>
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
                {isManager && <TableHead className="text-right">Collection</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {treatEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isManager ? 6 : 5} className="h-24 text-center text-xs text-zinc-500">
                    No treats declared yet.
                  </TableCell>
                </TableRow>
              ) : (
                treatEvents.map((treat) => (
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

                    {isManager && (
                      <TableCell className="text-right whitespace-nowrap">
                        {treat.status === 'pending' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => collectTreatPayment(treat.id)}
                          >
                            Mark Collected
                          </Button>
                        ) : (
                          <span className="text-xs text-zinc-400">Received ✓</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
