export async function onRequest(context) {
  const { request, env } = context;

  try {
    const { name, email, message } = await request.json();

    const requestPayload = {
      Messages: [
        {
          From: {
            Email: env.MAILJET_TO_EMAIL,
            Name: "Your Name"
          },
          To: [
            {
              Email: env.MAILJET_TO_EMAIL,
              Name: "Recipient Name"
            }
          ],
          Subject: "New Contact Form Submission",
          TextPart: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
        }
      ]
    };

    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${env.MAILJET_API_KEY}:${env.MAILJET_API_SECRET}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    const result = await response.json();

    if (response.ok) {
      console.log(result);
      return new Response(JSON.stringify({ message: 'Email sent successfully!' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      console.error(result);
      return new Response(JSON.stringify({ message: 'Failed to send email.' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('Error:', error);

    return new Response(JSON.stringify({ message: 'Failed to send email.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}