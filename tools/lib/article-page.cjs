const { xml } = require('./files.cjs');
function articlePage(document, title, summary) {
  const header = `<header data-blog-header style="max-width:1430px;margin:0 auto 20px;padding:20px 24px;box-sizing:border-box;font-family:system-ui,sans-serif;color:#1f2937;background:#fff;border-bottom:1px solid #d1d5db"><h1 style="margin:0 0 12px;font-size:clamp(24px,4vw,32px);line-height:1.35">${xml(title)}</h1>${summary ? `<div data-blog-summary style="font-size:16px;line-height:1.7;color:#4b5563">${summary}</div>` : ''}</header>`;
  let result = document.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${xml(title)}</title>`);
  const heading = result.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (heading && heading[1].replace(/<[^>]*>/g, '').trim() === title) result = result.replace(heading[0], header);
  else result = result.replace(/<body\b[^>]*>/i, match => match + header);
  return result;
}
module.exports = { articlePage };
