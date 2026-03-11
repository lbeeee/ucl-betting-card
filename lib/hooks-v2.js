'use client';

import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((r) => r.json());

/**
 * Fetch today's fixtures across all (or filtered) leagues.
 * Polls faster when live matches exist.
 */
export function useFixtures(date, leagueFilter) {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  if (leagueFilter?.length) params.set('leagues', leagueFilter.join(','));

  const url = `/api/fixtures?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    refreshInterval: (latestData) => {
      if (latestData?.liveCount > 0) return 30_000;   // 30s when live
      return 120_000;                                   // 2min otherwise
    },
    revalidateOnFocus: true,
    dedupingInterval: 15_000,
  });

  return {
    fixtures: data?.fixtures || {},
    leagues: data?.leagues || [],
    liveCount: data?.liveCount || 0,
    totalFixtures: data?.totalFixtures || 0,
    source: data?.source || {},
    fetchedAt: data?.fetchedAt,
    error: error || null,
    isLoading,
    refresh: mutate,
  };
}

/**
 * Legacy hooks for backward compat with existing UCL match detail page
 */
export function useLiveOdds() {
  const { data, error, isLoading, mutate } = useSWR('/api/odds', fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
    dedupingInterval: 10_000,
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

export function useLiveScores() {
  const { data, error, isLoading, mutate } = useSWR('/api/scores', fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: true,
    dedupingInterval: 5_000,
  });

  return {
    scores: data?.scores || {},
    source: data?.source || 'static',
    fetchedAt: data?.fetchedAt,
    error,
    isLoading,
    refresh: mutate,
  };
}

export function useLineups() {
  const { data, error, isLoading } = useSWR('/api/lineups', fetcher, {
    refreshInterval: 120_000,
    revalidateOnFocus: true,
  });

  return {
    lineups: data?.lineups || {},
    fetchedAt: data?.fetchedAt,
    error,
    isLoading,
  };
}
