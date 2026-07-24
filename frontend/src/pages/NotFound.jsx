import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <p className="font-mono text-sm font-medium text-signal">404</p>
      <h1 className="mt-4 font-display text-3xl font-medium text-ink">Page not found</h1>
      <p className="mt-2 text-graphite">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link to="/">
        <Button className="mt-8">Back to home</Button>
      </Link>
    </div>
  );
}

export default NotFound;
