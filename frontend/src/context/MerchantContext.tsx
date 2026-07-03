import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { Merchant } from '../types';

interface MerchantContextValue {
  merchant: Merchant | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  logout: () => void;
}

const MerchantContext = createContext<MerchantContextValue>({
  merchant: null,
  loading: true,
  error: null,
  refetch: () => {},
  logout: () => {},
});

export function MerchantProvider({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  const merchantId = searchParams.get('merchant');

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMerchant = useCallback(async () => {
    const token = localStorage.getItem('whosnext_token');

    // No token → not logged in. Send to login rather than showing an error.
    if (!token) {
      setLoading(false);
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    try {
      // Restore the session from the token. This is what lets the PWA reopen
      // (via start_url = /dashboard, no ?merchant= param) and stay logged in.
      // Fall back to the ?merchant= param for backward-compat links.
      const data = merchantId
        ? await api.get<Merchant>(`/merchants/${merchantId}`)
        : await api.get<Merchant>('/auth/me');
      setMerchant(data);
      setError(null);
    } catch (err) {
      // A 401 is already handled in api.ts (clears token + redirects to login).
      setError(err instanceof Error ? err.message : 'Failed to load merchant');
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchMerchant();
  }, [fetchMerchant]);

  const logout = useCallback(() => {
    localStorage.removeItem('whosnext_token');
    window.location.href = '/login';
  }, []);

  return (
    <MerchantContext.Provider value={{ merchant, loading, error, refetch: fetchMerchant, logout }}>
      {children}
    </MerchantContext.Provider>
  );
}

export function useMerchant() {
  return useContext(MerchantContext);
}
