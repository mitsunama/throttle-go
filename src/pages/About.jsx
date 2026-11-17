export default function About() {
  return (
    <div className="container page page--narrow">
      <h1>About Throttle</h1>
      <p className="muted">Made by Ashar Firdaus, ID 21120124130062, from Kelompok 03</p>
      <p>Throttle connects motorcycle sellers directly with buyers.</p>
      <ol className="steps">
        <li><strong>List.</strong> A seller posts a bike with its price, specs and photo.</li>
        <li><strong>Add to cart.</strong> A buyer picks a bike and sends a request. The bike is held for them.</li>
        <li><strong>Approve.</strong> The seller reviews the request. On approval the bike is sold and the date is recorded.</li>
      </ol>
      <p>If the seller declines, or the buyer removes the bike from their cart, it goes back on sale.</p>
    </div>
  );
}
