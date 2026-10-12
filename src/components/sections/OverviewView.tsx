'use client';

import React from 'react';
import { StatCards } from '@/components/dashboard/StatCards';
import { NavTab } from '@/components/layout/Sidebar';
import { useTRF } from '@/context/TRFContext';
import { useModals } from '@/context/ModalContext';
import { formatPKR, formatDate } from '@/lib/utils';
import { 
  ArrowRight, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  CheckCircle2,
  AlertTriangle
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
    currentUser,
    claims, 
    transactions, 
    members, 
    venues, 
    treatEvents, 
    isManager, 
    updateClaimStatus,
    collectTreatPayment,
    triggerCelebration 
  } = useTRF();
  const { openSendBirthdayWishModal } = useModals();

  const currentDate = useCurrentDate();
  const latestClaim = claims[0];
  const recentTransactions = transactions.slice(0, 5);

  const sortedMembers = [...members]
    .map((m) => ({ member: m, countdown: getBirthdayCountdown(m.birthDate, currentDate) }))
    .sort((a, b) => a.countdown.daysLeft - b.countdown.daysLeft);
  const nextBirthday = sortedMembers[0];
  const topVenue = [...venues].sort((a, b) => b.votes.length - a.votes.length)[0];
  const latestTreat = treatEvents[0];

  // Current user's pending payments & dues
  const myPendingJoining = currentUser.joiningFeeStatus === 'pending' ? (currentUser.joiningFeeAmount || 1000) : 0;
  const myTreats = treatEvents.filter(
    (t) => t.memberId === currentUser.id || (currentUser.name && t.memberName.toLowerCase() === currentUser.name.toLowerCase())
  );
  const myPendingTreats = myTreats.filter((t) => t.status === 'pending');
  const myPendingTreatAmount = myPendingTreats.reduce((sum, t) => sum + (t.amount || 0), 0);
  const myTotalPending = myPendingJoining + myPendingTreatAmount;

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
                {latestClaim.headcount} active heads (@ {formatPKR(latestClaim.ratePerHead || 1400)}) • Voucher {latestClaim.claimRefNumber || 'TRF-AUD'}
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

      {/* Dedicated Section: Logged-in User's Pending Payments & Dues */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${myTotalPending > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'}`}>
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                My Pending Payments & Dues
              </CardTitle>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Outstanding contributions, outing shares & membership dues for {currentUser.name}
              </p>
            </div>
          </div>
          {myTotalPending > 0 ? (
            <Badge variant="outline" className="text-xs font-mono font-semibold bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800">
              Total Due: {formatPKR(myTotalPending)}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs font-medium bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>All Settled</span>
            </Badge>
          )}
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-1">
          {myTotalPending > 0 ? (
            <div className="space-y-3 mt-1">
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800 bg-muted/20">
                {myPendingJoining > 0 && (
                  <div className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <span>TRF Membership Joining Fee</span>
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">Joining Fee</Badge>
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        One-time entry contribution to team recreational fund
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                        {formatPKR(myPendingJoining)}
                      </div>
                      <span className="text-[10px] text-zinc-400">Pending</span>
                    </div>
                  </div>
                )}
                {myPendingTreats.map((treat) => {
                  const isOutingShare = treat.ruleTitle.toLowerCase().includes('outing');
                  return (
                    <div key={treat.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                          <span>{treat.ruleTitle}</span>
                          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${isOutingShare ? 'border-amber-400 text-amber-700 dark:text-amber-300' : ''}`}>
                            {isOutingShare ? 'Outing Share' : 'Treat Due'}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {treat.details || `${formatDate(treat.date)} contribution`}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                            {formatPKR(treat.amount)}
                          </div>
                          <span className="text-[10px] text-zinc-400">{formatDate(treat.date)}</span>
                        </div>
                        {isManager && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2"
                            onClick={() => collectTreatPayment(treat.id)}
                            title="Mark this due as collected"
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-zinc-400">
                  Please submit cash or online transfer to the TRF Custodian to settle your dues.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigateTab('rules-treats')}
                  className="text-xs h-7 gap-1"
                >
                  <span>View All Rules & Treats</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between py-2 text-xs text-zinc-500">
              <span>You have zero pending payments or dues. Everything is fully settled!</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('rules-treats')}
                className="text-xs h-7 gap-1"
              >
                <span>View Rules & Treats</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
          {/* Next Birthday (Only if within 7 days) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-zinc-500">Upcoming Birthday</CardTitle>
              {nextBirthday && nextBirthday.countdown.daysLeft <= 7 ? (
                <Badge variant="outline" className="text-[10px]">
                  {nextBirthday.countdown.isToday ? 'Today' : `In ${nextBirthday.countdown.daysLeft}d`}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] text-zinc-400">
                  Next 7 Days
                </Badge>
              )}
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-1">
              {nextBirthday && nextBirthday.countdown.daysLeft <= 7 ? (
                <>
                  <div>
                    <div className="text-sm font-semibold">{nextBirthday.member.name}</div>
                    <div className="text-xs text-zinc-500">{nextBirthday.member.designation}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      openSendBirthdayWishModal({
                        id: nextBirthday.member.id,
                        name: nextBirthday.member.name,
                        avatarUrl: nextBirthday.member.avatarUrl,
                      })
                    }
                    className="text-xs cursor-pointer"
                  >
                    Celebrate 🎉
                  </Button>
                </>
              ) : (
                <div className="text-xs text-zinc-400 py-1">
                  No birthdays scheduled in the next 7 days
                </div>
              )}
            </CardContent>
          </Card>

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
