export async function onRequest(context) {
    const { request, env } = context;

    const providedKey = request.headers.get('X-Editor-Key');
    console.log(providedKey, env.EDITOR_KEY);

    if (providedKey === env.EDITOR_KEY) {
      console.log('Authorized');
      const url = new URL(request.url);
      const postId = url.searchParams.get('postId');
      const pageId = url.searchParams.get('pageId');
      const templateId = url.searchParams.get('templateId');

      const editorUrl = env.API_URL + '/wp-admin/';
      const editPostUrl = postId ? `${editorUrl}post.php?post=${postId}&action=edit` : null;
      const editPageUrl = pageId ? `${editorUrl}post.php?post=${pageId}&action=edit` : null;
      const editTemplateUrl = templateId ? `${editorUrl}post.php?post=${templateId}&action=edit` : null;
      const editMenuUrl = `${editorUrl}nav-menus.php`;
      const regenerateUrl = `${editorUrl}admin.php?page=custom_webhook`;

      const menuHTML = `
        <li>
            <a href="${editorUrl}" target="_blank" rel="noreferrer">
            <i class="icon-[mdi--view-dashboard] text-lg mr-1" title="Dashboard"></i>
            <span class="hidden md:inline-block">Dashboard</span>
            </a>
        </li>
        ${editPostUrl ? `
            <li>
            <a href="${editPostUrl}" target="_blank" rel="noreferrer">
                <i class="icon-[mdi--post-it-note-edit] text-lg mr-1" title="Edit Post"></i>
                <span class="hidden md:inline-block">Edit Post</span>
            </a>
            </li>
        ` : ''}
        ${editPageUrl ? `
            <li>
            <a href="${editPageUrl}" target="_blank" rel="noreferrer">
                <i class="icon-[mdi--post-it-note-edit] text-lg mr-1" title="Edit Page"></i>
                <span class="hidden md:inline-block">Edit Page</span>
            </a>
            </li>
        ` : ''}
        ${editTemplateUrl ? `
            <li>
            <a href="${editTemplateUrl}" target="_blank" rel="noreferrer">
                <i class="icon-[mdi--post-it-note-edit] text-lg mr-1" title="Edit Template"></i>
                <span class="hidden md:inline-block">Edit Template</span>
            </a>
            </li>
        ` : ''}
        <li>
            <a href="${editMenuUrl}" target="_blank" rel="noreferrer">
            <i class="icon-[mdi--menu-open] text-lg mr-1" title="Edit Menu"></i>
            <span class="hidden md:inline-block">Edit Menus</span>
            </a>
        </li>
        <li>
            <a href="${regenerateUrl}" target="_blank" rel="noreferrer">
            <i class="icon-[mdi--publish] text-lg mr-1" title="Regenerate Site"></i>
            <span class="hidden md:inline-block">Regenerate Site</span>
            </a>
        </li>
      `;

      return new Response(menuHTML, {
        headers: { 'Content-Type': 'text/html' },
      });
    } else {
      return new Response('Unauthorized', { status: 403 });
    }
  }