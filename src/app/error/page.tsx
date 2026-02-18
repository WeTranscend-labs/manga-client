import { Route } from '@/constants/routes';
import Link from 'next/link';

export default function ErrorPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background text-foreground">
      <h1 className="text-4xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground">
        We encountered an unexpected error. Please try again later.
      </p>
      <Link
        href={Route.HOME}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Go back home
      </Link>
    </div>
  );
}
