export async function GET() {
    const siteUrl = import.meta.env.SITE_URL; // Get SITE_URL from environment
    const sitemapURL = new URL('sitemap.xml', siteUrl); // Create sitemap URL

    const getRobotsTxt = (sitemapURL) => `
  User-agent: *
  Allow: /

  Sitemap: ${sitemapURL.href}
    `;

    return new Response(getRobotsTxt(sitemapURL), {
      headers: { 'Content-Type': 'text/plain' },
    });
}
