const fs = require('fs');
const path = require('path');

const folders = [
  'labor-signs',
  'pregnancy-tracker',
  'hospital-finder',
  'vital-signs',
  'vaccination-tracker',
  'nutrition',
  'emotion-tracker'
];

folders.forEach(folder => {
  const p = path.join('app/mother', folder, 'page.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');

    // Make page backgrounds consistent, light and airy!
    content = content.replace(/className="min-h-screen[^"]*"/g, 'className="min-h-screen bg-gradient-to-br from-princess-1/20 via-white to-princess-1/10 pb-10"');

    // Replace all colored full-width headers with our floating rounded premium ones
    content = content.replace(/className="bg-gradient-to-r from-[A-Za-z0-9\-\/]+ to-[A-Za-z0-9\-\/]+ p-[456] text-white[^"]*"/g, (match) => {
        if (match.includes("sticky")) {
            return 'className="mx-3 mt-4 overflow-hidden rounded-[2rem] bg-gradient-to-r from-princess-4 to-primary p-5 text-white sticky top-4 z-30 shadow-lg shadow-princess-4/20 border border-white/20 md:mx-auto md:max-w-2xl"';
        }
        return 'className="mx-3 mt-4 overflow-hidden rounded-[2rem] bg-gradient-to-r from-princess-4 to-primary p-6 text-white shadow-lg shadow-princess-4/20 border border-white/20 md:mx-auto md:max-w-xl"';
    });

    // Replace the button hover to be less dark if we changed the header.
    content = content.replace(/className="text-white hover:bg-white\/20"/g, 'className="text-white hover:bg-white/20 -ml-2"');
    content = content.replace(/className="text-white mb-4" onClick/g, 'className="text-white mb-4 hover:bg-white/20 -ml-2" onClick');

    fs.writeFileSync(p, content, 'utf8');
  }
});
console.log("Headers updated.");
