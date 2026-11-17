import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BikeCard from '../components/bike/bikeCard';
import BikeDetail from '../components/bike/bikeDetail';
import AdvancedFilter from '../components/common/AdvancedFilter';
import ConfirmModal from '../components/modals/ConfirmModal';
import { DEFAULT_FILTERS } from '../data/bike';
import useFetch from '../hooks/useFetch';
import { bikeService } from '../services/bikeService';
import { transactionService } from '../services/transactionService';
import { applyFilters } from '../utils/filters';
import { formatPrice } from '../utils/format';

export default function Showroom() {
  const { data, error, loading, reload } = useFetch(bikeService.list);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [open, setOpen] = useState(null);      // bike in the detail sheet
  const [confirm, setConfirm] = useState(null); // bike awaiting "add to cart" confirmation
  const [notice, setNotice] = useState(null);

  const bikes = useMemo(() => applyFilters(data || [], filters), [data, filters]);

  const addToCart = async () => {
    const bike = confirm;
    setConfirm(null);
    setOpen(null);
    try {
      await transactionService.addToCart(bike.transaction_id);
      setNotice({ ok: true, text: `${bike.name} is in your cart. The seller will review your request.` });
    } catch (e) {
      setNotice({ ok: false, text: e.message });
    }
    reload();
  };

  const actionsFor = (bike) =>
    bike.is_mine ? (
      <Link className="btn btn--quiet" to={`/bikes/${bike.id}/edit`}>Edit listing</Link>
    ) : (
      <button className="btn btn--primary" onClick={() => setConfirm(bike)}>Add to cart</button>
    );

  return (
    <div className="container page">
      <div className="page-head">
        <h1>Showroom</h1>
        <Link to="/sell" className="btn btn--primary">Sell a bike</Link>
      </div>
      <AdvancedFilter value={filters} onChange={setFilters} />
      {notice && <p className={notice.ok ? 'notice' : 'error'} role="status">{notice.text}</p>}
      {error && <p className="error">{error}</p>}
      {loading && !data && <p className="muted">Loading bikes…</p>}
      {data && bikes.length === 0 && (
        <p className="empty">
          {data.length === 0 ? 'No bikes for sale yet. ' : 'No bikes match those filters. '}
          {data.length === 0 && <Link to="/sell">List the first one.</Link>}
        </p>
      )}
      <div className="grid">
        {bikes.map((b) => (
          <BikeCard key={b.id} bike={b} onOpen={setOpen} actions={actionsFor(b)} />
        ))}
      </div>
      {open && <BikeDetail bike={open} onClose={() => setOpen(null)} actions={actionsFor(open)} />}
      {confirm && (
        <ConfirmModal
          title="Add to cart?"
          message={`${confirm.name} for ${formatPrice(confirm.price)}. The sale completes once the seller approves.`}
          confirmLabel="Add to cart"
          onConfirm={addToCart}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
