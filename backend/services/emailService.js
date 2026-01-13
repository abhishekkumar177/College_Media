const { Resend } = require('resend');
const logger = require('../utils/logger');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send OTP for password reset
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise} Resend API response
 */
const sendPasswordResetOTP = async (email, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'College Media <onboarding@resend.dev>', // Change this to your verified domain
      to: [email],
      subject: 'Password Reset OTP - College Media',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset OTP</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #f97316 100%); padding: 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">College Media</h1>
                      <p style="margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Password Reset Request</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                      <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your password for your College Media account. Use the OTP code below to verify your identity:
                      </p>
                      
                      <!-- OTP Box -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 30px 0;">
                            <div style="display: inline-block; padding: 20px 40px; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #f97316 100%); border-radius: 12px;">
                              <p style="margin: 0 0 8px; color: #ffffff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">Your OTP Code</p>
                              <p style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</p>
                            </div>
                          </td>
                        </tr>
                      </table>
                      
                      <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                          <strong>Important:</strong> This OTP will expire in <strong>10 minutes</strong> for security reasons.
                        </p>
                        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px;">
                        Need help? Contact us at <a href="mailto:support@collegemedia.com" style="color: #e8684a; text-decoration: none;">support@collegemedia.com</a>
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        © ${new Date().getFullYear()} College Media. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      logger.error('Resend email error:', error);
      throw new Error('Failed to send email');
    }

    logger.info('Password reset OTP email sent successfully:', { data });
    return data;
  } catch (error) {
    logger.error('Email service error:', error);
    throw error;
  }
};

/**
 * Send account deactivation confirmation email
 * @param {string} email - Recipient email address
 * @param {string} username - User's username
 * @returns {Promise} Resend API response
 */
const sendAccountDeactivationEmail = async (email, username) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'College Media <onboarding@resend.dev>',
      to: [email],
      subject: 'Account Deactivated - College Media',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Deactivated</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">College Media</h1>
                      <p style="margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Account Deactivation Confirmation</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Your Account Has Been Deactivated</h2>
                      <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Hi <strong>${username}</strong>,
                      </p>
                      <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Your College Media account has been successfully deactivated as requested. We're sorry to see you go, even if it's just temporary!
                      </p>
                      
                      <!-- Info Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px;">
                            <p style="margin: 0 0 15px; color: #92400e; font-size: 15px; font-weight: 600;">
                              ⚠️ What This Means:
                            </p>
                            <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
                              <li>Your profile is no longer visible to other users</li>
                              <li>You won't receive any notifications or emails</li>
                              <li>You cannot post, comment, or interact with content</li>
                              <li>Your data remains safely stored and preserved</li>
                              <li>Your username is reserved for you</li>
                            </ul>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Reactivation Info -->
                      <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); border-radius: 12px; border: 1px solid #93c5fd;">
                        <h3 style="margin: 0 0 15px; color: #1e40af; font-size: 18px; font-weight: 600;">
                          🔄 Want to Come Back?
                        </h3>
                        <p style="margin: 0 0 15px; color: #1e3a8a; font-size: 15px; line-height: 1.6;">
                          Great news! You can reactivate your account anytime by simply <strong>logging in again</strong> with your credentials.
                        </p>
                        <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                          Everything will be restored exactly as you left it - your posts, connections, and all your content will be right there waiting for you.
                        </p>
                      </div>
                      
                      <!-- Contact Support -->
                      <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                          <strong>Questions or concerns?</strong>
                        </p>
                        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                          If you didn't request this deactivation or need assistance, please contact our support team immediately at 
                          <a href="mailto:support@collegemedia.com" style="color: #f59e0b; text-decoration: none; font-weight: 500;">support@collegemedia.com</a>
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px;">
                        We hope to see you again soon! 👋
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        © ${new Date().getFullYear()} College Media. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend email error:', error);
      throw new Error('Failed to send email');
    }

    console.log('Account deactivation email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetOTP,
  sendAccountDeactivationEmail,
};
