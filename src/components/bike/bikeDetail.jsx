import { useEffect } from 'react';
import { assetUrl } from '../../config/api';
import { STATUS_LABEL } from '../../data/bike';
import { formatDisplacement, formatPrice } from '../../utils/format';
import BikePhoto from './BikePhoto';
import BikeSpecs from './BikeSpecs';

export default function BikeDetail({ bike, onClose, actions }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const image = assetUrl(bike.image_url);

  return (
    <div className="overlay" onClick={onClose}>
      <section
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={bike.name}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="sheet__close" onClick={onClose} aria-label="Close">×</button>
        {image && <BikePhoto className="sheet__image" src={image} alt={bike.name} />}
        <div className="sheet__body">
          <h2>{bike.name}</h2>
          <p className="bike-card__cc">{formatDisplacement(bike.displacement)}</p>
          <p className="bike-card__price">{formatPrice(bike.price)}</p>
          {bike.status && <p className="muted">{STATUS_LABEL[bike.status]}</p>}
          <BikeSpecs specs={bike.specs} />
          {bike.description && <p className="sheet__desc">{bike.description}</p>}
          {actions && <div className="bike-card__actions">{actions}</div>}
        </div>
      </section>
    </div>
  );
}
