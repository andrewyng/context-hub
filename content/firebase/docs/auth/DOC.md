---
name: auth
description: "Firebase Authentication JavaScript SDK - Comprehensive coding guide for Firebase auth in JavaScript projects"
metadata:
  languages: "javascript"
  versions: "12.14.0"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "firebase,auth,google,identity,session"
---

# Firebase Authentication JavaScript SDK - Comprehensive Coding Guide

## 1. Golden Rule

**Always use the official Firebase Authentication package:**
- Package: `firebase/auth` (modular SDK)
- Legacy: `@firebase/auth` (use only if maintaining legacy code)

**Never use deprecated Firebase namespaced imports.** The modular SDK is the only recommended approach for new projects.

## 2. Installation

### npm
```bash
npm install firebase
```

### yarn
```bash
yarn add firebase
```

### pnpm
```bash
pnpm add firebase
```

**Environment Variables (Optional):**
```bash
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
```

## 3. Initialization

### Basic Initialization
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
```

### Advanced Initialization

#### Custom Settings with Dependencies
```javascript
import {
  initializeAuth,
  browserLocalPersistence,
  browserPopupRedirectResolver
} from 'firebase/auth';

const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver
});
```

#### Cordova/Capacitor Initialization
```javascript
import {
  initializeAuth,
  indexedDBLocalPersistence,
  cordovaPopupRedirectResolver
} from 'firebase/auth';

const auth = initializeAuth(app, {
  persistence: indexedDBLocalPersistence,
  popupRedirectResolver: cordovaPopupRedirectResolver
});
```

### Emulator Connection
```javascript
import { connectAuthEmulator } from 'firebase/auth';

// Connect to local emulator (must be called before any operations)
connectAuthEmulator(auth, 'http://localhost:9099');
```

## 4. Core API Surfaces

### Email/Password Authentication

#### Minimal Example - Sign Up
```javascript
import { createUserWithEmailAndPassword } from 'firebase/auth';

const userCredential = await createUserWithEmailAndPassword(
  auth,
  'user@example.com',
  'password123'
);
```

#### Minimal Example - Sign In
```javascript
import { signInWithEmailAndPassword } from 'firebase/auth';

const userCredential = await signInWithEmailAndPassword(
  auth,
  'user@example.com',
  'password123'
);
```

#### Minimal Example - Sign Out
```javascript
import { signOut } from 'firebase/auth';

await signOut(auth);
```

#### Advanced Example - Password Reset
```javascript
import { sendPasswordResetEmail } from 'firebase/auth';

await sendPasswordResetEmail(auth, 'user@example.com', {
  url: 'https://myapp.com/login',
  handleCodeInApp: false
});
```

#### Advanced Example - Update Password
```javascript
import { updatePassword } from 'firebase/auth';

const user = auth.currentUser;
await updatePassword(user, 'newPassword123');
```

#### Email Verification
```javascript
import { sendEmailVerification } from 'firebase/auth';

const user = auth.currentUser;
await sendEmailVerification(user, {
  url: 'https://myapp.com/verify',
  handleCodeInApp: true
});
```

### Social Authentication (OAuth Providers)

#### Minimal Example - Google Sign In (Popup)
```javascript
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
```

#### Advanced Example - Google Sign In with Scopes
```javascript
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
provider.setCustomParameters({
  prompt: 'select_account'
});

const result = await signInWithPopup(auth, provider);
const credential = GoogleAuthProvider.credentialFromResult(result);
const accessToken = credential.accessToken;
```

#### Redirect Flow (Mobile/Better UX)
```javascript
import { signInWithRedirect, getRedirectResult, GoogleAuthProvider } from 'firebase/auth';

// Initiate redirect
const provider = new GoogleAuthProvider();
await signInWithRedirect(auth, provider);

// After redirect, get result
const result = await getRedirectResult(auth);
if (result) {
  const user = result.user;
}
```

#### Facebook Authentication
```javascript
import { signInWithPopup, FacebookAuthProvider } from 'firebase/auth';

