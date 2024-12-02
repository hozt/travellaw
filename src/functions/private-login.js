// File: functions/private-login.js

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');

    if (request.method === 'POST') {
      try {
        const { password } = await request.json();

        if (password === env.INVESTOR_PASSWORD) {
          const protectedContent = await fetchProtectedContent(context, slug);

          const response = new Response(protectedContent, {
            headers: { 'Content-Type': 'text/html' },
          });

          response.headers.set('Set-Cookie', 'authenticated=true; HttpOnly; Secure; SameSite=Strict; Max-Age=3600; Path=/');

          return response;
        } else {
          return new Response('Invalid password', { status: 401 });
        }
      } catch (error) {
        console.error('Error processing POST request:', error);
        return new Response('Error processing request', { status: 500 });
      }
    }

    if (request.method === 'GET') {
      const cookie = request.headers.get('Cookie');
      if (cookie && cookie.includes('authenticated=true')) {
        try {
          const protectedContent = await fetchProtectedContent(context, slug);
          return new Response(protectedContent, {
            headers: { 'Content-Type': 'text/html' },
          });
        } catch (error) {
          console.error('Error processing GET request:', error);
          return new Response('Error fetching content', { status: 500 });
        }
      }
    }

    return new Response('Not Found', { status: 404 });
  }

  async function fetchProtectedContent(context, slug) {
    const { env } = context;
    const siteUrl = env.SITE_URL;

    try {
      const response = await context.env.ASSETS.fetch(`${siteUrl}/private/${slug}/`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let content = await response.text();

      // Extract content from <main> tag if present
      if (content.includes('<main')) {
        const match = content.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
        if (match && match[1]) {
          content = match[1].trim();
        } else {
          console.warn('Found <main> tag but couldn\'t extract content');
        }
      } else {
        console.warn('No <main> tag found in the content');
      }

      return content;
    } catch (error) {
      console.error('Error fetching or processing content:', error);
      throw error;
    }
  }
