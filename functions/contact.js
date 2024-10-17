export async function onRequestPost({ request, env }) {
    console.log("Cloudflare Function called");
    try {
        // Read the request body
        const formData = await request.formData();

        const formDataJson = {};
        formData.forEach((value, key) => {
            formDataJson[key] = value;
        });

        const replyTo = formDataJson.email || env.MAILJET_TO_EMAIL;

        const turnstileToken = formData.get('cf-turnstile-response');
        console.log('Turnstile token:', turnstileToken);

        if (!turnstileToken) {
            console.error('Turnstile token is null or undefined');
            return new Response(JSON.stringify({ error: 'Turnstile token is missing' }), { status: 400 });
        }

        // Validate Turnstile token
        const isTurnstileValid = await validateTurnstileToken(turnstileToken, env.TURNSTILE_SECRET_KEY);
        if (!isTurnstileValid) {
            console.log('Invalid Turnstile token', turnstileToken, env.TURNSTILE_SECRET_KEY);
            return new Response(JSON.stringify({ error: 'Invalid Turnstile token' }), { status: 400 });
        }

        const mailjetApiKey = env.MAILJET_API_KEY;
        const mailjetApiSecret = env.MAILJET_API_SECRET;
        const fromEmail = 'cloud@hozt.com';
        const toEmail = env.MAILJET_TO_EMAIL;
        const emailSubject = 'New Contact Form Submission';

        let emailText = 'Do not reply directly to this email.\n\n';
        let emailHtml = '<p><strong>Do not reply directly to this email.</strong></p><br>';

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
                    ReplyTo: {
                        Email: replyTo,
                        Name: 'Contact Form',
                    },
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
                'Content-Type': 'application/json',
                'Authorization': `Basic ${btoa(`${apiKey}:${apiSecret}`)}`,
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