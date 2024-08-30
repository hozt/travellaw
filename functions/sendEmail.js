const Mailjet = require('node-mailjet');

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_API_SECRET
);

export async function onRequest(context) {
  const { request, env } = context;
  const { name, email, message } = await request.json();

  const requestPayload = {
    Messages: [
      {
        From: {
          Email: "jeff@hozt.com",
          Name: "Your Name"
        },
        To: [
          {
            Email: "jeff@hozt.com",
            Name: "Recipient Name"
          }
        ],
        Subject: "New Contact Form Submission",
        TextPart: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
      }
    ]
  };

  try {
    const result = await mailjet.post("send", { version: 'v3.1' }).request(requestPayload);
    console.log(result.body);
    return new Response(JSON.stringify({ message: 'Email sent successfully!' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Failed to send email.' }), { status: 500 });
  }
}