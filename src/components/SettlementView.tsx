import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  HelpCircle,
  Sparkles,
  DollarSign,
  Send,
  CheckCheck,
  Info,
  Users
} from 'lucide-react';
import { CurrencyConfig, Participant, ParticipantBalance, SettlementTransaction, TripMode } from '../types';
import { formatCurrency } from '../utils/settlementCalculator';

interface SettlementViewProps {
  settlements: SettlementTransaction[];
  balances: ParticipantBalance[];
  participants: Participant[];
  currency: CurrencyConfig;
  tripMode: TripMode;
  settledMap: Record<string, boolean>;
  onToggleSettled: (id: string) => void;
  selectedParticipantFilter: string | null;
  onSelectParticipantFilter: (id: string | null) => void;
}

export const SettlementView: React.FC<SettlementViewProps> = ({
  settlements,
  balances,
  participants,
  currency,
  tripMode,
  settledMap,
  onToggleSettled,
  selectedParticipantFilter,
  onSelectParticipantFilter,
}) => {
  const [showExplanation, setShowExplanation] = useState<string | null>(null);

  // Filter settlements if a specific participant is selected
  const filteredSettlements = selectedParticipantFilter
    ? settlements.filter(
        (s) => s.fromId === selectedParticipantFilter || s.toId === selectedParticipantFilter
      )
    : settlements;

  const totalSettlementAmount = settlements.reduce((sum, s) => sum + s.amount, 0);
  const completedSettlementsCount = settlements.filter((s) => settledMap[s.id]).length;
  const allSettled = settlements.length > 0 && completedSettlementsCount === settlements.length;

  return (
    <section className="bg-white rounded-xl border border-stone-200/90 shadow-xs overflow-hidden">
      {/* Header section */}
      <div className="px-5 py-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-stone-50/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-bold text-stone-900 tracking-tight">
              {tripMode === 'family' ? 'Family Settlement Plan (Proportional by Size)' : 'Settlement Plan for Equal Expenditure'}
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            {tripMode === 'family'
              ? 'Minimal direct transfers so every family pays exactly their proportion based on member count'
              : 'Minimal direct transfers required so every traveler spends the exact equal amount'}
          </p>
        </div>

        {/* Participant / Family quick filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => onSelectParticipantFilter(null)}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
              selectedParticipantFilter === null
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
            }`}
          >
            All Transfers ({settlements.length})
          </button>
          {participants.map((p) => (
            <button
              key={p.id}
              onClick={() =>
                onSelectParticipantFilter(selectedParticipantFilter === p.id ? null : p.id)
              }
              className={`text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1 transition-colors ${
                selectedParticipantFilter === p.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${p.color.split(' ')[0]}`} />
              <span>{p.name.split(' ')[0]}</span>
              {tripMode === 'family' && (
                <span className="text-[10px] text-stone-400">({p.memberCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5">
        {settlements.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-stone-800">
              Zero Outstanding Balance
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
              Either no expenses have been recorded yet, or all {tripMode === 'family' ? 'families' : 'participants'} have contributed their exact proportionate share. Everyone is currently even!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Completion banner */}
            {allSettled && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>All payments have been settled! {tripMode === 'family' ? 'Equal proportional family shares achieved.' : 'Equal trip expenditure achieved.'}</span>
                </div>
                <span className="font-semibold">{completedSettlementsCount}/{settlements.length} complete</span>
              </div>
            )}

            {/* List of settlement transactions */}
            <div className="grid grid-cols-1 gap-2.5">
              {filteredSettlements.map((tx) => {
                const isSettled = !!settledMap[tx.id];
                const fromBalance = balances.find((b) => b.participantId === tx.fromId);
                const toBalance = balances.find((b) => b.participantId === tx.toId);

                return (
                  <div
                    key={tx.id}
                    className={`rounded-xl border transition-all duration-200 p-3.5 sm:p-4 ${
                      isSettled
                        ? 'bg-stone-50/80 border-stone-200 opacity-60'
                        : 'bg-white border-stone-200 hover:border-emerald-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Debtor gives $X to Creditor */}
                      <div className="flex items-center gap-2 sm:gap-4 flex-1">
                        {/* Payer (Debtor) */}
                        <div className="flex items-center gap-2 min-w-[150px]">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${tx.fromColor}`}
                          >
                            {tx.fromName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-bold text-stone-900 block truncate">
                              {tx.fromName}
                            </span>
                            <span className="text-[10px] text-rose-600 font-medium flex items-center gap-1">
                              {tripMode === 'family' && tx.fromMemberCount ? (
                                <span>{tx.fromMemberCount} members • Owes</span>
                              ) : (
                                <span>Owes share</span>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Arrow with settlement instruction */}
                        <div className="flex-1 flex flex-col items-center px-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-stone-500 font-medium">gives</span>
                            <span
                              className={`text-sm sm:text-base font-extrabold px-2.5 py-0.5 rounded-md ${
                                isSettled
                                  ? 'line-through text-stone-500 bg-stone-100'
                                  : 'text-emerald-700 bg-emerald-50 border border-emerald-200/80 shadow-2xs'
                              }`}
                            >
                              {formatCurrency(tx.amount, currency.symbol)}
                            </span>
                            <span className="text-xs text-stone-500 font-medium">to</span>
                          </div>
                          <div className="w-full flex items-center mt-1">
                            <div className="h-[2px] flex-1 bg-stone-200" />
                            <ArrowRight className="w-3.5 h-3.5 text-stone-400 mx-0.5 shrink-0" />
                            <div className="h-[2px] flex-1 bg-stone-200" />
                          </div>
                        </div>

                        {/* Receiver (Creditor) */}
                        <div className="flex items-center gap-2 min-w-[150px] justify-end text-right">
                          <div className="truncate">
                            <span className="text-xs font-bold text-stone-900 block truncate">
                              {tx.toName}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-medium flex items-center justify-end gap-1">
                              {tripMode === 'family' && tx.toMemberCount ? (
                                <span>{tx.toMemberCount} members • Receives</span>
                              ) : (
                                <span>Receives back</span>
                              )}
                            </span>
                          </div>
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${tx.toColor}`}
                          >
                            {tx.toName.slice(0, 2).toUpperCase()}
                          </div>
                        </div>
                      </div>

                      {/* Settlement Action button */}
                      <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
                        <button
                          onClick={() =>
                            setShowExplanation(showExplanation === tx.id ? null : tx.id)
                          }
                          className="text-[11px] text-stone-500 hover:text-stone-700 flex items-center gap-1 px-1.5 py-1 rounded hover:bg-stone-100"
                          title="View mathematical explanation"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>Why this amount?</span>
                        </button>

                        <button
                          onClick={() => onToggleSettled(tx.id)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                            isSettled
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-stone-100 text-stone-700 hover:bg-emerald-600 hover:text-white'
                          }`}
                        >
                          {isSettled ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Paid &amp; Settled</span>
                            </>
                          ) : (
                            <>
                              <Circle className="w-3.5 h-3.5 text-stone-400" />
                              <span>Mark as Paid</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Explanatory accordion */}
                    {showExplanation === tx.id && (
                      <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-600 bg-stone-50/80 p-3 rounded-lg">
                        <p className="font-bold text-stone-800 mb-1.5">
                          Detailed Calculation:
                        </p>
                        <ul className="space-y-1.5 list-disc list-inside text-stone-600">
                          <li>
                            <strong className="text-stone-800">{tx.fromName}</strong>{' '}
                            {tripMode === 'family' && fromBalance ? (
                              <>
                                (Family of {fromBalance.memberCount}): Their proportional share is{' '}
                                <strong className="text-stone-800">{formatCurrency(fromBalance.fairShare, currency.symbol)}</strong>.
                                They paid {formatCurrency(fromBalance.totalPaid, currency.symbol)} during the trip, so their net balance is{' '}
                                <span className="text-rose-600 font-semibold">
                                  {formatCurrency(fromBalance.netBalance, currency.symbol)}
                                </span>.
                              </>
                            ) : (
                              <>
                                paid {formatCurrency(fromBalance?.totalPaid || 0, currency.symbol)}, but their fair share is{' '}
                                {formatCurrency(fromBalance?.fairShare || 0, currency.symbol)}. Their net balance is{' '}
                                <span className="text-rose-600 font-semibold">
                                  {formatCurrency(fromBalance?.netBalance || 0, currency.symbol)}
                                </span>.
                              </>
                            )}
                          </li>
                          <li>
                            <strong className="text-stone-800">{tx.toName}</strong>{' '}
                            {tripMode === 'family' && toBalance ? (
                              <>
                                (Family of {toBalance.memberCount}): Their proportional share is{' '}
                                <strong className="text-stone-800">{formatCurrency(toBalance.fairShare, currency.symbol)}</strong>.
                                They paid {formatCurrency(toBalance.totalPaid, currency.symbol)} during the trip, so their net balance is{' '}
                                <span className="text-emerald-600 font-semibold">
                                  +{formatCurrency(toBalance.netBalance, currency.symbol)}
                                </span>.
                              </>
                            ) : (
                              <>
                                paid {formatCurrency(toBalance?.totalPaid || 0, currency.symbol)}, but their fair share is{' '}
                                {formatCurrency(toBalance?.fairShare || 0, currency.symbol)}. Their net balance is{' '}
                                <span className="text-emerald-600 font-semibold">
                                  +{formatCurrency(toBalance?.netBalance || 0, currency.symbol)}
                                </span>.
                              </>
                            )}
                          </li>
                          <li>
                            Direct transfer of {formatCurrency(tx.amount, currency.symbol)} resolves this exact balance between the two parties with zero leftover debt.
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Total summary bar */}
            <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
              <span>
                Total money transferring hands:{' '}
                <strong className="text-stone-800 font-semibold">
                  {formatCurrency(totalSettlementAmount, currency.symbol)}
                </strong>{' '}
                across {settlements.length} direct transfers
              </span>
              <span className="text-[11px]">
                {tripMode === 'family'
                  ? 'Proportionally weighted by family members count'
                  : 'Greedy minimal transactions algorithm'}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
