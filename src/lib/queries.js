
import { gql } from '@apollo/client/core';

export const GET_PAGE = gql`
  query($uri: String!) {
    pageBy(uri: $uri) {
      databaseId
      content
      dateGmt
      slug
      uri
      subtitle
      title
      metaTitle
      metaDescription
      customJs
      bannerImage {
        sourceUrl
        mediaDetails {
          width
          height
        }
      }
      featuredImage {
        node {
          altText
          sourceUrl
          mediaDetails {
            height
            width
          }
        }
      }
    }
  }
`;

export const GET_MENU_ITEMS_BY_LANGUAGE = gql`
  query($first: Int!, $language: LanguageCodeFilterEnum!) {
    menuItems(where: { location: PRIMARY, language: $language }) {
      nodes {
        id
        label
        cssClasses
        url
        target
        parentDatabaseId
        childItems(first: $first) {
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
        childItems(first: $first) {
          nodes {
            id
            label
            url
            target
            cssClasses
            childItems(first: $first) {
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
    }
  }
`;

export const GET_MENU_ITEMS_BY_LOCATION = gql`
  query($location: MenuLocationEnum!) {
    menuItems(where: { location: $location }, first: 100) {
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

export const GET_ENABLED_FEATURES = gql`
  query {
    customSiteSettings {
      enabledFeatures
    }
  }
