const fs = require('fs');
const path = require('path');

const targetDir = 'app/mother';

if (fs.existsSync(targetDir)) {
  const folders = fs.readdirSync(targetDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  // We should also include sub-folders if needed, but they are flat. Just mapping directories
  folders.forEach(folder => {
    const p = path.join(targetDir, folder, 'page.tsx');
    if (fs.existsSync(p)) {
      let content = fs.readFileSync(p, 'utf8');
      
      let modified = false;

      // Make page backgrounds consistent, light and airy!
      const minHRegex = /className="min-h-screen[^"]*"/g;
      if (minHRegex.test(content) && !content.includes('bg-gradient-to-br from-princess-1/20 via-white to-princess-1/10 pb-10')) {
        content = content.replace(minHRegex, 'className="min-h-screen bg-gradient-to-br from-princess-1/20 via-white to-princess-1/10 pb-10"');
        modified = true;
      }

      // Replace any of the older solid edge-to-edge headers:
      const headerRegex = /className="bg-gradient-to-r from-[A-Za-z0-9\-\/]+ to-[A-Za-z0-9\-\/]+ p-[456] text-white[^"]*"/g;
      if (headerRegex.test(content)) {
        content = content.replace(headerRegex, (match) => {
            if (match.includes("sticky")) {
                return 'className="mx-3 mt-4 overflow-hidden rounded-[2rem] bg-gradient-to-r from-princess-4 to-primary p-5 text-white sticky top-4 z-30 shadow-lg shadow-princess-4/20 border border-white/20 md:mx-auto md:max-w-2xl"';
            }
            return 'className="mx-3 mt-4 overflow-hidden rounded-[2rem] bg-gradient-to-r from-princess-4 to-primary p-6 text-white shadow-lg shadow-princess-4/20 border border-white/20 md:mx-auto md:max-w-xl"';
        });
        modified = true;
      }

      // Sometimes headers might just use basic classes if they were customized differently (e.g., bg-primary, etc.)
      const simpleHeaderRegex = /className="bg-[^"]* p-[456] text-white[^"]*"/g;
      if (simpleHeaderRegex.test(content)) {
          // ensure it's an actual big header, by checking if it contains 'p-6' or 'p-5' and text-white.
          content = content.replace(simpleHeaderRegex, (match) => {
              if (match.includes("rounded-[2rem]")) return match; // Already fixed
              if (match.includes("sticky")) {
                  return 'className="mx-3 mt-4 overflow-hidden rounded-[2rem] bg-gradient-to-r from-princess-4 to-primary p-5 text-white sticky top-4 z-30 shadow-lg shadow-princess-4/20 border border-white/20 md:mx-auto md:max-w-2xl"';
              }
              return 'className="mx-3 mt-4 overflow-hidden rounded-[2rem] bg-gradient-to-r from-princess-4 to-primary p-6 text-white shadow-lg shadow-princess-4/20 border border-white/20 md:mx-auto md:max-w-xl"';
          });
          modified = true;
      }

      const h1Regex = /<h1 className="text-3xl font-bold mb-2">/g;
      if(h1Regex.test(content)){
          // content = content.replace(h1Regex, '<h1 className="text-2xl font-bold mb-2">');
          // modified = true;
      }

      // Replace the button hover to be less dark if we changed the header.
      if (modified) {
          content = content.replace(/className="text-white hover:bg-white\/20"/g, 'className="text-white hover:bg-white/20 -ml-2"');
          content = content.replace(/className="text-white mb-4"(\s*)onClick/g, 'className="text-white mb-4 hover:bg-white/20 -ml-2"$1onClick');
          content = content.replace(/className="text-white mb-4 transition"/g, 'className="text-white mb-4 hover:bg-white/20 -ml-2 transition"');
      }

      if (modified) {
        fs.writeFileSync(p, content, 'utf8');
        console.log(`Updated header in ${p}`);
      }
    }
  });
}
console.log("All tools header sweep completed.");
