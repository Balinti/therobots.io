# Firebase Integration Guide for Individual Apps

## Overview

All apps in the therobots.io ecosystem share a single Firebase project. Authentication is handled centrally through therobots.io, which redirects users back to your app with Firebase tokens.

**Firebase Project:** `therobots-io`
**Auth Hub:** https://therobots.io
**Individual Apps:** Hosted on Vercel (Next.js)

---

## Architecture

```
Your App                    therobots.io                 Google
   │                             │                          │
   │ ──── /signin ─────────────► │                          │
   │      (stores redirect)      │                          │
   │                             │ ───── Google OAuth ────► │
   │                             │ ◄──── User signs in ──── │
   │                             │                          │
   │ ◄─── ?firebase_token&uid ── │                          │
   │      (redirect back)        │                          │
   │                             │                          │
   │ ──── Store in localStorage  │                          │
   │ ──── Show logged in UI      │                          │
```

---

## Required Files (Next.js App Router)

Create these files in your app. Replace `your-app-slug` with your app's slug (lowercase, hyphens, e.g., `transit-mindful`).

### 1. Firebase Config: `src/lib/firebase/config.ts`

```typescript
// Firebase configuration for therobots.io shared project
export const firebaseConfig = {
  apiKey: "AIzaSyBS-ivqeT1Dj20xEQl2oUMsKsGnkBItv_I",
  authDomain: "therobots-io.firebaseapp.com",
  projectId: "therobots-io",
  storageBucket: "therobots-io.firebasestorage.app",
  messagingSenderId: "664502781350",
  appId: "1:664502781350:web:cbb1e91fe5216252707b67"
};

// CHANGE THIS to your app's slug (lowercase with hyphens)
export const APP_SLUG = 'your-app-slug';

// Collection paths
export const COLLECTIONS = {
  // Shared collections (all apps use these)
  logins: 'logins',
  users: 'users',

  // App-specific collections (under /apps/your-app-slug/)
  // Add your own collections here:
  // sessions: `apps/${APP_SLUG}/sessions`,
  // settings: `apps/${APP_SLUG}/settings`,
};
```

### 2. Firebase Client: `src/lib/firebase/client.ts`

```typescript
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Firestore,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { firebaseConfig, COLLECTIONS, APP_SLUG } from './config';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

function getApp(): FirebaseApp {
  if (app) return app;
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
  } else {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getDb(): Firestore {
  if (db) return db;
  db = getFirestore(getApp());
  return db;
}

// Get current user from localStorage
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    const userInfo = localStorage.getItem('user_info');
    if (!userInfo) return null;
    const parsed = JSON.parse(userInfo);
    // Check if token is expired
    if (parsed.expires_at && parsed.expires_at < Math.floor(Date.now() / 1000)) {
      localStorage.removeItem('user_info');
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

// Track login in shared /logins collection
export async function trackLogin(userId: string, email: string) {
  const db = getDb();
  const loginDocId = `${APP_SLUG}_${userId}`;
  const loginRef = doc(db, COLLECTIONS.logins, loginDocId);

  try {
    const loginDoc = await getDoc(loginRef);

    if (loginDoc.exists()) {
      await updateDoc(loginRef, {
        lastLoginAt: serverTimestamp(),
        loginCount: (loginDoc.data().loginCount || 0) + 1,
      });
    } else {
      await setDoc(loginRef, {
        userId,
        email,
        app: APP_SLUG,
        loginCount: 1,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error tracking login:', error);
  }
}

// Re-export Firestore utilities
export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
};
```

### 3. Auth Callback Route: `src/app/auth/callback/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;

  // Firebase tokens from therobots.io auth hub
  const firebaseToken = requestUrl.searchParams.get('firebase_token');
  const uid = requestUrl.searchParams.get('uid');

  if (firebaseToken && uid) {
    // Redirect to set-session page to store tokens client-side
    const params = new URLSearchParams({
      firebase_token: firebaseToken,
      uid: uid,
    });
    return NextResponse.redirect(`${origin}/auth/set-session?${params.toString()}`);
  }

  // No token - redirect to app with error
  return NextResponse.redirect(`${origin}/?auth_error=no_token`);
}
```

### 4. Set Session Page: `src/app/auth/set-session/page.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { trackLogin } from '@/lib/firebase/client';

function CallbackHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const firebaseToken = searchParams.get('firebase_token');
    const uid = searchParams.get('uid');
    const redirectTo = sessionStorage.getItem('auth_redirect') || '/';
    sessionStorage.removeItem('auth_redirect');

    if (firebaseToken && uid) {
      try {
        // Decode Firebase ID token to get user info
        const payload = JSON.parse(atob(firebaseToken.split('.')[1]));

        const userInfo = {
          id: uid,
          email: payload.email || '',
          name: payload.name || payload.email || '',
          avatar_url: payload.picture || '',
          firebase_token: firebaseToken,
          expires_at: payload.exp
        };

        localStorage.setItem('user_info', JSON.stringify(userInfo));
        console.log('User logged in:', payload.email);

        // Track login in Firestore
        if (userInfo.id && userInfo.email) {
          trackLogin(userInfo.id, userInfo.email).catch(console.error);
        }
      } catch (e) {
        console.error('Failed to process token:', e);
      }
    }

    window.location.href = redirectTo;
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function SetSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
```

### 5. Sign In Page: `src/app/signin/page.tsx`

```typescript
'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { APP_SLUG } from '@/lib/firebase/config';

