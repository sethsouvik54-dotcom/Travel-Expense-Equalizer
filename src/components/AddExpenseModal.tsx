import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Utensils,
  Car,
  Home,
  Compass,
  ShoppingBag,
  Ticket,
  Receipt,
  Users,
  Calendar,
  Sparkles
} from 'lucide-react';
import { CurrencyConfig, Expense, ExpenseCategory, Participant, TripMode } from '../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expense: Omit<Expense, 'id'>, editId?: string) => void;
  participants: Participant[];
  currency: CurrencyConfig;
  tripMode: TripMode;
  editingExpense?: Expense | null;
}

const CATEGORIES: { id: ExpenseCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'food', label: 'Food & Dining', icon: Utensils },
  { id: 'transport', label: 'Transport & Gas', icon: Car },
  { id: 'lodging', label: 'Stay & Lodging', icon: Home },
  { id: 'groceries', label: 'Groceries & Snacks', icon: ShoppingBag },
  { id: 'tickets', label: 'Tickets & Passes', icon: Ticket },
  { id: 'activities', label: 'Activities & Fun', icon: Compass },
  { id: 'general', label: 'General / Other', icon: Receipt },
];

const QUICK_AMOUNTS = [10, 25, 50, 100, 200];

const QUICK_PRESETS: { label: string; title: string; category: ExpenseCategory }[] = [
  { label: '🍽️ Dinner', title: 'Group Dinner', category: 'food' },
  { label: '⛽ Gas/Fuel', title: 'Gas & Fuel', category: 'transport' },
  { label: '🏨 Hotel/Stay', title: 'Hotel / Accommodation', category: 'lodging' },
  { label: '🛒 Groceries', title: 'Supermarket Groceries', category: 'groceries' },
  { label: '🎟️ Tickets', title: 'Attraction Tickets', category: 'tickets' },
  { label: '☕ Breakfast', title: 'Morning Breakfast & Coffee', category: 'food' },
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
  participants,
  currency,
  tripMode,
  editingExpense,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidById, setPaidById] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [splitBetweenIds, setSplitBetweenIds] = useState<string[]>([]);
  const [splitMode, setSplitMode] = useState<'all' | 'custom'>('all');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmount(editingExpense.amount.toString());
      setPaidById(editingExpense.paidById);
      setCategory(editingExpense.category);
      setDate(editingExpense.date);
      setSplitBetweenIds(editingExpense.splitBetweenIds || participants.map((p) => p.id));
      setSplitMode(
        editingExpense.splitBetweenIds.length === participants.length ? 'all' : 'custom'
      );
      setNotes(editingExpense.notes || '');
    } else {
      // Reset form
      setTitle('');
      setAmount('');
      setPaidById(participants[0]?.id || '');
      setCategory('food');
      setDate(new Date().toISOString().split('T')[0]);
      setSplitBetweenIds(participants.map((p) => p.id));
      setSplitMode('all');
      setNotes('');
      setError(null);
    }
  }, [editingExpense, isOpen, participants]);

  if (!isOpen) return null;

  const handleToggleSplitParticipant = (pId: string) => {
    if (splitBetweenIds.includes(pId)) {
      if (splitBetweenIds.length === 1) {
        setError('At least one traveler/family must be included in the split.');
        return;
      }
      setSplitBetweenIds(splitBetweenIds.filter((id) => id !== pId));
    } else {
      setSplitBetweenIds([...splitBetweenIds, pId]);
    }
    setError(null);
  };

  const handleSelectSplitAll = () => {
    setSplitMode('all');
    setSplitBetweenIds(participants.map((p) => p.id));
  };

  const handleQuickAddAmount = (addVal: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + addVal).toFixed(2));
    setError(null);
  };

  const handleApplyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (!title.trim()) {
      setError('Please provide a description or title for the payment.');
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid payment amount greater than zero.');
      return;
    }

    if (!paidById) {
      setError('Please select who made this payment.');
      return;
    }

    const finalSplit =
      splitMode === 'all'
        ? participants.map((p) => p.id)
        : splitBetweenIds.length > 0
        ? splitBetweenIds
        : participants.map((p) => p.id);

    onSaveExpense(
      {
        title: title.trim(),
        amount: Math.round(parsedAmount * 100) / 100,
        paidById,
        category,
        date,
        splitBetweenIds: finalSplit,
        notes: notes.trim() || undefined,
      },
      editingExpense?.id
    );

    onClose();
  };

  // Math calculation for preview
  const parsedAmt = parseFloat(amount) || 0;
  const activeSplitIds = splitMode === 'all' ? participants.map((p) => p.id) : splitBetweenIds;
  const activeParticipants = participants.filter((p) => activeSplitIds.includes(p.id));

  const totalMembersInSplit =
    tripMode === 'family'
      ? activeParticipants.reduce((sum, p) => sum + Math.max(1, p.memberCount || 1), 0)
      : activeParticipants.length;

  const costPerIndividual =
    totalMembersInSplit > 0 ? (parsedAmt / totalMembersInSplit).toFixed(2) : '0.00';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl border border-stone-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              {editingExpense ? 'Edit Trip Payment' : 'Insert Trip Payment'}
            </h2>
            <p className="text-xs text-stone-500">
              {tripMode === 'family'
                ? 'Record payment with proportional family share calculation'
                : 'Record payment to distribute equally among group'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* Quick Presets for Easy Tap */}
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
              Quick Presets (Tap to fill)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="text-xs px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 text-stone-700 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount input + Quick Increment Pills */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Payment Amount ({currency.symbol})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-bold text-stone-400">
                {currency.symbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                autoFocus
                required
                className="w-full text-2xl font-bold pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {/* Quick addition chips */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5">
              <span className="text-[11px] text-stone-400 font-medium">Quick add:</span>
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="text-xs px-2 py-0.5 rounded-md border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-medium transition-colors"
                >
                  +{currency.symbol}{val}
                </button>
              ))}
              {parsedAmt > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="text-xs px-2 py-0.5 rounded-md text-stone-400 hover:text-stone-600 font-medium ml-auto"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Description / What was this for? */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              What was this for? (Description)
            </label>
            <input
              type="text"
              placeholder="e.g., Highway Tolls, Seafood Feast, Villa Deposit"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              required
              className="w-full text-sm px-3.5 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Who Paid? (Select Person / Family) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-stone-700">
                {tripMode === 'family' ? 'Which Family/Person paid?' : 'Who paid for this?'}
              </label>
              <span className="text-[11px] text-stone-400">Select one</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {participants.map((p) => {
                const isSelected = paidById === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaidById(p.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600/30'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${p.color}`}
                    >
                      {p.initials}
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-bold text-stone-900 block truncate">
                        {p.name}
                      </span>
                      {tripMode === 'family' && (
                        <span className="text-[10px] text-sky-700 font-medium">
                          {p.memberCount} {p.memberCount === 1 ? 'member' : 'members'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Expense Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{cat.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="Receipt details, tips, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Split Mode: Equal Among All vs Custom */}
          <div className="border border-stone-200 rounded-xl p-3.5 bg-stone-50/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-800">
                Split Distribution
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleSelectSplitAll}
                  className={`text-[11px] px-2.5 py-0.5 rounded font-semibold ${
                    splitMode === 'all'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-stone-600 border border-stone-200'
                  }`}
                >
                  {tripMode === 'family'
                    ? `All Families (${participants.length})`
                    : `All Equal (${participants.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMode('custom')}
                  className={`text-[11px] px-2.5 py-0.5 rounded font-semibold ${
                    splitMode === 'custom'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-stone-600 border border-stone-200'
                  }`}
                >
                  Custom Pick
                </button>
              </div>
            </div>

            {splitMode === 'custom' ? (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {participants.map((p) => {
                  const isIncluded = splitBetweenIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none ${
                        isIncluded
                          ? 'border-emerald-500 bg-white font-medium text-stone-900 shadow-2xs'
                          : 'border-stone-200 bg-stone-100/60 text-stone-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isIncluded}
                        onChange={() => handleToggleSplitParticipant(p.id)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="truncate">{p.name}</span>
                      {tripMode === 'family' && (
                        <span className="text-[10px] text-stone-400">({p.memberCount})</span>
                      )}
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-stone-500">
                {tripMode === 'family'
                  ? `Shared proportionally across all ${totalMembersInSplit} individuals in ${participants.length} families.`
                  : `Cost is shared equally among all ${participants.length} travelers.`}
              </p>
            )}

            {parsedAmt > 0 && (
              <div className="mt-3 pt-2.5 border-t border-stone-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs text-stone-700">
                  <span>Cost per individual person:</span>
                  <strong className="font-extrabold text-emerald-700">
                    {currency.symbol}{costPerIndividual} / person
                  </strong>
                </div>
                {tripMode === 'family' && (
                  <div className="text-[11px] text-stone-500">
                    Families will be charged according to their number of members (e.g. 4 members = 4 × {currency.symbol}{costPerIndividual}).
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold px-4 py-2.5 text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs font-bold px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-xs transition-colors"
            >
              {editingExpense ? 'Save Changes' : 'Insert Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
