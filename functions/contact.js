export async function onRequestPost({ request, env }) {
    console.log("Cloudflare Function called");
    try {
        // Read the request body
        const formData = await request.formData();

        const mailjetApiKey = env.MAILJET_API_KEY;
        const mailjetApiSecret = env.MAILJET_API_SECRET;
        const fromEmail = 'cloud@hozt.com';
        const toEmail = env.MAILJET_TO_EMAIL;
        const emailSubject = 'New Contact Form Submission';

        let emailText = 'Do not reply directly to this email.\n\n';
        let emailHtml = '<p><strong>Do not reply directly to this email.</strong></p><br>';

        const turnstileToken = formData['cf-turnstile-response'];

        // Validate Turnstile token
        const isTurnstileValid = await validateTurnstileToken(turnstileToken, env.TURNSTILE_SECRET_KEY);
        if (!isTurnstileValid) {
            console.log('Invalid Turnstile token', turnstileToken, env.TURNSTILE_SECRET_KEY);
            return new Response(JSON.stringify({ error: 'Invalid Turnstile token' }), { status: 400 });
        }

        for (const [key, value] of formData.entries()) {
            if (key !== 'cf-turnstile-response') {
                emailText += `${key}: ${value}\n`;
                emailHtml += `<p>${key}: ${value}</p>`;
            }
        }

        const emailData = {
            Messages: [
                {
                    From: {
                        Email: fromEmail,
                        Name: 'Contact Form',
                    },
                    To: [
                        {
                            Email: toEmail,
                            Name: 'Recipient',
                        },
                    ],
                    Subject: emailSubject,
                    TextPart: emailText,
                    HTMLPart: emailHtml,
                },
            ],
        };

        console.log('Sending email:', emailData);

        const emailResponse = await sendEmail(mailjetApiKey, mailjetApiSecret, emailData);

        if (emailResponse.ok) {
            return new Response(JSON.stringify({ success: true, message: 'Message received' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            const errorText = await emailResponse.text();
            console.error('Email sending failed:', errorText);
            return new Response(JSON.stringify({ success: false, error: 'Failed to send message' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        console.error('Error in onRequestPost:', error);
        return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function sendEmail(apiKey, apiSecret, emailData) {
    try {
        const response = await fetch('https://api.mailjet.com/v3.1/send', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa(`${apiKey}:${apiSecret}`)}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error sending email:', errorText);
        }

        return response;
    } catch (error) {
        console.error('Error in sendEmail:', error);
        throw error;
    }
}