const provider = new FacebookAuthProvider();
provider.addScope('user_birthday');
const result = await signInWithPopup(auth, provider);
```

#### GitHub Authentication
```javascript
import { signInWithPopup, GithubAuthProvider } from 'firebase/auth';

const provider = new GithubAuthProvider();
provider.addScope('repo');
const result = await signInWithPopup(auth, provider);
```

#### Twitter/X Authentication
```javascript
import { signInWithPopup, TwitterAuthProvider } from 'firebase/auth';

const provider = new TwitterAuthProvider();
const result = await signInWithPopup(auth, provider);
```

#### Microsoft Authentication
```javascript
import { signInWithPopup, OAuthProvider } from 'firebase/auth';

const provider = new OAuthProvider('microsoft.com');
provider.addScope('mail.read');
const result = await signInWithPopup(auth, provider);
```

#### Apple Authentication
```javascript
import { signInWithPopup, OAuthProvider } from 'firebase/auth';

const provider = new OAuthProvider('apple.com');
provider.addScope('email');
provider.addScope('name');
const result = await signInWithPopup(auth, provider);
```

### Phone Authentication

#### Minimal Example - Send Verification Code
```javascript
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// Setup reCAPTCHA
const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
  size: 'invisible'
});

// Send code
const confirmationResult = await signInWithPhoneNumber(
  auth,
  '+1234567890',
  recaptchaVerifier
);
```

#### Advanced Example - Verify Code
```javascript
// User enters verification code
const code = '123456';
const result = await confirmationResult.confirm(code);
const user = result.user;
```

#### Visible reCAPTCHA
```javascript
const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
  size: 'normal',
  callback: (response) => {
    // reCAPTCHA solved
  },
  'expired-callback': () => {
    // reCAPTCHA expired
  }
});

recaptchaVerifier.render();
```

### Anonymous Authentication

#### Minimal Example
```javascript
import { signInAnonymously } from 'firebase/auth';

const userCredential = await signInAnonymously(auth);
const user = userCredential.user;
console.log('Anonymous user ID:', user.uid);
```

#### Link Anonymous Account to Email
```javascript
import { linkWithCredential, EmailAuthProvider } from 'firebase/auth';

const credential = EmailAuthProvider.credential('user@example.com', 'password123');
const userCredential = await linkWithCredential(auth.currentUser, credential);
```

### Custom Token Authentication

#### Minimal Example
```javascript
import { signInWithCustomToken } from 'firebase/auth';

// Token generated on your server
const customToken = 'your-custom-token';
const userCredential = await signInWithCustomToken(auth, customToken);
```

### Email Link Authentication

#### Send Sign-In Link
```javascript
import { sendSignInLinkToEmail } from 'firebase/auth';

const actionCodeSettings = {
  url: 'https://www.example.com/finishSignUp?cartId=1234',
  handleCodeInApp: true,
  iOS: {
    bundleId: 'com.example.ios'
  },
  android: {
    packageName: 'com.example.android',
    installApp: true,
    minimumVersion: '12'
  }
};

await sendSignInLinkToEmail(auth, 'user@example.com', actionCodeSettings);
// Save email to verify after redirect
window.localStorage.setItem('emailForSignIn', 'user@example.com');
```

#### Complete Sign-In with Email Link
```javascript
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';

// Confirm the link is a sign-in with email link
if (isSignInWithEmailLink(auth, window.location.href)) {
  let email = window.localStorage.getItem('emailForSignIn');
  if (!email) {
    email = window.prompt('Please provide your email for confirmation');
  }

  const result = await signInWithEmailLink(auth, email, window.location.href);
  window.localStorage.removeItem('emailForSignIn');
}
```

### SAML Authentication

#### Sign In with SAML
```javascript
import { signInWithPopup, SAMLAuthProvider } from 'firebase/auth';

const provider = new SAMLAuthProvider('saml.provider-id');
const result = await signInWithPopup(auth, provider);
```

### Multi-Factor Authentication (MFA)

#### Enroll User in Phone MFA
```javascript
import { multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator } from 'firebase/auth';

const user = auth.currentUser;
const multiFactorSession = await multiFactor(user).getSession();

