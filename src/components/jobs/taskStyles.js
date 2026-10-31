// Shared class strings for the checklist workflow screen (warm bone paper, hanging numerals).
export const CARD =
  'overflow-hidden rounded-[6px] border border-[#DED6C7] bg-white shadow-[0_10px_30px_-18px_rgba(60,40,15,0.35)]';

export const CARD_HEAD = 'flex items-center justify-between gap-4 border-b border-[#DED6C7] bg-[#F6F1E6] px-5 py-[13px]';

export const CARD_META = 'flex flex-wrap items-center gap-x-[14px] gap-y-1 text-[11px] text-[#6b6457]';

export const EMPTY =
  'rounded-r-[4px] border-l-[3px] border-[#9A5B2A] bg-[#F1EBDE] px-5 py-[18px] text-[14px] leading-[1.55] text-[#6b6457]';

export const SMALL_ACTION =
  'inline-flex items-center gap-[5px] rounded-[3px] border border-[#DED6C7] bg-white px-[11px] py-[6px] text-[11px] font-semibold text-[#1B1A17] transition-colors duration-200 hover:border-[#9A5B2A] hover:text-[#9A5B2A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A5B2A]';

export const SECTION_LINK =
  'text-[11px] font-semibold text-[#9A5B2A] transition-colors duration-200 hover:text-[#1B1A17] hover:underline';

const HERO_ACTION_BASE =
  'inline-flex items-center gap-2 rounded-[4px] border px-4 py-2.5 text-[13px] font-semibold text-[#FAF7F1] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E3C9A8]';

export const HERO_ACTION = `${HERO_ACTION_BASE} border-[#DED6C7] bg-transparent hover:bg-[rgba(250,247,241,0.14)] active:bg-[rgba(250,247,241,0.24)]`;

export const HERO_ACTION_PRIMARY = `${HERO_ACTION_BASE} border-[#9A5B2A] bg-[#9A5B2A] hover:bg-[#B06C36] active:bg-[#B06C36]`;

const TASK_ACTION_BASE =
  'inline-flex flex-none items-center justify-center rounded-[4px] border-[1.5px] px-[22px] py-[14px] text-[14px] font-bold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#9A5B2A] active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)]';

export const TASK_ACTION = `${TASK_ACTION_BASE} border-[#1B1A17] bg-[#1B1A17] text-[#FAF7F1] hover:border-[#9A5B2A] hover:bg-[#9A5B2A]`;

export const TASK_ACTION_OUTLINE = `${TASK_ACTION_BASE} border-[#1B1A17] bg-transparent text-[#1B1A17] hover:bg-[#1B1A17] hover:text-[#FAF7F1]`;