export type TripMode = 'single' | 'family';

export interface Participant {
  id: string;
  name: string;
  color: string;
  initials: string;
  memberCount: number; // In single mode = 1, in family mode = number of people in this family unit
}

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'lodging'
  | 'activities'
  | 'groceries'
  | 'tickets'
  | 'general';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidById: string;
  date: string;
  category: ExpenseCategory;
  splitBetweenIds: string[]; // List of participant/family IDs who share this expense
  notes?: string;
}

export interface ParticipantBalance {
  participantId: string;
  name: string;
  color: string;
  initials: string;
  memberCount: number;
  totalPaid: number;
  fairShare: number;
  netBalance: number; // positive = owed money (creditor), negative = owes money (debtor)
  perPersonCost: number; // fairShare / memberCount
}

export interface SettlementTransaction {
  id: string;
  fromId: string;
  fromName: string;
  fromColor: string;
  fromMemberCount?: number;
  toId: string;
  toName: string;
  toColor: string;
  toMemberCount?: number;
  amount: number;
  settled?: boolean;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

