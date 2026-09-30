/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Receipt,
  Users,
  Scale,
  ArrowRight,
  Share2,
  Sparkles,
  Info,
  Calendar,
  Layers,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { CurrencyConfig, Expense, Participant, TripMode } from './types';
import {
  CURRENCIES,
  INITIAL_EXPENSES,
  INITIAL_PARTICIPANTS,
  FAMILY_SAMPLE_PARTICIPANTS,
  FAMILY_SAMPLE_EXPENSES,
  AVATAR_COLORS
} from './data/sampleTrip';
import {
  calculateBalances,
  calculateSettlements,
  formatCurrency
} from './utils/settlementCalculator';
import { Header } from './components/Header';
import { SettlementView } from './components/SettlementView';
import { ParticipantBalances } from './components/ParticipantBalances';
import { ExpenseList } from './components/ExpenseList';
import { AddExpenseModal } from './components/AddExpenseModal';
import { ParticipantManagerModal } from './components/ParticipantManagerModal';

const STORAGE_KEYS = {
  TRIP_NAME: 'trip_eq_name',
  TRIP_MODE: 'trip_eq_mode',
  PARTICIPANTS: 'trip_eq_participants',
  EXPENSES: 'trip_eq_expenses',
  CURRENCY: 'trip_eq_currency',
  SETTLED_MAP: 'trip_eq_settled_map',
};