const phoneAuthProvider = new PhoneAuthProvider(auth);
const verificationId = await phoneAuthProvider.verifyPhoneNumber(
  '+1234567890',
  recaptchaVerifier,
  multiFactorSession
);

const verificationCode = '123456'; // User enters code
const phoneAuthCredential = PhoneAuthProvider.credential(verificationId, verificationCode);
const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);

await multiFactor(user).enroll(multiFactorAssertion, 'Personal phone');
```

#### Enroll User in TOTP MFA
```javascript
import { multiFactor, TotpMultiFactorGenerator, TotpSecret } from 'firebase/auth';

const user = auth.currentUser;
const multiFactorSession = await multiFactor(user).getSession();

// Generate TOTP secret
const totpSecret = await TotpSecret.generate(auth, multiFactorSession);

// Display QR code to user
const qrCodeUrl = totpSecret.generateQrCodeUrl(user.email, 'MyApp');
console.log('QR Code URL:', qrCodeUrl);

// User scans QR code and enters verification code
const verificationCode = '123456';
const multiFactorAssertion = TotpMultiFactorGenerator.assertionForEnrollment(
  totpSecret,
  verificationCode
);

await multiFactor(user).enroll(multiFactorAssertion, 'TOTP device');
```

#### Sign In with Phone MFA
```javascript
import { getMultiFactorResolver, PhoneAuthProvider, PhoneMultiFactorGenerator } from 'firebase/auth';

try {
  await signInWithEmailAndPassword(auth, email, password);
} catch (error) {
  if (error.code === 'auth/multi-factor-auth-required') {
    const resolver = getMultiFactorResolver(auth, error);

    const phoneAuthProvider = new PhoneAuthProvider(auth);
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(
      resolver.hints[0].phoneNumber,
      recaptchaVerifier
    );

    const verificationCode = '123456'; // User enters code
    const phoneAuthCredential = PhoneAuthProvider.credential(verificationId, verificationCode);
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);

    const userCredential = await resolver.resolveSignIn(multiFactorAssertion);
  }
}
```

#### Sign In with TOTP MFA
```javascript
import { getMultiFactorResolver, TotpMultiFactorGenerator } from 'firebase/auth';

try {
  await signInWithEmailAndPassword(auth, email, password);
} catch (error) {
  if (error.code === 'auth/multi-factor-auth-required') {
    const resolver = getMultiFactorResolver(auth, error);

    // Select TOTP factor
    const totpInfo = resolver.hints.find(hint => hint.factorId === 'totp');

    const verificationCode = '123456'; // User enters TOTP code
    const multiFactorAssertion = TotpMultiFactorGenerator.assertionForSignIn(
      totpInfo.uid,
      verificationCode
    );

    const userCredential = await resolver.resolveSignIn(multiFactorAssertion);
  }
}
```

#### Unenroll from MFA
```javascript
import { multiFactor } from 'firebase/auth';

const user = auth.currentUser;
const enrolledFactors = multiFactor(user).enrolledFactors;

// Unenroll from specific factor
await multiFactor(user).unenroll(enrolledFactors[0]);
```

## 5. Advanced Features

### User State Management

#### Auth State Observer
```javascript
import { onAuthStateChanged } from 'firebase/auth';

const unsubscribe = onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is signed in:', user.uid);
  } else {
    console.log('User is signed out');
  }
});

// Cleanup
unsubscribe();
```

#### ID Token Changed Listener
```javascript
import { onIdTokenChanged } from 'firebase/auth';

const unsubscribe = onIdTokenChanged(auth, (user) => {
  if (user) {
    // Get fresh token
    user.getIdToken().then((token) => {
      console.log('Fresh token:', token);
    });
  }
});
```

#### Before Auth State Changed (Blocking Callback)
```javascript
import { beforeAuthStateChanged } from 'firebase/auth';

