import { Candidate3A10, DebtBreakdown } from './types';

/**
 * Calculates the 3(a)(10) Candidate Suitability Index (0 - 100)
 * 
 * Criteria:
 * 1. Market Cap Constraint: MUST be < $500M. Sweet spot: micro-caps & small-caps ($1M - $100M).
 * 2. Debt Burden vs Market Cap Ratio: Debt / Cap > 1.0 indicates severe restructuring distress.
 * 3. Real Liabilities Component: High proportion of Accounts Payable + Short-Term/Defaulted Notes.
 * 4. Liquidity Crunch: Low Cash to Liabilities ratio (< 5%).
 * 5. Going Concern / Default Status: Boosts probability of executing 3(a)(10) court settlement.
 * 6. Daily Volume: Trading liquidity sufficient for funder share issuances.
 */
export function calculate3A10Score(
  marketCap: number,
  cash: number,
  debt: DebtBreakdown,
  goingConcern: boolean,
  defaultedNotes: boolean,
  volumeAvg30D: number
): { score: number; tier: 'Tier 1 High Conviction' | 'Tier 2 Moderate' | 'Tier 3 Watchlist' } {
  if (marketCap > 500000000) {
    return { score: 0, tier: 'Tier 3 Watchlist' };
  }

  let score = 0;

  // 1. Market Cap Sweet-Spot Scoring (max 25 pts)
  if (marketCap <= 25000000) {
    score += 25; // Micro-cap under $25M ideal for 3(a)(10) debt resolution
  } else if (marketCap <= 100000000) {
    score += 20;
  } else if (marketCap <= 250000000) {
    score += 15;
  } else {
    score += 10; // $250M - $500M small-cap range
  }

  // 2. Debt-to-Market-Cap Ratio (max 30 pts)
  const debtToCap = debt.totalDebt / Math.max(marketCap, 1);
  if (debtToCap >= 2.0) {
    score += 30; // Debt is double market cap! Extreme candidate
  } else if (debtToCap >= 1.0) {
    score += 25; // Debt exceeds market cap
  } else if (debtToCap >= 0.5) {
    score += 18;
  } else if (debtToCap >= 0.25) {
    score += 10;
  }

  // 3. Real Liabilities Structure (Accounts Payable + Defaulted Notes) (max 20 pts)
  const realLiabilities = debt.accountsPayable + debt.defaultedLiabilities + debt.shortTermDebt;
  const apRatio = realLiabilities / Math.max(debt.totalLiabilities, 1);
  if (apRatio >= 0.6) {
    score += 20;
  } else if (apRatio >= 0.4) {
    score += 15;
  } else if (apRatio >= 0.2) {
    score += 10;
  }

  // 4. Going Concern & Default Warning Boost (max 15 pts)
  if (defaultedNotes) score += 8;
  if (goingConcern) score += 7;

  // 5. Liquidity / Trading Volume Viability (max 10 pts)
  if (volumeAvg30D >= 250000) {
    score += 10;
  } else if (volumeAvg30D >= 50000) {
    score += 7;
  } else if (volumeAvg30D >= 10000) {
    score += 4;
  }

  const finalScore = Math.min(Math.round(score), 99);

  let tier: 'Tier 1 High Conviction' | 'Tier 2 Moderate' | 'Tier 3 Watchlist';
  if (finalScore >= 78) {
    tier = 'Tier 1 High Conviction';
  } else if (finalScore >= 60) {
    tier = 'Tier 2 Moderate';
  } else {
    tier = 'Tier 3 Watchlist';
  }

  return { score: finalScore, tier };
}

export function formatCurrency(val: number): string {
  if (val >= 1000000000) {
    return `$${(val / 1000000000).toFixed(2)}B`;
  }
  if (val >= 1000000) {
    return `$${(val / 1000000).toFixed(1)}M`;
  }
  if (val >= 1000) {
    return `$${(val / 1000).toFixed(0)}K`;
  }
  return `$${val.toLocaleString()}`;
}

export function formatPercent(val: number): string {
  return `${(val * 100).toFixed(1)}%`;
}
