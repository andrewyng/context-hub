---
name: client
description: "Open-source Firebase alternative with PostgreSQL backend, authentication, storage, realtime subscriptions, and edge functions"
metadata:
  languages: "javascript"
  versions: "2.106.2"
  revision: 2
  updated-on: "2026-05-29"
  source: maintainer
  tags: "supabase,sdk,database,auth,storage,realtime"
---
# Supabase JavaScript SDK Coding Guidelines

You are a Supabase coding expert. Help me write code using the Supabase JavaScript SDK, which provides a complete backend-as-a-service solution with authentication, database, storage, realtime subscriptions, and edge functions.

You can find the official SDK documentation here:
https://supabase.com/docs/reference/javascript/introduction

## Golden Rule: Use the Correct and Current SDK

Always use the official Supabase JavaScript SDK (`@supabase/supabase-js`) for all Supabase interactions. Do not use deprecated libraries or unofficial packages.

- **Library Name:** Supabase JavaScript SDK
- **NPM Package:** `@supabase/supabase-js`
- **Current Version:** 2.106.2
- **Legacy Libraries:** Do not use `@supabase/auth-js`, `@supabase/postgrest-js`, `@supabase/storage-js`, or other individual packages directly - these are bundled in the main SDK

**Installation:**

```bash
npm install @supabase/supabase-js
```

**APIs and Usage:**

- **Correct:** `import { createClient } from '@supabase/supabase-js'`
- **Correct:** `const supabase = createClient(url, anonKey)`
- **Correct:** `await supabase.from('table').select()`
- **Correct:** `await supabase.auth.signInWithPassword()`
- **Incorrect:** Using individual package imports
- **Incorrect:** `new Supabase()` or `SupabaseClient()`

## Initialization

The Supabase SDK requires your project URL and public anon key for initialization.

### Basic Client Setup

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Environment Variables

Set these environment variables in your `.env` file:

```bash
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### Client Initialization with Options

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: { 'x-my-custom-header': 'my-app-name' }
  }
})
```

### Server-Side Client (No Session Persistence)

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
})
```

## Authentication

The Supabase SDK provides comprehensive authentication through `supabase.auth`.

### Sign Up with Email and Password

```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password-123'
})

if (error) {
  console.error('Error signing up:', error.message)
} else {
  console.log('User created:', data.user)
}
```

### Sign Up with Additional User Metadata

```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password-123',
  options: {
    data: {
      first_name: 'John',
      age: 27
    }
  }
})
```

### Sign In with Email and Password

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password-123'
})

if (error) {
  console.error('Error signing in:', error.message)
} else {
  console.log('User signed in:', data.user)
  console.log('Session:', data.session)
}
```

### Sign In with OAuth

```javascript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})

// Available providers: google, github, gitlab, bitbucket, azure,
// facebook, twitter, discord, slack, spotify, twitch, linkedin, etc.
```

### Sign In with OAuth and Options

```javascript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://example.com/auth/callback',
    scopes: 'https://www.googleapis.com/auth/calendar',
    queryParams: {
      access_type: 'offline',
      prompt: 'consent'
    }
  }
})
```

### Sign In with Magic Link (OTP)

```javascript
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: 'https://example.com/welcome'
  }
})
```

### Sign In with Phone OTP

```javascript
// Send OTP
const { data, error } = await supabase.auth.signInWithOtp({
  phone: '+1234567890'
})

// Verify OTP
const { data, error } = await supabase.auth.verifyOtp({
  phone: '+1234567890',
  token: '123456',
  type: 'sms'
})
```

### Anonymous Sign In

```javascript
const { data, error } = await supabase.auth.signInAnonymously()

console.log('Anonymous user:', data.user)
```

### Get Current User

```javascript
const { data: { user } } = await supabase.auth.getUser()

if (user) {
  console.log('Current user:', user)
} else {
  console.log('No user logged in')
}
```

