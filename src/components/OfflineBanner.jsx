import useOnlineStatus from '../hooks/useOnlineStatus';

export default function OfflineBanner() {
  if (useOnlineStatus()) return null;
  return (
    <div className="offline-banner" role="status">
      You’re offline. Bikes you’ve already viewed are still here, but listing, carting and approving need a connection.
    </div>
  );
}
