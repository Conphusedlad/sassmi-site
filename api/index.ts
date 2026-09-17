import { handle } from 'hono/vercel'
import app from '../server/app'

// Vercel Function (Node.js runtime). vercel.json rewrites every /api/* request here.
// Named method exports use Vercel's Web-standard Request/Response signature; the default export
// keeps the Hono-documented shape as a fallback.
const handler = handle(app)
export default handler
export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
export const OPTIONS = handler