### Get Current Session

```javascript
const { data: { session } } = await supabase.auth.getSession()

if (session) {
  console.log('Access token:', session.access_token)
  console.log('Refresh token:', session.refresh_token)
  console.log('Expires at:', session.expires_at)
}
```

### Update User

```javascript
const { data, error } = await supabase.auth.updateUser({
  email: 'newemail@example.com',
  password: 'new-password-456',
  data: {
    first_name: 'Jane',
    age: 28
  }
})
```

### Sign Out

```javascript
const { error } = await supabase.auth.signOut()

if (error) {
  console.error('Error signing out:', error.message)
} else {
  console.log('User signed out successfully')
}
```

### Password Reset

```javascript
// Send password reset email
const { data, error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com',
  {
    redirectTo: 'https://example.com/reset-password'
  }
)
```

### Auth State Changes Listener

```javascript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    console.log('Auth event:', event)
    console.log('Session:', session)

    if (event === 'SIGNED_IN') {
      console.log('User signed in!')
    }
    if (event === 'SIGNED_OUT') {
      console.log('User signed out!')
    }
  }
)

// Unsubscribe when done
subscription.unsubscribe()
```

### Refresh Session

```javascript
const { data, error } = await supabase.auth.refreshSession()

console.log('New session:', data.session)
```

### Exchange Auth Code (OAuth Flow)

```javascript
const { data, error } = await supabase.auth.exchangeCodeForSession(code)
```

## Database Queries

The Supabase SDK uses PostgREST for database operations with a chainable API.

> **Row-Level Security (RLS):** Every query made with the `anon` key is filtered by your table's RLS policies. If a query returns `[]` or "permission denied" when you expect data, RLS is almost always the cause. Verify policies in the Supabase Dashboard under Authentication > Policies, and only use the `service_role` key in trusted backend code (it bypasses RLS).

### Select All Rows

```javascript
const { data, error } = await supabase
  .from('countries')
  .select('*')

if (error) {
  console.error('Error fetching data:', error.message)
} else {
  console.log('Countries:', data)
}
```

### Select Specific Columns

```javascript
const { data, error } = await supabase
  .from('countries')
  .select('id, name, capital')
```

### Select with Column Alias

```javascript
const { data, error } = await supabase
  .from('countries')
  .select('country_name:name, country_id:id')
```

### Select with Foreign Table Relations

```javascript
const { data, error } = await supabase
  .from('countries')
  .select(`
    name,
    cities (
      name,
      population
    )
  `)
```

### Select with Multiple Foreign Key References

```javascript
const { data, error } = await supabase
  .from('messages')
  .select(`
    content,
    from:sender_id(name),
    to:receiver_id(name)
  `)
```

### Select with Nested Foreign Tables

```javascript
const { data, error } = await supabase
  .from('countries')
  .select(`
    name,
    cities (
      name,
      buildings (
        name,
        floors
      )
    )
  `)
```

### Select with Filters

```javascript
const { data, error } = await supabase
  .from('countries')
  .select('*')
  .eq('name', 'United States')
```

### Filtering Operators

```javascript
// Equals
.eq('column', 'value')

// Not equals
.neq('column', 'value')

// Greater than
.gt('column', 10)

// Greater than or equal
.gte('column', 10)

// Less than
.lt('column', 10)

// Less than or equal
.lte('column', 10)

// Pattern matching (case-sensitive)
.like('column', '%pattern%')

// Pattern matching (case-insensitive)
.ilike('column', '%pattern%')

// Is null
.is('column', null)

// In array
.in('column', ['value1', 'value2', 'value3'])

// Contains (for arrays)
.contains('column', ['value1', 'value2'])

// Contained by (for arrays)
.containedBy('column', ['value1', 'value2', 'value3'])

// Range overlap
.overlaps('column', [start, end])

// Full text search
.textSearch('column', 'search terms')
```

### Multiple Filters (AND)

