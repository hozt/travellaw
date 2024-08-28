import pkg from '@apollo/client';
const { gql } = pkg;

export const GET_PAGE_DATA = gql`
  query GetIndexPage {
    pageBy(uri: "index") {
      databaseId
      content
      dateGmt
      slug
      subtitle
      title
      metaDescription
      bannerImage {
        sourceUrl
        mediaDetails {
          width
          height
        }
      }
    }
  }
`;

export const GET_MENU_ITEMS = gql`
  query GetMenuItems($first: Int!) {
    menuItems(where: { location: PRIMARY }, first: $first) {
      nodes {
        id
        label
        cssClasses
        url
        target
        parentDatabaseId
        childItems {
          nodes {
            id
            label
            url
            target
            cssClasses
          }
        }
      }
    }
  }
`;

export const GET_FOOTER_MENU_ITEMS = gql`
  query {
    menuItems(where: { location: FOOTER }) {
      nodes {
        id
        label
        cssClasses
        url
        target
        parentDatabaseId
        childItems {
          nodes {
            id
            label
            url
            target
            cssClasses
          }
        }
      }
    }
  }
`;

export const GET_SITE_SETTINGS = gql`
  query {
    customSiteSettings {
      logo {
        sourceUrl
        altText
        mediaDetails {
          width
          height
        }
      }
      mobileLogo {
        altText
        sourceUrl
        mediaDetails {
          width
          height
        }
      }
      siteTitle
      tagLine
    }
  }
`;

export const GET_SITE_TITLE = gql`
  query {
    customSiteSettings {
      siteTitle
    }
  }
`;

export const GET_PAGES = gql`
  query GetPages($first: Int!) {
    pages(first: $first, where: { status: PUBLISH }) {
      nodes {
        uri
        slug
        title
        subtitle
        content
        bannerImage {
          sourceUrl
          mediaDetails {
            width
            height
          }
        }
        featuredImage {
          node {
            sourceUrl
            mediaDetails {
              width
              height
            }
          }
        }
        metaDescription
        databaseId
      }
    }
  }
`;

export const GET_ALL_POSTS = gql`
  query($first: Int!) {
    posts(first: $first, where: {status: PUBLISH}) {
      nodes {
        databaseId
        slug
      }
    }
  }
`;

export const GET_POST = gql`
  query($slug: String!) {
    postBy(slug: $slug) {
      databaseId
      subtitle
      title
      slug
      metaDescription
      date
      content
      bannerImage {
        altText
        sourceUrl
        mediaDetails {
          width
          height
        }
      }
    }
  }
`;

export const GET_POSTS_EXCERPTS = gql`
  query GET_POSTS_EXCERPTS($first: Int!, $after: String) {
    posts(first: $first, after: $after) {
      nodes {
        id
        title
        excerpt
        slug
        databaseId
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;


export const GET_POSTS_BY_CATEGORY = gql`
  query GET_POSTS_BY_CATEGORY($slug: ID!) {
    category(id: $slug, idType: SLUG) {
      name
      posts {
        nodes {
          title
          slug
          excerpt
          databaseId
          featuredImage {
            node {
              sourceUrl
            }
          }
        }
      }
    }
  }
`;

// get posts by tags
export const GET_POSTS_BY_TAG = gql`
  query GET_POSTS_BY_TAG($slug: ID!) {
    tag(id: $slug, idType: SLUG) {
      name
      posts {
        nodes {
          title
          slug
          excerpt
          databaseId
          featuredImage {
            node {
              sourceUrl
            }
          }
        }
      }
    }
  }
`;

// get tags list for static paths
export const GET_TAGS = gql`
  query {
    tags {
      nodes {
        name
        slug
        databaseId
        description
      }
    }
  }
`;

// get category list for static paths
export const GET_CATEGORIES = gql`
  query {
    categories {
      nodes {
        name
        slug
        databaseId
        description
      }
    }
  }
`;

export const GET_FAQS = gql`
  query {
    faqTopics {
      nodes {
        name
        description
        faqTopicId
      }
    }
    faqs(first:200, where: {orderby: {field: MENU_ORDER, order: ASC}}) {
      nodes {
        title
        content
        faqId
        faqTopics {
          nodes {
            taxonomyName
            databaseId
            name
          }
        }
      }
    }
  }
`;

export const GET_FAQ_TOPICS = gql`
  query {
    faqTopics {
      nodes {
        slug
        parentId
      }
    }
  }
`;

export const GET_TEMPLATE = gql`
  query GetTemplate($slug: String!) {
    templateBy(slug: $slug) {
      title
      databaseId
      content
      subtitle
      metaDescription
      bannerImage {
        sourceUrl
        mediaDetails {
          width
          height
        }
      }
    }
  }
`;

export const GET_VIDEOS = gql`
  query GetVideos {
    videos(where: {status: PUBLISH}) {
      nodes {
        title
        slug
        content
        databaseId
        videoUrl
        featuredImage {
          node {
            sourceUrl
            mediaDetails {
              sizes {
                width
                height
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_EVENTS = gql`
  query GetEvents {
    events(where: { status: PUBLISH }) {
      nodes {
        title
        startDatetime
        endDatetime
        content
        featuredImage {
          node {
            sourceUrl
            mediaDetails {
              width
              height
            }
          }
        }
      }
    }
  }
`;

export const GET_ARTICLES_COUNT = gql`
  query GetArticlesCount {
    posts(first: 500) {
      nodes {
        id
      }
    }
  }
`;

export const GET_ALL_FORMS = gql`
  query GetForms {
    forms {
      nodes {
        slug
      }
    }
  }
`;

export const GET_FORM = gql`
  query GetForm($slug: String!) {
    formBy(slug: $slug) {
      title
      databaseId
      content
      subtitle
      metaDescription
      bannerImage {
        sourceUrl
        mediaDetails {
          width
          height
        }
      }
    }
  }
`;

export const GET_REDIRECTS = gql`
  query {
    redirects {
      new_url
      old_url
      status_code
    }
  }
`;