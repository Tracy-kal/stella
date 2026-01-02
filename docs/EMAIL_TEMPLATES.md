# Supabase Email Templates

Configure these in **Supabase Dashboard > Authentication > Email Templates**

---

## 1. Confirm Signup Email

**Subject:** Confirm your email for StellaOne Capitals

```html
<h2>Welcome to StellaOne Capitals!</h2>

<p>Hi {{ .Email }},</p>

<p>Thank you for signing up. Please confirm your email address by clicking the button below:</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
    Confirm Email
  </a>
</p>

<p>Or copy and paste this link in your browser:</p>
<p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<p>If you didn't create an account, please ignore this email.</p>

<hr>
<p style="color: #666; font-size: 12px;">
  StellaOne Capitals - Global Investment & Trading Platform<br>
  This is an automated message, please do not reply.
</p>
```

---

## 2. Reset Password Email

**Subject:** Reset your StellaOne Capitals password

```html
<h2>Password Reset Request</h2>

<p>Hi,</p>

<p>We received a request to reset your password. Click the button below to create a new password:</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #2196F3; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
    Reset Password
  </a>
</p>

<p>Or copy and paste this link in your browser:</p>
<p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>

<p>This link expires in 24 hours.</p>

<hr>
<p style="color: #666; font-size: 12px;">
  StellaOne Capitals - Global Investment & Trading Platform
</p>
```

---

## 3. Magic Link Email

**Subject:** Sign in to StellaOne Capitals

```html
<h2>Sign In Request</h2>

<p>Hi,</p>

<p>Click the button below to sign in to your StellaOne Capitals account:</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #9C27B0; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
    Sign In
  </a>
</p>

<p>Or copy and paste this link in your browser:</p>
<p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<p>If you didn't request this sign-in link, please ignore this email.</p>

<hr>
<p style="color: #666; font-size: 12px;">
  StellaOne Capitals - Global Investment & Trading Platform
</p>
```

---

## 4. Invite User Email

**Subject:** You're invited to StellaOne Capitals

```html
<h2>You've Been Invited!</h2>

<p>Hi,</p>

<p>You have been invited to join StellaOne Capitals, a premier investment and trading platform.</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #FF9800; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
    Accept Invitation
  </a>
</p>

<p>Or copy and paste this link in your browser:</p>
<p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<hr>
<p style="color: #666; font-size: 12px;">
  StellaOne Capitals - Global Investment & Trading Platform
</p>
```

---

## How to Configure

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Email Templates**
3. Select each template type from the dropdown
4. Paste the corresponding HTML from above
5. Click **Save**

### Optional: Custom SMTP

For production, configure custom SMTP:
1. Go to **Project Settings** > **Auth** > **SMTP Settings**
2. Enable custom SMTP
3. Add your SMTP credentials (SendGrid, Mailgun, etc.)
