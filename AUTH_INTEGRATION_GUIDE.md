# Google Auth Integration Guide for TheRobots.io Apps

Use this prompt for Claude Code to add Google authentication to any app.

---

## Prompt for Claude Code:

```
Add Google authentication using therobots.io as the OAuth hub.

## How it works:
1. User clicks "Sign in with Google" → redirect to therobots.io
2. therobots.io handles OAuth with Google
3. therobots.io redirects back to this app with tokens
4. This app stores user info from the decoded JWT

## Implementation:

### 1. Create a Google Auth button/component
When clicked, redirect to:
```javascript
const APP_NAME = 'YOUR_APP_SLUG'; // e.g., 'transit-mindful'
const RETURN_URL = window.location.origin + '/auth/callback';
window.location.href = `https://therobots.io/auth/login.html?app=${APP_NAME}&return_url=${encodeURIComponent(RETURN_URL)}`;
```

### 2. Create an auth callback page at /auth/callback
This page receives tokens and stores user info:

```tsx
// For Next.js: src/app/auth/callback/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');

    if (accessToken) {
      try {
        // Decode JWT to get user info
        const payload = JSON.parse(atob(accessToken.split('.')[1]));

        // Store user info in localStorage
        const userInfo = {
          id: payload.sub,
          email: payload.email,
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: payload.exp
        };

        localStorage.setItem('user_info', JSON.stringify(userInfo));
        console.log('User logged in:', payload.email);
      } catch (e) {
        console.error('Failed to process token:', e);
      }
    }

    router.push('/');
  }, [searchParams, router]);

  return <div>Completing sign in...</div>;
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackHandler />
    </Suspense>
  );
}
```

### 3. Check if user is logged in
```javascript
function getUser() {
  const stored = localStorage.getItem('user_info');
  if (!stored) return null;

  const user = JSON.parse(stored);
  // Check if token expired
  if (user.expires_at && user.expires_at < Date.now() / 1000) {
    localStorage.removeItem('user_info');
    return null;
  }
  return user;
}
```

### 4. Sign out
```javascript
function signOut() {
  localStorage.removeItem('user_info');
  // Optionally redirect to home
  window.location.href = '/';
}
```

## Important Notes:
- Do NOT use Supabase setSession() - it fails cross-domain
- Just decode the JWT and store user info directly
- The access_token can be used for API calls if needed
- therobots.io handles tracking logins in the user_tracking table

## Supabase Credentials (if needed for data operations):
- URL: https://api.srv936332.hstgr.cloud
- Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
```

---

## Quick Reference

| Step | URL/Action |
|------|------------|
| Login redirect | `https://therobots.io/auth/login.html?app=YOUR_APP&return_url=YOUR_CALLBACK` |
| Callback receives | `?access_token=...&refresh_token=...` |
| Store user | `localStorage.setItem('user_info', JSON.stringify({...}))` |
| Get user | `JSON.parse(localStorage.getItem('user_info'))` |
| Sign out | `localStorage.removeItem('user_info')` |
