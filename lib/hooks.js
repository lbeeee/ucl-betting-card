'use client';

import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((r) => r.json());

/**
 * Poll live odds. Refreshes every ODDS_POLL_INTERVAL ms.
 */
export function useLiveOdds() {
  const interval = parseInt(process.env.NEXT_PUBLIC_ODDS_POLL_INTERVAL || '60000');
  const { data, error, isLoading, mutate } = useSWR('/api/odds', fetcher, {
    refreshInterval: interval,
    revalidateOnFocus: true,
    dedupingInterval: 10000,
  });

  return {
    odds: data?.odds || {},
    source: data?.source || 'static',
    remaining: data?.remaining,
    fetchedAt: data?.fetchedAt,
    error: data?.error || error,
    isLoading,
    refresh: mutate,
  };
}

/**
 * Poll live scores. Faster during live matches.
 */
export function useLiveScores() {
  const interval = parseInt(process.env.NEXT_PUBLIC_SCORES_POLL_INTERVAL || '30000');
  const { data, error, isLoading, mutate } = useSWR('/api/scores', fetcher, {
    refreshInterval: interval,
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  return {
    scores: data?.scores || {},
    source: data?.source || 'static',
    fetchedAt: data?.fetchedAt,
    error: error,
    isLoading,
    refresh: mutate,
  };
}

/**
 * Poll lineups. Slower refresh — lineups only change once.
 */
export function useLineups() {
  const { data, error, isLoading } = useSWR('/api/lineups', fetcher, {
    refreshInterval: 120000, // 2 min
    revalidateOnFocus: true,
  });

  return {
    lineups: data?.lineups || {},
    fetchedAt: data?.fetchedAt,
    error,
    isLoading,
  };
}
