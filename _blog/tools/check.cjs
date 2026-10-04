const fs=require('node:fs');const path=require('node:path');const cheerio=require('cheerio');
const project=path.resolve(__dirname,'..'),dir=path.join(project,'public');
const index=JSON.parse(fs.readFileSync(path.join(dir,'blog-index.json')));const failures=[];
function fail(s){failures.push(s)}
const home=cheerio.load(fs.readFileSync(path.join(dir,'index.html')));
const archive=cheerio.load(fs.readFileSync(path.join(dir,'archives/index.html')));
const paths=JSON.parse(fs.readFileSync(path.join(project,'build-routes.json')));
const expectedOrder=[...index].sort((a,b)=>b.date.localeCompare(a.date));
for(const post of index){
  if(!fs.existsSync(path.join(dir,post.path)))fail(`Article missing: ${post.path}`);
  if(!archive(`a[href="/${encodeURI(post.path.replace(/index.html$/,''))}"]`).length&&!archive(`a[href="/${post.path.replace(/index.html$/,'')}"]`).length){
    const archivePages=paths.filter(x=>/^archives\/.*index\.html$/.test(x));
    if(!archivePages.some(f=>fs.readFileSync(path.join(dir,f),'utf8').includes(post.title.replaceAll('&','&amp;'))))fail(`Archive entry missing: ${post.title}`);
  }
  for(const taxonomy of [...post.categories,...post.tags])if(!fs.existsSync(path.join(dir,taxonomy.path)))fail(`Taxonomy missing: ${taxonomy.path}`);
}
if(index.length&&home('.article-title').first().text().trim()!==expectedOrder[0].title)fail('Newest article not first on homepage');
for(const file of paths.filter(p=>p.endsWith('.html'))){
  const $=cheerio.load(fs.readFileSync(path.join(dir,file)));$('a[href],img[src],script[src],link[href],iframe[src]').each((_,el)=>{
    const link=$(el).attr('href')||$(el).attr('src');if(!link||/^(https?:|\/\/|#|mailto:|javascript:|data:)/.test(link))return;
    let pathname;try{pathname=decodeURIComponent(new URL(link,'https://gogoyao.github.io/'+file).pathname)}catch{fail(`Invalid link ${file}: ${link}`);return;}
    const local=path.join(dir,pathname);if(!fs.existsSync(local))fail(`Broken local link ${file}: ${link}`);
  });
}
for(const post of index)if(!fs.readFileSync(path.join(dir,'search.xml'),'utf8').includes(post.title.replaceAll('&','&amp;')))fail(`Search missing ${post.title}`);
const sourceAsset=path.join(project,'source/cuda-sm-warp-occupancy.html');
if(!fs.readFileSync(sourceAsset).equals(fs.readFileSync(path.join(dir,'cuda-sm-warp-occupancy.html'))))fail('Interactive HTML changed during generation');
if(paths.some(p=>p.includes('_drafts')))fail('Draft route leaked');
if(failures.length){console.error([...new Set(failures)].join('\n'));process.exit(1)}
console.log(`Checks passed: ${index.length} articles, home, archives, taxonomies, search, local links and interactive HTML.`);
