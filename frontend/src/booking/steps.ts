import type { Merchant } from '../types';

export type BookingStepKey =
  | 'service'
  | 'vehicle'
  | 'tattoo'
  | 'datetime'
  | 'info'
  | 'payment'
  | 'confirm';

export interface BookingStep {
  key: BookingStepKey;
  label: string;
}

export function getStepsForMerchant(merchant: Merchant | null, requiresDeposit: boolean): BookingStep[] {
  const vertical = merchant?.vertical ?? 'GENERIC';
  const showVehicle = vertical === 'AUTOMOTIVE' || vertical === 'POWERSPORTS';
  const showTattoo = vertical === 'TATTOO';

  return [
    { key: 'service', label: 'Service' },
    ...(showVehicle ? [{ key: 'vehicle' as BookingStepKey, label: 'Vehicle' }] : []),
    ...(showTattoo ? [{ key: 'tattoo' as BookingStepKey, label: 'Design' }] : []),
    { key: 'datetime', label: 'Date & Time' },
    { key: 'info', label: 'Your Info' },
    ...(requiresDeposit ? [{ key: 'payment' as BookingStepKey, label: 'Payment' }] : []),
    { key: 'confirm', label: 'Confirm' },
  ];
}
