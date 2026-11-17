import { useState } from 'react';
import { getUserProfile, saveUserProfile } from '../services/userService';
import { compressImage } from '../utils/image';

export default function Profile() {
  const [initial] = useState(getUserProfile);
  const [username, setUsername] = useState(initial.username || '');
  const [bio, setBio] = useState(initial.bio || '');
  const [avatar, setAvatar] = useState(initial.avatar || null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const pickAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setError(null);
      setSaved(false);
      setAvatar(await compressImage(file, { maxSize: 256, square: true }));
    } catch (err) {
      setError(err.message);
    }
  };

  const save = (e) => {
    e.preventDefault();
    const result = saveUserProfile({
      ...getUserProfile(),
      username: username.trim() || 'Rider',
      bio: bio.trim(),
      avatar,
    });
    if (result.success) {
      setUsername(result.data.username);
      setError(null);
      setSaved(true);
    } else {
      setError('Couldn’t save your profile. Your browser may be blocking storage.');
    }
  };

  return (
    <div className="container page page--narrow">
      <h1>Profile</h1>
      <form className="form" onSubmit={save}>
        {error && <p className="error" role="alert">{error}</p>}
        {saved && <p className="notice" role="status">Profile saved.</p>}

        <div className="profile__avatar-row">
          {avatar ? (
            <img className="avatar" src={avatar} alt="Your avatar" />
          ) : (
            <div className="avatar avatar--empty" aria-hidden="true">{(username || 'R').charAt(0).toUpperCase()}</div>
          )}
          <div className="profile__avatar-actions">
            <label>Avatar
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickAvatar} />
            </label>
            {avatar && (
              <button type="button" className="btn btn--quiet" onClick={() => { setAvatar(null); setSaved(false); }}>
                Remove avatar
              </button>
            )}
          </div>
        </div>

        <label>Username
          <input value={username} maxLength={30} onChange={(e) => { setUsername(e.target.value); setSaved(false); }} placeholder="Rider" />
        </label>
        <label>Description
          <textarea rows="4" maxLength={200} value={bio} onChange={(e) => { setBio(e.target.value); setSaved(false); }} placeholder="Tell buyers a little about yourself" />
        </label>
        <button className="btn btn--primary">Save profile</button>
        <p className="muted">Your profile is stored in this browser only.</p>
      </form>
    </div>
  );
}