const unsubscribe = beforeAuthStateChanged(
  auth,
  async (user) => {
    // Runs before auth state changes
    // Can be async and block the state change
    if (user) {
      console.log('User about to be set:', user.uid);
      // Perform any necessary checks
    }
  },
  () => {
    // onAbort callback - called if a later beforeAuthStateChanged throws
    console.log('Auth state change was aborted');
  }
);
```

#### Update Current User
```javascript
import { updateCurrentUser } from 'firebase/auth';

// Set a different user as current user
await updateCurrentUser(auth, newUser);
```

#### Get Current User
```javascript
const user = auth.currentUser;

if (user) {
  console.log('User ID:', user.uid);
  console.log('Email:', user.email);
  console.log('Display Name:', user.displayName);
  console.log('Photo URL:', user.photoURL);
  console.log('Email Verified:', user.emailVerified);
}
```

### User Profile Management

#### Update Profile
```javascript
import { updateProfile } from 'firebase/auth';

const user = auth.currentUser;
await updateProfile(user, {
  displayName: 'John Doe',
  photoURL: 'https://example.com/photo.jpg'
});
```

#### Update Email (Deprecated)
```javascript
import { updateEmail, sendEmailVerification } from 'firebase/auth';

const user = auth.currentUser;
await updateEmail(user, 'newemail@example.com');
await sendEmailVerification(user);
```

#### Update Email with Verification (Recommended)
```javascript
import { verifyBeforeUpdateEmail } from 'firebase/auth';

const actionCodeSettings = {
  url: 'https://www.example.com/?email=user@example.com'
};

const user = auth.currentUser;
await verifyBeforeUpdateEmail(user, 'newemail@example.com', actionCodeSettings);
// User must verify new email before it takes effect
```

#### Update Phone Number
```javascript
import { updatePhoneNumber, PhoneAuthProvider } from 'firebase/auth';

// First get phone credential
const phoneAuthProvider = new PhoneAuthProvider(auth);
const verificationId = await phoneAuthProvider.verifyPhoneNumber(
  '+1234567890',
  recaptchaVerifier
);

const verificationCode = '123456'; // User enters code
const phoneCredential = PhoneAuthProvider.credential(verificationId, verificationCode);

const user = auth.currentUser;
await updatePhoneNumber(user, phoneCredential);
```

#### Reload User Data
```javascript
import { reload } from 'firebase/auth';

await reload(auth.currentUser);
const updatedUser = auth.currentUser;
```

#### Delete User Account
```javascript
import { deleteUser } from 'firebase/auth';

const user = auth.currentUser;
await deleteUser(user);
```

### Token Management

#### Get ID Token
```javascript
const user = auth.currentUser;
const token = await user.getIdToken();
const refreshedToken = await user.getIdToken(true); // Force refresh
```

#### Get ID Token Result (with Claims)
```javascript
import { getIdToken, getIdTokenResult } from 'firebase/auth';

const user = auth.currentUser;

// Using user method
const token = await getIdToken(user);
const idTokenResult = await getIdTokenResult(user);

console.log('Token:', idTokenResult.token);
console.log('Expiration:', idTokenResult.expirationTime);
console.log('Custom Claims:', idTokenResult.claims);
console.log('Auth Time:', idTokenResult.authTime);
console.log('Issued At:', idTokenResult.issuedAtTime);
console.log('Sign-in Provider:', idTokenResult.signInProvider);
```

### Password Validation

#### Validate Password Against Policy
```javascript
import { validatePassword } from 'firebase/auth';

const validationStatus = await validatePassword(auth, 'MyPassword123!');

console.log('Is valid:', validationStatus.isValid);
console.log('Contains lowercase:', validationStatus.containsLowercaseLetter);
console.log('Contains uppercase:', validationStatus.containsUppercaseLetter);
console.log('Contains numeric:', validationStatus.containsNumericCharacter);
console.log('Contains non-alphanumeric:', validationStatus.containsNonAlphanumericCharacter);
console.log('Meets min length:', validationStatus.meetsMinPasswordLength);
console.log('Meets max length:', validationStatus.meetsMaxPasswordLength);
```

### Account Linking

#### Link Multiple Providers
```javascript
import { linkWithPopup, GoogleAuthProvider } from 'firebase/auth';