```javascript
const { data, error } = await supabase
  .from('countries')
  .select('*')
  .eq('continent', 'Europe')
  .gt('population', 1000000)
```

### OR Filters

```javascript
const { data, error } = await supabase
  .from('countries')
  .select('*')
  .or('continent.eq.Europe,continent.eq.Asia')
```

### Filter on Foreign Table Columns

```javascript
const { data, error } = await supabase
  .from('countries')
  .select('name, cities(*)')
  .eq('cities.name', 'Paris')
```

### Inner Join (Only Return Rows with Matches)

```javascript
const { data, error } = await supabase
  .from('countries')
  .select('name, cities!inner(name)')
  .eq('cities.name', 'Paris')
```

### Ordering Results

```javascript
// Ascending order
const { data, error } = await supabase
  .from('countries')
  .select('*')
  .order('name', { ascending: true })

// Descending order
const { data, error } = await supabase
  .from('countries')
  .select('*')
  .order('population', { ascending: false })
```

### Ordering with Nulls

```javascript
const { data, error } = await supabase
  .from('countries')
  .select('*')
  .order('name', { ascending: true, nullsFirst: false })
```

### Order Foreign Table Columns

```javascript
const { data, error } = await supabase
  .from('countries')
  .select('name, cities(name)')
  .order('name', { foreignTable: 'cities' })
```

### Limit Results

```javascript
const { data, error } = await supabase
  .from('countries')
  .select('*')
  .limit(10)
```

### Limit Foreign Table Rows

```javascript
const { data, error } = await supabase
  .from('countries')
  .select('name, cities(name)')
  .limit(5, { foreignTable: 'cities' })
```

### Pagination with Range

```javascript
// Get rows 0-9
const { data, error } = await supabase
  .from('countries')
  .select('*')
  .range(0, 9)

// Get rows 10-19
const { data, error } = await supabase
  .from('countries')
  .select('*')
  .range(10, 19)
```

### Get Single Row

```javascript
const { data, error } = await supabase
  .from('countries')
  .select('*')
  .eq('id', 1)
  .single()

// Returns single object instead of array
```

### Maybe Single (No Error if Not Found)

```javascript
const { data, error } = await supabase
  .from('countries')
  .select('*')
  .eq('id', 1)
  .maybeSingle()
```

### Count Rows

```javascript
const { count, error } = await supabase
  .from('countries')
  .select('*', { count: 'exact', head: true })

console.log('Total countries:', count)
```

### Query JSON Columns

```javascript
const { data, error } = await supabase
  .from('users')
  .select('id, name, address->city, address->country')
```

### Query Array Columns

```javascript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .contains('tags', ['developer', 'designer'])
```

### Use Different Schema

```javascript
const { data, error } = await supabase
  .schema('private')
  .from('employees')
  .select('*')
```

## Insert Data

### Insert Single Row

```javascript
const { data, error } = await supabase
  .from('countries')
  .insert({
    name: 'Canada',
    capital: 'Ottawa',
    population: 38000000
  })
```

### Insert Single Row and Return Data

```javascript
const { data, error } = await supabase
  .from('countries')
  .insert({
    name: 'Canada',
    capital: 'Ottawa'
  })
  .select()

console.log('Inserted row:', data)
```

### Insert Multiple Rows

```javascript
const { data, error } = await supabase
  .from('countries')
  .insert([
    { name: 'Canada', capital: 'Ottawa' },
    { name: 'Mexico', capital: 'Mexico City' },
    { name: 'Brazil', capital: 'Brasilia' }
  ])
  .select()
```

### Insert and Return Specific Columns

```javascript
const { data, error } = await supabase
  .from('countries')
  .insert({ name: 'Canada', capital: 'Ottawa' })
  .select('id, name')
```

## Update Data

### Update Matching Rows

```javascript
const { data, error } = await supabase
  .from('countries')
  .update({ capital: 'New Capital' })
  .eq('name', 'Canada')
```

