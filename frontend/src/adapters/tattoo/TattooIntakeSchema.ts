export const TATTOO_STYLES = [
  'Traditional',
  'Neo-Traditional',
  'Realism',
  'Blackwork',
  'Japanese',
  'Watercolor',
  'Geometric',
  'Dotwork',
  'Tribal',
  'Lettering',
  'Other',
] as const;

export const TATTOO_SIZES = [
  'Tiny (< 2")',
  'Small (2-4")',
  'Medium (4-6")',
  'Large (6-10")',
  'Extra Large (10"+)',
  'Full Sleeve',
  'Half Sleeve',
  'Back Piece',
] as const;

export const TATTOO_TYPES = [
  'New tattoo',
  'Touch-up',
  'Cover-up',
  'Rework',
] as const;

export const COLOR_PREFERENCES = [
  'Full color',
  'Black & grey',
  'Black only',
] as const;

export interface TattooIntakeData {
  style: string;
  placement: string;
  sizeEstimate: string;
  isNewOrRework: string;
  referencePhotos: string[];
  description: string;
  skinToneNotes: string;
  colorPreference: string;
}

export const EMPTY_TATTOO_INTAKE: TattooIntakeData = {
  style: '',
  placement: '',
  sizeEstimate: '',
  isNewOrRework: '',
  referencePhotos: [],
  description: '',
  skinToneNotes: '',
  colorPreference: '',
};

export function validateTattooIntake(data: TattooIntakeData): boolean {
  return !!data.style && !!data.placement && !!data.sizeEstimate && !!data.description;
}
