'use client';

import React, { useState } from 'react';
import { useTRF } from '@/context/TRFContext';
import { formatPKR, formatDate, exportToCSV } from '@/lib/utils';
import {
  Receipt,
  Download,
  Plus,
  Search,
  Filter,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Building2,
  UserCheck
} from 'lucide-react';

interface FundsLedgerViewProps {
  onOpenNewTransaction: () => void;
}

export function FundsLedgerView({ onOpenNewTransaction }: FundsLedgerViewProps) {
  const { transactions, deleteTransaction, isManager, totalInflow, totalOutflow, currentBalance } = useTRF();

  const [filterType, setFilterType] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered transactions
  const filtered = transactions.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (selectedCategory !== 'all' && tx.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = tx.title.toLowerCase().includes(q);
      const matchDesc = tx.description?.toLowerCase().includes(q) || false;
      const matchLogger = tx.loggedBy.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchLogger;
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
    <div className="space-y-6">
      {/* Header & Export / Add controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Receipt className="h-6 w-6 text-emerald-400" />
            Collective Funds Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete transparent ledger of company allowances, member treats, and team expenses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-colors flex items-center gap-2"
            title="Download CSV for Excel / Audit"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>

          {isManager && (
            <button
              onClick={onOpenNewTransaction}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Log Transaction</span>
            </button>
          )}
        </div>
      </div>

      {/* Ledger Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <span className="text-xs text-slate-400">Total Deposits (Inflows)</span>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            +{formatPKR(totalInflow)}
          </div>
          <span className="text-[11px] text-slate-500">Company Claims & Treats</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <span className="text-xs text-slate-400">Total Expenses (Outflows)</span>
          <div className="text-xl font-bold text-rose-400 mt-1">
            -{formatPKR(totalOutflow)}
          </div>
          <span className="text-[11px] text-slate-500">Dinners, Cakes & Activities</span>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4">
          <span className="text-xs text-slate-300">Net Pool Reserve</span>
          <div className="text-xl font-extrabold text-white mt-1">
            {formatPKR(currentBalance)}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">Available for team use</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description or member..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Inflow/Outflow Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('inflow')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterType === 'inflow'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Inflows
          </button>
          <button
            onClick={() => setFilterType('outflow')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filterType === 'outflow'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Outflows
          </button>
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500 hidden sm:block" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="company_claim">Company Allowance (1,400)</option>
            <option value="joining_fee">Joining Fee</option>
            <option value="treat_event">Treats & Gadgets</option>
            <option value="team_dinner">Team Dinners</option>
            <option value="snacks_refreshment">Snacks & Chai</option>
            <option value="birthday_cake">Birthday Cakes</option>
            <option value="activity_outing">Outings & Bowling</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Date & Type</th>
                <th className="px-5 py-3.5 font-semibold">Title & Description</th>
                <th className="px-5 py-3.5 font-semibold">Category</th>
                <th className="px-5 py-3.5 font-semibold">Logged By</th>
                <th className="px-5 py-3.5 font-semibold text-right">Amount (PKR)</th>
                {isManager && <th className="px-5 py-3.5 font-semibold text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={isManager ? 6 : 5}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const isInflow = tx.type === 'inflow';
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Date & Type */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-1.5 rounded-lg ${
                              isInflow
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {isInflow ? (
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDownRight className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {formatDate(tx.date)}
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase font-mono">
                              {tx.type}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Title & Description */}
                      <td className="px-5 py-4 max-w-sm">
                        <div className="font-semibold text-slate-200">
                          {tx.title}
                        </div>
                        {tx.description && (
                          <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {tx.description}
                          </div>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-medium text-slate-300 border border-slate-700 capitalize">
                          {tx.category.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Logged By */}
                      <td className="px-5 py-4 whitespace-nowrap text-slate-400">
                        {tx.loggedBy}
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <span
                          className={`font-bold text-sm ${
                            isInflow ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isInflow ? '+' : '-'}
                          {formatPKR(tx.amount)}
                        </span>
                      </td>

                      {/* Manager Delete Action */}
                      {isManager && (
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
