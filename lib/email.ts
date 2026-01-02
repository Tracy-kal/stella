import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface EmailOptions {
    to: string
    subject: string
    html: string
}

export async function sendEmail(options: EmailOptions) {
    if (!resend) {
        console.log('Resend not configured, skipping email:', options.subject)
        return { success: false, error: 'Resend not configured' }
    }

    try {
        const { error } = await resend.emails.send({
            from: 'StellaOne Capitals <notifications@stellaonecapitals.com>',
            to: options.to,
            subject: options.subject,
            html: options.html,
        })

        if (error) {
            console.error('Resend error:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Email send error:', error)
        return { success: false, error: 'Failed to send email' }
    }
}

// Email templates
export const emailTemplates = {
    depositReceived: (userName: string, amount: number, crypto: string) => ({
        subject: 'Deposit Received - StellaOne Capitals',
        html: `
      <h2>Deposit Received!</h2>
      <p>Hi ${userName},</p>
      <p>We have received your deposit request:</p>
      <ul>
        <li><strong>Amount:</strong> $${amount.toFixed(2)}</li>
        <li><strong>Cryptocurrency:</strong> ${crypto}</li>
        <li><strong>Status:</strong> Pending Verification</li>
      </ul>
      <p>Our team will verify your deposit within 24-48 hours.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">StellaOne Capitals - Global Investment & Trading Platform</p>
    `,
    }),

    depositApproved: (userName: string, amount: number) => ({
        subject: 'Deposit Approved - StellaOne Capitals',
        html: `
      <h2>Deposit Approved!</h2>
      <p>Hi ${userName},</p>
      <p>Great news! Your deposit of <strong>$${amount.toFixed(2)}</strong> has been approved and credited to your account.</p>
      <p>You can now use these funds for trading and investments.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">StellaOne Capitals - Global Investment & Trading Platform</p>
    `,
    }),

    withdrawalRequested: (userName: string, amount: number, crypto: string) => ({
        subject: 'Withdrawal Request Submitted - StellaOne Capitals',
        html: `
      <h2>Withdrawal Request Received</h2>
      <p>Hi ${userName},</p>
      <p>We have received your withdrawal request:</p>
      <ul>
        <li><strong>Amount:</strong> $${amount.toFixed(2)}</li>
        <li><strong>Cryptocurrency:</strong> ${crypto}</li>
        <li><strong>Status:</strong> Pending Approval</li>
      </ul>
      <p>Processing time: 24-48 hours.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">StellaOne Capitals - Global Investment & Trading Platform</p>
    `,
    }),

    withdrawalApproved: (userName: string, amount: number, crypto: string) => ({
        subject: 'Withdrawal Approved - StellaOne Capitals',
        html: `
      <h2>Withdrawal Approved!</h2>
      <p>Hi ${userName},</p>
      <p>Your withdrawal of <strong>$${amount.toFixed(2)}</strong> in ${crypto} has been approved and is being processed.</p>
      <p>Please allow up to 24 hours for the funds to arrive in your wallet.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">StellaOne Capitals - Global Investment & Trading Platform</p>
    `,
    }),

    kycSubmitted: (userName: string) => ({
        subject: 'KYC Documents Received - StellaOne Capitals',
        html: `
      <h2>Documents Received</h2>
      <p>Hi ${userName},</p>
      <p>We have received your KYC verification documents. Our team will review them within 24-48 hours.</p>
      <p>You will be notified once the verification is complete.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">StellaOne Capitals - Global Investment & Trading Platform</p>
    `,
    }),

    kycApproved: (userName: string) => ({
        subject: 'KYC Verification Approved - StellaOne Capitals',
        html: `
      <h2>Verification Approved!</h2>
      <p>Hi ${userName},</p>
      <p>Congratulations! Your identity verification (KYC) has been approved.</p>
      <p>You now have full access to all account features including withdrawals.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">StellaOne Capitals - Global Investment & Trading Platform</p>
    `,
    }),

    // Admin notifications
    adminNewDeposit: (userName: string, email: string, amount: number, crypto: string) => ({
        subject: `[ADMIN] New Deposit: $${amount} from ${userName}`,
        html: `
      <h2>New Deposit Request</h2>
      <p><strong>User:</strong> ${userName} (${email})</p>
      <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
      <p><strong>Crypto:</strong> ${crypto}</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/deposits">Review in Admin Panel</a></p>
    `,
    }),

    adminNewWithdrawal: (userName: string, email: string, amount: number, crypto: string) => ({
        subject: `[ADMIN] Withdrawal Request: $${amount} from ${userName}`,
        html: `
      <h2>New Withdrawal Request</h2>
      <p><strong>User:</strong> ${userName} (${email})</p>
      <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
      <p><strong>Crypto:</strong> ${crypto}</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/withdrawals">Review in Admin Panel</a></p>
    `,
    }),

    adminNewKYC: (userName: string, email: string) => ({
        subject: `[ADMIN] New KYC Submission: ${userName}`,
        html: `
      <h2>New KYC Submission</h2>
      <p><strong>User:</strong> ${userName} (${email})</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/kyc">Review in Admin Panel</a></p>
    `,
    }),

    adminNewUser: (userName: string, email: string) => ({
        subject: `[ADMIN] New User Registration: ${userName}`,
        html: `
      <h2>New User Registered</h2>
      <p><strong>Name:</strong> ${userName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/users">View in Admin Panel</a></p>
    `,
    }),
}
