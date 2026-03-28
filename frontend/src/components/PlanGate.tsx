import { useMerchant } from '../context/MerchantContext';
import UpgradePrompt from './UpgradePrompt';
import type { ReactNode } from 'react';

interface PlanGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wraps a feature behind a plan check.
 * If the merchant is on FREE, shows UpgradePrompt (or custom fallback).
 * PRO and GRANDFATHERED merchants see children.
 */
export default function PlanGate({ feature, children, fallback }: PlanGateProps) {
  const { merchant } = useMerchant();

  const isPro = merchant?.plan === 'PRO' || merchant?.plan === 'GRANDFATHERED';

  if (!isPro) {
    return <>{fallback ?? <UpgradePrompt feature={feature} />}</>;
  }

  return <>{children}</>;
}
