export const formatPrice = (n) =>
  'Rp ' + Number(n).toLocaleString('id-ID', { maximumFractionDigits: 0 });

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// "250cc" or "250" -> 250
export const ccNumber = (text) => parseInt(String(text).replace(/[^\d]/g, ''), 10) || 0;

// Always shows the unit: 250 -> "250cc"
export const formatDisplacement = (d) => (ccNumber(d) ? `${ccNumber(d)}cc` : String(d ?? ''));

// "2" -> "2 cyl"; free text like "Single" is shown as typed.
export const formatCylinder = (c) => (/^\d+$/.test(String(c)) ? `${c} cyl` : String(c));

// specs is { model_year, cylinder, condition }. Older rows may hold an array of
// {label, value} pairs, so accept that shape too.
const LEGACY_LABELS = { 'model year': 'model_year', cylinder: 'cylinder', condition: 'condition' };
export function normalizeSpecs(specs) {
  const out = { model_year: '', cylinder: '', condition: '' };
  if (Array.isArray(specs)) {
    specs.forEach((s) => {
      const key = LEGACY_LABELS[String(s?.label).toLowerCase()];
      if (key) out[key] = String(s.value ?? '');
    });
  } else if (specs && typeof specs === 'object') {
    Object.keys(out).forEach((k) => { out[k] = String(specs[k] ?? ''); });
  }
  return out;
}
