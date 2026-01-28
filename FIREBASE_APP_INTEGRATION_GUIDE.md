# Firebase Integration Guide for Individual Apps

## Overview

All apps in the therobots.io ecosystem share a single Firebase project. This guide explains how to integrate Firebase authentication and Firestore into individual apps.

**Firebase Project:** `therobots-io`
**Main Hub:** https://therobots.io/apps.html (GitHub Pages)
**Individual Apps:** Hosted on Vercel

---

## Firebase Configuration

Use this configuration in all apps:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBS-ivqeT1Dj20xEQl2oUMsKsGnkBItv_I",
  authDomain: "therobots-io.firebaseapp.com",
  projectId: "therobots-io",
  storageBucket: "therobots-io.firebasestorage.app",
  messagingSenderId: "664502781350",
  appId: "1:664502781350:web:cbb1e91fe5216252707b67"
};
```

---

## Authentication Options

### Option 1: Redirect to Hub (Recommended for Simple Apps)

Redirect users to therobots.io for authentication, then receive tokens back:

```javascript
function loginViaHub() {
  const returnUrl = window.location.href;
  const appName = 'Your_App_Name'; // Use underscores, matches image naming
  window.location.href = `https://therobots.io/auth/login.html?app=${appName}&return_url=${encodeURIComponent(returnUrl)}`;
}

// On page load, check for returning tokens
function checkAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const firebaseToken = params.get('firebase_token');
  const uid = params.get('uid');

  if (firebaseToken && uid) {
    // User is authenticated - store and use
    localStorage.setItem('firebase_token', firebaseToken);
    localStorage.setItem('uid', uid);

    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
  }
}
```

### Option 2: Direct Firebase Auth (For Apps Needing Full Control)

Install Firebase SDK and handle auth directly:

```bash
npm install firebase
```

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, signInAnonymously, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Google Sign-In
async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
  }
}

// Anonymous Sign-In (for apps that don't require identity)
async function signInAnon() {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Anonymous sign-in error:', error);
  }
}

// Listen for auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User signed in:', user.uid);
    // Track login
    trackAppLogin(user);
  } else {
    console.log('User signed out');
  }
});
```

---

## Firestore Collections

### Shared Collections (Used by Hub)

| Collection | Document ID Format | Purpose |
|------------|-------------------|---------|
| `/users/{uid}` | Firebase UID | User profiles |
| `/logins/{appSlug}_{uid}` | e.g., `ai-tutor-kids_abc123` | Login tracking per app |
| `/ratings/{appSlug}_{uid}` | e.g., `ai-tutor-kids_abc123` | App ratings |
| `/feedback/{id}` | Auto-generated | User feedback |

### App-Specific Collections

Each app can create its own collections under a namespace:

```
/apps/{appSlug}/...
```

Example for "AI Tutor Kids":
```
/apps/ai-tutor-kids/sessions/{sessionId}
/apps/ai-tutor-kids/progress/{oderId}
/apps/ai-tutor-kids/settings/{oderId}
```

---

## Tracking User Logins

**IMPORTANT:** Always track logins so the hub can monitor usage.

```javascript
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';

async function trackAppLogin(user, appSlug) {
  const loginDocId = `${appSlug}_${user.uid}`;
  const loginRef = doc(db, 'logins', loginDocId);

  try {
    const loginDoc = await getDoc(loginRef);

    if (loginDoc.exists()) {
      await updateDoc(loginRef, {
        loginCount: increment(1),
        lastLoginAt: serverTimestamp()
      });
    } else {
      await setDoc(loginRef, {
        userId: user.uid,
        email: user.email || `anonymous-${user.uid.substring(0, 8)}@therobots.io`,
        app: appSlug,
        loginCount: 1,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Failed to track login:', error);
  }
}
```

---

## Firestore Security Rules

The hub has these rules. Your app-specific data should follow similar patterns:

```javascript
// Users can only access their own data
match /apps/{appSlug}/{collection}/{docId} {
  allow read, write: if request.auth != null
                     && resource.data.userId == request.auth.uid;
}
```

**If you need new collections or rules**, communicate this to the main terminal working on therobots.io.

---

## Migration from Supabase

If the app currently uses Supabase:

### Before (Supabase)
```javascript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', userId);
```

### After (Firebase)
```javascript
import { collection, query, where, getDocs } from 'firebase/firestore';

const q = query(
  collection(db, 'apps/your-app-slug/table_name'),
  where('userId', '==', userId)
);
const snapshot = await getDocs(q);
const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

---

## Important Notes

1. **Authorized Domains**: The domain must be added to Firebase Console → Authentication → Settings → Authorized domains. Currently authorized:
   - `therobots-io.firebaseapp.com`
   - `therobots.io`
   - `localhost`
   - Vercel preview URLs may need to be added

2. **App Slug Convention**: Use lowercase with hyphens (e.g., `ai-tutor-kids`), derived from the Vercel URL.

3. **Modifications to Hub**: If you need changes to:
   - Firestore Security Rules
   - Shared collections structure
   - Authentication flow
   - The apps.html hub page

   **State clearly**: "This requires modification to therobots.io hub" and describe what's needed.

4. **Testing**: Test authentication locally before deploying. Use Firebase emulator suite if needed.

---

## Quick Start Checklist

- [ ] Add Firebase SDK to your app
- [ ] Use the shared `firebaseConfig`
- [ ] Implement authentication (redirect or direct)
- [ ] Track logins using `trackAppLogin()`
- [ ] Use app-specific collections: `/apps/{your-app-slug}/...`
- [ ] Test Google sign-in works
- [ ] Verify data appears in Firestore Console

---

## Contact

For questions or required hub modifications, communicate via the main therobots.io terminal session.
