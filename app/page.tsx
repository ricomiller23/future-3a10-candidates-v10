"use client";

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  Download, 
  ExternalLink, 
  ShieldAlert, 
  Scale, 
  Zap, 
  FileText, 
  BarChart3, 
  DollarSign, 
  SlidersHorizontal,
  ChevronRight,
  X,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Clock
} from 'lucide-react';
import { candidateDatabase } from '@/lib/data-3a10';
import { Candidate3A10, FilterState } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/sec-analyzer';

export default function Home() {
  const [candidatesList, setCandidatesList] = useState<Candidate3A10[]>(candidateDatabase);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate3A10 | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  // Live SEC Lookup state
  const [liveTickerInput, setLiveTickerInput] = useState('');
  const [loadingLiveSec, setLoadingLiveSec] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveSuccessMsg, setLiveSuccessMsg] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    maxMarketCap: 500000000,
    minDebtToCap: 0,
    minScore: 0,
    tierFilter: 'all',
    exchangeFilter: 'all',
    goingConcernOnly: false,
    sortBy: 'score',
    sortOrder: 'desc'
  });

  // Fetch Live SEC EDGAR facts for ANY ticker
  const handleFetchLiveSecTicker = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const ticker = liveTickerInput.trim().toUpperCase();
    if (!ticker) return;

    setLoadingLiveSec(true);
    setLiveError(null);
    setLiveSuccessMsg(null);

    try {
      const res = await fetch(`/api/screener?ticker=${ticker}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || `Failed to fetch SEC EDGAR data for ${ticker}`);
      }

      const liveCand: Candidate3A10 = json.data;

      setCandidatesList(prev => {
        const exists = prev.some(c => c.ticker === liveCand.ticker);
        if (exists) {
          return prev.map(c => c.ticker === liveCand.ticker ? liveCand : c);
        }
        return [liveCand, ...prev];
      });

      setLiveSuccessMsg(`Successfully scraped live SEC EDGAR facts for $${ticker}!`);
      setSelectedCandidate(liveCand);
      setLiveTickerInput('');
    } catch (err: any) {
      setLiveError(err.message || 'SEC EDGAR scrape failed.');
    } finally {
      setLoadingLiveSec(false);
    }
  };

  // Filter & Sort logic
  const filteredCandidates = useMemo(() => {
    return candidatesList.filter((item) => {
      // 1. Hard Market Cap Constraint (< $500M)
      if (item.marketCap > filters.maxMarketCap) return false;

      // 2. Debt-to-Cap ratio
      if (item.debtToMarketCapRatio < filters.minDebtToCap) return false;

      // 3. Minimum 3(a)(10) Score
      if (item.score3A10 < filters.minScore) return false;

      // 4. Tier filter
      if (filters.tierFilter !== 'all' && item.tier !== filters.tierFilter) return false;

      // 5. Exchange filter
      if (filters.exchangeFilter !== 'all' && item.exchange !== filters.exchangeFilter) return false;

      // 6. Going concern filter
      if (filters.goingConcernOnly && !item.goingConcernWarning) return false;

      // 7. Search query match
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchTicker = item.ticker.toLowerCase().includes(q);
        const matchName = item.companyName.toLowerCase().includes(q);
        const matchSector = item.sector.toLowerCase().includes(q);
        const matchFunder = item.primaryFunderMatch.funderName.toLowerCase().includes(q);
        const matchCourt = item.courtJurisdiction.toLowerCase().includes(q);
        if (!matchTicker && !matchName && !matchSector && !matchFunder && !matchCourt) return false;
      }

      return true;
    }).sort((a, b) => {
      let compA: any = a.score3A10;
      let compB: any = b.score3A10;

      if (filters.sortBy === 'marketCap') {
        compA = a.marketCap;
        compB = b.marketCap;
      } else if (filters.sortBy === 'totalDebt') {
        compA = a.debt.totalDebt;
        compB = b.debt.totalDebt;
      } else if (filters.sortBy === 'debtToCap') {
        compA = a.debtToMarketCapRatio;
        compB = b.debtToMarketCapRatio;
      } else if (filters.sortBy === 'ticker') {
        compA = a.ticker;
        compB = b.ticker;
      }

      if (filters.sortOrder === 'asc') {
        return compA > compB ? 1 : -1;
      }
      return compA < compB ? 1 : -1;
    });
  }, [candidatesList, filters]);

  // Aggregate KPI summary metrics
  const stats = useMemo(() => {
    const totalCount = filteredCandidates.length;
    const totalDebt = filteredCandidates.reduce((sum, c) => sum + c.debt.totalDebt, 0);
    const totalAP = filteredCandidates.reduce((sum, c) => sum + c.debt.accountsPayable, 0);
    const avgDebtRatio = totalCount > 0 
      ? filteredCandidates.reduce((sum, c) => sum + c.debtToMarketCapRatio, 0) / totalCount 
      : 0;
    const highConvictionCount = filteredCandidates.filter(c => c.tier === 'Tier 1 High Conviction').length;

    return { totalCount, totalDebt, totalAP, avgDebtRatio, highConvictionCount };
  }, [filteredCandidates]);

  // Export CSV Report Function
  const handleExportCSV = () => {
    const headers = [
      'Ticker', 'Company Name', 'Exchange', 'Market Cap ($)', 'Total Debt ($)', 
      'Accounts Payable ($)', 'Cash ($)', 'Debt/MarketCap Ratio', '3(a)(10) Score', 
      'Tier', 'Primary Funder Match', 'Court Jurisdiction'
    ];

    const rows = filteredCandidates.map(c => [
      c.ticker,
      `"${c.companyName}"`,
      c.exchange,
      c.marketCap,
      c.debt.totalDebt,
      c.debt.accountsPayable,
      c.cashAndEquivalents,
      (c.debtToMarketCapRatio * 100).toFixed(1) + '%',
      c.score3A10,
      c.tier,
      `"${c.primaryFunderMatch.funderName}"`,
      `"${c.courtJurisdiction}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `future_3a10_candidates_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 pb-16">
      {/* Top Header & Branding */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#080c14]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500/20 via-indigo-500/20 to-purple-500/20 border border-sky-500/30 text-sky-400">
              <Scale className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-indigo-200 to-purple-300">
                  FUTURE 3a10candidates
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Auto Scan: 8:00 AM EST
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Live SEC EDGAR Restructuring Screener &bull; Cap Ceiling: <span className="text-emerald-400 font-semibold">&lt; $500,000,000</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live SEC Ticker Search Bar */}
            <form onSubmit={handleFetchLiveSecTicker} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Scrape Ticker (e.g. CETY, SASI)"
                value={liveTickerInput}
                onChange={(e) => setLiveTickerInput(e.target.value)}
                className="w-44 py-1.5 px-3 rounded-lg glass-input text-xs uppercase font-bold tracking-wider placeholder:normal-case placeholder:font-normal placeholder:tracking-normal"
              />
              <button
                type="submit"
                disabled={loadingLiveSec || !liveTickerInput.trim()}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20"
              >
                {loadingLiveSec ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Live SEC
              </button>
            </form>

            <button
              onClick={() => setShowExplanationModal(true)}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 flex items-center gap-1.5 transition"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              3(a)(10) Guide
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/20 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              CSV Export
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* Live Notification Banners */}
        {liveSuccessMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-emerald-400" /> {liveSuccessMsg}
            </span>
            <button onClick={() => setLiveSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {liveError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-400" /> {liveError}
            </span>
            <button onClick={() => setLiveError(null)} className="text-rose-400 hover:text-rose-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* KPI Dashboard Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="p-4 rounded-xl glass-card relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Analyzed Candidates</span>
              <Building2 className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">
              {stats.totalCount}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <span>Cap Range &lt; $500M</span>
            </div>
          </div>

          <div className="p-4 rounded-xl glass-card relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>High Conviction (Tier 1)</span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400">
              {stats.highConvictionCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Top Restructuring Targets
            </div>
          </div>

          <div className="p-4 rounded-xl glass-card relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Total Debt Burden</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-400">
              {formatCurrency(stats.totalDebt)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              AP &amp; Convertible Liabilities
            </div>
          </div>

          <div className="p-4 rounded-xl glass-card relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Accounts Payable Pool</span>
              <BarChart3 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-extrabold text-purple-300">
              {formatCurrency(stats.totalAP)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Trade Creditor Claims
            </div>
          </div>

          <div className="p-4 rounded-xl glass-card relative overflow-hidden col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Avg Debt / Cap Ratio</span>
              <TrendingUp className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-extrabold text-rose-400">
              {formatPercent(stats.avgDebtRatio)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Severe Debt Leverage
            </div>
          </div>
        </div>

        {/* Filter Controls Panel */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-sky-400" />
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                Candidate Screening Controls
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Ticker, Name, Funder, Court..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2 rounded-lg glass-input text-xs"
                />
                {filters.searchQuery && (
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${viewMode === 'table' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Table View
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${viewMode === 'grid' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Cards Grid
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Max Market Cap Slider up to $500M */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>Max Market Cap Ceiling:</span>
                <span className="text-emerald-400 font-bold">{formatCurrency(filters.maxMarketCap)}</span>
              </div>
              <input
                type="range"
                min="5000000"
                max="500000000"
                step="10000000"
                value={filters.maxMarketCap}
                onChange={(e) => setFilters(prev => ({ ...prev, maxMarketCap: Number(e.target.value) }))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>$5M</span>
                <span>$250M</span>
                <span>$500M Limit</span>
              </div>
            </div>

            {/* Minimum 3(a)(10) Score */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>Min 3(a)(10) Score Index:</span>
                <span className="text-sky-400 font-bold">{filters.minScore} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={filters.minScore}
                onChange={(e) => setFilters(prev => ({ ...prev, minScore: Number(e.target.value) }))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Any (0)</span>
                <span>Moderate (60+)</span>
                <span>High (80+)</span>
              </div>
            </div>

            {/* Conviction Tier Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Conviction Tier:
              </label>
              <select
                value={filters.tierFilter}
                onChange={(e) => setFilters(prev => ({ ...prev, tierFilter: e.target.value }))}
                className="w-full py-2 px-3 rounded-lg glass-input text-xs"
              >
                <option value="all">All Tiers</option>
                <option value="Tier 1 High Conviction">Tier 1: High Conviction (78+ Score)</option>
                <option value="Tier 2 Moderate">Tier 2: Moderate (60-77 Score)</option>
                <option value="Tier 3 Watchlist">Tier 3: Watchlist (&lt;60 Score)</option>
              </select>
            </div>

            {/* Sort By Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Sort Candidates By:
              </label>
              <div className="flex gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="flex-1 py-2 px-3 rounded-lg glass-input text-xs"
                >
                  <option value="score">3(a)(10) Feasibility Score</option>
                  <option value="totalDebt">Total Debt Burden ($)</option>
                  <option value="debtToCap">Debt / Market Cap Ratio</option>
                  <option value="marketCap">Market Cap ($)</option>
                  <option value="ticker">Ticker Symbol</option>
                </select>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
                  className="px-3 py-2 rounded-lg glass-input text-xs font-bold hover:bg-slate-800"
                  title="Toggle Sort Direction"
                >
                  {filters.sortOrder === 'desc' ? '↓' : '↑'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate List - Table or Cards View */}
        {filteredCandidates.length === 0 ? (
          <div className="p-12 text-center rounded-2xl glass-panel border border-slate-800 text-slate-400">
            <AlertTriangle className="w-10 h-10 mx-auto text-amber-400 mb-3" />
            <h3 className="text-base font-semibold text-white">No 3(a)(10) Candidates Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              No companies matched your current screener constraints. Try increasing the Max Market Cap slider or clearing search filters.
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="rounded-2xl glass-panel border border-slate-800/80 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Company / Ticker</th>
                    <th className="py-3.5 px-4">Market Cap (&lt;$500M)</th>
                    <th className="py-3.5 px-4">Total Debt / AP</th>
                    <th className="py-3.5 px-4">Debt / Cap Ratio</th>
                    <th className="py-3.5 px-4">Primary Funder Match</th>
                    <th className="py-3.5 px-4">Venue Jurisdiction</th>
                    <th className="py-3.5 px-4 text-center">3(a)(10) Score</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredCandidates.map((c) => {
                    const badgeClass = c.tier === 'Tier 1 High Conviction' 
                      ? 'badge-tier-1' 
                      : c.tier === 'Tier 2 Moderate' 
                        ? 'badge-tier-2' 
                        : 'badge-tier-3';

                    return (
                      <tr 
                        key={c.id} 
                        className="hover:bg-slate-800/40 transition cursor-pointer group"
                        onClick={() => setSelectedCandidate(c)}
                      >
                        {/* Company / Ticker */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white group-hover:border-sky-400 transition">
                              {c.ticker}
                            </div>
                            <div>
                              <div className="font-bold text-white group-hover:text-sky-300 transition flex items-center gap-2">
                                {c.companyName}
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                  {c.exchange}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {c.sector} &bull; {c.industry}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Market Cap */}
                        <td className="py-4 px-4 font-medium text-emerald-400">
                          {formatCurrency(c.marketCap)}
                          <div className="text-[10px] text-slate-400 font-normal">
                            Share Price: ${c.sharePrice}
                          </div>
                        </td>

                        {/* Total Debt & AP */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-amber-400">
                            {formatCurrency(c.debt.totalDebt)}
                          </div>
                          <div className="text-[10px] text-purple-300 font-normal">
                            AP: {formatCurrency(c.debt.accountsPayable)}
                          </div>
                        </td>

                        {/* Debt to Cap Ratio */}
                        <td className="py-4 px-4 font-semibold">
                          <span className={c.debtToMarketCapRatio >= 1.0 ? 'text-rose-400 font-extrabold' : 'text-amber-300'}>
                            {formatPercent(c.debtToMarketCapRatio)}
                          </span>
                          <div className="w-20 bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                            <div 
                              className={`h-full ${c.debtToMarketCapRatio >= 1.0 ? 'bg-rose-500' : 'bg-amber-400'}`}
                              style={{ width: `${Math.min(c.debtToMarketCapRatio * 50, 100)}%` }}
                            />
                          </div>
                        </td>

                        {/* Primary Funder */}
                        <td className="py-4 px-4">
                          <div className="font-medium text-slate-200">
                            {c.primaryFunderMatch.funderName}
                          </div>
                          <div className="text-[10px] text-sky-400">
                            {c.primaryFunderMatch.typicalDiscount}
                          </div>
                        </td>

                        {/* Court Jurisdiction */}
                        <td className="py-4 px-4 text-[11px] text-slate-300 max-w-xs truncate">
                          {c.courtJurisdiction}
                        </td>

                        {/* 3(a)(10) Score */}
                        <td className="py-4 px-4 text-center">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${badgeClass}`}>
                            <Sparkles className="w-3.5 h-3.5" />
                            {c.score3A10} / 100
                          </div>
                        </td>

                        {/* Action button */}
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCandidate(c);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 text-xs font-medium flex items-center gap-1 ml-auto transition"
                          >
                            Inspect <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Cards Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCandidates.map((c) => {
              const badgeClass = c.tier === 'Tier 1 High Conviction' 
                ? 'badge-tier-1' 
                : c.tier === 'Tier 2 Moderate' 
                  ? 'badge-tier-2' 
                  : 'badge-tier-3';

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCandidate(c)}
                  className="p-5 rounded-2xl glass-card flex flex-col justify-between cursor-pointer border border-slate-800 hover:border-sky-500/50"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white">
                          {c.ticker}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm hover:text-sky-300 transition">
                            {c.companyName}
                          </h3>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {c.exchange} &bull; Market Cap: <span className="text-emerald-400 font-semibold">{formatCurrency(c.marketCap)}</span>
                          </div>
                        </div>
                      </div>

                      <div className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${badgeClass}`}>
                        {c.score3A10}
                      </div>
                    </div>

                    {/* Financial Metrics Box */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 my-3 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Total Debt Burden</span>
                        <span className="font-bold text-amber-400 text-sm">{formatCurrency(c.debt.totalDebt)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Accounts Payable</span>
                        <span className="font-bold text-purple-300 text-sm">{formatCurrency(c.debt.accountsPayable)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Debt / Market Cap</span>
                        <span className={`font-bold ${c.debtToMarketCapRatio >= 1.0 ? 'text-rose-400' : 'text-amber-300'}`}>
                          {formatPercent(c.debtToMarketCapRatio)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Cash Reserves</span>
                        <span className="font-bold text-slate-300">{formatCurrency(c.cashAndEquivalents)}</span>
                      </div>
                    </div>

                    {/* Funder Match */}
                    <div className="text-xs text-slate-300 mb-3">
                      <div className="text-[11px] text-slate-400 font-medium">Primary 3(a)(10) Funder Match:</div>
                      <div className="font-semibold text-sky-300">{c.primaryFunderMatch.funderName}</div>
                      <div className="text-[10px] text-slate-400">{c.courtJurisdiction}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px] font-medium">
                      {c.tier}
                    </span>
                    <span className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1">
                      Inspect Dossier <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Detailed Candidate Dossier Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl glass-panel border border-slate-700 shadow-2xl p-6 sm:p-8">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-5 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/20 to-purple-500/20 border border-sky-500/30 flex items-center justify-center font-extrabold text-xl text-white">
                  {selectedCandidate.ticker}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">
                      {selectedCandidate.companyName}
                    </h2>
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-slate-800 text-sky-400 border border-slate-700">
                      {selectedCandidate.exchange}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedCandidate.sector} &bull; {selectedCandidate.industry} &bull; Market Cap: <span className="text-emerald-400 font-bold">{formatCurrency(selectedCandidate.marketCap)}</span> (&lt;$500M)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3(a)(10) Feasibility Score Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-sky-500/20 text-sky-400 font-extrabold text-2xl border border-sky-500/40">
                  {selectedCandidate.score3A10}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    3(a)(10) Restructuring Suitability Score
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    {selectedCandidate.tier}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {selectedCandidate.goingConcernWarning && (
                  <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" /> Going Concern
                  </span>
                )}
                {selectedCandidate.defaultedNotesPresent && (
                  <span className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 font-medium">
                    <ShieldAlert className="w-3.5 h-3.5" /> Debt Default
                  </span>
                )}
              </div>
            </div>

            {/* Financial Liabilities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  Real Liabilities &amp; Debt Composition
                </h3>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Accounts Payable (Trade Payables):</span>
                    <span className="font-semibold text-purple-300">{formatCurrency(selectedCandidate.debt.accountsPayable)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Accrued Liabilities &amp; Expenses:</span>
                    <span className="font-semibold text-slate-300">{formatCurrency(selectedCandidate.debt.accruedExpenses)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Short-Term Debt (&lt; 12 Mo):</span>
                    <span className="font-semibold text-amber-300">{formatCurrency(selectedCandidate.debt.shortTermDebt)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Convertible / Toxic Notes:</span>
                    <span className="font-semibold text-rose-400">{formatCurrency(selectedCandidate.debt.convertibleNotes)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Defaulted Claims / Obligations:</span>
                    <span className="font-semibold text-rose-300">{formatCurrency(selectedCandidate.debt.defaultedLiabilities)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 pt-2 font-bold text-sm">
                    <span className="text-white">Total Debt Burden:</span>
                    <span className="text-amber-400">{formatCurrency(selectedCandidate.debt.totalDebt)}</span>
                  </div>
                </div>
              </div>

              {/* Funder & Court Venue Match */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-sky-400" />
                    3(a)(10) Debt Funder &amp; Court Venue Alignment
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Matching Institutional Funder:</span>
                      <span className="text-sm font-bold text-sky-300">{selectedCandidate.primaryFunderMatch.funderName}</span>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Track Record: {selectedCandidate.primaryFunderMatch.historicalDeals} prior court-approved deals &bull; {selectedCandidate.primaryFunderMatch.typicalDiscount}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">Target Court Jurisdiction Venue:</span>
                      <span className="font-medium text-slate-200">{selectedCandidate.courtJurisdiction}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">Catalyst &amp; Restructuring Notes:</span>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                        {selectedCandidate.catalystNotes}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SEC Filings Section */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Authoritative SEC EDGAR Filings (10-K, 10-Q, 8-K)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedCandidate.keyFilings.map((filing, idx) => (
                  <a
                    key={idx}
                    href={filing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-500/50 flex items-center justify-between transition group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-xs font-extrabold rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                          {filing.form}
                        </span>
                        <span className="text-xs font-medium text-slate-300">
                          {filing.filingDate}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 group-hover:text-slate-200 transition">
                        {filing.description}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition" />
                  </a>
                ))}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Explanation Modal */}
      {showExplanationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-2xl glass-panel border border-slate-700 shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-base">
                <Scale className="w-5 h-5" />
                Section 3(a)(10) Exemption Overview
              </div>
              <button onClick={() => setShowExplanationModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong>Section 3(a)(10) of the Securities Act of 1933</strong> allows public companies to issue unregistered shares to settle bona fide outstanding debt, claims, or trade payables—provided the terms of the settlement are approved after a fairness hearing by a court of competent jurisdiction (e.g. Florida Circuit Court, California Superior Court).
              </p>
              <h4 className="font-bold text-white text-sm pt-2">Key Criteria for 3(a)(10) Candidate Companies:</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong className="text-emerald-400">Market Cap &lt; $500,000,000</strong>: Micro-caps and small-caps where traditional secondary equity offerings are impractical.</li>
                <li><strong className="text-amber-400">Excessive Real Debt &amp; Payables</strong>: High Accounts Payable, defaulted promissory notes, or toxic convertible debt exceeding current cash reserves.</li>
                <li><strong className="text-sky-400">Funder Monetization Liquidity</strong>: Active daily trading volume allowing institutional funders (Silverback, Trillium, Continuation Capital) to liquidate settled shares smoothly into the market.</li>
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowExplanationModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:bg-sky-500/30 transition"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
