import { request, gql } from 'graphql-request';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { config } from 'dotenv';

config(); // Load environment variables
const endpoint = 'https://travellaw.hozt.com/graphql'; //process.env.GRAPHQL_URL;

if (!endpoint) {
  throw new Error('GRAPHQL_URL environment variable is not set');
}

const recordsToFetch = 500;
const query = gql`
  query GetImages($first: Int!) {
    pages(first: $first) {
      nodes {
        title
        bannerImage {
          sourceUrl
        }
      }
    }
    posts(first: $first) {
      nodes {
        bannerImage {
          sourceUrl
        }
        featuredImage {
          node {
            sourceUrl
          }
        }
      }
    }
    forms(first: $first) {
      nodes {
        bannerImage {
          sourceUrl
        }
      }
    }
    templates(first: $first) {
      nodes {
        bannerImage {
          sourceUrl
        }
      }
    }
    customSiteSettings {
      logo {
        sourceUrl
      }
      mobileLogo {
        sourceUrl
      }
    }
    galleries {
      nodes {
        galleryImages {
          sourceUrl
          mediaDetails {
            width
            height
          }
        }
      }
    }
  }
`;

async function downloadImage(url, filepath) {
  try {
    const response = await axios({
      url,
      responseType: 'stream',
    });

    if (response.status !== 200) {
      throw new Error(`Failed to download image: ${url} - Status Code: ${response.status}`);
    }

    return new Promise((resolve, reject) => {
      response.data
        .pipe(fs.createWriteStream(filepath))
        .on('finish', () => {
          console.log(`Successfully downloaded: ${filepath}`);
          resolve();
        })
        .on('error', (e) => {
          console.error(`Error writing to file ${filepath}:`, e.message);
          reject(e);
        });
    });
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error.message);
  }
}

function extractImageUrlsFromContent(htmlContent) {
  if (!htmlContent) {
    return [];
  }
  const $ = cheerio.load(htmlContent);
  const imageUrls = [];
  $('img').each((_, img) => {
    const src = $(img).attr('src');
    if (src) {
      imageUrls.push(src);
    }
  });
  return imageUrls;
}

async function fetchAndSaveImages() {
  try {
    const data = await request(endpoint, query, { first: recordsToFetch });

    if (!data) {
      throw new Error('No data returned from the GraphQL API');
    }

    const directories = {
      bannerImagesDir: path.join('public', 'images', 'banners'),
      featuredImagesDir: path.join('public', 'images', 'featured'),
      contentImagesDir: path.join('public', 'images', 'content'),
      logosDir: path.join('public', 'images', 'logos'),
    };

    for (const dir of Object.values(directories)) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    }

    const downloadPromises = [];

    // Download banner images
    downloadBanners(data.pages, directories);
    downloadBanners(data.posts, directories);
    downloadBanners(data.forms, directories);
    downloadBanners(data.templates, directories);

    // Download featured images
    if (data.posts?.nodes) {
      for (const node of data.posts.nodes) {
        const url = node?.featuredImage?.node?.sourceUrl;
        if (url) {
          const filename = path.basename(url);
          const filepath = path.join(directories.featuredImagesDir, filename);
          console.log(`Downloading featured image: ${url}`);
          downloadPromises.push(downloadImage(url, filepath));
        }
      }
    }

    // Download content images
    const contentImageUrls = [
      ...data.pages?.nodes?.flatMap(node => extractImageUrlsFromContent(node?.content)) || [],
      ...data.posts?.nodes?.flatMap(node => extractImageUrlsFromContent(node?.content)) || [],
    ];

    for (const url of contentImageUrls) {
      if (url) {
        const filename = path.basename(url);
        const filepath = path.join(directories.contentImagesDir, filename);
        console.log(`Downloading content image: ${url}`);
        downloadPromises.push(downloadImage(url, filepath));
      }
    }

    // Download logos
    const logos = [
      data.customSiteSettings?.logo?.sourceUrl,
      data.customSiteSettings?.mobileLogo?.sourceUrl,
    ].filter(url => url);

    for (const url of logos) {
      if (url) {
        const filename = path.basename(url);
        const filepath = path.join(directories.logosDir, filename);
        console.log(`Downloading logo: ${url}`);
        downloadPromises.push(downloadImage(url, filepath));
      }
    }

    // Download gallery images
    const galleryImages = data.galleries?.nodes?.flatMap(gallery => gallery.galleryImages?.map(image => image.sourceUrl) || []) || [];
    for (const url of galleryImages) {
      if (url) {
        const filename = path.basename(url);
        const filepath = path.join(directories.contentImagesDir, filename);
        console.log(`Downloading gallery image: ${url}`);
        downloadPromises.push(downloadImage(url, filepath));
      }
    }

    // Wait for all downloads to complete
    await Promise.all(downloadPromises);

    console.log('All images downloaded successfully');
  } catch (error) {
    console.error('Error in fetchAndSaveImages:', error.message);
  }
}

function downloadBanners(data, directories) {
  const downloadPromises = [];
  if (!data?.nodes) {
    console.warn('No nodes data found for banners');
    return;
  }
  for (const node of data.nodes) {
    const url = node?.bannerImage?.sourceUrl;
    if (url) {
      const filename = path.basename(url);
      const filepath = path.join(directories.bannerImagesDir, filename);
      console.log(`Downloading banner image: ${url} to ${filepath}`);
      downloadPromises.push(downloadImage(url, filepath));
    }
  }
}

// Run the function
fetchAndSaveImages();
