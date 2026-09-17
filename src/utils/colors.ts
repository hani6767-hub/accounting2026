export const ChartPalette = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#F43F5E', // Rose
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#84CC16'  // Lime
];

export const COLOR_PALETTE = ChartPalette;

export function getItemColor(colorOrIndex: string | number, fallbackIndex = 0): string {
  if (typeof colorOrIndex === 'number') {
    return ChartPalette[Math.abs(colorOrIndex) % ChartPalette.length];
  }
  if (colorOrIndex && colorOrIndex.startsWith('#') && colorOrIndex.length >= 7) {
    return colorOrIndex.substring(0, 7);
  }
  return ChartPalette[fallbackIndex % ChartPalette.length];
}
