import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Check, Scale, Users, Plus, Minus, User } from 'lucide-react';
import { CurrencyConfig, ParticipantBalance, TripMode } from '../types';
import { formatCurrency } from '../utils/settlementCalculator';

interface ParticipantBalancesProps {
  balances: ParticipantBalance[];
  currency: CurrencyConfig;
  totalTripExpense: number;
  tripMode: TripMode;
  onUpdateMemberCount?: (participantId: string, count: number) => void;
}

export const ParticipantBalances: React.FC<ParticipantBalancesProps> = ({
  balances,
  currency,
  totalTripExpense,
  tripMode,
  onUpdateMemberCount,
}) => {
  return (
    <section className="bg-white rounded-xl border border-stone-200/90 shadow-xs overflow-hidden">
      <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-stone-900 tracking-tight">
            {tripMode === 'family' ? 'Family Balances & Headcounts' : 'Individual Balances & Contributions'}
          </h2>
        </div>
        <span className="text-xs text-stone-500 font-medium">
          {tripMode === 'family' ? `${balances.length} Families` : `${balances.length} Travelers`}
        </span>
      </div>

      {tripMode === 'family' && (
        <div className="px-5 py-2 bg-sky-50/60 border-b border-sky-100 flex items-center justify-between text-xs text-sky-800">
          <span>👨‍👩‍👧‍👦 <strong>Family Mode active:</strong> Adjust family sizes below with <kbd className="px-1 py-0.2 bg-white rounded border border-sky-200 text-[10px] font-bold">+</kbd> and <kbd className="px-1 py-0.2 bg-white rounded border border-sky-200 text-[10px] font-bold">-</kbd> to scale fair shares.</span>
        </div>
      )}

      <div className="divide-y divide-stone-100">
        {balances.map((b) => {
          const isCreditor = b.netBalance > 0.009;
          const isDebtor = b.netBalance < -0.009;
          const isEven = !isCreditor && !isDebtor;

          const paidPercent =
            totalTripExpense > 0
              ? Math.min(100, Math.round((b.totalPaid / totalTripExpense) * 100))
              : 0;

          return (
            <div
              key={b.participantId}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/50 transition-colors"
            >
              {/* Participant / Family Info */}
              <div className="flex items-center gap-3 min-w-[200px]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${b.color}`}
                >
                  {b.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-stone-900">{b.name}</h3>
                    {tripMode === 'family' && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                        {b.memberCount} {b.memberCount === 1 ? 'member' : 'members'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[11px] text-stone-500">
                      Paid: <strong className="text-stone-700">{formatCurrency(b.totalPaid, currency.symbol)}</strong>
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="text-[11px] text-stone-500">
                      Fair Share:{' '}
                      <strong className="text-stone-700">
                        {formatCurrency(b.fairShare, currency.symbol)}
                      </strong>
                      {tripMode === 'family' && b.memberCount > 1 && (
                        <span className="text-[10px] text-stone-400 ml-1">
                          ({formatCurrency(b.perPersonCost, currency.symbol)}/ea)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Family Size Stepper (Easy for every type of user) */}
              {tripMode === 'family' && onUpdateMemberCount && (
                <div className="flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 self-start sm:self-center">
                  <span className="text-[11px] text-stone-500 font-medium">Family Size:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdateMemberCount(b.participantId, Math.max(1, b.memberCount - 1))}
                      disabled={b.memberCount <= 1}
                      className="w-6 h-6 rounded-md bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                      title="Decrease family members"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-stone-900 w-5 text-center">
                      {b.memberCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateMemberCount(b.participantId, b.memberCount + 1)}
                      className="w-6 h-6 rounded-md bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 flex items-center justify-center shadow-xs"
                      title="Increase family members"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Progress bar (in single mode or family mode) */}
              {tripMode === 'single' && (
                <div className="hidden md:flex flex-col flex-1 max-w-xs px-4">
                  <div className="flex justify-between text-[10px] text-stone-500 mb-1">
                    <span>Funded {paidPercent}% of trip</span>
                    <span>Target: {balances.length > 0 ? Math.round(100 / balances.length) : 0}%</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCreditor ? 'bg-emerald-500' : isDebtor ? 'bg-rose-400' : 'bg-stone-400'
                      }`}
                      style={{ width: `${paidPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Net Balance Pill */}
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                    {tripMode === 'family' ? 'Family Balance' : 'Net Balance'}
                  </span>
                  <div className="flex items-center gap-1.5 justify-end">
                    {isCreditor && (
                      <span className="inline-flex items-center text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                        <ArrowDownLeft className="w-3 h-3 mr-0.5" />
                        Gets back {formatCurrency(b.netBalance, currency.symbol)}
                      </span>
                    )}
                    {isDebtor && (
                      <span className="inline-flex items-center text-xs font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                        Owes {formatCurrency(Math.abs(b.netBalance), currency.symbol)}
                      </span>
                    )}
                    {isEven && (
                      <span className="inline-flex items-center text-xs font-medium text-stone-600 bg-stone-100 px-2 py-1 rounded-md">
                        <Check className="w-3 h-3 mr-1 text-stone-400" />
                        Balanced ($0.00)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
