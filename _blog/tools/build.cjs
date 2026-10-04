const fs = require('node:fs');
const path = require('node:path');
const Hexo = require('hexo');
const matter = require('gray-matter');
const project = path.resolve(__dirname, '..');
const root = path.resolve(project, '..');
const draftPreview = process.argv.includes('--drafts');
const publicDir = path.join(project, 'public');
function xml(s){return String(s).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));}
(async()=>{
  for(const name of fs.readdirSync(path.join(project,'source/_posts'))){
    const file=path.join(project,'source/_posts',name);if(!fs.statSync(file).isFile())continue;
    const {data,content}=matter(fs.readFileSync(file,'utf8'));
    for(const key of ['title','date','permalink'])if(!data[key])throw Error(`${name}: missing ${key}`);
    if(!Array.isArray(data.tags)||!Array.isArray(data.categories))throw Error(`${name}: categories and tags must be arrays`);
    if(!content.trim())throw Error(`${name}: empty article`);
    if(!/^[^?#\\]+\/$/.test(data.permalink)||data.permalink.startsWith('/')||data.permalink.split('/').includes('..'))throw Error(`${name}: unsafe permalink`);
  }
  const hexo = new Hexo(project,{silent:true,draft:draftPreview});await hexo.init();await hexo.call('clean');
  for(const name of ['css','js','dist','images','fancybox','favicon.ico','404.html']){
    const from=path.join(root,name);if(fs.existsSync(from))fs.cpSync(from,path.join(publicDir,name),{recursive:true});
  }
  await hexo.call('generate');
  const posts=hexo.locals.get('posts').sort('date',-1).toArray().filter(p=>(draftPreview||p.published!==false)&&p.date.valueOf()<=Date.now());
  const index=posts.map(p=>({title:p.title,path:p.path.replace(/^\/+/,''),published:p.published!==false,date:p.date.format('YYYY-MM-DD'),source:p.source,categories:p.categories.map(c=>({name:c.name,path:c.path})),tags:p.tags.map(t=>({name:t.name,path:t.path}))}));
  if(new Set(index.map(p=>p.path)).size!==index.length)throw Error('Duplicate article URLs');
  const search='<?xml version="1.0" encoding="UTF-8"?><search>'+posts.map(p=>`<entry><title>${xml(p.title)}</title><content>${xml(p.content.replace(/<[^>]*>/g,' '))}</content><url>/${xml(p.path)}</url></entry>`).join('')+'</search>';
  fs.writeFileSync(path.join(publicDir,'search.xml'),search);
  const site = 'https://gogoyao.github.io/';
  const atom = '<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>GOGO</title><id>'+site+'</id><link href="'+site+'"/><link href="'+site+'atom.xml" rel="self"/><updated>'+new Date(Math.max(...posts.map(p=>p.updated.valueOf()))).toISOString()+'</updated>'+posts.map(p=>`<entry><title>${xml(p.title)}</title><id>${site}${xml(p.path.replace(/^\/+/,'').replace(/index.html$/,''))}</id><link href="${site}${xml(p.path.replace(/^\/+/,'').replace(/index.html$/,''))}"/><updated>${p.updated.toISOString()}</updated><published>${p.date.toISOString()}</published><author><name>GOGOYAO</name></author><content type="html">${xml(p.content)}</content></entry>`).join('')+'</feed>';
  fs.writeFileSync(path.join(publicDir,'atom.xml'),atom);
  fs.writeFileSync(path.join(publicDir,'blog-index.json'),JSON.stringify(index,null,2)+'\n');
  const routes=Array.from(new Set([...hexo.route.list(),'search.xml','atom.xml','blog-index.json'])).sort();
  fs.writeFileSync(path.join(project,'build-routes.json'),JSON.stringify(routes,null,2)+'\n');
  await hexo.exit();console.log(`Built ${index.length} ${draftPreview ? 'preview' : 'published'} articles, ${routes.length} managed files.`);
})().catch(e=>{console.error(e);process.exitCode=1});
