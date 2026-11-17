import { DISPLACEMENT_BANDS } from '../data/bike';
import { ccNumber } from './format';

export function applyFilters(bikes, { q, band, maxPrice, sort }) {
  const needle = q.trim().toLowerCase();
  const inBand = DISPLACEMENT_BANDS.find((b) => b.value === band)?.test ?? (() => true);
  const cap = Number(maxPrice) || Infinity;

  const result = bikes.filter(
    (b) =>
      (!needle || `${b.name} ${b.description || ''}`.toLowerCase().includes(needle)) &&
      inBand(ccNumber(b.displacement)) &&
      Number(b.price) <= cap
  );

  const by = {
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    'cc-desc': (a, b) => ccNumber(b.displacement) - ccNumber(a.displacement),
    newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
  }[sort];
  return result.sort(by);
}
