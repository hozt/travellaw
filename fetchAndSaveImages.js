import { request, gql } from 'graphql-request';
import { parse } from 'node-html-parser';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import sharp from 'sharp';
dotenv.config();

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const endpoint = process.env.GRAPHQL_URL;

if (!endpoint) {
  throw new Error('GRAPHQL_URL environment variable is not set');
}

const recordsToFetch = 500;
const query = gql`
  query GetImages($first: Int!) {
    pages(first: $first) {
      nodes {
        bannerImage {
          sourceUrl
        }
        content
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
        content
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
      faviconLogo {
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
    mediaItems(where: {mimeType: APPLICATION_PDF}) {
      nodes {
        mediaItemUrl
      }
    }
  }
`;

function extractImageUrlsFromContent(htmlContent) {
  if (!htmlContent) {
    return [];
  }

  const root = parse(htmlContent);
  const imageUrls = new Set();

  root.querySelectorAll('img').forEach(img => {
    // Extract src attribute
    const src = img.getAttribute('src');
    if (src) {
      imageUrls.add(src);
    }

    // Extract srcset attribute
    const srcset = img.getAttribute('srcset');
    if (srcset) {
      srcset.split(',').forEach(srcsetItem => {
        const [url] = srcsetItem.trim().split(' ');
        if (url) {
          imageUrls.add(url);
        }
      });
    }
  });

  return Array.from(imageUrls);
}

async function fetchImageUrls() {
  try {
    const data = await request(endpoint, query, { first: recordsToFetch });

    if (!data) {
      throw new Error('No data returned from the GraphQL API');
    }

    const imageUrls = {
      banners: [],
      featured: [],
      content: [],
      logos: [],
      gallery: []
    };

    // Collect banner images
    ['pages', 'posts', 'forms', 'templates'].forEach(type => {
      data[type]?.nodes?.forEach(node => {
        if (node?.bannerImage?.sourceUrl) {
          imageUrls.banners.push(node.bannerImage.sourceUrl);
        }
      });
    });

    // Collect featured images
    data.posts?.nodes?.forEach(node => {
      if (node?.featuredImage?.node?.sourceUrl) {
        imageUrls.featured.push(node.featuredImage.node.sourceUrl);
      }
    });

    // Collect content images
    ['pages', 'posts'].forEach(type => {
      data[type]?.nodes?.forEach(node => {
        imageUrls.content.push(...extractImageUrlsFromContent(node?.content));
      });
    });

    // Collect logos
    if (data.customSiteSettings?.logo?.sourceUrl) {
      imageUrls.logos.push(data.customSiteSettings.logo.sourceUrl);
    }
    if (data.customSiteSettings?.mobileLogo?.sourceUrl) {
      imageUrls.logos.push(data.customSiteSettings.mobileLogo.sourceUrl);
    }
    // save favicon to /public/favicon.svg  convert to svg
    if (data.customSiteSettings?.faviconLogo?.sourceUrl) {
      imageUrls.logos.push(data.customSiteSettings.faviconLogo.sourceUrl);
    }
    // Collect gallery images
    data.galleries?.nodes?.forEach(gallery => {
      gallery.galleryImages?.forEach(image => {
        if (image.sourceUrl) {
          imageUrls.gallery.push(image.sourceUrl);
        }
      });
    });

    console.log('All image URLs collected successfully');
    return imageUrls;
  } catch (error) {
    console.error('Error in fetchImageUrls:', error.message);
    return null;
  }
}

async function downloadImage(url, outputPath) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    const buffer = await response.buffer();
    await fs.writeFile(outputPath, buffer);
    console.log(`Downloaded: ${url}`);
    // Convert to WebP
    const webpOutputPath = outputPath.replace(/\.(jpg|jpeg|png)$/, '.webp');
    await sharp(buffer).webp().toFile(webpOutputPath);
    console.log(`Converted to WebP: ${webpOutputPath}`);
  } catch (error) {
    console.error(`Error downloading ${url}: ${error.message}`);
  }
}

async function downloadPdf(pdfUrl, outputPath) {
  try {
    const response = await fetch(pdfUrl);
    if (!response.ok) throw new Error(`Failed to fetch PDF: ${pdfUrl}`);
    const buffer = await response.buffer();
    await fs.writeFile(outputPath, buffer);
    console.log(`Downloaded PDF: ${outputPath}`);
  } catch (error) {
    console.error(`Error downloading PDF ${pdfUrl}: ${error.message}`);
  }
}

async function fetchAndSavePDFs() {
  try {
    const data = await request(endpoint, query, { first: recordsToFetch });

    const localPdfDir = 'public/pdfs';
    await fs.mkdir(path.join(__dirname, localPdfDir), { recursive: true });

    for (const node of data.mediaItems.nodes) {
      try {
        const pdfUrl = node.mediaItemUrl;
        const pdfFilename = pdfUrl.split('/').pop();
        const pdfPath = path.join(__dirname, localPdfDir, pdfFilename);
        await downloadPdf(pdfUrl, pdfPath);
      } catch (error) {
        console.error(`Error fetching PDF: ${error.message}`);
      }
    }

    console.log('PDFs fetched and saved successfully');
  } catch (error) {
    console.error('Error in fetchAndSavePDFs:', error.message);
  }
}

async function downloadAllImages(imageUrls) {
  const downloadPromises = [];
  for (const [category, urls] of Object.entries(imageUrls)) {
    for (const url of urls) {
      const fileName = path.basename(new URL(url).pathname);
      const outputPath = path.join(__dirname, 'public', 'images', category, fileName);
      await fs.mkdir(path.join(__dirname, 'public', 'images'), { recursive: true });
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      downloadPromises.push(downloadImage(url, outputPath));
    }
  }
  await Promise.all(downloadPromises);
}

// Main execution
(async () => {
  try {
    const imageUrls = await fetchImageUrls();
    if (imageUrls) {
      console.log('Banner Images:', imageUrls.banners.length);
      console.log('Featured Images:', imageUrls.featured.length);
      console.log('Content Images:', imageUrls.content.length);
      console.log('Logos:', imageUrls.logos.length);
      console.log('Gallery Images:', imageUrls.gallery.length);

      console.log('Starting image downloads...');
      await downloadAllImages(imageUrls);
      await fetchAndSavePDFs();
      console.log('All images downloaded successfully');

    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
})();