import { assetUrl } from '../../config/api';
import { STATUS_LABEL } from '../../data/bike';
import { formatDate, formatDisplacement, formatPrice } from '../../utils/format';
import BikePhoto from './BikePhoto';
import BikeSpecs from './BikeSpecs';

// The whole card opens the bike's detail: the name is a real button whose
// ::after stretches over the card (see App.css), so keyboards work too.
export default function BikeCard({ bike, onOpen, actions }) {
  const image = assetUrl(bike.image_url);
  return (
    <article className={onOpen ? 'bike-card is-clickable' : 'bike-card'}>
      <BikePhoto className="bike-card__image" src={image} />
      <div className="bike-card__body">
        <h3 className="bike-card__name">
          {onOpen ? (
            <button type="button" className="bike-card__open" onClick={() => onOpen(bike)}>{bike.name}</button>
          ) : (
            bike.name
          )}
        </h3>
        <div className="bike-card__meta">
          <span className="bike-card__cc">{formatDisplacement(bike.displacement)}</span>
          {bike.status && (
            <span className={`status status--${bike.status.toLowerCase()}`}>{STATUS_LABEL[bike.status]}</span>
          )}
        </div>
        <p className="bike-card__price">{formatPrice(bike.price)}</p>
        <BikeSpecs specs={bike.specs} />
        {bike.bought_at && <p className="muted">Sold on {formatDate(bike.bought_at)}</p>}
        {actions && <div className="bike-card__actions">{actions}</div>}
      </div>
    </article>
  );
}
