const { xml } = require('./files.cjs');
function articlePage(document, title, summary) {
  const header = `<header data-blog-header style="margin:0 0 22px;padding:0 0 18px;box-sizing:border-box;font-family:inherit;color:inherit;border-bottom:1px solid var(--border,#d1d5db)"><h1 style="margin:0 0 12px;font-size:clamp(24px,2.4vw,32px);font-weight:700;letter-spacing:-.025em;line-height:1.4">${xml(title)}</h1>${summary ? `<div data-blog-summary style="max-width:100ch;font-size:15px;line-height:1.85;color:var(--muted,#64748b)">${summary}</div>` : ''}</header>`;
  const styles = `<style>[data-blog-summary]>:first-child{margin-top:0}[data-blog-summary]>:last-child{margin-bottom:0}[data-blog-summary] p{margin:0 0 8px}[data-blog-header]+.sub{font-size:14px;line-height:1.7;margin-top:-8px;margin-bottom:20px}@media(max-width:600px){[data-blog-header]{margin-bottom:18px!important;padding-bottom:14px!important}[data-blog-summary]{font-size:14px!important;line-height:1.75!important}}</style>`;
  let result = document.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${xml(title)}</title>`);
  const heading = result.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (heading && heading[1].replace(/<[^>]*>/g, '').trim() === title) result = result.replace(heading[0], header);
  else result = result.replace(/<body\b[^>]*>/i, match => match + header);
  return result.replace(/<\/head>/i, styles + '</head>');
}
module.exports = { articlePage };