export default function App() {
  // Trip Mode state: 'single' | 'family'
  const [tripMode, setTripMode] = useState<TripMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRIP_MODE);
    return saved === 'family' || saved === 'single' ? saved : 'single';
  });

  // Trip Name state
  const [tripName, setTripName] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.TRIP_NAME) || 'Alpine Road Trip';
  });

  // Participants state
  const [participants, setParticipants] = useState<Participant[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PARTICIPANTS;
      }
    }
    return INITIAL_PARTICIPANTS;
  });

  // Expenses state
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_EXPENSES;
      }
    }
    return INITIAL_EXPENSES;
  });

  // Currency state
  const [currency, setCurrency] = useState<CurrencyConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return CURRENCIES[0];
      }
    }
    return CURRENCIES[0];
  });

  // Settled transfers state
  const [settledMap, setSettledMap] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTLED_MAP);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });

  // UI state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [selectedParticipantFilter, setSelectedParticipantFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'settlement' | 'payments'>('all');

  // Persistence side-effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRIP_MODE, tripMode);
  }, [tripMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRIP_NAME, tripName);
  }, [tripName]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(currency));
  }, [currency]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTLED_MAP, JSON.stringify(settledMap));
  }, [settledMap]);

  // Core calculations with tripMode passed in
  const { balances, totalTripExpense, averagePerPerson, totalMembersCount } = useMemo(() => {
    return calculateBalances(participants, expenses, tripMode);
  }, [participants, expenses, tripMode]);

  const settlements = useMemo(() => {
    return calculateSettlements(balances, participants);
  }, [balances, participants]);

  // Mode change handler with optional sample prompt
  const handleChangeTripMode = (newMode: TripMode) => {
    if (newMode === tripMode) return;
    setTripMode(newMode);

    // If switching to family mode and user has the default initial single participants,
    // upgrade trip name & offer smooth sample transition
    if (newMode === 'family') {
      const isInitialSingle =
        participants.length === INITIAL_PARTICIPANTS.length &&
        participants.every((p, idx) => p.name === INITIAL_PARTICIPANTS[idx].name);
      if (isInitialSingle) {
        setTripName('Family Coastal Vacation');
        setParticipants(FAMILY_SAMPLE_PARTICIPANTS);
        setExpenses(FAMILY_SAMPLE_EXPENSES);
        setSettledMap({});
      }
    } else if (newMode === 'single') {
      const isInitialFamily =
        participants.length === FAMILY_SAMPLE_PARTICIPANTS.length &&
        participants.every((p, idx) => p.name === FAMILY_SAMPLE_PARTICIPANTS[idx].name);
      if (isInitialFamily) {
        setTripName('Alpine Road Trip');
        setParticipants(INITIAL_PARTICIPANTS);
        setExpenses(INITIAL_EXPENSES);
        setSettledMap({});
      }
    }
  };

  // Update member count for a specific family / participant
  const handleUpdateMemberCount = (participantId: string, count: number) => {
    const validCount = Math.max(1, Math.round(count));
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, memberCount: validCount } : p))
    );
  };

  // Summary shareable text
  const summaryText = useMemo(() => {
    const lines = [
      `✈️ Trip: ${tripName} (${tripMode === 'family' ? 'Family Mode' : 'Single Traveler Mode'})`,
      `💰 Total Trip Expense: ${formatCurrency(totalTripExpense, currency.symbol)}`,
      tripMode === 'family'
        ? `👥 Cost Per Person: ${formatCurrency(averagePerPerson, currency.symbol)} (Total ${totalMembersCount} people in ${participants.length} families)`
        : `👥 Equal Share Per Person: ${formatCurrency(averagePerPerson, currency.symbol)} (${participants.length} travelers)`,
      '',
      tripMode === 'family' ? '👨‍👩‍👧‍👦 Family Balances:' : '📊 Individual Contributions:',
      ...balances.map((b) => {
        const familySizeStr = tripMode === 'family' ? ` (${b.memberCount} members)` : '';
        if (b.netBalance > 0.009) {
          return `• ${b.name}${familySizeStr}: Paid ${formatCurrency(b.totalPaid, currency.symbol)} | Fair share: ${formatCurrency(b.fairShare, currency.symbol)} (Gets back ${formatCurrency(b.netBalance, currency.symbol)})`;
        } else if (b.netBalance < -0.009) {
          return `• ${b.name}${familySizeStr}: Paid ${formatCurrency(b.totalPaid, currency.symbol)} | Fair share: ${formatCurrency(b.fairShare, currency.symbol)} (Owes ${formatCurrency(Math.abs(b.netBalance), currency.symbol)})`;
        } else {
          return `• ${b.name}${familySizeStr}: Paid ${formatCurrency(b.totalPaid, currency.symbol)} | Fair share: ${formatCurrency(b.fairShare, currency.symbol)} (Balanced)`;
        }
      }),
      '',
      '🤝 Equal Expenditure Settlement Transfers:',
      settlements.length === 0
        ? '• All balances are equal! No transfers needed.'
        : settlements
            .map(
              (s, idx) =>
                `${idx + 1}. ${s.fromName} gives ${formatCurrency(s.amount, currency.symbol)} to ${s.toName}${
                  settledMap[s.id] ? ' [PAID]' : ''
                }`
            )
            .join('\n'),
    ];
    return lines.join('\n');
  }, [
    tripName,
    tripMode,
    totalTripExpense,
    averagePerPerson,
    totalMembersCount,
    currency,
    participants,
    balances,
    settlements,
    settledMap
  ]);

  // Handlers
  const handleSaveExpense = (
    expenseData: Omit<Expense, 'id'>,
    editId?: string
  ) => {
    if (editId) {
      setExpenses((prev) =>
        prev.map((exp) => (exp.id === editId ? { ...expenseData, id: editId } : exp))
      );
    } else {
      const newExpense: Expense = {
        ...expenseData,
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      };
      setExpenses((prev) => [newExpense, ...prev]);
    }
    setEditingExpense(null);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsAddExpenseOpen(true);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const handleToggleSettled = (settleId: string) => {
    setSettledMap((prev) => ({
      ...prev,
      [settleId]: !prev[settleId],
    }));
  };

  const handleAddParticipant = (name: string, color: string, memberCount: number = 1) => {
    const initials = name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newParticipant: Participant = {
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      color,
      initials: initials || name.slice(0, 2).toUpperCase(),
      memberCount: Math.max(1, memberCount),
    };

    setParticipants((prev) => [...prev, newParticipant]);
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    // Clean up expenses
    setExpenses((prev) =>
      prev
        .filter((exp) => exp.paidById !== id)
        .map((exp) => ({
          ...exp,
          splitBetweenIds: exp.splitBetweenIds.filter((pId) => pId !== id),
        }))
    );
  };

  const handleResetSample = () => {
    if (tripMode === 'family') {
      setTripName('Family Coastal Vacation');
      setParticipants(FAMILY_SAMPLE_PARTICIPANTS);
      setExpenses(FAMILY_SAMPLE_EXPENSES);
    } else {
      setTripName('Alpine Road Trip');
      setParticipants(INITIAL_PARTICIPANTS);
      setExpenses(INITIAL_EXPENSES);
    }
    setCurrency(CURRENCIES[0]);
    setSettledMap({});
    setSelectedParticipantFilter(null);
  };

  const handleClearAll = () => {
    setTripName('New Trip');
    if (tripMode === 'family') {
      setParticipants([
        { id: 'f1', name: 'Family 1', color: AVATAR_COLORS[0], initials: 'F1', memberCount: 3 },
        { id: 'f2', name: 'Family 2', color: AVATAR_COLORS[1], initials: 'F2', memberCount: 2 },
      ]);
    } else {
      setParticipants([
        { id: 'p1', name: 'Traveler 1', color: AVATAR_COLORS[0], initials: 'T1', memberCount: 1 },
        { id: 'p2', name: 'Traveler 2', color: AVATAR_COLORS[1], initials: 'T2', memberCount: 1 },
      ]);
    }
    setExpenses([]);
    setSettledMap({});
    setSelectedParticipantFilter(null);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans antialiased flex flex-col">
      {/* Top Application Header */}
      <Header
        tripName={tripName}
        onUpdateTripName={setTripName}
        tripMode={tripMode}
        onChangeTripMode={handleChangeTripMode}
        currency={currency}
        onSelectCurrency={setCurrency}
        totalTripExpense={totalTripExpense}
        averagePerPerson={averagePerPerson}
        participantCount={participants.length}
        totalMembersCount={totalMembersCount}
        expenseCount={expenses.length}
        onOpenAddExpense={() => {
          setEditingExpense(null);
          setIsAddExpenseOpen(true);
        }}
        onOpenAddParticipant={() => setIsParticipantModalOpen(true)}
        onResetSample={handleResetSample}
        onClearAll={handleClearAll}
        summaryText={summaryText}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mode Information & Quick Help Callout */}
        <div className="mb-5 bg-white border border-stone-200/90 rounded-xl p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                tripMode === 'family' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {tripMode === 'family' ? <Users className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900">
                  {tripMode === 'family'
                    ? 'Family Mode Active (Proportional Weighting)'
                    : 'Single Person Group Mode Active (Equal 1:1 Split)'}
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-stone-100 font-semibold text-stone-600 border border-stone-200">
                  {tripMode === 'family'
                    ? `${totalMembersCount} total people across ${participants.length} families`
                    : `${participants.length} individual travelers`}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {tripMode === 'family'
                  ? 'Each household or payer can have different member counts (e.g. Family of 4 pays 4x the individual share). Adjust sizes anytime.'
                  : 'Every participant represents 1 individual share. Expenses are split equally.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => handleChangeTripMode(tripMode === 'family' ? 'single' : 'family')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors"
            >
              Switch to {tripMode === 'family' ? 'Single Group Mode' : 'Family Mode'}
            </button>
          </div>
        </div>

        {/* Navigation / Tab Pills for responsive focus */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-1 bg-stone-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Full Overview
            </button>
            <button
              onClick={() => setActiveTab('settlement')}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'settlement'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Settlement Plan</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
                {settlements.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'payments'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Payments Log</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200 text-stone-700">
                {expenses.length}
              </span>
            </button>
          </div>

          <button
            onClick={() => {
              setEditingExpense(null);
              setIsAddExpenseOpen(true);
            }}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Insert Payment</span>
          </button>
        </div>

        {/* Tab: Full Overview */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            {/* Top Primary Focus: Debt Settlement Plan */}
            <SettlementView
              settlements={settlements}
              balances={balances}
              participants={participants}
              currency={currency}
              tripMode={tripMode}
              settledMap={settledMap}
              onToggleSettled={handleToggleSettled}
              selectedParticipantFilter={selectedParticipantFilter}
              onSelectParticipantFilter={setSelectedParticipantFilter}
            />

            {/* Two-Column Grid: Balances & Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Balances with Live Member Count Steppers */}
              <div className="lg:col-span-5 space-y-6">
                <ParticipantBalances
                  balances={balances}
                  currency={currency}
                  totalTripExpense={totalTripExpense}
                  tripMode={tripMode}
                  onUpdateMemberCount={handleUpdateMemberCount}
                />

                {/* Quick Info Box */}
                <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-xs text-stone-700">
                  <div className="flex items-center gap-2 font-bold text-emerald-950 mb-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span>
                      {tripMode === 'family'
                        ? 'Family Equal Share Principle'
                        : 'Equal Expenditure Principle'}
                    </span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">
                    {tripMode === 'family'
                      ? `In Family Mode, each family or household's fair expenditure is proportional to their size (${totalMembersCount} people total). When anyone logs a payment, the minimal direct transfers are calculated so each person ends up paying their exact share ($${averagePerPerson.toFixed(2)}/person).`
                      : 'Whenever any traveler pays during the trip (hotel, gas, meals), the system logs who paid. At the end of the trip, each traveler\'s fair share is calculated. Those who spent less than average transfer money directly to those who spent more, minimizing total transactions.'}
                  </p>
                </div>
              </div>

              {/* Right Column: Payments Log */}
              <div className="lg:col-span-7 space-y-6">
                <ExpenseList
                  expenses={expenses}
                  participants={participants}
                  currency={currency}
                  tripMode={tripMode}
                  onEditExpense={handleEditExpense}
                  onDeleteExpense={handleDeleteExpense}
                  onOpenAddExpense={() => {
                    setEditingExpense(null);
                    setIsAddExpenseOpen(true);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Settlement Only */}
        {activeTab === 'settlement' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <SettlementView
              settlements={settlements}
              balances={balances}
              participants={participants}
              currency={currency}
              tripMode={tripMode}
              settledMap={settledMap}
              onToggleSettled={handleToggleSettled}
              selectedParticipantFilter={selectedParticipantFilter}
              onSelectParticipantFilter={setSelectedParticipantFilter}
            />

            <ParticipantBalances
              balances={balances}
              currency={currency}
              totalTripExpense={totalTripExpense}
              tripMode={tripMode}
              onUpdateMemberCount={handleUpdateMemberCount}
            />
          </div>
        )}

        {/* Tab: Payments Log Only */}
        {activeTab === 'payments' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <ExpenseList
              expenses={expenses}
              participants={participants}
              currency={currency}
              tripMode={tripMode}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
              onOpenAddExpense={() => {
                setEditingExpense(null);
                setIsAddExpenseOpen(true);
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700">Trip Expense Equalizer</span>
            <span>•</span>
            <span>Single &amp; Family Weighted Debt Settlement System</span>
          </div>
          <span>Trip data is preserved in your local browser session.</span>
        </div>
      </footer>

      {/* Add / Edit Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setEditingExpense(null);
        }}
        onSaveExpense={handleSaveExpense}
        participants={participants}
        currency={currency}
        tripMode={tripMode}
        editingExpense={editingExpense}
      />

      {/* Participant Manager Modal */}
      <ParticipantManagerModal
        isOpen={isParticipantModalOpen}
        onClose={() => setIsParticipantModalOpen(false)}
        participants={participants}
        expenses={expenses}
        tripMode={tripMode}
        onAddParticipant={handleAddParticipant}
        onUpdateMemberCount={handleUpdateMemberCount}
        onRemoveParticipant={handleRemoveParticipant}
      />
    </div>
  );
}
