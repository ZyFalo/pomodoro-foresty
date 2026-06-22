'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth-store';

interface TreeItem {
  id: string;
  template: {
    id: string;
    name: string;
    imageUrl: string;
    probability: number;
    category: string;
  };
  customName?: string;
  isFavorite: boolean;
  earnedAt: string;
  rarity: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface Stats {
  pomodoros_completed: number;
  total_focus_minutes: number;
  total_trees: number;
  collection: {
    unique: number;
    total: number;
    progress: number;
  };
  by_rarity: Record<string, number>;
}

export function useTrees() {
  const { token } = useAuthStore();
  const [trees, setTrees] = useState<TreeItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, pages: 0 });
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [rarity, setRarity] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [search, setSearch] = useState('');

  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const fetchTrees = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (rarity) params.set('rarity', rarity);
      if (favorite) params.set('favorite', 'true');
      if (search) params.set('search', search);

      const res = await fetch(`/api/trees?${params}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setTrees(data.trees);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching trees:', error);
    } finally {
      setLoading(false);
    }
  }, [headers, rarity, favorite, search]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats', { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [headers]);

  const toggleFavorite = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/trees/${id}/favorite`, {
        method: 'PUT',
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setTrees((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isFavorite: data.is_favorite } : t))
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [headers]);

  const renameTree = useCallback(async (id: string, custom_name: string) => {
    try {
      const res = await fetch(`/api/trees/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ custom_name }),
      });
      if (!res.ok) throw new Error('Error renaming');

      setTrees((prev) =>
        prev.map((t) => (t.id === id ? { ...t, customName: custom_name } : t))
      );
    } catch (error) {
      console.error('Error renaming tree:', error);
    }
  }, [headers]);

  const deleteTree = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/trees/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error('Error deleting');

      setTrees((prev) => prev.filter((t) => t.id !== id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      fetchStats();
    } catch (error) {
      console.error('Error deleting tree:', error);
    }
  }, [headers, fetchStats]);

  // Auto-fetch when filters change
  useEffect(() => {
    if (token) {
      fetchTrees(1);
    }
  }, [token, fetchTrees]);

  // Fetch stats on mount
  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token, fetchStats]);

  return {
    trees,
    pagination,
    stats,
    loading,
    rarity,
    favorite,
    search,
    setRarity,
    setFavorite,
    setSearch,
    fetchTrees,
    fetchStats,
    toggleFavorite,
    renameTree,
    deleteTree,
  };
}
