import React, { useState } from 'react';
import {
  Users,
  Check,
  RotateCcw,
  Plus,
  Receipt,
  Share2,
  User,
  HeartHandshake
} from 'lucide-react';
import { CurrencyConfig, TripMode } from '../types';
import { CURRENCIES } from '../data/sampleTrip';
import { formatCurrency } from '../utils/settlementCalculator';

interface HeaderProps {
  tripName: string;
  onUpdateTripName: (name: string) => void;
  tripMode: TripMode;
  onChangeTripMode: (mode: TripMode) => void;
  currency: CurrencyConfig;
  onSelectCurrency: (currency: CurrencyConfig) => void;
  totalTripExpense: number;
  averagePerPerson: number;
  participantCount: number;
  totalMembersCount: number;
  expenseCount: number;
  onOpenAddExpense: () => void;
  onOpenAddParticipant: () => void;
  onResetSample: () => void;
  onClearAll: () => void;
  summaryText: string;
}

export const Header: React.FC<HeaderProps> = ({
  tripName,
  onUpdateTripName,
  tripMode,
  onChangeTripMode,
  currency,
  onSelectCurrency,
  totalTripExpense,
  averagePerPerson,
  participantCount,
  totalMembersCount,
  expenseCount,
  onOpenAddExpense,
  onOpenAddParticipant,
  onResetSample,
  onClearAll,
  summaryText,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(tripName);
  const [copied, setCopied] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateTripName(tempName.trim());
    } else {
      setTempName(tripName);
    }
    setIsEditingName(false);
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Top bar: Title, Mode switcher, Currency, Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-stone-100">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    onBlur={handleSaveName}
                    autoFocus
                    className="text-base font-bold text-stone-900 border border-stone-300 rounded-md px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleSaveName}
                    className="text-xs px-2.5 py-1 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1
                    onClick={() => {
                      setTempName(tripName);
                      setIsEditingName(true);
                    }}
                    title="Click to rename trip"
                    className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight cursor-pointer hover:text-emerald-700 transition-colors"
                  >
                    {tripName}
                  </h1>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    {tripMode === 'family' ? '👨‍👩‍👧‍👦 Family Mode' : '👤 Single Mode'}
                  </span>
                </div>
              )}
              <p className="text-xs text-stone-500 mt-0.5">
                {tripMode === 'family'
                  ? 'Expenditure calculated proportional to each family\'s member count'
                  : 'Expenditure calculated equally across each individual traveler'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Toggle: High prominence for easy access */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-stone-100 p-1 rounded-xl flex items-center border border-stone-200">
              <button
                type="button"
                onClick={() => onChangeTripMode('single')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tripMode === 'single'
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Single Person Group: Every person represents 1 equal share"
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Single Group</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeTripMode('family')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tripMode === 'family'
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Family Mode: Unequal family sizes (e.g., family of 4 vs family of 2)"
              >
                <Users className="w-3.5 h-3.5 text-sky-600" />
                <span>Family Mode</span>
              </button>
            </div>

            {/* Currency selector */}
            <div className="relative">
              <select
                aria-label="Currency"
                value={currency.code}
                onChange={(e) => {
                  const found = CURRENCIES.find((c) => c.code === e.target.value);
                  if (found) onSelectCurrency(found);
                }}
                className="text-xs font-semibold bg-stone-50 text-stone-700 border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Share / Copy Summary */}
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 bg-stone-50 hover:bg-stone-100 transition-colors"
              title="Copy WhatsApp/text summary to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-stone-500" />
                  <span>Share Breakdown</span>
                </>
              )}
            </button>

            {/* Reset / Sample */}
            <div className="relative">
              {!showConfirmClear ? (
                <button
                  onClick={() => setShowConfirmClear(true)}
                  className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 px-2 py-1.5 rounded-md hover:bg-stone-100 transition-colors"
                  title="Reset trip options"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg border border-stone-200 animate-in fade-in duration-150">
                  <button
                    onClick={() => {
                      onResetSample();
                      setShowConfirmClear(false);
                    }}
                    className="text-xs px-2 py-0.5 bg-white border border-stone-200 text-stone-700 rounded hover:bg-stone-50 font-medium"
                  >
                    Sample Data
                  </button>
                  <button
                    onClick={() => {
                      onClearAll();
                      setShowConfirmClear(false);
                    }}
                    className="text-xs px-2 py-0.5 bg-rose-600 text-white rounded hover:bg-rose-700 font-medium"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className="text-xs px-1.5 py-0.5 text-stone-500 hover:text-stone-700"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Manage Travelers / Families Button */}
            <button
              onClick={onOpenAddParticipant}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 bg-white hover:bg-stone-50 transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-stone-500" />
              <span>
                {tripMode === 'family'
                  ? `Families (${participantCount})`
                  : `Travelers (${participantCount})`}
              </span>
            </button>

            {/* Big Friendly Primary CTA: Insert Payment */}
            <button
              onClick={onOpenAddExpense}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Insert Payment</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
          <div className="bg-stone-50 rounded-lg p-2.5 border border-stone-200/70">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Total Trip Expense
            </span>
            <span className="text-lg font-extrabold text-stone-900">
              {formatCurrency(totalTripExpense, currency.symbol)}
            </span>
          </div>

          <div className="bg-emerald-50/70 rounded-lg p-2.5 border border-emerald-200/70">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
              {tripMode === 'family' ? 'Cost Per Individual' : 'Equal Share Each'}
            </span>
            <span className="text-lg font-extrabold text-emerald-900">
              {formatCurrency(averagePerPerson, currency.symbol)}
              <span className="text-xs font-normal text-emerald-700 ml-1">
                / person
              </span>
            </span>
          </div>

          <div className="bg-stone-50 rounded-lg p-2.5 border border-stone-200/70">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Total Headcount
            </span>
            <span className="text-lg font-extrabold text-stone-900">
              {tripMode === 'family' ? (
                <>
                  {totalMembersCount}{' '}
                  <span className="text-xs font-medium text-stone-500">
                    people ({participantCount} families)
                  </span>
                </>
              ) : (
                <>
                  {participantCount}{' '}
                  <span className="text-xs font-medium text-stone-500">
                    individual{participantCount === 1 ? '' : 's'}
                  </span>
                </>
              )}
            </span>
          </div>

          <div className="bg-stone-50 rounded-lg p-2.5 border border-stone-200/70">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Logged Payments
            </span>
            <span className="text-lg font-extrabold text-stone-900">
              {expenseCount} {expenseCount === 1 ? 'payment' : 'payments'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
