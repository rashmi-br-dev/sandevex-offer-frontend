export const OFFER_EMAIL_TEMPLATE = `
<div style="background-color:#f5f5f7; padding:40px 0;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background-color:#ffffff; padding:40px; border-radius:8px; width:100%; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <tr>
            <td style="text-align:left; padding-bottom:18px; border-bottom:1px solid #e5e5e5;">
              <img src="https://i.ibb.co/5WdJ560X/1-1.png" alt="Sandevex Logo" width="180" />
            </td>
          </tr>
          <tr>
            <td style="font-size:22px; font-weight:600; color:#111111; padding-top:20px;">
              Offer Letter – Sandevex Internship Program
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px; font-size:16px; color:#111111;">
              Dear {{full_name}},
            </td>
          </tr>
          <tr>
            <td style="padding-top:16px; font-size:15px; color:#444444; line-height:1.7;">
              We are pleased to offer you an opportunity to join 
              <strong>Sandevex – SandHut India Private Limited</strong> 
              as a <strong>{{position}} Intern</strong>.
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e5e5; border-radius:6px;">
                <tr>
                  <td style="padding:20px; font-size:14px; color:#333333; line-height:1.9;">
                    <strong style="display:block; margin-bottom:12px; font-size:15px; color:#111111;">Offer Details</strong>
                    Position: <strong>{{position}}</strong><br/>
                    Department: <strong>{{department}}</strong><br/>
                    Work Mode: <strong>{{mode}}</strong><br/>
                    Internship Type: <strong>{{internship_type}}</strong><br/>
                    Duration: <strong>{{duration}}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-top:28px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e5e5; border-radius:6px; background-color:#fafafa;">
                <tr>
                  <td style="padding:24px; text-align:center; font-size:14px; color:#333333; line-height:1.7;">
                    <strong style="display:block; margin-bottom:14px; font-size:15px; color:#111111;">
                      Confirm Your Response
                    </strong>
                    <p style="margin-bottom:18px;">
                      Please confirm your response within <strong>24 hours of receiving this email</strong> to secure your internship slot.
                    </p>
                    <a href="{{domain}}/respond?email={{email}}&status=accept"
                       style="background:#111111;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;margin-right:10px;display:inline-block;font-weight:500;">
                       Accept Offer
                    </a>
                    <a href="{{domain}}/respond?email={{email}}&status=decline"
                       style="background:#e5e5e5;color:#111111;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:500;">
                       Not Interested
                    </a>
                    <p style="margin-top:18px; font-size:13px; color:#666666;">
                      After this period, the opportunity may be offered to another candidate.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-top:28px; font-size:15px; color:#444444;">
              We look forward to having you onboard and hope you have a great learning experience with us.
            </td>
          </tr>
          <tr>
            <td style="padding-top:32px; border-top:1px solid #e5e5e5; font-size:14px; color:#666666;">
              Best regards,<br/>
              <strong>Sandevex Hiring Team</strong><br/>
              SandHut India Private Limited
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>
`;

export const EMAIL_DEFAULTS = {
  position: 'Software Engineer',
  department: 'Engineering',
  mode: 'In-Office',
  internship_type: 'Full-time',
  duration: '6 months',
  domain: 'sandevex.com' // Update this with your actual domain
};
