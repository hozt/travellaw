// src/template/pageTemplate.js

export async function renderPage(props) {
  const { page } = props;

  const {
    title,
    subtitle,
    content,
    slug
  } = page;

  return `
    <div class="embed-page">
      <a name="${slug}"></a>
      <div class="title">${title}</div>
      ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
      <div class="content">${content}</div>
    </div>`;
}