### Update with Multiple Filters

```javascript
const { data, error } = await supabase
  .from('countries')
  .update({ population: 39000000 })
  .eq('name', 'Canada')
  .lt('population', 40000000)
```

### Update and Return Data

```javascript
const { data, error } = await supabase
  .from('countries')
  .update({ capital: 'New Capital' })
  .eq('id', 1)
  .select()
```

### Update JSON Column

```javascript
const { data, error } = await supabase
  .from('users')
  .update({
    settings: { theme: 'dark', language: 'en' }
  })
  .eq('id', 1)
```

## Upsert Data

### Upsert (Insert or Update)

```javascript
const { data, error } = await supabase
  .from('countries')
  .upsert({
    id: 1,
    name: 'Canada',
    capital: 'Ottawa'
  })
```

### Upsert Multiple Rows

```javascript
const { data, error } = await supabase
  .from('countries')
  .upsert([
    { id: 1, name: 'Canada', capital: 'Ottawa' },
    { id: 2, name: 'Mexico', capital: 'Mexico City' }
  ])
```

### Upsert with Conflict Resolution

```javascript
const { data, error } = await supabase
  .from('countries')
  .upsert(
    { id: 1, name: 'Canada' },
    { onConflict: 'id' }
  )
```

### Upsert and Ignore Duplicates

```javascript
const { data, error } = await supabase
  .from('countries')
  .upsert(
    { name: 'Canada', capital: 'Ottawa' },
    { onConflict: 'name', ignoreDuplicates: true }
  )
```

## Delete Data

### Delete Matching Rows

```javascript
const { error } = await supabase
  .from('countries')
  .delete()
  .eq('name', 'Canada')
```

### Delete with Multiple Filters

```javascript
const { error } = await supabase
  .from('countries')
  .delete()
  .eq('continent', 'Europe')
  .lt('population', 100000)
```

### Delete and Return Data

```javascript
const { data, error } = await supabase
  .from('countries')
  .delete()
  .eq('id', 1)
  .select()
```

## RPC (Call Postgres Functions)

### Call Function Without Parameters

```javascript
const { data, error } = await supabase.rpc('hello_world')

console.log('Function result:', data)
```

### Call Function with Parameters

```javascript
const { data, error } = await supabase.rpc('add_numbers', {
  a: 5,
  b: 10
})

console.log('Sum:', data)
```

### Call Function with Array Parameter

```javascript
const { data, error } = await supabase.rpc('add_one_each', {
  arr: [1, 2, 3, 4, 5]
})

console.log('Result:', data)
```

### Chain Filters with RPC

```javascript
const { data, error } = await supabase
  .rpc('get_countries')
  .eq('continent', 'Europe')
  .order('population', { ascending: false })
  .limit(10)
```

### RPC with Single Result

```javascript
const { data, error } = await supabase
  .rpc('get_country_by_id', { country_id: 1 })
  .single()
```

### Call Function on Read Replica

```javascript
const { data, error } = await supabase.rpc(
  'get_data',
  {},
  { get: true }
)
```

## Realtime Subscriptions

The Supabase SDK provides realtime functionality through channels.

### Subscribe to Database Changes

```javascript
const channel = supabase
  .channel('db-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'countries'
    },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

### Subscribe to INSERT Events

```javascript
const channel = supabase
  .channel('db-inserts')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'countries'
    },
    (payload) => {
      console.log('New record:', payload.new)
    }
  )
  .subscribe()
```

### Subscribe to UPDATE Events

```javascript
const channel = supabase
  .channel('db-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'countries'
    },
    (payload) => {
      console.log('Old record:', payload.old)
      console.log('New record:', payload.new)
    }
  )
  .subscribe()
