import { useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BikeForm from '../components/bike/BikeForm';
import useFetch from '../hooks/useFetch';
import { bikeService } from '../services/bikeService';

export default function EditBike() {
  const { id } = useParams();
  const navigate = useNavigate();
  const load = useCallback(() => bikeService.get(id), [id]);
  const { data: bike, error, loading } = useFetch(load);

  return (
    <div className="container page page--narrow">
      <h1>Edit listing</h1>
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}
      {bike && !bike.is_mine && <p className="error">You can only edit your own listings.</p>}
      {bike && bike.is_mine && bike.status !== 'Active' && (
        <p className="error">This bike has a buyer waiting or is sold, so it can’t be edited. <Link to="/transactions">Go to transactions</Link></p>
      )}
      {bike && bike.is_mine && bike.status === 'Active' && (
        <BikeForm
          initial={bike}
          submitLabel="Save changes"
          onSubmit={async (values) => {
            await bikeService.update(id, values);
            navigate('/transactions?tab=listings');
          }}
        />
      )}
    </div>
  );
}
