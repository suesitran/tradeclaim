export const LIABILITY_OPTIONS = [
  { value: 'workmanship', label: 'Our workmanship' },
  { value: 'outside_scope', label: 'Outside the quoted scope' },
  { value: 'other_trade', label: 'Damage by another trade' },
  { value: 'unclear', label: 'Not clear yet' },
];

export const LIABILITY_LABELS = {
  workmanship: 'Our workmanship',
  outside_scope: 'Outside scope',
  other_trade: 'Other trade',
  unclear: 'Not clear',
};

export const LIABILITY_TONES = {
  workmanship: 'bg-[#FBE7E4] text-[#8C2A1E] border-[#F1CBC5]',
  outside_scope: 'bg-[#E4F0E8] text-[#245B3B] border-[#C6DFCE]',
  other_trade: 'bg-[#E7EEF5] text-[#1F4A70] border-[#CBDCEB]',
  unclear: 'bg-[#EDEBE4] text-[#4A4F55] border-[#DCD7CB]',
};

export const DEFECT_STATUS_LABELS = {
  open: 'Open',
  rectified: 'Rectified',
  disputed: 'Disputed',
};

export const DEFECT_STATUS_TONES = {
  open: 'bg-[#FBE7E4] text-[#8C2A1E] border-[#F1CBC5]',
  rectified: 'bg-[#E4F0E8] text-[#245B3B] border-[#C6DFCE]',
  disputed: 'bg-[#EDEBE4] text-[#4A4F55] border-[#DCD7CB]',
};

export const OUTCOME_OPTIONS = [
  { value: 'resolved', label: 'Fixed on the visit' },
  { value: 'further_work', label: 'Further work needed' },
  { value: 'no_access', label: 'No access on the day' },
  { value: 'not_our_work', label: 'Not our work' },
];

export const OUTCOME_LABELS = {
  resolved: 'Fixed on the visit',
  further_work: 'Further work needed',
  no_access: 'No access',
  not_our_work: 'Not our work',
};