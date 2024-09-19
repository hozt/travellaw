// lib/enabledFeatures.js
import { GET_ENABLED_FEATURES } from './queries';
import client from './apolloClient';

export async function isEnabled(feature) {
  const { data } = await client.query({
    query: GET_ENABLED_FEATURES,
  });

  const isEnabled = data.customSiteSettings.enabledFeatures.includes(feature);
  // console.log('enabled features:', data.customSiteSettings.enabledFeatures, feature, isEnabled);
  return isEnabled;
}

