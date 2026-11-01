/**
 * Auth routing for `/` is handled in middleware with a path-only Location
 * header (avoids host:port redirect loops when accessed via public IP).
 */
export default function HomePage() {
  return null;
}
