import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

export const processHtml = (htmlContent) => {
  const processor = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeRaw) // allows for raw HTML
    .use(rehypeSanitize) // sanitize HTML to prevent XSS
    .use(rehypeStringify);

  return processor.processSync(htmlContent).toString();
};
