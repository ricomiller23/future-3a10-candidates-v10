export interface DebtBreakdown {
  accountsPayable: number;       // Trade payables to vendors/creditors ($)
  accruedExpenses: number;       // Accrued liabilities ($)
  shortTermDebt: number;         // Notes due within 12 months ($)
  convertibleNotes: number;      // Toxic / convertible debt ($)
  defaultedLiabilities: number;  // Notes in default or litigation ($)
  totalDebt: number;             // Total debt burden ($)
  totalLiabilities: number;      // Total liabilities on balance sheet ($)
}

export interface SecFiling {
  form: '10-K' | '10-Q' | '8-K' | 'S-1';
  filingDate: string;
  periodEnd: string;
  url: string;
  description: string;
}

export interface FunderMatch {
  funderName: string;
  historicalDeals: number;
  favoredJurisdiction: string;
  typicalDiscount: string; // e.g. "35-50% off VWAP"
  matchScore: number;       // 0 - 100
}

export interface Candidate3A10 {
  id: string;
  ticker: string;
  companyName: string;
  sector: string;
  industry: string;
  exchange: 'NASDAQ' | 'NYSE American' | 'OTC Pink' | 'OTCQB';
  marketCap: number;            // Must be < 100,000,000
  sharePrice: number;
  volumeAvg30D: number;         // Average daily trading volume ($)
  sharesOutstanding: number;
  cashAndEquivalents: number;
  debt: DebtBreakdown;
  debtToMarketCapRatio: number; // Total Debt / Market Cap
  liabilitiesToCapRatio: number;// Total Liabilities / Market Cap
  goingConcernWarning: boolean;
  defaultedNotesPresent: boolean;
  recentLitigation: boolean;
  score3A10: number;            // 0 - 100 3(a)(10) feasibility index
  tier: 'Tier 1 High Conviction' | 'Tier 2 Moderate' | 'Tier 3 Watchlist';
  primaryFunderMatch: FunderMatch;
  courtJurisdiction: string;
  keyFilings: SecFiling[];
  catalystNotes: string;
  lastUpdated: string;
}

export interface FilterState {
  searchQuery: string;
  maxMarketCap: number;
  minDebtToCap: number;
  minScore: number;
  tierFilter: string;
  exchangeFilter: string;
  goingConcernOnly: boolean;
  sortBy: 'score' | 'marketCap' | 'totalDebt' | 'debtToCap' | 'ticker';
  sortOrder: 'asc' | 'desc';
}
