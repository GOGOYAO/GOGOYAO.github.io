const fs=require('node:fs');const path=require('node:path');
const project=path.resolve(__dirname,'..'),root=path.resolve(project,'..');
const routes=JSON.parse(fs.readFileSync(path.join(project,'build-routes.json')));
const manifestPath=path.join(project,'published-routes.json');
const old=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath)):[];
function validate(p){if(p.startsWith('/')||p.split('/').includes('..')||p.startsWith('_blog/')||p.startsWith('.git/'))throw Error(`Unsafe generated path: ${p}`)}
for(const p of [...routes,...old])validate(p);
for(const p of old)if(!routes.includes(p)){const file=path.join(root,p);if(fs.existsSync(file))fs.unlinkSync(file);}
for(const p of routes){const to=path.join(root,p);fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(path.join(project,'public',p),to);}
fs.writeFileSync(manifestPath,JSON.stringify(routes,null,2)+'\n');
console.log(`Prepared ${routes.length} generated files. Review the Git diff before publishing.`);
