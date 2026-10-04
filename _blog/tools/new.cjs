const fs=require('node:fs');const path=require('node:path');
const [slug,title,...options]=process.argv.slice(2);
if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug||'')||!title){console.error('Usage: npm run new -- english-slug "文章标题" [--publish]');process.exit(1)}
const project=path.resolve(__dirname,'..');
for(const folder of ['_posts','_drafts'])for(const ext of ['.md','.html'])if(fs.existsSync(path.join(project,'source',folder,slug+ext)))throw Error('Article already exists');
const now=new Date();const date=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now);
const folder=options.includes('--publish')?'_posts':'_drafts';
const text=`---\ntitle: ${JSON.stringify(title)}\ndate: ${date}\nupdated: ${date}\npermalink: posts/${slug}/\ncategories: []\ntags: []\ndescription: ""\n---\n\n文章摘要。\n\n<!-- more -->\n\n正文。\n`;
const dest=path.join(project,'source',folder,slug+'.md');fs.writeFileSync(dest,text,{flag:'wx'});console.log(dest);
