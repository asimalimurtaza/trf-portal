'use client';

import React from 'react';
import { StatCards } from '@/components/dashboard/StatCards';
import { NavTab } from '@/components/layout/Sidebar';
import { useTRF } from '@/context/TRFContext';
import { formatPKR, formatDate } from '@/lib/utils';
import { 
  ArrowRight, 
  ArrowUpRight, 
  ArrowDownRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCurrentDate } from '@/hooks/useCurrentDate';
import { getBirthdayCountdown } from '@/lib/utils';
import { motion } from 'framer-motion';

interface OverviewViewProps {
  onNavigateTab: (tab: NavTab) => void;
  onOpenNewTransaction: () => void;
  onOpenNewClaim: () => void;
  onOpenNewTreat: () => void;
}

export function OverviewView({
  onNavigateTab,
  onOpenNewTransaction,
  onOpenNewClaim,
  onOpenNewTreat,
}: OverviewViewProps) {
  const { 
    claims, 
    transactions, 
    members, 
    venues, 
    treatEvents, 
    isManager, 
    updateClaimStatus,
    triggerCelebration 
  } = useTRF();

  const currentDate = useCurrentDate();
  const latestClaim = claims[0];
  const recentTransactions = transactions.slice(0, 5);

  const sortedMembers = [...members]
    .map((m) => ({ member: m, countdown: getBirthdayCountdown(m.birthDate, currentDate) }))
    .sort((a, b) => a.countdown.daysLeft - b.countdown.daysLeft);
  const nextBirthday = sortedMembers[0];
  const topVenue = [...venues].sort((a, b) => b.votes.length - a.votes.length)[0];
  const latestTreat = treatEvents[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Overview of team funds pool and monthly audit claims
          </p>
        </div>
      </div>

      {/* 3 Core Metric Cards */}
      <StatCards />

      {/* Active Monthly Audit Claim Status Banner */}
      {latestClaim && (
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {latestClaim.monthYear} Claim: {formatPKR(latestClaim.totalAmount)}
                </span>
                <Badge variant={latestClaim.status === 'approved_disbursed' ? 'default' : 'secondary'} className="text-[10px]">
                  {latestClaim.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {latestClaim.headcount} active heads (@ 1,400 PKR) • Voucher {latestClaim.claimRefNumber || 'TRF-AUD'}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {isManager && latestClaim.status === 'submitted' && (
                <Button
                  size="sm"
                  onClick={() => updateClaimStatus(latestClaim.id, 'approved_disbursed')}
                >
                  Mark Disbursed
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('audit-claims')}
                className="gap-1 text-xs"
              >
                <span>Claims</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Grid: Recent Activity & Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Ledger Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">Recent Transactions</CardTitle>
              <Button
                variant="link"
                size="sm"
                onClick={() => onNavigateTab('ledger')}
                className="h-auto p-0 text-xs"
              >
                View all
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((tx) => {
                    const isInflow = tx.type === 'inflow';
                    return (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="font-medium text-xs text-zinc-900 dark:text-zinc-100">
                            {tx.title}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {tx.loggedBy}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-500 whitespace-nowrap">
                          {formatDate(tx.date)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium text-xs whitespace-nowrap">
                          <span className={isInflow ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'}>
                            {isInflow ? '+' : '-'}{formatPKR(tx.amount)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col): Focused Quick Highlights */}
        <div className="space-y-4">
          {/* Next Birthday */}
          {nextBirthday && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-zinc-500">Upcoming Birthday</CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  {nextBirthday.countdown.isToday ? 'Today' : `In ${nextBirthday.countdown.daysLeft}d`}
                </Badge>
              </CardHeader>
              <CardContent className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-sm font-semibold">{nextBirthday.member.name}</div>
                  <div className="text-xs text-zinc-500">{nextBirthday.member.designation}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerCelebration}
                  className="text-xs"
                >
                  Celebrate
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Top Voted Venue */}
          {topVenue && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-zinc-500">Top Voted Place</CardTitle>
                <Badge variant="secondary" className="text-[10px]">
                  {topVenue.votes.length} Votes
                </Badge>
              </CardHeader>
              <CardContent className="pt-1">
                <div className="text-sm font-semibold">{topVenue.name}</div>
                <div className="text-xs text-zinc-500 mt-0.5 font-mono">
                  ~{formatPKR(topVenue.estimatedCostPerHead)} / head
                </div>
              </CardContent>
            </Card>
          )}

          {/* Latest Milestone Treat */}
          {latestTreat && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-zinc-500">Latest Treat</CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {formatPKR(latestTreat.amount)}
                </Badge>
              </CardHeader>
              <CardContent className="pt-1">
                <div className="text-sm font-semibold">{latestTreat.memberName}</div>
                <div className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{latestTreat.ruleTitle}</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
