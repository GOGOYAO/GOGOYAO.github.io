const fs=require('node:fs'),path=require('node:path'),matter=require('gray-matter');
const source=path.resolve(__dirname,'../source');
for(const [folder,label] of [['_posts','正式文章'],['_drafts','草稿']]){
  const files=fs.existsSync(path.join(source,folder))?fs.readdirSync(path.join(source,folder)).filter(f=>/\.(md|html)$/.test(f)):[];
  console.log(`\n${label}（${files.length}）`);
  for(const file of files){const {data}=matter(fs.readFileSync(path.join(source,folder,file),'utf8'));console.log(`${data.title}\t${data.permalink}\t${folder}/${file}`);}
}
