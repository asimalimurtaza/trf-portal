'use client';

import React, { useState } from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR, formatDate, exportToCSV } from '@/lib/utils';
import { Download, Plus, Search, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface FundsLedgerViewProps {
  onOpenNewTransaction: () => void;
}

export function FundsLedgerView({ onOpenNewTransaction }: FundsLedgerViewProps) {
  const { transactions, deleteTransaction, isManager } = useTRF();

  const [filterType, setFilterType] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tx.title.toLowerCase().includes(q) ||
        (tx.description?.toLowerCase().includes(q) ?? false) ||
        tx.loggedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const rows = filtered.map((tx) => ({
      ID: tx.id,
      Date: tx.date,
      Title: tx.title,
      Type: tx.type.toUpperCase(),
      Category: tx.category,
      Amount_PKR: tx.amount,
      Logged_By: tx.loggedBy,
      Description: tx.description || '',
    }));
    exportToCSV(`TRF_Transactions_Ledger_${new Date().toISOString().split('T')[0]}`, rows);
  };

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
            Funds Ledger
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Audit trail of company claims, member treats, and expenses
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>

          {isManager && (
            <Button
              size="sm"
              onClick={onOpenNewTransaction}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Expense</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="pl-9 h-8 text-xs"
          />
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={filterType === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilterType('all')}
            className="h-8 text-xs"
          >
            All ({transactions.length})
          </Button>
          <Button
            variant={filterType === 'inflow' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilterType('inflow')}
            className="h-8 text-xs"
          >
            Inflows
          </Button>
          <Button
            variant={filterType === 'outflow' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilterType('outflow')}
            className="h-8 text-xs"
          >
            Outflows
          </Button>
        </div>
      </div>

      {/* Ledger Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title & Category</TableHead>
                <TableHead>Logged By</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                {isManager && <TableHead className="w-12 text-right"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isManager ? 5 : 4} className="h-24 text-center text-xs text-zinc-500">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((tx) => {
                  const isInflow = tx.type === 'inflow';
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="text-xs text-zinc-500 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-xs text-zinc-900 dark:text-zinc-100">
                          {tx.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-zinc-400 capitalize">
                            {tx.category.replace('_', ' ')}
                          </span>
                          {tx.description && (
                            <span className="text-[11px] text-zinc-400 truncate max-w-xs">
                              • {tx.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-zinc-500 whitespace-nowrap">
                        {tx.loggedBy}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium text-xs whitespace-nowrap">
                        <span className={isInflow ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'}>
                          {isInflow ? '+' : '-'}{formatPKR(tx.amount)}
                        </span>
                      </TableCell>
                      {isManager && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTransaction(tx.id)}
                            className="h-7 w-7 text-zinc-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
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
