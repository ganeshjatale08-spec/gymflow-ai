import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const PROTECTED = [
  '/dashboard', '/conversations', '/leads', '/members', '/employees',
  '/automations', '/analytics', '/payments', '/settings', '/activity',
  '/import', '/templates',
]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const path = request.nextUrl.pathname
  const isProtected = PROTECTED.some(p => path === p || path.startsWith(p + '/'))
  const isRoot      = path === '/'

  function toLogin() {
    const u = request.nextUrl.clone()
    u.pathname = '/login'
    return NextResponse.redirect(u)
  }
  function toDash() {
    const u = request.nextUrl.clone()
    u.pathname = '/dashboard'
    return NextResponse.redirect(u)
  }

  // If Supabase not configured, block everything protected
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    if (isProtected || isRoot) return toLogin()
    return response
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()

    // Root → dashboard (logged in) or login
    if (isRoot) return user ? toDash() : toLogin()

    // Not logged in → redirect to login
    if (isProtected && !user) return toLogin()

    // Already logged in → skip login page
    if ((path === '/login' || path === '/signup') && user) return toDash()

  } catch {
    // Auth check failed → fail closed (never allow protected pages)
    if (isProtected || isRoot) return toLogin()
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
