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
    if (!merchantId) {
      setLoading(false);
      setError('No merchant ID provided');
      return;
    }
    setLoading(true);
    try {
      const data = await api.get<Merchant>(`/merchants/${merchantId}`);
      setMerchant(data);
      setError(null);
    } catch (err) {
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
