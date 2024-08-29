import { request, gql } from 'graphql-request';
import { parse } from 'node-html-parser';

const endpoint = 'https://travellaw.hozt.com/graphql' //import.meta.env.GRAPHQL_URL;

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

function extractImageUrlsFromContent(htmlContent) {
  if (!htmlContent) {
    return [];
  }
  const root = parse(htmlContent);
  return root.querySelectorAll('img').map(img => img.getAttribute('src')).filter(Boolean);
}

async function fetchImageUrls() {
  try {
    const data = await request(endpoint, query, { first: recordsToFetch });

    if (!data) {
      throw new Error('No data returned from the GraphQL API');
    }

    const imageUrls = {
      bannerImages: [],
      featuredImages: [],
      contentImages: [],
      logos: [],
      galleryImages: []
    };

    // Collect banner images
    ['pages', 'posts', 'forms', 'templates'].forEach(type => {
      data[type]?.nodes?.forEach(node => {
        if (node?.bannerImage?.sourceUrl) {
          imageUrls.bannerImages.push(node.bannerImage.sourceUrl);
        }
      });
    });

    // Collect featured images
    data.posts?.nodes?.forEach(node => {
      if (node?.featuredImage?.node?.sourceUrl) {
        imageUrls.featuredImages.push(node.featuredImage.node.sourceUrl);
      }
    });

    // Collect content images
    ['pages', 'posts'].forEach(type => {
      data[type]?.nodes?.forEach(node => {
        imageUrls.contentImages.push(...extractImageUrlsFromContent(node?.content));
      });
    });

    // Collect logos
    if (data.customSiteSettings?.logo?.sourceUrl) {
      imageUrls.logos.push(data.customSiteSettings.logo.sourceUrl);
    }
    if (data.customSiteSettings?.mobileLogo?.sourceUrl) {
      imageUrls.logos.push(data.customSiteSettings.mobileLogo.sourceUrl);
    }

    // Collect gallery images
    data.galleries?.nodes?.forEach(gallery => {
      gallery.galleryImages?.forEach(image => {
        if (image.sourceUrl) {
          imageUrls.galleryImages.push(image.sourceUrl);
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

// Usage
fetchImageUrls().then(imageUrls => {
  if (imageUrls) {
    console.log('Banner Images:', imageUrls.bannerImages.length);
    console.log('Featured Images:', imageUrls.featuredImages.length);
    console.log('Content Images:', imageUrls.contentImages.length);
    console.log('Logos:', imageUrls.logos.length);
    console.log('Gallery Images:', imageUrls.galleryImages.length);
  }
});
