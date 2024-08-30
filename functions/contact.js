export async function onRequestPost({ request, env }) {
    let formData;
    try {
        // Read the request body only once
        formData = await request.json();
    } catch (error) {
        console.error('Error parsing request body:', error);
        return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
    }

    /*
    const turnstileToken = formData['cf-turnstile-response'];

    // Validate Turnstile token
    const isTurnstileValid = await validateTurnstileToken(turnstileToken, env.TURNSTILE_SECRET_KEY);
    if (!isTurnstileValid) {
        console.log('Invalid Turnstile token', turnstileToken, env.TURNSTILE_SECRET_KEY);
        return new Response(JSON.stringify({ error: 'Invalid Turnstile token' }), { status: 400 });
    }
    */

    const mailjetApiKey = env.MAILJET_API_KEY;
    const mailjetApiSecret = env.MAILJET_API_SECRET;
    const fromEmail = 'cloud@hozt.com';
    const toEmail = env.MAILJET_TO_EMAIL;
    const emailSubject = 'New Contact Form Submission';

    let emailText = 'Do not reply directly to this email.\n\n';
    let emailHtml = '<p><strong>Do not reply directly to this email.</strong></p><br>';

    for (const [key, value] of Object.entries(formData)) {
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

    const emailResponse = await sendEmail(mailjetApiKey, mailjetApiSecret, emailData);

    if (emailResponse.ok) {
        return new Response(JSON.stringify({ message: 'Message received' }), { status: 200 });
    } else {
        const errorText = await emailResponse.text();
        console.error('Email sending failed:', errorText);
        return new Response(JSON.stringify({ error: 'Failed to send message' }), { status: 500 });
    }
}

async function validateTurnstileToken(token, secretKey) {
    try {
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                secret: secretKey,
                response: token,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error validating Turnstile token:', errorText);
            return false;
        }

        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Error in validateTurnstileToken:', error);
        return false;
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
        return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500 });
    }
}
