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
  Settings2,
  Search,
  LayoutGrid,
  List,
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
import { Input } from '@/components/ui/input';
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

  // Filters, Sorting & View Mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'official' | 'personal'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'mandatory' | 'treat'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'amount_desc' | 'amount_asc' | 'name_asc' | 'name_desc'>('default');
  const [ruleSearch, setRuleSearch] = useState('');

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('trf_rules_view_mode') as 'grid' | 'list';
      if (saved === 'grid' || saved === 'list') {
        setViewMode(saved);
      }
    } catch {}
  }, []);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    try {
      localStorage.setItem('trf_rules_view_mode', mode);
    } catch {}
  };

  const filteredAndSortedRules = [...rules]
    .filter((r) => {
      if (categoryFilter === 'official' && !r.title.toLowerCase().startsWith('official')) return false;
      if (categoryFilter === 'personal' && !r.title.toLowerCase().startsWith('personal')) return false;
      if (typeFilter === 'mandatory' && !r.isMandatory) return false;
      if (typeFilter === 'treat' && r.isMandatory) return false;
      if (ruleSearch.trim()) {
        const q = ruleSearch.toLowerCase();
        return r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'amount_desc') return b.suggestedAmount - a.suggestedAmount;
      if (sortBy === 'amount_asc') return a.suggestedAmount - b.suggestedAmount;
      if (sortBy === 'name_asc') return a.title.localeCompare(b.title);
      if (sortBy === 'name_desc') return b.title.localeCompare(a.title);
      return 0;
    });

  const officialCount = rules.filter((r) => r.title.toLowerCase().startsWith('official')).length;
  const personalCount = rules.filter((r) => r.title.toLowerCase().startsWith('personal')).length;

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Contribution Guidelines & Rates ({rules.length})
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Base rates: {formatPKR(monthlyPerHeadRate)}/head monthly allowance • {formatPKR(defaultJoiningFee)} default joining fee
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-0.5 border border-border rounded-lg p-0.5 bg-muted/30">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('list')}
                className="h-7 px-2 text-xs gap-1"
                title="List View"
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">List</span>
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('grid')}
                className="h-7 px-2 text-xs gap-1"
                title="Cards Grid View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
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
        </div>

        {/* Filter Tabs, Type Filter, Sort & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 flex-wrap">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <Button
              variant={categoryFilter === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setCategoryFilter('all')}
              className="h-8 text-xs font-medium"
            >
              All Rules ({rules.length})
            </Button>
            <Button
              variant={categoryFilter === 'official' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setCategoryFilter('official')}
              className="h-8 text-xs font-medium"
            >
              Official ({officialCount})
            </Button>
            <Button
              variant={categoryFilter === 'personal' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setCategoryFilter('personal')}
              className="h-8 text-xs font-medium"
            >
              Personal ({personalCount})
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end flex-wrap">
            <select
              aria-label="Filter rule type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Rule Types</option>
              <option value="mandatory">Mandatory Fines/Fees</option>
              <option value="treat">Milestone Treats</option>
            </select>

            <select
              aria-label="Sort rules"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="default">Sort: Default</option>
              <option value="amount_desc">Amount: High to Low</option>
              <option value="amount_asc">Amount: Low to High</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>

            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input
                type="text"
                value={ruleSearch}
                onChange={(e) => setRuleSearch(e.target.value)}
                placeholder="Search rules..."
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Content: List / Table View OR Cards Grid View */}
        {viewMode === 'list' ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Occasion / Rule Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Rule Type</TableHead>
                    <TableHead className="text-right">Suggested Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedRules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-xs text-zinc-500">
                        No rules found matching your filter criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedRules.map((rule) => {
                      const isOfficial = rule.title.toLowerCase().startsWith('official');
                      const cleanTitle = rule.title.replace(/^(Official|Personal):\s*/i, '');

                      return (
                        <TableRow key={rule.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-xs text-zinc-900 dark:text-zinc-100">
                                {cleanTitle}
                              </div>
                              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                {rule.description}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                isOfficial
                                  ? 'border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                                  : 'border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300'
                              }`}
                            >
                              {isOfficial ? 'Official' : 'Personal'}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <Badge variant={rule.isMandatory ? 'default' : 'secondary'} className="text-[10px]">
                              {rule.isMandatory ? 'Mandatory' : 'Milestone Treat'}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right font-mono font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                            {formatPKR(rule.suggestedAmount)}
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isManager && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingRule(rule)}
                                  className="h-7 text-xs gap-1 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                                  title="Edit rule amount"
                                >
                                  <Edit2 className="h-3 w-3" />
                                  <span>Edit</span>
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={onOpenNewTreat}
                                className="h-7 text-xs gap-1"
                                title="Declare treat"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Use</span>
                              </Button>
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredAndSortedRules.map((rule) => (
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
        )}
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
