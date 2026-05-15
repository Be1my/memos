# Sign-Up Page Implementation

## Overview

Complete the placeholder sign-up page at `/sign-up` by mimicking the existing sign-in page pattern.

## Changes

### 1. Schema (`features/auth/schemas/index.ts`)

Add `name` field to `signUpSchema` and a refinement ensuring confirmPassword matches password:

- `name`: required string
- `confirmPassword`: superRefine to check equality with password

### 2. Form Component (`features/auth/components/sign-up-form.tsx`)

Mirrors `sign-in-form.tsx` exactly:

- Same TanStack React Form pattern
- Same UI components (Field, FieldLabel, Input, FieldError, Button)
- Same loading/disabled state on submit button
- Same error message display below fields
- Same redirectPath prop

Fields in order:
1. username → `m.common_username()`
2. email → `m.common_email()`
3. password → `m.common_password()`
4. confirmPassword → `m.common_confirm_password()`

On submit: `authClient.signUp.email({ name: value.name, email: value.email, password: value.password })`
On success: navigate to `/home`
On error: display error message

### 3. Route (`routes/_auth/sign-up.tsx`)

Replace placeholder div with `<SignUpForm />` import and render.