```

### Subscribe to DELETE Events

```javascript
const channel = supabase
  .channel('db-deletes')
  .on(
    'postgres_changes',
    {
      event: 'DELETE',
      schema: 'public',
      table: 'countries'
    },
    (payload) => {
      console.log('Deleted record:', payload.old)
    }
  )
  .subscribe()
```

### Subscribe with Row-Level Filter

```javascript
const channel = supabase
  .channel('specific-row')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'countries',
      filter: 'id=eq.1'
    },
    (payload) => {
      console.log('Change to specific row:', payload)
    }
  )
  .subscribe()
```

### Subscribe to Multiple Tables

```javascript
const channel = supabase
  .channel('multi-table')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'countries' },
    handleCountryChange
  )
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'cities' },
    handleCityChange
  )
  .subscribe()
```

### Unsubscribe from Changes

```javascript
const channel = supabase.channel('my-channel')

// ... set up subscriptions

// Later, unsubscribe
await supabase.removeChannel(channel)
```

### Broadcast Messages

```javascript
// Send broadcast
const channel = supabase.channel('room-1')

channel.subscribe((status) => {
  if (status === 'SUBSCRIBED') {
    channel.send({
      type: 'broadcast',
      event: 'cursor-pos',
      payload: { x: 100, y: 200 }
    })
  }
})

// Receive broadcast
channel.on('broadcast', { event: 'cursor-pos' }, (payload) => {
  console.log('Cursor position:', payload)
})
```

### Presence Tracking

```javascript
const channel = supabase.channel('room-1')

// Track user presence
channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState()
  console.log('Online users:', state)
})

channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
  console.log('User joined:', newPresences)
})

channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
  console.log('User left:', leftPresences)
})

// Subscribe and track current user
channel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await channel.track({
      user_id: 1,
      online_at: new Date().toISOString()
    })
  }
})
```

### Untrack Presence

```javascript
await channel.untrack()
```

### Channel Status Callbacks

```javascript
const channel = supabase
  .channel('my-channel')
  .subscribe((status, err) => {
    if (status === 'SUBSCRIBED') {
      console.log('Connected!')
    }
    if (status === 'CHANNEL_ERROR') {
      console.error('Connection error:', err)
    }
    if (status === 'TIMED_OUT') {
      console.log('Connection timed out')
    }
    if (status === 'CLOSED') {
      console.log('Channel closed')
    }
  })
```

## Storage

The Supabase SDK provides file storage through `supabase.storage`.

### List Buckets

```javascript
const { data, error } = await supabase
  .storage
  .listBuckets()

console.log('Buckets:', data)
```

### Get Bucket

```javascript
const { data, error } = await supabase
  .storage
  .getBucket('avatars')

console.log('Bucket:', data)
```

### Create Bucket

```javascript
const { data, error } = await supabase
  .storage
  .createBucket('avatars', {
    public: false,
    fileSizeLimit: 1024000
  })
```

### Update Bucket

```javascript
const { data, error } = await supabase
  .storage
  .updateBucket('avatars', {
    public: true
  })
```

### Delete Bucket

```javascript
// Must empty bucket first
const { data: files } = await supabase
  .storage
  .from('avatars')
  .list()

await supabase
  .storage
  .from('avatars')
  .remove(files.map(file => file.name))

// Then delete bucket
const { data, error } = await supabase
  .storage
  .deleteBucket('avatars')
```

### Empty Bucket

```javascript
const { data, error } = await supabase
  .storage
  .emptyBucket('avatars')
```

### Upload File

```javascript
const file = event.target.files[0]

const { data, error } = await supabase
  .storage
  .from('avatars')
  .upload('public/avatar1.png', file, {
    cacheControl: '3600',
    upsert: false
  })

if (error) {
  console.error('Error uploading:', error.message)
} else {
  console.log('File path:', data.path)
}
```

### Upload File with Content Type

```javascript
const { data, error } = await supabase
  .storage
  .from('avatars')
  .upload('folder/file.pdf', file, {
    contentType: 'application/pdf'
  })
