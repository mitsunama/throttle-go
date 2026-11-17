import { useEffect, useState } from 'react';

// Shows the photo; if the link is dead or blocked, shows a plain placeholder
// instead of a broken-image icon. no-referrer lets photos from hosts that
// block hotlinking from other sites load.
export default function BikePhoto({ src, alt = '', className }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return <div className={`${className} ${className}--empty`} aria-hidden="true" />;
  }
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
