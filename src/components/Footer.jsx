import { Link } from 'react-router-dom';
import useInstallPrompt from '../hooks/useInstallPrompt';

export default function Footer() {
  const { canInstall, install, installed, ios } = useInstallPrompt();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span>Throttle. Buy and sell motorcycles, seller to buyer. Always ride safely.</span>
        <span className="footer__links">
          {!installed && canInstall && (
            <button type="button" className="footer__install" onClick={install}>Install app</button>
          )}
          {!installed && !canInstall && ios && (
            <span>To install: tap Share, then Add to Home Screen.</span>
          )}
          <Link to="/about" className="footer__link">About</Link>
        </span>
      </div>
    </footer>
  );
}
