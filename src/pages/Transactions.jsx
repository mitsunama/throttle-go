import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import BikeCard from '../components/bike/bikeCard';
import BikeDetail from '../components/bike/bikeDetail';
import ConfirmModal from '../components/modals/ConfirmModal';
import { getUserIdentifier } from '../services/userService';
import useFetch from '../hooks/useFetch';
import { bikeService } from '../services/bikeService';
import { transactionService as tx } from '../services/transactionService';

const TABS = [
  { key: 'cart', label: 'My cart', load: tx.cart, empty: 'Your cart is empty. Add a bike from the showroom and wait for the seller to approve.' },
  { key: 'requests', label: 'Buy requests', load: tx.requests, empty: 'No buyers are waiting on you.' },
  { key: 'listings', label: 'My listings', load: bikeService.mine, empty: 'You haven’t listed any bikes yet.' },
  { key: 'history', label: 'History', load: tx.history, empty: 'No completed sales or purchases yet.' },
];

export default function Transactions() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.find((t) => t.key === params.get('tab')) || TABS[0];
  return (
    <div className="container page">
      <h1>Transactions</h1>
      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={t.key === tab.key}
            className={t.key === tab.key ? 'tab is-active' : 'tab'}
            onClick={() => setParams({ tab: t.key })}
          >
            {t.label}
          </button>
        ))}
      </div>
      <TabPanel key={tab.key} tab={tab} />
    </div>
  );
}

function TabPanel({ tab }) {
  const { data, error, loading, reload } = useFetch(tab.load);
  const [confirm, setConfirm] = useState(null); // { bike, title, message, label, danger, run }
  const [actionError, setActionError] = useState(null);
  const [open, setOpen] = useState(null); // bike shown in the detail sheet

  const ask = (cfg) => setConfirm(cfg);
  const perform = async () => {
    const { run } = confirm;
    setConfirm(null);
    try {
      setActionError(null);
      await run();
    } catch (e) {
      setActionError(e.message);
    }
    reload();
  };

  const actionsFor = (b) => {
    if (tab.key === 'cart') {
      return <button className="btn btn--quiet" onClick={() => ask({
        title: 'Remove from cart?', message: `${b.name} goes back on sale.`, label: 'Remove',
        run: () => tx.removeFromCart(b.transaction_id),
      })}>Remove from cart</button>;
    }
    if (tab.key === 'requests') {
      return (
        <>
          <button className="btn btn--primary" onClick={() => ask({
            title: 'Approve this sale?', message: `${b.name} will be marked as sold and the sale date recorded.`, label: 'Approve sale',
            run: () => tx.approve(b.transaction_id),
          })}>Approve sale</button>
          <button className="btn btn--quiet" onClick={() => ask({
            title: 'Decline this request?', message: `${b.name} goes back on sale and the buyer is notified in their cart.`, label: 'Decline',
            danger: true, run: () => tx.decline(b.transaction_id),
          })}>Decline</button>
        </>
      );
    }
    if (tab.key === 'listings' && b.status === 'Active') {
      return (
        <>
          <Link className="btn btn--quiet" to={`/bikes/${b.id}/edit`}>Edit</Link>
          <button className="btn btn--danger-quiet" onClick={() => ask({
            title: 'Delete this listing?', message: `${b.name} will be removed from the showroom.`, label: 'Delete listing',
            danger: true, run: () => bikeService.remove(b.id),
          })}>Delete</button>
        </>
      );
    }
    return null;
  };

  return (
    <>
      {error && <p className="error">{error}</p>}
      {actionError && <p className="error" role="alert">{actionError}</p>}
      {loading && !data && <p className="muted">Loading…</p>}
      {data && data.length === 0 && <p className="empty">{tab.empty}</p>}
      <div className="grid">
        {(data || []).map((b) => (
          <div key={b.transaction_id}>
            {tab.key === 'history' && (
              <p className="role">{b.buyer_id === getUserIdentifier() ? 'You bought this' : 'You sold this'}</p>
            )}
            <BikeCard bike={b} onOpen={setOpen} actions={actionsFor(b)} />
          </div>
        ))}
      </div>
      {open && <BikeDetail bike={open} onClose={() => setOpen(null)} />}
      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.label}
          danger={confirm.danger}
          onConfirm={perform}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}
