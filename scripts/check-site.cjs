'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const htmlFiles=['index.html','prompts.html','support.html','terms.html','privacy-policy.html'];
let localReferences=0;
for(const file of htmlFiles){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,file+': duplicate IDs');
  assert.equal((html.match(/<h1\b/g)||[]).length,1,file+': one h1 required');
  for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
    if(/^(https?:|mailto:|data:|javascript:|\/\/)/.test(match[1]))continue;
    const [resource,fragment]=match[1].split('#');
    const target=resource?decodeURIComponent(resource.split('?')[0]):file;
    const absolute=path.resolve(root,target);
    assert(absolute.startsWith(root+path.sep),file+': path outside website');
    assert(fs.existsSync(absolute),file+': missing '+target);
    if(fragment&&target.endsWith('.html')){
      const targetHTML=fs.readFileSync(absolute,'utf8');
      assert([...targetHTML.matchAll(/\bid="([^"]+)"/g)].some(m=>m[1]===fragment),file+': missing anchor '+target+'#'+fragment);
    }
    localReferences++;
  }
}
for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.css'))){
  const css=fs.readFileSync(path.join(root,file),'utf8');
  for(const match of css.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g)){
    if(/^(https?:|data:|#)/.test(match[1]))continue;
    assert(fs.existsSync(path.resolve(root,match[1])),file+': missing CSS asset '+match[1]);
  }
}
const library=fs.readFileSync(path.join(root,'prompts.html'),'utf8');
const support=fs.readFileSync(path.join(root,'support.html'),'utf8');
assert(support.includes('This is an early preview, not a stable release.'));
assert(support.includes('text expansion in real applications is still being verified'));
assert(support.includes('Google sign-in and cloud sync remain limited to configured test accounts'));
const crypto=require('node:crypto');
const download=path.join(root,'downloads/Ziptype-1.0.6-notarized.dmg');
const checksum=crypto.createHash('sha256').update(fs.readFileSync(download)).digest('hex');
assert.equal(checksum,'a068804a9046d17c7594a4b742ed76244bea5d9642c4fd0554ebeba3e8557750');
assert(fs.readFileSync(path.join(root,'downloads/SHA256SUMS.txt'),'utf8').includes(checksum));
assert.equal((library.match(/data-prompt-card\b/g)||[]).length,524);
assert(fs.readFileSync(path.join(root,'terms.html'),'utf8').includes('content="noindex,follow"'));
assert(!fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').includes('terms.html'));
console.log(`PASS ${htmlFiles.length} pages, ${localReferences} local references, CSS assets, 524 prompts and draft-terms indexing guard`);
