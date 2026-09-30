import { Expense, Participant, ParticipantBalance, SettlementTransaction, TripMode } from '../types';

/**
 * Calculates individual balances and fair shares for each participant/family.
 */
export function calculateBalances(
  participants: Participant[],
  expenses: Expense[],
  mode: TripMode = 'single'
): {
  balances: ParticipantBalance[];
  totalTripExpense: number;
  averagePerPerson: number;
  totalMembersCount: number;
} {
  if (participants.length === 0) {
    return {
      balances: [],
      totalTripExpense: 0,
      averagePerPerson: 0,
      totalMembersCount: 0,
    };
  }

  const participantMap = new Map<string, Participant>();
  participants.forEach((p) => participantMap.set(p.id, p));

  const paidMap = new Map<string, number>();
  const shareMap = new Map<string, number>();

  participants.forEach((p) => {
    paidMap.set(p.id, 0);
    shareMap.set(p.id, 0);
  });

  // Calculate total members (in family mode: sum of member counts; in single mode: 1 each)
  const getWeight = (pId: string) => {
    if (mode === 'single') return 1;
    const p = participantMap.get(pId);
    return Math.max(1, p?.memberCount || 1);
  };

  const totalMembersCount = participants.reduce((sum, p) => sum + getWeight(p.id), 0);

  let totalTripExpense = 0;

  for (const exp of expenses) {
    const amount = Number(exp.amount) || 0;
    totalTripExpense += amount;

    // Credit the payer
    if (paidMap.has(exp.paidById)) {
      paidMap.set(exp.paidById, (paidMap.get(exp.paidById) || 0) + amount);
    }

    // Split among participants based on mode
    const splitIds =
      exp.splitBetweenIds && exp.splitBetweenIds.length > 0
        ? exp.splitBetweenIds.filter((id) => participantMap.has(id))
        : participants.map((p) => p.id);

    if (splitIds.length > 0) {
      if (mode === 'single') {
        const splitAmount = amount / splitIds.length;
        for (const id of splitIds) {
          shareMap.set(id, (shareMap.get(id) || 0) + splitAmount);
        }
      } else {
        // Family mode: weighted by number of members in each family
        const expenseTotalMembers = splitIds.reduce((sum, id) => sum + getWeight(id), 0);
        if (expenseTotalMembers > 0) {
          for (const id of splitIds) {
            const familyWeight = getWeight(id);
            const familyShare = amount * (familyWeight / expenseTotalMembers);
            shareMap.set(id, (shareMap.get(id) || 0) + familyShare);
          }
        }
      }
    }
  }

  const balances: ParticipantBalance[] = participants.map((p) => {
    const totalPaid = Math.round((paidMap.get(p.id) || 0) * 100) / 100;
    const fairShare = Math.round((shareMap.get(p.id) || 0) * 100) / 100;
    const netBalance = Math.round((totalPaid - fairShare) * 100) / 100;
    const count = getWeight(p.id);
    const perPersonCost = count > 0 ? Math.round((fairShare / count) * 100) / 100 : fairShare;

    return {
      participantId: p.id,
      name: p.name,
      color: p.color,
      initials: p.initials,
      memberCount: count,
      totalPaid,
      fairShare,
      netBalance,
      perPersonCost,
    };
  });

  const averagePerPerson =
    totalMembersCount > 0
      ? Math.round((totalTripExpense / totalMembersCount) * 100) / 100
      : 0;

  return {
    balances,
    totalTripExpense: Math.round(totalTripExpense * 100) / 100,
    averagePerPerson,
    totalMembersCount,
  };
}

/**
 * Calculates the minimal list of transactions needed to settle all debts
 * so that everyone has equal (or fair) net expenditure.
 */
export function calculateSettlements(
  balances: ParticipantBalance[],
  participants: Participant[]
): SettlementTransaction[] {
  const participantMap = new Map<string, Participant>();
  participants.forEach((p) => participantMap.set(p.id, p));

  // Debtors: netBalance < 0 (they owe money)
  // Creditors: netBalance > 0 (they are owed money)
  const debtors: { id: string; name: string; color: string; memberCount: number; amount: number }[] = [];
  const creditors: { id: string; name: string; color: string; memberCount: number; amount: number }[] = [];

  balances.forEach((b) => {
    const net = Math.round(b.netBalance * 100) / 100;
    if (net < -0.009) {
      debtors.push({
        id: b.participantId,
        name: b.name,
        color: b.color,
        memberCount: b.memberCount,
        amount: -net, // positive debt amount
      });
    } else if (net > 0.009) {
      creditors.push({
        id: b.participantId,
        name: b.name,
        color: b.color,
        memberCount: b.memberCount,
        amount: net, // positive credit amount
      });
    }
  });

  // Sort descending by amount for greedy minimization
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: SettlementTransaction[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settleAmount = Math.min(debtor.amount, creditor.amount);
    const roundedSettle = Math.round(settleAmount * 100) / 100;

    if (roundedSettle > 0.009) {
      settlements.push({
        id: `settle-${debtor.id}-${creditor.id}-${settlements.length}`,
        fromId: debtor.id,
        fromName: debtor.name,
        fromColor: debtor.color,
        fromMemberCount: debtor.memberCount,
        toId: creditor.id,
        toName: creditor.name,
        toColor: creditor.color,
        toMemberCount: creditor.memberCount,
        amount: roundedSettle,
      });
    }

    debtor.amount = Math.round((debtor.amount - roundedSettle) * 100) / 100;
    creditor.amount = Math.round((creditor.amount - roundedSettle) * 100) / 100;

    if (debtor.amount <= 0.009) {
      dIdx++;
    }
    if (creditor.amount <= 0.009) {
      cIdx++;
    }
  }

  return settlements;
}

export function formatCurrency(amount: number, symbol = '$'): string {
  const rounded = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : ''}${symbol}${rounded}`;
}
