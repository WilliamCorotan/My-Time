# Organization Invite Email Setup

This guide explains how to set up the organization invite email feature using Resend.

## Prerequisites

1. A Resend account (https://resend.com)
2. A verified domain in Resend

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Resend Email Configuration
RESEND_API_KEY=your_resend_api_key_here

# App Configuration (for invite links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup Steps

### 1. Get Resend API Key

1. Sign up for a Resend account at https://resend.com
2. Go to your dashboard and copy your API key
3. Add it to your `.env.local` file as `RESEND_API_KEY`

### 2. Verify Your Domain

1. In your Resend dashboard, go to "Domains"
2. Add and verify your domain (e.g., `yourdomain.com`)
3. Update the `from` email in `lib/email.ts` to use your verified domain:
   ```typescript
   from: 'DTR <noreply@yourdomain.com>',
   ```

### 3. Set App URL

Set `NEXT_PUBLIC_APP_URL` to your application's base URL:
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

## How It Works

1. **Admin sends invitation**: Organization admins can invite new members by entering their email address
2. **Email sent**: An invitation email is sent via Resend with a unique invite link
3. **User accepts**: The invited user clicks the link and accepts the invitation
4. **Member added**: The user is automatically added to the organization

## Features

- ✅ Email validation
- ✅ Admin-only access
- ✅ 7-day expiration
- ✅ Beautiful email template
- ✅ Secure invite tokens
- ✅ Automatic member addition

## Troubleshooting

### Email not sending
- Check your Resend API key is correct
- Ensure your domain is verified in Resend
- Check the `from` email address in `lib/email.ts`

### Invite links not working
- Verify `NEXT_PUBLIC_APP_URL` is set correctly
- Check that the invitation hasn't expired
- Ensure the user is authenticated

### Database errors
- Run `npx drizzle-kit push` to ensure the invitations table is created
- Check your Turso database connection 