import React, { useState } from 'react';
import {
  Search,
  Trash2,
  Edit2,
  Utensils,
  Car,
  Home,
  Compass,
  ShoppingBag,
  Ticket,
  Receipt,
  Users,
  Calendar
} from 'lucide-react';
import { CurrencyConfig, Expense, ExpenseCategory, Participant, TripMode } from '../types';
import { formatCurrency } from '../utils/settlementCalculator';

interface ExpenseListProps {
  expenses: Expense[];
  participants: Participant[];
  currency: CurrencyConfig;
  tripMode: TripMode;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onOpenAddExpense: () => void;
}

const CATEGORY_MAP: Record<
  ExpenseCategory,
  { label: string; icon: React.FC<{ className?: string }>; color: string }
> = {
  food: { label: 'Food', icon: Utensils, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  transport: { label: 'Transport', icon: Car, color: 'text-sky-700 bg-sky-50 border-sky-200' },
  lodging: { label: 'Lodging', icon: Home, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  groceries: { label: 'Groceries', icon: ShoppingBag, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  tickets: { label: 'Tickets', icon: Ticket, color: 'text-rose-700 bg-rose-50 border-rose-200' },
  activities: { label: 'Activity', icon: Compass, color: 'text-violet-700 bg-violet-50 border-violet-200' },
  general: { label: 'General', icon: Receipt, color: 'text-stone-700 bg-stone-50 border-stone-200' },
};

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  participants,
  currency,
  tripMode,
  onEditExpense,
  onDeleteExpense,
  onOpenAddExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [payerFilter, setPayerFilter] = useState<string>('all');

  const participantMap = new Map<string, Participant>();
  participants.forEach((p) => participantMap.set(p.id, p));

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.notes && exp.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || exp.category === categoryFilter;
    const matchesPayer = payerFilter === 'all' || exp.paidById === payerFilter;
    return matchesSearch && matchesCategory && matchesPayer;
  });

  return (
    <section className="bg-white rounded-xl border border-stone-200/90 shadow-xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-4 border-b border-stone-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-stone-50/50">
        <div>
          <h2 className="text-sm font-bold text-stone-900 tracking-tight">
            Trip Payment Log ({expenses.length})
          </h2>
          <p className="text-xs text-stone-500">
            Chronological payments recorded by travelers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative min-w-[160px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <select
            aria-label="Filter by Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-white text-stone-700 border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="food">Food</option>
            <option value="transport">Transport</option>
            <option value="lodging">Lodging</option>
            <option value="groceries">Groceries</option>
            <option value="tickets">Tickets</option>
            <option value="activities">Activities</option>
            <option value="general">General</option>
          </select>

          {/* Payer Filter */}
          <select
            aria-label="Filter by Payer"
            value={payerFilter}
            onChange={(e) => setPayerFilter(e.target.value)}
            className="text-xs bg-white text-stone-700 border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">All Payers</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {tripMode === 'family' ? `(${p.memberCount} members)` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table/List */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-stone-700">No payments found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
            {expenses.length === 0
              ? 'No payments have been inserted yet during this trip. Record what you paid to calculate equal balances.'
              : 'No expenses matched the search or filter criteria.'}
          </p>
          {expenses.length === 0 && (
            <button
              onClick={onOpenAddExpense}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Insert First Payment
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-stone-100">
          {filteredExpenses.map((exp) => {
            const payer = participantMap.get(exp.paidById);
            const categoryInfo = CATEGORY_MAP[exp.category] || CATEGORY_MAP.general;
            const CategoryIcon = categoryInfo.icon;

            const splitParticipantIds = exp.splitBetweenIds || participants.map((p) => p.id);
            const splitParticipants = participants.filter((p) => splitParticipantIds.includes(p.id));
            const splitCount = splitParticipants.length;
            const splitEqual = splitCount === participants.length;

            const splitTotalMembers =
              tripMode === 'family'
                ? splitParticipants.reduce((sum, p) => sum + (p.memberCount || 1), 0)
                : splitCount;

            const costPerIndividual =
              splitTotalMembers > 0 ? exp.amount / splitTotalMembers : exp.amount;

            return (
              <div
                key={exp.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 transition-colors"
              >
                {/* Left: Category Icon, Title, Payer, Details */}
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${categoryInfo.color}`}
                  >
                    <CategoryIcon className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs font-bold text-stone-900">{exp.title}</h3>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${categoryInfo.color}`}
                      >
                        {categoryInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <span className="text-stone-400">Paid by</span>
                        <strong className="text-stone-700 font-medium">
                          {payer ? payer.name : 'Unknown'}
                        </strong>
                        {tripMode === 'family' && payer && (
                          <span className="text-[10px] text-sky-700 font-semibold bg-sky-50 px-1 rounded border border-sky-200">
                            {payer.memberCount} members
                          </span>
                        )}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        <span>{exp.date}</span>
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-stone-400" />
                        <span>
                          {tripMode === 'family'
                            ? splitEqual
                              ? `All ${splitTotalMembers} people in ${participants.length} families`
                              : `${splitCount}/${participants.length} families (${splitTotalMembers} people)`
                            : splitEqual
                            ? 'Equal for all'
                            : `Shared by ${splitCount}/${participants.length}`}
                        </span>
                      </span>
                    </div>

                    {exp.notes && (
                      <p className="text-[11px] text-stone-400 mt-0.5 italic">
                        "{exp.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-stone-900 block">
                      {formatCurrency(exp.amount, currency.symbol)}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {formatCurrency(costPerIndividual, currency.symbol)} / person
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditExpense(exp)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
                      title="Edit payment"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteExpense(exp.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete payment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
