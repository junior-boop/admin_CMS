export const onRequest = async (context, next) => {
    const path = context.url.pathname;
    if (!path.startsWith('/admin'))
        return next();
    if (path === '/admin/login' || path === '/admin/logout')
        return next();
    const env = context.locals?.runtime?.env ?? {};
    const adminPassword = env['ADMIN_PASSWORD'];
    // No password configured → open access (local dev)
    if (!adminPassword)
        return next();
    const cookie = context.cookies.get('cms_admin_session')?.value;
    if (!cookie || !await verifyToken(cookie, adminPassword)) {
        return context.redirect('/admin/login');
    }
    return next();
};
// ─── HMAC session helpers ─────────────────────────────────────────────────────
const TTL_MS = 24 * 60 * 60 * 1000;
async function hmac(data, secret) {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const buf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
async function verifyToken(token, password) {
    const dot = token.lastIndexOf('.');
    if (dot === -1)
        return false;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    try {
        if (await hmac(payload, password) !== sig)
            return false;
        const ts = parseInt(atob(payload), 10);
        return Date.now() - ts < TTL_MS;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=middleware.js.map