const AUTH_HUB_URL = 'https://therobots.io';

function SignInRedirect() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    // Store where to redirect after auth
    sessionStorage.setItem('auth_redirect', redirect);

    // Redirect to auth hub
    const returnUrl = `${window.location.origin}/auth/callback`;
    const loginUrl = `${AUTH_HUB_URL}/auth/login.html?app=${APP_SLUG}&return_url=${encodeURIComponent(returnUrl)}`;
    window.location.href = loginUrl;
  }, [redirect]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to sign in...</p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignInRedirect />
    </Suspense>
  );
}
```

### 6. Auth Component: `src/components/AuthButton.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/firebase/client';

export function signOut() {
  localStorage.removeItem('user_info');
  window.location.reload();
}

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  if (loading) {
    return <span className="text-gray-400">...</span>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{user.email}</span>
        <button
          onClick={signOut}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => router.push('/signin')}
      className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Sign in with Google
    </button>
  );
}
```

---

## Using Auth in Components

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/firebase/client';

export default function MyComponent() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  if (!user) {
    return <p>Please sign in</p>;
  }

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <p>User ID: {user.id}</p>
    </div>
  );
}
```

---

## Firestore Collections

### Shared Collections (All Apps)

| Collection | Document ID | Purpose |
|------------|-------------|---------|
| `/logins/{appSlug}_{uid}` | e.g., `transit-mindful_abc123` | Login tracking |
| `/users/{uid}` | Firebase UID | User profiles |
| `/ratings/{appSlug}_{uid}` | e.g., `transit-mindful_abc123` | App ratings |
| `/feedback/{auto}` | Auto-generated | User feedback |

### App-Specific Collections

Store your app's data under `/apps/{appSlug}/`:

```
/apps/your-app-slug/sessions/{sessionId}
/apps/your-app-slug/settings/{userId}
/apps/your-app-slug/data/{docId}
```

---

## Firestore Security Rules

These rules are configured in the Firebase Console. Your app data is protected by userId:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Users - only own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Logins - document ID contains userId
    match /logins/{loginId} {
      allow read: if request.auth != null
                  && loginId.matches('.*_' + request.auth.uid + '$');
      allow create: if request.auth != null
                  && loginId.matches('.*_' + request.auth.uid + '$')
                  && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null
                  && loginId.matches('.*_' + request.auth.uid + '$')
                  && resource.data.userId == request.auth.uid;
      allow delete: if false;
    }

    // Ratings
    match /ratings/{ratingId} {
      allow read: if true;
      allow create: if request.auth != null
                    && ratingId == request.resource.data.appSlug + '_' + request.auth.uid
                    && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null
                    && resource.data.userId == request.auth.uid;
      allow delete: if false;
    }

    // Feedback
    match /feedback/{feedbackId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }

    // App-specific data
    match /apps/{appSlug}/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## Dependencies

Add to your `package.json`:

```json
{
  "dependencies": {
    "firebase": "^10.8.0"
  }
}
```

Install:
```bash
npm install firebase
```

---

## File Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.ts          # Receives tokens from hub
│   │   └── set-session/
│   │       └── page.tsx          # Stores tokens in localStorage
│   ├── signin/
│   │   └── page.tsx              # Redirects to auth hub
│   └── page.tsx                  # Your app
├── components/
│   └── AuthButton.tsx            # Sign in/out button
└── lib/
    └── firebase/
        ├── config.ts             # Firebase config + APP_SLUG
        └── client.ts             # Firestore client + helpers
```

---

## Checklist

- [ ] Set `APP_SLUG` in `src/lib/firebase/config.ts`
- [ ] Create all 6 required files
- [ ] Install firebase package
- [ ] Test sign in flow: `/signin` → therobots.io → back to app
- [ ] Verify user info in localStorage after sign in
- [ ] Check login appears in Firestore `/logins` collection
- [ ] Add `AuthButton` component to your app header

---

## Troubleshooting

**"No token" error on callback:**
Check that therobots.io is redirecting to your `/auth/callback` with `?firebase_token=...&uid=...`

**User not persisting after refresh:**
Check localStorage for `user_info` key. Token may be expired.

**Firestore permission denied:**
Ensure your document includes `userId` field matching the authenticated user.

**Sign in redirects but nothing happens:**
Check browser console for errors. Verify `APP_SLUG` matches your Vercel URL slug.
