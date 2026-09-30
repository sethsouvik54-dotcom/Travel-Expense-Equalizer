import React, { useState } from 'react';
import { X, UserPlus, Trash2, Users, Plus, Minus, User } from 'lucide-react';
import { Participant, Expense, TripMode } from '../types';
import { AVATAR_COLORS } from '../data/sampleTrip';

interface ParticipantManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  expenses: Expense[];
  tripMode: TripMode;
  onAddParticipant: (name: string, color: string, memberCount?: number) => void;
  onUpdateMemberCount?: (id: string, count: number) => void;
  onRemoveParticipant: (id: string) => void;
}

export const ParticipantManagerModal: React.FC<ParticipantManagerModalProps> = ({
  isOpen,
  onClose,
  participants,
  expenses,
  tripMode,
  onAddParticipant,
  onUpdateMemberCount,
  onRemoveParticipant,
}) => {
  const [newName, setNewName] = useState('');
  const [newMemberCount, setNewMemberCount] = useState(tripMode === 'family' ? 3 : 1);
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      setError(
        tripMode === 'family'
          ? 'Please enter a family or payer name.'
          : 'Please enter a traveler name.'
      );
      return;
    }

    if (
      participants.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())
    ) {
      setError('A member/family with this name is already on the trip.');
      return;
    }

    onAddParticipant(trimmed, selectedColor, tripMode === 'family' ? newMemberCount : 1);
    setNewName('');
    setNewMemberCount(tripMode === 'family' ? 3 : 1);

    // Cycle to next color
    const nextColorIdx =
      (AVATAR_COLORS.indexOf(selectedColor) + 1) % AVATAR_COLORS.length;
    setSelectedColor(AVATAR_COLORS[nextColorIdx]);
    setError(null);
  };

  const totalHeadcount = participants.reduce((sum, p) => sum + (tripMode === 'family' ? p.memberCount : 1), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {tripMode === 'family'
                  ? `Trip Families (${participants.length})`
                  : `Travelers (${participants.length})`}
              </h2>
              <p className="text-[11px] text-stone-500">
                Total group headcount: <strong>{totalHeadcount} people</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Add New Participant Form */}
          <form onSubmit={handleAdd} className="space-y-3 bg-stone-50/80 p-3.5 rounded-xl border border-stone-200/80">
            <label className="block text-xs font-bold text-stone-800">
              {tripMode === 'family' ? 'Add New Family / Household' : 'Add New Traveler'}
            </label>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder={tripMode === 'family' ? 'e.g. The Miller Family or Dave & Sarah' : 'e.g. Chris Nolan'}
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setError(null);
                }}
                className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {/* In Family Mode: choose how many members in this family */}
              {tripMode === 'family' && (
                <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-stone-200 text-xs">
                  <span className="text-stone-600 font-medium">Family Members:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNewMemberCount(Math.max(1, newMemberCount - 1))}
                      disabled={newMemberCount <= 1}
                      className="w-6 h-6 rounded bg-stone-100 border border-stone-200 flex items-center justify-center disabled:opacity-40"
                    >
                      <Minus className="w-3 h-3 text-stone-700" />
                    </button>
                    <span className="font-bold text-stone-900 w-4 text-center">
                      {newMemberCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setNewMemberCount(newMemberCount + 1)}
                      className="w-6 h-6 rounded bg-stone-100 border border-stone-200 flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3 text-stone-700" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                {/* Color swatches */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-stone-400 mr-0.5">Color:</span>
                  {AVATAR_COLORS.slice(0, 6).map((col, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`w-5 h-5 rounded-full ${col.split(' ')[0]} transition-transform ${
                        selectedColor === col ? 'ring-2 ring-stone-900 ring-offset-1 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add {tripMode === 'family' ? 'Family' : 'Person'}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Current Members List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-800">
                {tripMode === 'family' ? 'Registered Families' : 'Registered Travelers'}
              </span>
              <span className="text-[11px] text-stone-400">
                {tripMode === 'family' ? 'Adjust member counts below' : ''}
              </span>
            </div>

            <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
              {participants.map((p) => {
                const paidCount = expenses.filter((e) => e.paidById === p.id).length;
                const canRemove = participants.length > 2;

                return (
                  <div
                    key={p.id}
                    className="p-3 flex items-center justify-between hover:bg-stone-50 transition-colors gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${p.color}`}
                      >
                        {p.initials}
                      </div>
                      <div className="min-w-0 truncate">
                        <span className="text-xs font-bold text-stone-900 block truncate">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {paidCount} payment{paidCount === 1 ? '' : 's'} logged
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Family members counter in modal */}
                      {tripMode === 'family' && onUpdateMemberCount && (
                        <div className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-lg border border-stone-200">
                          <button
                            type="button"
                            onClick={() => onUpdateMemberCount(p.id, Math.max(1, p.memberCount - 1))}
                            disabled={p.memberCount <= 1}
                            className="w-5 h-5 rounded bg-white text-stone-700 flex items-center justify-center disabled:opacity-40"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-xs font-bold text-stone-800 w-4 text-center">
                            {p.memberCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateMemberCount(p.id, p.memberCount + 1)}
                            className="w-5 h-5 rounded bg-white text-stone-700 flex items-center justify-center"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}

                      {canRemove ? (
                        <button
                          onClick={() => onRemoveParticipant(p.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Remove traveler"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-stone-400 italic">
                          Min 2
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-stone-50 border-t border-stone-100 text-right">
          <button
            onClick={onClose}
            className="text-xs font-semibold px-4 py-1.5 bg-white border border-stone-200 text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            Close &amp; Save
          </button>
        </div>
      </div>
    </div>
  );
};
