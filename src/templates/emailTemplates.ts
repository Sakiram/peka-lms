export const baseEmailTemplate = (content: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4; padding: 40px 0;">
        <tr>
          <td align="center">
            <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">{{ORG_NAME}}</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  ${content}
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0; color: #6c757d; font-size: 14px;">
                    &copy; ${new Date().getFullYear()} {{ORG_NAME}}. All rights reserved.
                  </p>
                  <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 12px;">
                    This is an automated message, please do not reply to this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export const welcomeEmailTemplate = (org_email: string,
  org_name: string,
  firstname: string,
): string => {
    return `
        <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">
        Hi ${firstname},
        </h2>
        <p style="margin: 0 0 16px 0; color: #555555; font-size: 16px; line-height: 1.6;">
        We're thrilled to have you on board! Your organization <strong style="color: #667eea;">${org_name}</strong> has been successfully onboarded.
        </p>
        <p style="margin: 0 0 24px 0; color: #555555; font-size: 16px; line-height: 1.6;">
        You can now start managing your team, tracking leaves, and utilizing all the features available to you.
        </p>
        <table role="presentation" style="margin: 0 auto;">
        <tr>
            <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                Get Started
            </a>
            </td>
        </tr>
        </table>
        <p style="margin: 24px 0 0 0; color: #999999; font-size: 14px; line-height: 1.5;">
        If you have any questions, feel free to reach out to our support team.
        </p>
    `;
  }

export const inviteEmailTemplate = (
  token: string,
  org_name: string,
  firstName: string
): string => {
    return `
    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">
      Hi ${firstName},
    </h2>
    <p style="margin: 0 0 16px 0; color: #555555; font-size: 16px; line-height: 1.6;">
      You've been invited to join <strong style="color: #667eea;">${org_name}</strong>! We're excited to have you as part of the team.
    </p>
    <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.5;">
        <strong>Next Step:</strong> Set up your password to access your account and get started.
      </p>
    </div>
    <table role="presentation" style="margin: 0 auto;">
      <tr>
        <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <a href="${process.env.CLIENT_URL}/set-password/${token}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
            Set Password & Login
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 24px 0 0 0; color: #999999; font-size: 14px; line-height: 1.5;">
      This link will expire in 24 hours. If you didn't request this invitation, please ignore this email.
    </p>
  `;
};

export const requestEmailTemplate = (
  managerName: string,
  employeeName: string,
  leaveType: string,
  startDate: string,
  endDate: string
): string => {
    return `
    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">
      Leave Request Notification
    </h2>
    <p style="margin: 0 0 16px 0; color: #555555; font-size: 16px; line-height: 1.6;">
      Hi ${managerName},
    </p>
    <p style="margin: 0 0 20px 0; color: #555555; font-size: 16px; line-height: 1.6;">
      You have a new leave request awaiting your review.
    </p>
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 6px; margin: 20px 0;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6c757d; font-size: 14px; width: 140px;">
                <strong>Employee:</strong>
              </td>
              <td style="padding: 8px 0; color: #333333; font-size: 14px;">
                ${employeeName || 'N/A'}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6c757d; font-size: 14px;">
                <strong>Leave Type:</strong>
              </td>
              <td style="padding: 8px 0; color: #333333; font-size: 14px;">
                ${leaveType || 'N/A'}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6c757d; font-size: 14px;">
                <strong>Start Date:</strong>
              </td>
              <td style="padding: 8px 0; color: #333333; font-size: 14px;">
                ${startDate || 'N/A'}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6c757d; font-size: 14px;">
                <strong>End Date:</strong>
              </td>
              <td style="padding: 8px 0; color: #333333; font-size: 14px;">
                ${endDate || 'N/A'}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <table role="presentation" style="margin: 20px auto 0 auto;">
      <tr>
        <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <a href="${process.env.CLIENT_URL}/leave-requests" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
            Review Request
          </a>
        </td>
      </tr>
    </table>
  `;
}

export const reviewEmailTemplate = (
  firstName: string,
  leaveStatus: string,
  leaveType?: string,
  reviewedBy?: string,
  isApproved?: boolean
) => {
    const statusColor = isApproved ? '#28a745' : '#dc3545';
  const statusBg = isApproved ? '#d4edda' : '#f8d7da';
  const statusIcon = isApproved ? '✓' : '✗';
  
  return `
    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">
      Leave Request Update
    </h2>
    <p style="margin: 0 0 20px 0; color: #555555; font-size: 16px; line-height: 1.6;">
      Hi ${firstName},
    </p>
    <div style="background-color: ${statusBg}; border-left: 4px solid ${statusColor}; padding: 20px; margin: 24px 0; border-radius: 6px; text-align: center;">
      <div style="display: inline-block; width: 50px; height: 50px; line-height: 50px; background-color: ${statusColor}; color: #ffffff; border-radius: 50%; font-size: 28px; font-weight: bold; margin-bottom: 12px;">
        ${statusIcon}
      </div>
      <p style="margin: 0; color: ${statusColor}; font-size: 20px; font-weight: 600;">
        Your leave request has been ${leaveStatus.toLowerCase()}
      </p>
    </div>
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 6px; margin: 20px 0;">
      <tr>
        <td style="padding: 20px;">
          ${leaveType ? `
          <p style="margin: 0 0 12px 0; color: #555555; font-size: 14px;">
            <strong style="color: #6c757d;">Leave Type:</strong> ${leaveType}
          </p>` : ''}
          ${reviewedBy ? `
          <p style="margin: 0; color: #555555; font-size: 14px;">
            <strong style="color: #6c757d;">Reviewed By:</strong> ${reviewedBy}
          </p>` : ''}
        </td>
      </tr>
    </table>
    <p style="margin: 20px 0 0 0; color: #555555; font-size: 16px; line-height: 1.6;">
      ${isApproved 
        ? 'Your time off has been confirmed. Enjoy your break!' 
        : 'If you have any questions about this decision, please contact your manager.'}
    </p>
    <table role="presentation" style="margin: 24px auto 0 auto;">
      <tr>
        <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <a href="${process.env.CLIENT_URL}/leaves" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
            View Leave History
          </a>
        </td>
      </tr>
    </table>
  `;
}