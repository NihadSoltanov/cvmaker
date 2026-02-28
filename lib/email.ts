import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(toEmail: string) {
    try {
        const data = await resend.emails.send({
            from: 'Nexora <onboarding@resend.dev>',
            to: [toEmail],
            subject: 'Welcome to Nexora!',
            html: `
        <div style="font-family: sans-serif; text-align: center; max-w-md; margin: auto; padding: 20px;">
          <h2 style="color: #4f46e5;">Congrats on taking the first step!</h2>
          <p>You have successfully joined <strong>Nexora</strong> — your AI-powered career intelligence platform.</p>
          <p>Start tailoring your application for your dream job right now.</p>
        </div>
      `,
        });

        console.log('Email sent:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
}
