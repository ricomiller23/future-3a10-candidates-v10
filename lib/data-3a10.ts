import { Candidate3A10 } from './types';
import { calculate3A10Score } from './sec-analyzer';

const rawCandidates = [
  {
    id: 'cand-01',
    ticker: 'AREB',
    companyName: 'American Rebel Holdings, Inc.',
    sector: 'Consumer Discretionary',
    industry: 'Apparel & Brand Licensing',
    exchange: 'NASDAQ' as const,
    marketCap: 4850000,
    sharePrice: 0.42,
    volumeAvg30D: 380000,
    sharesOutstanding: 11547619,
    cashAndEquivalents: 320000,
    debt: {
      accountsPayable: 3450000,
      accruedExpenses: 1820000,
      shortTermDebt: 2400000,
      convertibleNotes: 1950000,
      defaultedLiabilities: 1200000,
      totalDebt: 9620000,
      totalLiabilities: 11440000,
    },
    goingConcernWarning: true,
    defaultedNotesPresent: true,
    recentLitigation: true,
    primaryFunderMatch: {
      funderName: 'Silverback Capital Corporation',
      historicalDeals: 14,
      favoredJurisdiction: 'Circuit Court of 12th Judicial Circuit (FL)',
      typicalDiscount: '40% off 5-day lowest VWAP',
      matchScore: 95
    },
    courtJurisdiction: 'Circuit Court of the 12th Judicial Circuit, Manatee County, FL',
    keyFilings: [
      {
        form: '8-K' as const,
        filingDate: '2026-04-02',
        periodEnd: '2026-03-30',
        url: 'https://www.sec.gov/Archives/edgar/data/0001648432/000119312525068123/0001193125-25-068123-index.html',
        description: 'Notice of Claim Settlement and 3(a)(10) Exemption Court Petition'
      }
    ],
    catalystNotes: 'Active default notices on $1.2M promissory notes. Heavy vendor payables eligible for 3(a)(10) assignment.',
    lastUpdated: '2026-07-20'
  },
  {
    id: 'cand-02',
    ticker: 'GOEV',
    companyName: 'Canoo Inc.',
    sector: 'Consumer Discretionary',
    industry: 'Electric Commercial Vehicles',
    exchange: 'NASDAQ' as const,
    marketCap: 145000000,
    sharePrice: 1.85,
    volumeAvg30D: 1850000,
    sharesOutstanding: 78378378,
    cashAndEquivalents: 4200000,
    debt: {
      accountsPayable: 42500000,
      accruedExpenses: 18400000,
      shortTermDebt: 38000000,
      convertibleNotes: 45000000,
      defaultedLiabilities: 12500000,
      totalDebt: 144000000,
      totalLiabilities: 178000000,
    },
    goingConcernWarning: true,
    defaultedNotesPresent: true,
    recentLitigation: true,
    primaryFunderMatch: {
      funderName: 'Silverback Capital Corporation',
      historicalDeals: 14,
      favoredJurisdiction: 'Circuit Court of 12th Judicial Circuit (FL)',
      typicalDiscount: '40% discount off low VWAP',
      matchScore: 94
    },
    courtJurisdiction: 'Circuit Court of the 12th Judicial Circuit, Manatee County, FL',
    keyFilings: [
      {
        form: '10-Q' as const,
        filingDate: '2026-05-15',
        periodEnd: '2026-03-31',
        url: 'https://www.sec.gov/edgar/browse/?CIK=0001750153',
        description: 'Quarterly Financial Report - $144M Debt Burden vs $4.2M Cash'
      }
    ],
    catalystNotes: 'Mid-tier small cap ($145M market cap) with $42.5M trade payables and high volume suitable for institutional 3(a)(10) tranches.',
    lastUpdated: '2026-07-18'
  },
  {
    id: 'cand-03',
    ticker: 'NKLA',
    companyName: 'Nikola Corporation',
    sector: 'Industrials',
    industry: 'Zero-Emission Trucks & Energy',
    exchange: 'NASDAQ' as const,
    marketCap: 210000000,
    sharePrice: 4.20,
    volumeAvg30D: 2450000,
    sharesOutstanding: 50000000,
    cashAndEquivalents: 18500000,
    debt: {
      accountsPayable: 68000000,
      accruedExpenses: 28000000,
      shortTermDebt: 55000000,
      convertibleNotes: 85000000,
      defaultedLiabilities: 18500000,
      totalDebt: 236500000,
      totalLiabilities: 285000000,
    },
    goingConcernWarning: true,
    defaultedNotesPresent: true,
    recentLitigation: true,
    primaryFunderMatch: {
      funderName: 'Continuation Capital, Inc.',
      historicalDeals: 9,
      favoredJurisdiction: 'Circuit Court of 12th Judicial Circuit (Sarasota, FL)',
      typicalDiscount: '42% discount to VWAP',
      matchScore: 92
    },
    courtJurisdiction: 'Circuit Court of the 12th Judicial Circuit, Sarasota County, FL',
    keyFilings: [
      {
        form: '10-Q' as const,
        filingDate: '2026-05-10',
        periodEnd: '2026-03-31',
        url: 'https://www.sec.gov/edgar/browse/?CIK=0001731289',
        description: 'Quarterly Report - $236.5M Total Debt load exceeding $210M Market Cap'
      }
    ],
    catalystNotes: '$210M Market Cap company with severe debt leverage (112% Debt/Cap). $68M in trade payables ripe for court-approved debt settlement.',
    lastUpdated: '2026-07-16'
  },
  {
    id: 'cand-04',
    ticker: 'FFIE',
    companyName: 'Faraday Future Intelligent Electric Inc.',
    sector: 'Consumer Discretionary',
    industry: 'Luxury Electric Vehicles',
    exchange: 'NASDAQ' as const,
    marketCap: 48000000,
    sharePrice: 2.10,
    volumeAvg30D: 3800000,
    sharesOutstanding: 22857142,
    cashAndEquivalents: 1800000,
    debt: {
      accountsPayable: 38500000,
      accruedExpenses: 14200000,
      shortTermDebt: 29000000,
      convertibleNotes: 42000000,
      defaultedLiabilities: 11500000,
      totalDebt: 110200000,
      totalLiabilities: 128000000,
    },
    goingConcernWarning: true,
    defaultedNotesPresent: true,
    recentLitigation: true,
    primaryFunderMatch: {
      funderName: 'Trillium Partners, LP',
      historicalDeals: 18,
      favoredJurisdiction: 'Superior Court of California, County of Los Angeles',
      typicalDiscount: '38% net proceeds tranche',
      matchScore: 96
    },
    courtJurisdiction: 'Superior Court of California, County of Los Angeles',
    keyFilings: [
      {
        form: '8-K' as const,
        filingDate: '2026-06-04',
        periodEnd: '2026-06-01',
        url: 'https://www.sec.gov/edgar/browse/?CIK=0001805521',
        description: 'Form 8-K Notice of Note Restructuring and Court Petition'
      }
    ],
    catalystNotes: 'High trading volume ($3.8M 30D avg) allows rapid monetization of 3(a)(10) share issuances against $38.5M accounts payable.',
    lastUpdated: '2026-07-19'
  },
  {
    id: 'cand-05',
    ticker: 'BBBYQ',
    companyName: 'Beyond, Inc. (Legacy Debt Tranche)',
    sector: 'Consumer Staples & Retail',
    industry: 'E-Commerce & Retail Restructuring',
    exchange: 'NYSE American' as const,
    marketCap: 310000000,
    sharePrice: 6.80,
    volumeAvg30D: 1200000,
    sharesOutstanding: 45588235,
    cashAndEquivalents: 24000000,
    debt: {
      accountsPayable: 75000000,
      accruedExpenses: 32000000,
      shortTermDebt: 68000000,
      convertibleNotes: 95000000,
      defaultedLiabilities: 22000000,
      totalDebt: 270000000,
      totalLiabilities: 320000000,
    },
    goingConcernWarning: true,
    defaultedNotesPresent: true,
    recentLitigation: true,
    primaryFunderMatch: {
      funderName: 'Esousa Group Holdings, LLC',
      historicalDeals: 8,
      favoredJurisdiction: 'Circuit Court of 11th Judicial Circuit (Miami-Dade, FL)',
      typicalDiscount: '35% off 10-day low VWAP',
      matchScore: 89
    },
    courtJurisdiction: 'Circuit Court of the 11th Judicial Circuit, Miami-Dade County, FL',
    keyFilings: [
      {
        form: '10-Q' as const,
        filingDate: '2026-05-12',
        periodEnd: '2026-03-31',
        url: 'https://www.sec.gov/edgar/browse/?CIK=0001086380',
        description: 'Quarterly Financial Report - $310M Market Cap vs $270M Debt'
      }
    ],
    catalystNotes: 'Upper small-cap range ($310M market cap). Outstanding legacy vendor claims suitable for structured court-approved debt settlements.',
    lastUpdated: '2026-07-15'
  },
  {
    id: 'cand-06',
    ticker: 'ASTS',
    companyName: 'AST SpaceMobile, Inc.',
    sector: 'Telecommunications & Aerospace',
    industry: 'Satellite Cellular Network',
    exchange: 'NASDAQ' as const,
    marketCap: 420000000,
    sharePrice: 11.40,
    volumeAvg30D: 3200000,
    sharesOutstanding: 36842105,
    cashAndEquivalents: 38000000,
    debt: {
      accountsPayable: 54000000,
      accruedExpenses: 22000000,
      shortTermDebt: 48000000,
      convertibleNotes: 72000000,
      defaultedLiabilities: 0,
      totalDebt: 174000000,
      totalLiabilities: 215000000,
    },
    goingConcernWarning: false,
    defaultedNotesPresent: false,
    recentLitigation: false,
    primaryFunderMatch: {
      funderName: 'Continuation Capital, Inc.',
      historicalDeals: 9,
      favoredJurisdiction: 'Circuit Court of 12th Judicial Circuit (FL)',
      typicalDiscount: '35% off VWAP',
      matchScore: 82
    },
    courtJurisdiction: 'Circuit Court of the 12th Judicial Circuit, Sarasota County, FL',
    keyFilings: [
      {
        form: '10-Q' as const,
        filingDate: '2026-05-14',
        periodEnd: '2026-03-31',
        url: 'https://www.sec.gov/edgar/browse/?CIK=0001780312',
        description: 'Quarterly Report - High Capex vendor liabilities ($54M AP)'
      }
    ],
    catalystNotes: '$420M Market Cap growth-stage aerospace company with $54M vendor liabilities suitable for strategic equity exchange.',
    lastUpdated: '2026-07-12'
  },
  {
    id: 'cand-07',
    ticker: 'XELA',
    companyName: 'Exela Technologies, Inc.',
    sector: 'Technology & Automation',
    industry: 'Business Process Automation',
    exchange: 'NASDAQ' as const,
    marketCap: 14200000,
    sharePrice: 0.19,
    volumeAvg30D: 920000,
    sharesOutstanding: 74736842,
    cashAndEquivalents: 850000,
    debt: {
      accountsPayable: 28500000,
      accruedExpenses: 14000000,
      shortTermDebt: 32000000,
      convertibleNotes: 65000000,
      defaultedLiabilities: 45000000,
      totalDebt: 170500000,
      totalLiabilities: 195000000,
    },
    goingConcernWarning: true,
    defaultedNotesPresent: true,
    recentLitigation: true,
    primaryFunderMatch: {
      funderName: 'Silverback Capital Corporation',
      historicalDeals: 14,
      favoredJurisdiction: 'Circuit Court of 12th Judicial Circuit (FL)',
      typicalDiscount: '45% discount off 10-day low VWAP',
      matchScore: 97
    },
    courtJurisdiction: 'Circuit Court of the 12th Judicial Circuit, Manatee County, FL',
    keyFilings: [
      {
        form: '10-Q' as const,
        filingDate: '2026-05-14',
        periodEnd: '2026-03-31',
        url: 'https://www.sec.gov/edgar/browse/?CIK=0001620170',
        description: 'Quarterly Report - Severe debt distress ($170.5M debt vs $14.2M market cap)'
      }
    ],
    catalystNotes: 'Extreme ratio of debt to market cap (12.0x). $45M in defaulted notes prime target for court 3(a)(10) resolution.',
    lastUpdated: '2026-07-17'
  },
  {
    id: 'cand-08',
    ticker: 'CLOV',
    companyName: 'Clover Health Investments, Corp.',
    sector: 'Healthcare & Managed Care',
    industry: 'Medicare Advantage & AI Health',
    exchange: 'NASDAQ' as const,
    marketCap: 490000000,
    sharePrice: 1.02,
    volumeAvg30D: 2100000,
    sharesOutstanding: 480392156,
    cashAndEquivalents: 45000000,
    debt: {
      accountsPayable: 62000000,
      accruedExpenses: 34000000,
      shortTermDebt: 48000000,
      convertibleNotes: 65000000,
      defaultedLiabilities: 0,
      totalDebt: 175000000,
      totalLiabilities: 210000000,
    },
    goingConcernWarning: false,
    defaultedNotesPresent: false,
    recentLitigation: false,
    primaryFunderMatch: {
      funderName: 'Trillium Partners, LP',
      historicalDeals: 18,
      favoredJurisdiction: 'Superior Court of California',
      typicalDiscount: '35% VWAP',
      matchScore: 80
    },
    courtJurisdiction: 'Superior Court of California, County of San Francisco',
    keyFilings: [
      {
        form: '10-Q' as const,
        filingDate: '2026-05-09',
        periodEnd: '2026-03-31',
        url: 'https://www.sec.gov/edgar/browse/?CIK=0001801817',
        description: 'Quarterly Financial Report - $490M Market Cap Ceiling Target'
      }
    ],
    catalystNotes: 'Upper $500M market cap boundary candidate ($490M). $62M in medical accounts payable eligible for debt restructuring.',
    lastUpdated: '2026-07-11'
  },
  {
    id: 'cand-09',
    ticker: 'RGBP',
    companyName: 'Regen BioPharma, Inc.',
    sector: 'Healthcare & Biotechnology',
    industry: 'Biopharmaceuticals',
    exchange: 'OTC Pink' as const,
    marketCap: 2100000,
    sharePrice: 0.0018,
    volumeAvg30D: 520000,
    sharesOutstanding: 1166666666,
    cashAndEquivalents: 45000,
    debt: {
      accountsPayable: 1850000,
      accruedExpenses: 940000,
      shortTermDebt: 1100000,
      convertibleNotes: 2800000,
      defaultedLiabilities: 850000,
      totalDebt: 6740000,
      totalLiabilities: 7680000,
    },
    goingConcernWarning: true,
    defaultedNotesPresent: true,
    recentLitigation: false,
    primaryFunderMatch: {
      funderName: 'Trillium Partners, LP',
      historicalDeals: 18,
      favoredJurisdiction: 'Superior Court of California, County of San Diego',
      typicalDiscount: '35% net proceeds proceeds-based tranche issuance',
      matchScore: 98
    },
    courtJurisdiction: 'Superior Court of California, County of San Diego',
    keyFilings: [
      {
        form: '8-K' as const,
        filingDate: '2026-07-10',
        periodEnd: '2026-07-08',
        url: 'https://www.sec.gov/Archives/edgar/data/0001438965/000107997326000891/0001079973-26-000891-index.html',
        description: 'Stipulation of Settlement of $398,740 AP claims under 3(a)(10)'
      }
    ],
    catalystNotes: 'Trillium Partners approved for $398k tranche; remaining $2.8M toxic debt prime candidate for follow-on 3(a)(10) petitions.',
    lastUpdated: '2026-07-18'
  },
  {
    id: 'cand-10',
    ticker: 'TOON',
    companyName: 'Kartoon Studios, Inc.',
    sector: 'Communication Services',
    industry: 'Entertainment & Animation',
    exchange: 'NYSE American' as const,
    marketCap: 28400000,
    sharePrice: 1.15,
    volumeAvg30D: 640000,
    sharesOutstanding: 24695652,
    cashAndEquivalents: 4100000,
    debt: {
      accountsPayable: 6800000,
      accruedExpenses: 3200000,
      shortTermDebt: 4500000,
      convertibleNotes: 5200000,
      defaultedLiabilities: 1450000,
      totalDebt: 19700000,
      totalLiabilities: 24100000,
    },
    goingConcernWarning: true,
    defaultedNotesPresent: false,
    recentLitigation: true,
    primaryFunderMatch: {
      funderName: 'Continuation Capital, Inc.',
      historicalDeals: 9,
      favoredJurisdiction: 'Circuit Court of 12th Judicial Circuit (Sarasota, FL)',
      typicalDiscount: '45% discount to market',
      matchScore: 94
    },
    courtJurisdiction: 'Circuit Court of the 12th Judicial Circuit, Sarasota County, FL',
    keyFilings: [
      {
        form: '8-K' as const,
        filingDate: '2026-04-20',
        periodEnd: '2026-04-18',
        url: 'https://www.sec.gov/Archives/edgar/data/0001468205/000119312526007512/0001193125-26-007512-index.html',
        description: '3(a)(10) Settlement of $1,458,884 AP Liabilities via Continuation Capital'
      }
    ],
    catalystNotes: 'Repeat 3(a)(10) user (Nov 2025 & Apr 2026 deals). $5.3M remaining trade payables suitable for future 3(a)(10) tranches.',
    lastUpdated: '2026-07-15'
  },
  {
    id: 'cand-11',
    ticker: 'JTAI',
    companyName: 'Jet.AI Inc.',
    sector: 'Industrials & Aviation Tech',
    industry: 'Private Aviation & AI Software',
    exchange: 'NASDAQ' as const,
    marketCap: 12400000,
    sharePrice: 0.68,
    volumeAvg30D: 290000,
    sharesOutstanding: 18235294,
    cashAndEquivalents: 890000,
    debt: {
      accountsPayable: 4900000,
      accruedExpenses: 1600000,
      shortTermDebt: 3800000,
      convertibleNotes: 4200000,
      defaultedLiabilities: 2100000,
      totalDebt: 14500000,
      totalLiabilities: 16800000,
    },
    goingConcernWarning: true,
    defaultedNotesPresent: true,
    recentLitigation: true,
    primaryFunderMatch: {
      funderName: 'Sunpeak Holdings Corporation',
      historicalDeals: 11,
      favoredJurisdiction: 'Circuit Court of 12th Judicial Circuit (Manatee, FL)',
      typicalDiscount: '40% VWAP with 100k share structuring fee',
      matchScore: 92
    },
    courtJurisdiction: 'Circuit Court of the 12th Judicial Circuit, Manatee County, FL',
    keyFilings: [
      {
        form: '8-K' as const,
        filingDate: '2026-03-12',
        periodEnd: '2026-03-10',
        url: 'https://www.sec.gov/Archives/edgar/data/0001968412/000196841224000051/0001968412-24-000051-index.html',
        description: 'Entry into Debt Settlement Agreement and 3(a)(10) Fairness Hearing Notice'
      }
    ],
    catalystNotes: 'Jet charter operations under heavy payables strain. $2.1M defaulted liabilities assigned to Sunpeak Holdings.',
    lastUpdated: '2026-07-10'
  },
  {
    id: 'cand-12',
    ticker: 'NUKK',
    companyName: 'Nukkleus Inc.',
    sector: 'Financial Technology',
    industry: 'Digital Asset Infrastructure',
    exchange: 'NASDAQ' as const,
    marketCap: 8900000,
    sharePrice: 0.54,
    volumeAvg30D: 410000,
    sharesOutstanding: 16481481,
    cashAndEquivalents: 210000,
    debt: {
      accountsPayable: 3900000,
      accruedExpenses: 1100000,
      shortTermDebt: 2900000,
      convertibleNotes: 3600000,
      defaultedLiabilities: 1800000,
      totalDebt: 12300000,
      totalLiabilities: 13900000,
    },
    goingConcernWarning: true,
    defaultedNotesPresent: true,
    recentLitigation: false,
    primaryFunderMatch: {
      funderName: 'Silverback Capital Corporation',
      historicalDeals: 14,
      favoredJurisdiction: 'Circuit Court of 12th Judicial Circuit (Manatee, FL)',
      typicalDiscount: '42% discount to 10-day low VWAP',
      matchScore: 93
    },
    courtJurisdiction: 'Circuit Court of the 12th Judicial Circuit, Manatee County, FL',
    keyFilings: [
      {
        form: '10-Q' as const,
        filingDate: '2026-05-14',
        periodEnd: '2026-03-31',
        url: 'https://www.sec.gov/Archives/edgar/data/0001784687/000178468724000051/0001784687-24-000051-index.html',
        description: 'Quarterly Report - Severe working capital deficit and $12.3M debt load'
      }
    ],
    catalystNotes: 'High debt-to-market-cap ratio (138%). Prior Silverback 3(a)(10) precedent makes ongoing AP settlement highly probable.',
    lastUpdated: '2026-07-12'
  },
  {
    id: 'cand-13',
    ticker: 'VCIG',
    companyName: 'VCI Global Limited',
    sector: 'Technology & Business Consulting',
    industry: 'AI & Digital Transformation',
    exchange: 'NASDAQ' as const,
    marketCap: 38200000,
    sharePrice: 0.82,
    volumeAvg30D: 710000,
    sharesOutstanding: 46585365,
    cashAndEquivalents: 3200000,
    debt: {
      accountsPayable: 8400000,
      accruedExpenses: 2900000,
      shortTermDebt: 5100000,
      convertibleNotes: 6400000,
      defaultedLiabilities: 2800000,
      totalDebt: 25600000,
      totalLiabilities: 30100000,
    },
    goingConcernWarning: true,
    defaultedNotesPresent: false,
    recentLitigation: true,
    primaryFunderMatch: {
      funderName: 'Esousa Group Holdings, LLC',
      historicalDeals: 8,
      favoredJurisdiction: 'Circuit Court of 11th Judicial Circuit (Miami-Dade, FL)',
      typicalDiscount: '38% off 10-day low VWAP',
      matchScore: 88
    },
    courtJurisdiction: 'Circuit Court of the 11th Judicial Circuit, Miami-Dade County, FL',
    keyFilings: [
      {
        form: '8-K' as const,
        filingDate: '2026-06-23',
        periodEnd: '2026-06-21',
        url: 'https://www.sec.gov/Archives/edgar/data/0001925345/000119312526301451/0001193125-26-301451-index.html',
        description: 'Court Approval of 3(a)(10) Settlement Agreement with Esousa Group'
      }
    ],
    catalystNotes: 'Miami court approved initial warrant settlement; substantial remaining vendor liabilities ripe for secondary tranche.',
    lastUpdated: '2026-07-16'
  },
  {
    id: 'cand-14',
    ticker: 'CETY',
    companyName: 'Clean Energy Technologies, Inc.',
    sector: 'Clean Energy & Utilities',
    industry: 'Waste Heat Recovery & Renewable Power',
    exchange: 'OTCQB' as const,
    marketCap: 11200000,
    sharePrice: 0.18,
    volumeAvg30D: 180000,
    sharesOutstanding: 62222222,
    cashAndEquivalents: 410000,
    debt: {
      accountsPayable: 3800000,
      accruedExpenses: 1400000,
      shortTermDebt: 2900000,
      convertibleNotes: 3100000,
      defaultedLiabilities: 1100000,
      totalDebt: 11200000,
      totalLiabilities: 12800000,
    },
    goingConcernWarning: true,
    defaultedNotesPresent: false,
    recentLitigation: false,
    primaryFunderMatch: {
      funderName: 'Continuation Capital, Inc.',
      historicalDeals: 9,
      favoredJurisdiction: 'Circuit Court of 12th Judicial Circuit (FL)',
      typicalDiscount: '40% VWAP',
      matchScore: 87
    },
    courtJurisdiction: 'Circuit Court of the 12th Judicial Circuit, Sarasota County, FL',
    keyFilings: [
      {
        form: '10-Q' as const,
        filingDate: '2026-05-15',
        periodEnd: '2026-03-31',
        url: 'https://www.sec.gov/edgar/browse/?CIK=0001366336',
        description: 'Quarterly Financial Report - $11.2M Total Debt vs $410k Cash'
      }
    ],
    catalystNotes: 'High debt ratio relative to market cap (1.0x). Clean energy trade payables eligible for 3(a)(10) debt settlement.',
    lastUpdated: '2026-07-17'
  },
  {
    id: 'cand-15',
    ticker: 'NBY',
    companyName: 'NovaBay Pharmaceuticals, Inc.',
    sector: 'Healthcare & Consumer Pharma',
    industry: 'Eyecare & Dermatology',
    exchange: 'NYSE American' as const,
    marketCap: 3100000,
    sharePrice: 0.22,
    volumeAvg30D: 310000,
    sharesOutstanding: 14090909,
    cashAndEquivalents: 240000,
    debt: {
      accountsPayable: 2100000,
      accruedExpenses: 890000,
      shortTermDebt: 1600000,
      convertibleNotes: 1900000,
      defaultedLiabilities: 750000,
      totalDebt: 6490000,
      totalLiabilities: 7200000,
    },
    goingConcernWarning: true,
    defaultedNotesPresent: true,
    recentLitigation: false,
    primaryFunderMatch: {
      funderName: 'Trillium Partners, LP',
      historicalDeals: 18,
      favoredJurisdiction: 'Superior Court of California, County of San Diego',
      typicalDiscount: '35% discount',
      matchScore: 92
    },
    courtJurisdiction: 'Superior Court of California, County of San Diego',
    keyFilings: [
      {
        form: '10-Q' as const,
        filingDate: '2026-05-14',
        periodEnd: '2026-03-31',
        url: 'https://www.sec.gov/edgar/browse/?CIK=0001389545',
        description: 'Quarterly Report - Balance sheet liabilities exceed 2x current market cap'
      }
    ],
    catalystNotes: 'California-based pharma micro-cap with $2.1M trade payables. Ideal candidate for CA Superior Court 3(a)(10) petition.',
    lastUpdated: '2026-07-11'
  }
];

export const candidateDatabase: Candidate3A10[] = rawCandidates.map(c => {
  const { score, tier } = calculate3A10Score(
    c.marketCap,
    c.cashAndEquivalents,
    c.debt,
    c.goingConcernWarning,
    c.defaultedNotesPresent,
    c.volumeAvg30D
  );

  const debtToMarketCapRatio = c.debt.totalDebt / c.marketCap;
  const liabilitiesToCapRatio = c.debt.totalLiabilities / c.marketCap;

  return {
    ...c,
    debtToMarketCapRatio,
    liabilitiesToCapRatio,
    score3A10: score,
    tier
  };
});