```

### Upload and Overwrite Existing File

```javascript
const { data, error } = await supabase
  .storage
  .from('avatars')
  .upload('public/avatar1.png', file, {
    upsert: true
  })
```

### Upload from Base64

```javascript
const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANS...'

const { data, error } = await supabase
  .storage
  .from('avatars')
  .upload('public/avatar1.png', base64, {
    contentType: 'image/png'
  })
```

### Download File

```javascript
const { data, error } = await supabase
  .storage
  .from('avatars')
  .download('folder/avatar1.png')

if (error) {
  console.error('Error downloading:', error.message)
} else {
  // data is a Blob
  const url = URL.createObjectURL(data)
  console.log('File URL:', url)
}
```

### Get Public URL

```javascript
const { data } = supabase
  .storage
  .from('avatars')
  .getPublicUrl('folder/avatar1.png')

console.log('Public URL:', data.publicUrl)
```

### Get Public URL with Transform

```javascript
const { data } = supabase
  .storage
  .from('avatars')
  .getPublicUrl('folder/avatar1.png', {
    transform: {
      width: 200,
      height: 200,
      resize: 'cover'
    }
  })
```

### Create Signed URL

```javascript
const { data, error } = await supabase
  .storage
  .from('avatars')
  .createSignedUrl('folder/avatar1.png', 3600)

console.log('Signed URL:', data.signedUrl)
console.log('Expires at:', new Date(Date.now() + 3600 * 1000))
```

### Create Signed URLs (Multiple)

```javascript
const { data, error } = await supabase
  .storage
  .from('avatars')
  .createSignedUrls(['folder/avatar1.png', 'folder/avatar2.png'], 3600)

console.log('Signed URLs:', data)
```

### Create Signed Upload URL

```javascript
const { data, error } = await supabase
  .storage
  .from('avatars')
  .createSignedUploadUrl('folder/avatar1.png')

console.log('Upload URL:', data.signedUrl)
console.log('Upload token:', data.token)
```

### Upload to Signed URL

```javascript
const { data: signedData } = await supabase
  .storage
  .from('avatars')
  .createSignedUploadUrl('folder/avatar1.png')

const { data, error } = await supabase
  .storage
  .from('avatars')
  .uploadToSignedUrl(signedData.path, signedData.token, file)
```

### List Files in Bucket

```javascript
const { data, error } = await supabase
  .storage
  .from('avatars')
  .list('folder', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' }
  })

console.log('Files:', data)
```

### Search Files

```javascript
const { data, error } = await supabase
  .storage
  .from('avatars')
  .list('folder', {
    search: 'avatar'
  })
```

### Move File

```javascript
const { data, error } = await supabase
  .storage
  .from('avatars')
  .move('old/path/avatar.png', 'new/path/avatar.png')
```

### Copy File

```javascript
const { data, error } = await supabase
  .storage
  .from('avatars')
  .copy('original/avatar.png', 'backup/avatar.png')
```

### Delete Files

```javascript
const { data, error } = await supabase
  .storage
  .from('avatars')
  .remove(['folder/avatar1.png', 'folder/avatar2.png'])
```

### Get File Metadata

```javascript
const { data, error } = await supabase
  .storage
  .from('avatars')
  .list('folder', {
    limit: 1
  })

console.log('Metadata:', data[0])
```

## Edge Functions

The Supabase SDK allows invoking Edge Functions.

### Invoke Function

```javascript
const { data, error } = await supabase.functions.invoke('hello-world')

if (error) {
  console.error('Error invoking function:', error.message)
} else {
  console.log('Function response:', data)
}
```

### Invoke Function with Body

```javascript
const { data, error } = await supabase.functions.invoke('hello-world', {
  body: {
    name: 'JavaScript',
    message: 'Hello from client'
  }
})

