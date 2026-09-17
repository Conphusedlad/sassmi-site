import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="kicker">404</p>
      <h1 className="mt-4 text-5xl">This pond has no such lotus.</h1>
      <p className="mt-4 text-ink-soft">The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="btn btn-night mt-8">Back to Sassmi</Link>
    </div>
  )
}
