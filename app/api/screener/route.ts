import { NextResponse } from 'next/server';
import { candidateDatabase } from '@/lib/data-3a10';
import { fetchLiveSecData } from '@/lib/sec-edgar-api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const liveTicker = searchParams.get('ticker')?.trim().toUpperCase();

  // 1. Handle live single-ticker SEC EDGAR scraping request
  if (liveTicker) {
    try {
      const liveCandidate = await fetchLiveSecData(liveTicker);
      if (!liveCandidate) {
        return NextResponse.json({ success: false, error: `Could not fetch SEC EDGAR data for ticker ${liveTicker}` }, { status: 444 });
      }
      return NextResponse.json({
        success: true,
        source: 'SEC_EDGAR_LIVE_API',
        data: liveCandidate
      });
    } catch (err: any) {
      return NextResponse.json({
        success: false,
        error: `SEC EDGAR Fetch Failed for "${liveTicker}": ${err.message}`
      }, { status: 400 });
    }
  }

  // 2. Default Screener Filter query
  const query = searchParams.get('q')?.toLowerCase() || '';
  const maxCap = parseFloat(searchParams.get('maxCap') || '500000000');
  const minScore = parseInt(searchParams.get('minScore') || '0', 10);
  const tier = searchParams.get('tier') || 'all';

  let filtered = candidateDatabase.filter(c => {
    if (c.marketCap > maxCap) return false;
    if (c.score3A10 < minScore) return false;
    if (tier !== 'all' && c.tier !== tier) return false;

    if (query) {
      const matchTicker = c.ticker.toLowerCase().includes(query);
      const matchName = c.companyName.toLowerCase().includes(query);
      const matchSector = c.sector.toLowerCase().includes(query);
      const matchFunder = c.primaryFunderMatch.funderName.toLowerCase().includes(query);
      if (!matchTicker && !matchName && !matchSector && !matchFunder) return false;
    }

    return true;
  });

  const totalCandidates = filtered.length;
  const totalDebtAnalyzed = filtered.reduce((acc, curr) => acc + curr.debt.totalDebt, 0);
  const totalMarketCap = filtered.reduce((acc, curr) => acc + curr.marketCap, 0);
  const avgDebtToCap = totalCandidates > 0 
    ? (filtered.reduce((acc, curr) => acc + curr.debtToMarketCapRatio, 0) / totalCandidates) 
    : 0;

  const highConvictionCount = filtered.filter(c => c.tier === 'Tier 1 High Conviction').length;

  return NextResponse.json({
    success: true,
    count: totalCandidates,
    summary: {
      totalCandidates,
      totalDebtAnalyzed,
      totalMarketCap,
      avgDebtToCap,
      highConvictionCount
    },
    data: filtered
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticker } = body;

    if (!ticker) {
      return NextResponse.json({ success: false, error: 'Ticker is required' }, { status: 400 });
    }

    const liveData = await fetchLiveSecData(ticker);
    return NextResponse.json({
      success: true,
      source: 'SEC_EDGAR_LIVE_API',
      data: liveData
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
