import Parser from 'rss-parser';

// Initialize the RSS parser
const parser = new Parser();

// Function to fetch and render the latest podcast episode
export async function renderLatestPodcastEpisode(feedUrl) {
  try {
    // Fetch the RSS feed
    console.log('Fetching podcast feed:', feedUrl);
    const feed = await parser.parseURL(feedUrl);

    // Get the latest episode (the first item in the feed)
    const latestEpisode = feed.items[0];

    if (latestEpisode) {
      let summary = '';
      if (latestEpisode.itunes.summary.length > 150) {
        summary = latestEpisode.itunes.summary.substring(0, 150) + '...';
      }

      // Create the HTML for the latest episode
      return `
          <div class="post-template">
              <div class="featured-image">
                  <a href="/podcast/#latest">
                      <img class="w-full" src="https://drdeborahmd.hozt.com/wp-content/uploads/sites/12/2024/10/docstalk.jpeg" alt={episode.title} />
                  </a>
              </div>
              <div class="post-content has-image">
                  <div class="post-title"><a href="/podcast/#latest">Docs Talk Shop</a></div>
                  <div class="post-excerpt">${latestEpisode.title}</div>
              </div>
          </div>
      `;
    }
  } catch (error) {
    console.error('Error fetching podcast:', error);
    return '<p>Error loading podcast episode.</p>';
  }
}