const provider = new GoogleAuthProvider();
const result = await linkWithPopup(auth.currentUser, provider);
```

#### Link with Credential
```javascript
import { linkWithCredential, EmailAuthProvider } from 'firebase/auth';

const credential = EmailAuthProvider.credential('user@example.com', 'password123');
await linkWithCredential(auth.currentUser, credential);
```

#### Link with Phone Number
```javascript
import { linkWithPhoneNumber } from 'firebase/auth';

const confirmationResult = await linkWithPhoneNumber(
  auth.currentUser,
  '+1234567890',
  recaptchaVerifier
);

const verificationCode = '123456';
await confirmationResult.confirm(verificationCode);
```

#### Link with Redirect
```javascript
import { linkWithRedirect, GoogleAuthProvider } from 'firebase/auth';

const provider = new GoogleAuthProvider();
await linkWithRedirect(auth.currentUser, provider);

// After redirect, check result
const result = await getRedirectResult(auth);
```

#### Unlink Provider
```javascript
import { unlink } from 'firebase/auth';

await unlink(auth.currentUser, 'google.com');
```

#### Fetch Sign-In Methods
```javascript
import { fetchSignInMethodsForEmail } from 'firebase/auth';

const methods = await fetchSignInMethodsForEmail(auth, 'user@example.com');
console.log('Available sign-in methods:', methods);
```

### Re-authentication

#### Re-authenticate User
```javascript
import { reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const user = auth.currentUser;
const credential = EmailAuthProvider.credential(user.email, 'current-password');

await reauthenticateWithCredential(user, credential);
// Now perform sensitive operations
```

#### Re-authenticate with Popup
```javascript
import { reauthenticateWithPopup, GoogleAuthProvider } from 'firebase/auth';

const provider = new GoogleAuthProvider();
await reauthenticateWithPopup(auth.currentUser, provider);
```

#### Re-authenticate with Redirect
```javascript
import { reauthenticateWithRedirect, GoogleAuthProvider } from 'firebase/auth';

const provider = new GoogleAuthProvider();
await reauthenticateWithRedirect(auth.currentUser, provider);

// After redirect
const result = await getRedirectResult(auth);
```

#### Re-authenticate with Phone Number
```javascript
import { reauthenticateWithPhoneNumber } from 'firebase/auth';

const confirmationResult = await reauthenticateWithPhoneNumber(
  auth.currentUser,
  '+1234567890',
  recaptchaVerifier
);

const verificationCode = '123456';
await confirmationResult.confirm(verificationCode);
```

### Session Persistence

#### Set Persistence (Browser)
```javascript
import {
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  indexedDBLocalPersistence
} from 'firebase/auth';

// Local persistence using localStorage (survives browser restart)
await setPersistence(auth, browserLocalPersistence);

// Session persistence using sessionStorage (survives page refresh only)
await setPersistence(auth, browserSessionPersistence);

// No persistence (memory only)
await setPersistence(auth, inMemoryPersistence);

// IndexedDB persistence (recommended for large data)
await setPersistence(auth, indexedDBLocalPersistence);
```

#### React Native Persistence
```javascript
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
```

#### Cookie Persistence (Public Preview)
```javascript
import { setPersistence, browserCookiePersistence } from 'firebase/auth';

// For hybrid rendering and middleware applications
await setPersistence(auth, browserCookiePersistence);
```

### Language and Localization

#### Use Device Language
```javascript
import { useDeviceLanguage } from 'firebase/auth';

useDeviceLanguage(auth); // Use device language

// Or set specific language
auth.languageCode = 'es';
```

#### Initialize reCAPTCHA Config
```javascript
import { initializeRecaptchaConfig } from 'firebase/auth';

// Load reCAPTCHA config to reduce latency for auth flows
await initializeRecaptchaConfig(auth);
```

### Action Code Handling

#### Handle Password Reset Link
```javascript
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';

const actionCode = 'code-from-email-link';

// Verify code is valid
const email = await verifyPasswordResetCode(auth, actionCode);

// Reset password
await confirmPasswordReset(auth, actionCode, 'newPassword123');
```

#### Handle Email Verification
```javascript
import { applyActionCode } from 'firebase/auth';

const actionCode = 'code-from-email-link';
await applyActionCode(auth, actionCode);
```

#### Handle Email Change
```javascript
import { checkActionCode, applyActionCode } from 'firebase/auth';

const actionCode = 'code-from-email-link';
const info = await checkActionCode(auth, actionCode);
await applyActionCode(auth, actionCode);
```

#### Parse Action Code URL
```javascript
import { parseActionCodeURL } from 'firebase/auth';

const actionCodeUrl = parseActionCodeURL('https://example.com/action?mode=...');

if (actionCodeUrl) {
  console.log('Mode:', actionCodeUrl.operation); // 'PASSWORD_RESET', 'VERIFY_EMAIL', etc.
  console.log('Code:', actionCodeUrl.code);
  console.log('Continue URL:', actionCodeUrl.continueUrl);
  console.log('Language:', actionCodeUrl.languageCode);
}
```

### Additional User Info

#### Get Provider-Specific Info
```javascript
import { signInWithPopup, GoogleAuthProvider, getAdditionalUserInfo } from 'firebase/auth';

const provider = new GoogleAuthProvider();
const userCredential = await signInWithPopup(auth, provider);

const additionalInfo = getAdditionalUserInfo(userCredential);
console.log('Is new user:', additionalInfo.isNewUser);
console.log('Provider ID:', additionalInfo.providerId);
console.log('Profile:', additionalInfo.profile); // Provider-specific profile
console.log('Username:', additionalInfo.username); // GitHub/Twitter username
```

### Revoke Access Tokens

#### Revoke Apple OAuth Token
```javascript
import { revokeAccessToken } from 'firebase/auth';

// Revoke Apple OAuth access token
await revokeAccessToken(auth, appleAccessToken);
```

## 6. TypeScript Usage

### Import Types
```typescript
import type {
  Auth,
  User,
  UserCredential,
  AuthProvider,
  AuthError,
  IdTokenResult,
  MultiFactorResolver,
  Unsubscribe
} from 'firebase/auth';
```

### Type-Safe User Handling
```typescript
import { onAuthStateChanged, User } from 'firebase/auth';

onAuthStateChanged(auth, (user: User | null) => {
  if (user) {
    const uid: string = user.uid;
    const email: string | null = user.email;
    const emailVerified: boolean = user.emailVerified;
  }
});
```

### Type-Safe Error Handling
```typescript
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';

try {
  await signInWithEmailAndPassword(auth, email, password);
} catch (error) {
  const authError = error as AuthError;

  switch (authError.code) {
    case 'auth/user-not-found':
      console.error('User not found');
      break;
    case 'auth/wrong-password':
      console.error('Wrong password');
      break;
    case 'auth/invalid-email':
      console.error('Invalid email');
      break;
    default:
      console.error('Authentication error:', authError.message);
  }
}
```

### Custom Claims Type
```typescript
interface CustomClaims {
  admin?: boolean;
  role?: string;
  subscription?: string;
}

const idTokenResult = await user.getIdTokenResult();
const claims = idTokenResult.claims as CustomClaims;

if (claims.admin) {
  console.log('User is an admin');
}
```

## 7. OAuth Credential Handling

#### Sign In with OAuth Credential
```javascript
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';

// Create credential from access token
const credential = GoogleAuthProvider.credential(idToken, accessToken);
await signInWithCredential(auth, credential);
```

#### Extract Credential from Result
```javascript
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);

// Get OAuth credential from result
const credential = GoogleAuthProvider.credentialFromResult(result);
const accessToken = credential.accessToken;
const idToken = credential.idToken;
```

#### Extract Credential from Error
```javascript
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

try {
  await signInWithPopup(auth, provider);
} catch (error) {
  // Extract credential that was being used
  const credential = GoogleAuthProvider.credentialFromError(error);

  if (error.code === 'auth/account-exists-with-different-credential') {
    // Handle account linking
    const methods = await fetchSignInMethodsForEmail(auth, error.customData.email);
    // Proceed with account linking flow
  }
}
```
