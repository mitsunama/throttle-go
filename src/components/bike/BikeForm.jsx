import { useState } from 'react';
import { assetUrl } from '../../config/api';
import { CONDITIONS } from '../../data/bike';
import { ccNumber, normalizeSpecs } from '../../utils/format';
import { compressImage } from '../../utils/image';
import BikePhoto from './BikePhoto';

// Shared by CreateBike and EditBike.
export default function BikeForm({ initial, submitLabel, onSubmit }) {
  const [form, setForm] = useState(() => ({
    name: initial?.name ?? '',
    displacement: initial ? String(ccNumber(initial.displacement) || '') : '',
    price: initial ? String(Number(initial.price)) : '',
    description: initial?.description ?? '',
    ...normalizeSpecs(initial?.specs), // model_year, cylinder, condition
  }));
  const [image, setImage] = useState(null); // new photo as a data URL
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const preview = image || assetUrl(initial?.image_url);

  const pickPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setError(null);
      setImage(await compressImage(file));
    } catch (err) {
      setError(err.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        name: form.name,
        displacement: form.displacement,
        price: Number(form.price),
        description: form.description,
        specs: { model_year: form.model_year, cylinder: form.cylinder, condition: form.condition },
        ...(image ? { image } : {}),
      });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      {error && <p className="error" role="alert">{error}</p>}

      <label>Bike name
        <input required value={form.name} onChange={set('name')} placeholder="Yamaha MT-25" />
      </label>

      <div className="form__row">
        <label>Displacement
          <span className="input-suffix">
            <input required type="number" min="1" inputMode="numeric" value={form.displacement} onChange={set('displacement')} placeholder="250" />
            <span aria-hidden="true">cc</span>
          </span>
        </label>
        <label>Price (Rp)
          <input required type="number" min="0" value={form.price} onChange={set('price')} placeholder="55000000" />
        </label>
      </div>

      <div className="form__row form__row--3">
        <label>Model year
          <input required inputMode="numeric" maxLength={4} pattern="\d{4}" title="Four digits, like 2019" value={form.model_year} onChange={set('model_year')} placeholder="2019" />
        </label>
        <label>Cylinder
          <input required maxLength={30} value={form.cylinder} onChange={set('cylinder')} placeholder="2" />
        </label>
        <label>Condition
          <select required value={form.condition} onChange={set('condition')}>
            <option value="" disabled>Select…</option>
            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>

      <label>Photo
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickPhoto} />
      </label>
      {preview && <BikePhoto className="form__preview" src={preview} alt="Selected bike" />}

      <label>Description
        <textarea rows="4" value={form.description} onChange={set('description')} />
      </label>

      <button className="btn btn--primary" disabled={busy}>{busy ? 'Saving…' : submitLabel}</button>
    </form>
  );
}
