import { Expense, Participant, CurrencyConfig } from '../types';

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar (C$)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (S$)' },
];

export const AVATAR_COLORS = [
  'bg-emerald-600 text-white',
  'bg-sky-600 text-white',
  'bg-amber-600 text-white',
  'bg-violet-600 text-white',
  'bg-rose-600 text-white',
  'bg-teal-600 text-white',
  'bg-indigo-600 text-white',
  'bg-orange-600 text-white',
];

// Single Mode Sample (1 person per payer)
export const INITIAL_PARTICIPANTS: Participant[] = [
  { id: 'p1', name: 'Alex Rivera', color: 'bg-emerald-600 text-white', initials: 'AR', memberCount: 1 },
  { id: 'p2', name: 'Jordan Lee', color: 'bg-sky-600 text-white', initials: 'JL', memberCount: 1 },
  { id: 'p3', name: 'Samira Patel', color: 'bg-amber-600 text-white', initials: 'SP', memberCount: 1 },
  { id: 'p4', name: 'Taylor Brooks', color: 'bg-violet-600 text-white', initials: 'TB', memberCount: 1 },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    title: 'Mountain Cabin Rental (3 nights)',
    amount: 680.00,
    paidById: 'p1',
    date: '2026-09-15',
    category: 'lodging',
    splitBetweenIds: ['p1', 'p2', 'p3', 'p4'],
    notes: 'Paid via Airbnb booking',
  },
  {
    id: 'exp-2',
    title: 'Rental Car & Highway Tolls',
    amount: 240.50,
    paidById: 'p2',
    date: '2026-09-15',
    category: 'transport',
    splitBetweenIds: ['p1', 'p2', 'p3', 'p4'],
    notes: 'Airport pick up + electronic toll pass',
  },
  {
    id: 'exp-3',
    title: 'Supermarket Groceries & Snacks',
    amount: 156.30,
    paidById: 'p3',
    date: '2026-09-16',
    category: 'groceries',
    splitBetweenIds: ['p1', 'p2', 'p3', 'p4'],
    notes: 'Breakfast items, fruits, snacks, water bottles',
  },
  {
    id: 'exp-4',
    title: 'Alpine Gondola & Peak Passes',
    amount: 220.00,
    paidById: 'p4',
    date: '2026-09-17',
    category: 'tickets',
    splitBetweenIds: ['p1', 'p2', 'p3', 'p4'],
    notes: '4 adult day passes with scenic lift',
  },
  {
    id: 'exp-5',
    title: 'Fireside Dinner & Drinks',
    amount: 198.20,
    paidById: 'p1',
    date: '2026-09-17',
    category: 'food',
    splitBetweenIds: ['p1', 'p2', 'p3', 'p4'],
    notes: 'Local pub dinner celebration',
  },
];

// Family Mode Sample (Families with unequal member counts: 4, 3, 2, 1 = 10 people total)
export const FAMILY_SAMPLE_PARTICIPANTS: Participant[] = [
  { id: 'f1', name: 'Miller Family', color: 'bg-emerald-600 text-white', initials: 'MF', memberCount: 4 },
  { id: 'f2', name: 'Sharma Family', color: 'bg-sky-600 text-white', initials: 'SF', memberCount: 3 },
  { id: 'f3', name: 'David & Sarah', color: 'bg-amber-600 text-white', initials: 'DS', memberCount: 2 },
  { id: 'f4', name: 'Mark Wilson (Solo)', color: 'bg-violet-600 text-white', initials: 'MW', memberCount: 1 },
];

export const FAMILY_SAMPLE_EXPENSES: Expense[] = [
  {
    id: 'f-exp-1',
    title: 'Beachfront Cottages (3 nights)',
    amount: 1400.00,
    paidById: 'f1', // Miller Family paid
    date: '2026-09-15',
    category: 'lodging',
    splitBetweenIds: ['f1', 'f2', 'f3', 'f4'],
    notes: '2 joined family villas by the sea',
  },
  {
    id: 'f-exp-2',
    title: 'Theme Park & Safari Tickets (10 people)',
    amount: 650.00,
    paidById: 'f3', // David & Sarah paid
    date: '2026-09-16',
    category: 'tickets',
    splitBetweenIds: ['f1', 'f2', 'f3', 'f4'],
    notes: 'Full day passes for all 10 family members',
  },
  {
    id: 'f-exp-3',
    title: 'Seafood Buffet & Family Feast',
    amount: 460.00,
    paidById: 'f2', // Sharma Family paid
    date: '2026-09-16',
    category: 'food',
    splitBetweenIds: ['f1', 'f2', 'f3', 'f4'],
    notes: 'Group dinner banquet',
  },
  {
    id: 'f-exp-4',
    title: 'Charter Boat Tour & Island Ferry',
    amount: 320.00,
    paidById: 'f4', // Mark paid
    date: '2026-09-17',
    category: 'activities',
    splitBetweenIds: ['f1', 'f2', 'f3', 'f4'],
    notes: 'Private catamaran cruise for group',
  },
  {
    id: 'f-exp-5',
    title: 'Big Box Groceries, Drinks & Snacks',
    amount: 270.00,
    paidById: 'f1', // Miller Family paid
    date: '2026-09-17',
    category: 'groceries',
    splitBetweenIds: ['f1', 'f2', 'f3', 'f4'],
    notes: 'Breakfast cereals, milk, fruits, water',
  },
];
