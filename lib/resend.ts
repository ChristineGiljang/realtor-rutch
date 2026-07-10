import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInquiryEmail({
  name,
  email,
  phone,
  message,
  intent,
  propertyTitle,
  budgetMin,
  budgetMax,
  timeline,
}: {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  intent?: string;
  propertyTitle?: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline?: string;
}) {
  try {
    console.log("Attempting to send email to:", process.env.AGENT_EMAIL);
    console.log(
      "Using API key:",
      process.env.RESEND_API_KEY ? "Found" : "MISSING",
    );

    const result = await resend.emails.send({
      from: "noreply@realtor-rutch.com",
      to: process.env.AGENT_EMAIL!,
      subject: propertyTitle
        ? `New Inquiry: ${propertyTitle}`
        : "New Contact Form Submission",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #F5F0E8;">
          <h1 style="color: #1A1A1A; font-size: 24px; margin-bottom: 8px;">New Inquiry</h1>
          ${propertyTitle ? `<p style="color: #C9A96E; font-size: 14px; margin-bottom: 24px;">Re: ${propertyTitle}</p>` : ""}
          
          <div style="background: white; padding: 24px; border: 1px solid #E2D9C8;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #E2D9C8; color: #8B7355; font-size: 13px; width: 40%;">Name</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #E2D9C8; color: #1A1A1A; font-size: 13px;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #E2D9C8; color: #8B7355; font-size: 13px;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #E2D9C8; color: #1A1A1A; font-size: 13px;">${email}</td>
              </tr>
              ${
                phone
                  ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #E2D9C8; color: #8B7355; font-size: 13px;">Phone</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #E2D9C8; color: #1A1A1A; font-size: 13px;">${phone}</td>
              </tr>`
                  : ""
              }
              ${
                intent
                  ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #E2D9C8; color: #8B7355; font-size: 13px;">Intent</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #E2D9C8; color: #1A1A1A; font-size: 13px; text-transform: capitalize;">${intent}</td>
              </tr>`
                  : ""
              }
              ${
                budgetMin || budgetMax
                  ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #E2D9C8; color: #8B7355; font-size: 13px;">Budget</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #E2D9C8; color: #1A1A1A; font-size: 13px;">₱${budgetMin?.toLocaleString() ?? "0"} – ₱${budgetMax?.toLocaleString() ?? "0"}</td>
              </tr>`
                  : ""
              }
              ${
                timeline
                  ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #E2D9C8; color: #8B7355; font-size: 13px;">Timeline</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #E2D9C8; color: #1A1A1A; font-size: 13px;">${timeline}</td>
              </tr>`
                  : ""
              }
              ${
                message
                  ? `
              <tr>
                <td style="padding: 10px 0; color: #8B7355; font-size: 13px; vertical-align: top;">Message</td>
                <td style="padding: 10px 0; color: #1A1A1A; font-size: 13px;">${message}</td>
              </tr>`
                  : ""
              }
            </table>
          </div>

          <p style="color: #8B7355; font-size: 12px; margin-top: 16px; text-align: center;">
            This inquiry was submitted via your website.
          </p>
        </div>
      `,
    });

    console.log("Email result:", result);
  } catch (error) {
    console.error("Email sending error:", error);
  }
}
