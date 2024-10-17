import Parser from 'rss-parser';

// Initialize the RSS parser
const parser = new Parser();

// Function to fetch and render the latest podcast episode
export async function renderLatestPodcastEpisode(feedUrl, podcastImage) {
  console.log(`Attempting to fetch podcast feed: ${feedUrl}`);
  try {
    const feed = await parser.parseURL(feedUrl);
    console.log('Feed parsed successfully');

    // Get the latest episode (the first item in the feed)
    const latestEpisode = feed.items[0];

    if (latestEpisode) {
      console.log('Latest episode found:', latestEpisode.title);
      let summary = latestEpisode.itunes?.summary || '';
      if (summary.length > 150) {
        summary = summary.substring(0, 150) + '...';
      }

      // Create the HTML for the latest episode
      return `
        <div class="post-template">
          <div class="featured-image">
            <a href="/podcast/#latest">
              <img class="w-full" src="${podcastImage}" alt="${latestEpisode.title}" />
            </a>
          </div>
          <div class="post-content has-image">
            <div class="post-title"><a href="/podcast/#latest">Docs Talk Shop</a></div>
            <div class="post-excerpt">${latestEpisode.title}</div>
          </div>
        </div>
      `;
    } else {
      console.log('No episodes found in the feed');
      return '';
    }
  } catch (error) {
    console.error('Error fetching or parsing podcast:', error);
    return '';
  }
}
