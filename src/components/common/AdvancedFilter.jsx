import { DEFAULT_FILTERS, DISPLACEMENT_BANDS, SORT_OPTIONS } from '../../data/bike';

export default function AdvancedFilter({ value, onChange }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });

  return (
    <form className="filter" onSubmit={(e) => e.preventDefault()} aria-label="Filter bikes">
      <label className="filter__search">Search
        <input type="search" value={value.q} onChange={set('q')} placeholder="Name or description" />
      </label>
      <label>Engine size
        <select value={value.band} onChange={set('band')}>
          {DISPLACEMENT_BANDS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>
      </label>
      <label>Max price (Rp)
        <input type="number" min="0" value={value.maxPrice} onChange={set('maxPrice')} placeholder="No limit" />
      </label>
      <label>Sort by
        <select value={value.sort} onChange={set('sort')}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
      <button type="button" className="btn btn--quiet" onClick={() => onChange(DEFAULT_FILTERS)}>Clear filters</button>
    </form>
  );
}