console.log('Response:', data)
```

### Invoke Function with Custom Headers

```javascript
const { data, error } = await supabase.functions.invoke('hello-world', {
  headers: {
    'X-Custom-Header': 'my-value'
  },
  body: { name: 'JavaScript' }
})
```

### Invoke Function with Method

```javascript
const { data, error } = await supabase.functions.invoke('hello-world', {
  method: 'POST',
  body: { data: 'test' }
})
```

### Invoke Function on Specific Region

```javascript
const { data, error } = await supabase.functions.invoke('hello-world', {
  region: 'us-west-1'
})
```

## Error Handling

All Supabase operations return an object with `data` and `error` properties.

### Basic Error Handling

```javascript
const { data, error } = await supabase
  .from('countries')
  .select('*')

if (error) {
  console.error('Database error:', error.message)
  console.error('Error details:', error.details)
  console.error('Error hint:', error.hint)
} else {
  console.log('Data:', data)
}
```

### Error Properties

```javascript
if (error) {
  console.log('Message:', error.message)
  console.log('Details:', error.details)
  console.log('Hint:', error.hint)
  console.log('Code:', error.code)
}
```

### Try-Catch with Async/Await

```javascript
try {
  const { data, error } = await supabase
    .from('countries')
    .select('*')

  if (error) throw error

  console.log('Data:', data)
} catch (error) {
  console.error('Error:', error.message)
}
```

### Auth Error Handling

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'wrong-password'
})

if (error) {
  if (error.message.includes('Invalid login credentials')) {
    console.log('Wrong email or password')
  } else if (error.message.includes('Email not confirmed')) {
    console.log('Please verify your email')
  } else {
    console.error('Auth error:', error.message)
  }
}
```

### Storage Error Handling

```javascript
const { data, error } = await supabase
  .storage
  .from('avatars')
  .upload('file.png', file)

if (error) {
  if (error.message.includes('Duplicate')) {
    console.log('File already exists')
  } else if (error.message.includes('Size')) {
    console.log('File too large')
  } else {
    console.error('Storage error:', error.message)
  }
}
```

## TypeScript Support

The Supabase SDK has full TypeScript support with automatic type inference.

### Define Database Types

```typescript
import { createClient } from '@supabase/supabase-js'

interface Database {
  public: {
    Tables: {
      countries: {
        Row: {
          id: number
          name: string
          capital: string | null
          population: number | null
        }
        Insert: {
          id?: number
          name: string
          capital?: string | null
          population?: number | null
        }
        Update: {
          id?: number
          name?: string
          capital?: string | null
          population?: number | null
        }
      }
    }
  }
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### Type-Safe Queries

```typescript
const { data, error } = await supabase
  .from('countries')
  .select('*')

// data is automatically typed as Database['public']['Tables']['countries']['Row'][]
```

### Generate Types from Database

Use the Supabase CLI to generate types:

```bash
supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

Then import and use:

```typescript
import { Database } from './types/supabase'

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

## Advanced Configuration

### Custom Fetch Implementation

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch
  }
})
```

### Custom Headers

```javascript
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'x-application-name': 'my-app'
    }
  }
})
```

### Schema Configuration

```javascript
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'private'
  }
})
```

### Auth Configuration

```javascript
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: customStorageAdapter,
    storageKey: 'my-app-auth-token',
    flowType: 'pkce'
  }
})
```

### Realtime Configuration

```javascript
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})
```

## Useful Links

- Documentation: https://supabase.com/docs
- JavaScript SDK Reference: https://supabase.com/docs/reference/javascript/introduction
- API Reference: https://supabase.com/docs/guides/api
- Auth Documentation: https://supabase.com/docs/guides/auth
- Database Documentation: https://supabase.com/docs/guides/database
- Storage Documentation: https://supabase.com/docs/guides/storage
- Realtime Documentation: https://supabase.com/docs/guides/realtime
- Edge Functions: https://supabase.com/docs/guides/functions
