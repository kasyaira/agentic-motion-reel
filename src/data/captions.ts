export type CaptionWord = { w: string; start: number; end: number };

/**
 * 16 — CAPTION SCRIPT (word-level timings, in scene-local frames @30fps)
 * Timed against the synthesized narration in public/audio/voice.mp3.
 */
export const CAPTION_LINE: CaptionWord[] = [
  { w: 'Every', start: 6, end: 19 },
  { w: 'frame', start: 19, end: 33 },
  { w: 'is', start: 33, end: 41 },
  { w: 'rendered', start: 41, end: 60 },
  { w: 'from', start: 60, end: 71 },
  { w: 'code.', start: 71, end: 89 },
  { w: 'Every', start: 97, end: 110 },
  { w: 'sound', start: 110, end: 125 },
  { w: 'is', start: 125, end: 132 },
  { w: 'synthesized', start: 132, end: 156 },
  { w: 'on', start: 156, end: 166 },
  { w: 'purpose.', start: 166, end: 186 },
];
