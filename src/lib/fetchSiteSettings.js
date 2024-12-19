import client from './apolloClient';
import { GET_SITE_SETTINGS } from './queries';

export async function getDefaultFeaturedImage() {
    const siteSettings = await getSiteSettings();
    return siteSettings?.defaultFeaturedImage?.sourceUrl;
}

async function getSiteSettings() {
  const { data } = await client.query({
    query: GET_SITE_SETTINGS,
    fetchPolicy: 'cache-first',
  });

  return data.customSiteSettings;
};
