import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { searchParams, pathname } = request.nextUrl;

    // Check if this is a token redirect (backend sending tokens)
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    // If we detect tokens in the URL and we're NOT already at /oauth/callback
    if (accessToken && refreshToken && pathname !== '/oauth/callback') {
        console.log('[Middleware] Detected tokens, redirecting to /oauth/callback');

        // Redirect to /oauth/callback with all params
        const callbackUrl = new URL('/oauth/callback', request.url);
        searchParams.forEach((value, key) => {
            callbackUrl.searchParams.set(key, value);
        });

        return NextResponse.redirect(callbackUrl);
    }

    return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
