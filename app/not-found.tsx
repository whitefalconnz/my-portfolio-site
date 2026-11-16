import Link from "next/link";

export default function NotFound() {
  return (
    <div className="notice">
      <h2>404 — Page Not Found</h2>
      <p className="dim">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/" className="word">
        Go Home
      </Link>
    </div>
  );
}
