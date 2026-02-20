import { Link, useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center">
        <h1 className="mb-2 text-6xl font-bold text-foreground">404</h1>
        <p className="mb-2 text-xl text-muted-foreground">Page not found</p>
        <p className="mb-6 text-sm text-muted-foreground">
          <code className="rounded bg-secondary px-2 py-1">{location.pathname}</code> is not a valid route.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