`;

export const GET_TAG_LINE = gql`
  query {
    customSiteSettings {
      tagLine
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
        id
      }
      mobileLogo {
        altText
        sourceUrl
        mediaDetails {
          width
          height
        }
        id
      }
      defaultHeaderImage {
        altText
        sourceUrl
        mediaDetails {
          width
          height
        }
        id
      }
      defaultFeaturedImage {
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


export const GET_LANGUAGES = gql`
  query {
    languages {
      slug
      code
      locale
      homeUrl
      name
    }
  }
`;

export const GET_PAGES_FRAGMENT = gql`
  fragment GetPagesFields on Page {
    uri
    slug
    isFrontPage
    title
    subtitle
    content
    customJs
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
        altText
        mediaDetails {
          width
          height
        }
      }
    }
    metaTitle
    metaDescription
    databaseId
  }
`;

export const GET_PAGES = gql`
  ${GET_PAGES_FRAGMENT}
  query($first: Int!) {
    pages(first: $first, where: { status: PUBLISH }) {
      nodes {
        ...GetPagesFields
      }
    }
  }
`;

export const GET_ALL_POSTS = gql`
  query($first: Int!, $after: String) {
    allNodes:posts(first: $first, after: $after, where: {status: PUBLISH}) {
      nodes {
        databaseId
        slug
      }
      pageInfo {
        hasNextPage
        endCursor
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
      metaTitle
      metaDescription
      date
      content
      videoUrl
      tags {
        nodes {
          name
          slug
        }
      }
      featuredImage {
        node {
          altText
          sourceUrl
          mediaDetails {
            height
            width
          }
        }
      }
      bannerImage {
        altText
        sourceUrl
        mediaDetails {
          width
          height
        }
      }
      relatedPosts {
        slug
        uri
        title
      }
    }
  }
`;

export const POST_EXCERPT_FRAGMENT = gql`
  fragment PostExcerptFields on Post {
    id
    title
    excerpt
    slug
    databaseId
    date
    tags {
      nodes {
        name
        slug
      }
    }
    featuredImage {
      node {
        altText
        sourceUrl
      }
    }
  }
`;

export const GET_POSTS_EXCERPTS = gql`
  ${POST_EXCERPT_FRAGMENT}
  query($first: Int!, $after: String) {
    posts(first: $first, after: $after) {
      nodes {
        ...PostExcerptFields
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

export const GET_POSTS_EXCERPTS_STICKY = gql`
  ${POST_EXCERPT_FRAGMENT}
  query {
    posts(first: 10, where: {isStickyPost: true, orderby: {field: MENU_ORDER, order: ASC}}) {
      nodes {
        ...PostExcerptFields
      }
    }
  }
`;

export const GET_POSTS_EXCERPTS_BY_IDS = gql`
  ${POST_EXCERPT_FRAGMENT}
  query ($ids: [ID!]) {
    posts(where: {in: $ids, orderby: { field: DATE, order: DESC }}) {
      nodes {
        ...PostExcerptFields
      }
    }
  }
`;

export const GET_POSTS_BY_TAG_COUNT = gql`
  ${POST_EXCERPT_FRAGMENT}
  query ($tag: String!, $count: Int!) {
    posts(where: { tag: $tag, orderby: { field: DATE, order: DESC } }, first: $count) {
      nodes {
        ...PostExcerptFields
      }
    }
  }
`;

export const GET_CATEGORY_BY_SLUG = gql`
  query($slug: ID!) {
    category(id: $slug, idType: SLUG) {
      name
      databaseId
      description
    }
  }
`;

export const GET_POSTS_BY_CATEGORY = gql`
  query($first: Int!, $after: String, $categoryIn: [ID]!) {
    allNodes:posts(first: $first, after: $after, where: { categoryIn: $categoryIn }) {
      nodes {
        title
        slug
        excerpt
        databaseId
        date
        featuredImage {
          node {
            altText
            sourceUrl
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

 export const GET_POSTS_BY_CATEGORY_SLUG = gql`
  query($slug: ID!) {
    category(id: $slug, idType: SLUG) {
      id
      posts {
        nodes {
          title
          slug
          excerpt
          databaseId
          date
          featuredImage {
            node {
              altText
              sourceUrl
            }
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
`;

// get posts by tags
export const GET_POSTS_BY_TAG = gql`
  query($slug: ID!) {
    tag(id: $slug, idType: SLUG) {
      name
      description
      databaseId
      posts(first: 100, where: {orderby: {field: DATE, order: DESC}}) {
        nodes {
          title
          slug
          excerpt
          databaseId
          featuredImage {
            node {
              altText
              sourceUrl
            }
          }
        }
      }
    }
  }
`;

// get posts by tags
export const GET_PORTFOLIOS_BY_TAG = gql`
  query($slug: ID!) {
    portfolioCategory(id: $slug, idType: SLUG) {
      name
      description
      portfolios {
        nodes {
          title
          slug
          excerpt
          databaseId
          linkUrl
          featuredImage {
            node {
              altText
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
  query($first: Int!, $after: String) {
    allNodes:tags(first: $first, after: $after) {
      nodes {
        name
        slug
        databaseId
        description
        count
        hideFromDisplay
        posts {
          nodes {
            id
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

// get portfolioCategories
export const GET_PORTFOLIO_CATEGORIES = gql`
  query($first: Int!, $after: String) {
    allNodes:portfolioCategories(first: $first, after: $after) {
      nodes {
        name
        slug
        databaseId
        description
        count
        portfolios {
          nodes {
            id
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

// get category list for static paths
export const GET_CATEGORIES = gql`
  query($first: Int!) {
    categories(first: $first) {
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

export const GET_FAQ_TOPIC_BY_SLUG = gql`
  query($slug: ID!) {
    faqTopic(id: $slug, idType: SLUG) {
      name
      description
      faqTopicId
    }
  }
`;

export const GET_TEMPLATE = gql`
  query($slug: String!) {
    templateBy(slug: $slug) {
      title
      databaseId
      content
      contentFooter
      subtitle
      metaTitle
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
        excerpt
        databaseId
        videoUrl
        featuredImage {
          node {
            altText
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
  query {
    events(where: { status: PUBLISH }) {
      nodes {
        title
        startDatetime
        endDatetime
        content
        location
        featuredImage {
          node {
            altText
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
  query($first: Int!, $after: String) {
    allNodes: posts(first: $first, after: $after) {
      nodes {
        id
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_ALL_FORMS = gql`
  query {
    forms {
      nodes {
        slug
      }
    }
  }
`;

export const GET_FORM = gql`
  query($slug: String!) {
    formBy(slug: $slug) {
      title
      databaseId
      content
      subtitle
      metaTitle
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

export const GET_TESTIMONIALS = gql`
  query {
    testimonials(where: {status: PUBLISH, orderby: {order: ASC, field: MENU_ORDER}}) {
      nodes {
        databaseId
        title
        content
        source
      }
    }
  }
`;

//   query ($tag: String!, $count: Int!) {
// get testimonials order by random limit to count
export const GET_TESTIMONIALS_LIMIT = gql`
  query($count: Int!) {
    testimonials(where: {status: PUBLISH}, first: $count) {
      nodes {
        databaseId
        title
        content
        source
      }
    }
  }
`;

export const GET_VIDEO_SLUGS = gql`
  query {
    videos {
      nodes {
        slug
      }
    }
  }
`;

export const GET_VIDEO = gql`
  query($slug: String!) {
    videoBy(slug: $slug) {
      title
      content
      videoUrl
    }
  }
`;

export const GET_GALLERY_SLUGS = gql`
  query {
    galleries {
      nodes {
        slug
      }
    }
    templateBy(slug: "gallery") {
      databaseId
      title
      subtitle
      metaTitle
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

export const GET_GALLERY = gql`
  query GetGallery($slug: String!) {
    galleryBy(slug: $slug) {
      title
      content
      databaseId
      galleryImages {
        sourceUrl
        altText
        mediaDetails {
          height
          width
        }
      }
    }
  }
`;

export const GET_FAVICON = gql`
  {
    customSiteSettings {
      faviconLogo {
        sourceUrl
        mimeType
        id
      }
      logo {
       sourceUrl
      }
    }
  }
`;

export const GET_EDITOR_KEY = gql`
  {
    customSiteSettings {
      editorKey
    }
  }
`;

export const GET_NEWS_FEED = gql`
  query($first: Int!) {
    posts(first: $first, where: {status: PUBLISH, orderby: {field: DATE, order: DESC}}) {
      nodes {
        slug
        title
        excerpt
        date
        databaseId
      }
    }
  }
`;

export const GET_SITEMAP_SLUGS = gql`
  query($first: Int!) {
      pages(first: $first) {
        nodes {
          slug
          modified
          isFrontPage
          excludeFromSitemap
        }
      }
      posts(first: $first) {
        nodes {
          slug
          modified
          excludeFromSitemap
        }
      }
      forms(first: $first) {
        nodes {
          slug
          modified
          excludeFromSitemap
        }
      }
      galleries {
        nodes {
          slug
          modified
        }
      }
      portfolios(first: $first) {
        nodes {
          slug
          modified
          excludeFromSitemap
        }
      }
      faqTopics(first: $first) {
        nodes {
          slug
          parentId
        }
      }
      tags(first: $first) {
        nodes {
          slug
        }
      }
      portfolioCategories(first: $first) {
        nodes {
          slug
        }
      }
      categories(first: $first) {
        nodes {
          slug
        }
      }

    }
`;



export const GET_ALL_PORTFOLIOS = gql`
  query($first: Int!) {
    portfolios(first: $first, where: {status: PUBLISH, orderby: {order: ASC, field: MENU_ORDER}}) {
      nodes {
        databaseId
        slug
        isSticky
        additionalImage {
          sourceUrl
          title
          altText
          mediaDetails {
            height
            width
          }
        }
        tags:portfolioCategories {
          nodes {
            name
            slug
          }
        }
      }
    }
  }
`;

export const GET_PORTFOLIO = gql`
  query($slug: String!) {
    portfolioBy(slug: $slug) {
      databaseId
      subtitle
      title
      slug
      metaTitle
      metaDescription
      date
      content
      linkUrl
      tags:portfolioCategories {
        nodes {
          name
          slug
        }
      }
      featuredImage {
        node {
          altText
          sourceUrl
          title
          mediaDetails {
            height
            width
          }
        }
      }
      additionalImage {
        sourceUrl
        title
        mediaDetails {
          height
          width
        }
      }
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

export const GET_PORTFOLIO_EXCERPTS = gql`
  {
    portfolios(where: {status: PUBLISH, orderby: {order: ASC, field: MENU_ORDER}}) {
      nodes {
        title
        slug
        databaseId
        excerpt
        subtitle
        linkUrl
        featuredImage {
          node {
            altText
            sourceUrl
            title
            mediaDetails {
              width
              height
            }
          }
        }
        additionalImage {
          sourceUrl
          title
          mediaDetails {
            width
            height
          }
        }
      }
    }
  }
`;

export const GET_EMBED_PAGE = gql`
  query($id: ID!) {
    page(id: $id, idType: URI) {
      content
      title
      subtitle
      databaseId
      slug
    }
  }
`;

export const GET_ALL_PRIVATE_PAGES = gql`
  query {
    privates {
      nodes {
        databaseId
        slug
      }
    }
  }
`;

export const GET_PRIVATE_PAGE = gql`
  query($slug: String!) {
    privateBy(slug: $slug) {
      databaseId
      content
      title
      slug
    }
  }
`;
