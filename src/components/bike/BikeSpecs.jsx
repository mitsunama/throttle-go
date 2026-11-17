import { formatCylinder, normalizeSpecs } from '../../utils/format';

const conditionClass = { Good: 'good', 'Some fixes needed': 'fixes', 'Parts only': 'parts' };

// Model year, cylinder and condition from the bike's specs JSON.
export default function BikeSpecs({ specs }) {
  const s = normalizeSpecs(specs);
  const items = [
    s.model_year && { label: 'Year', value: s.model_year },
    s.cylinder && { label: 'Cylinder', value: formatCylinder(s.cylinder) },
    s.condition && { label: 'Condition', value: s.condition, tone: conditionClass[s.condition] },
  ].filter(Boolean);
  if (!items.length) return null;

  return (
    <dl className="spec-grid">
      {items.map((it) => (
        <div key={it.label}>
          <dt>{it.label}</dt>
          <dd className={it.tone ? `tone tone--${it.tone}` : undefined}>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
