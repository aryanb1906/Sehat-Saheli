const fs = require('fs');
const path = require('path');

const targetDir = 'app/mother';

if (fs.existsSync(targetDir)) {
  const folders = fs.readdirSync(targetDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  folders.forEach(folder => {
    const p = path.join(targetDir, folder, 'page.tsx');
    if (fs.existsSync(p)) {
      let content = fs.readFileSync(p, 'utf8');
      
      let modified = false;

      // Make the float header fluid to the page width!
      // Replace md:max-w-xl or 2xl and md:mx-auto
      const headerMaxWPatt1 = /md:mx-auto md:max-w-xl/g;
      const headerMaxWPatt2 = /md:mx-auto md:max-w-2xl/g;
      
      if (headerMaxWPatt1.test(content) || headerMaxWPatt2.test(content)) {
          content = content.replace(headerMaxWPatt1, 'md:mx-6 2xl:mx-auto 2xl:max-w-7xl');
          content = content.replace(headerMaxWPatt2, 'md:mx-6 2xl:mx-auto 2xl:max-w-7xl');
          modified = true;
      }
      
      // Fine-tune curves: The user asked to "workon curves".
      // They might mean GuestModeBanner, but let's change rounded-[2rem] to rounded-[1.5rem] just to feel a bit more sleek and less pill-ish on giant desktop monitors, while still being beautifully rounded, or just keep rounded-3xl.
      const roundedPatt = /rounded-\[2rem\]/g;
      if (roundedPatt.test(content)) {
          content = content.replace(roundedPatt, 'rounded-3xl');
          modified = true;
      }

      if (modified) {
        fs.writeFileSync(p, content, 'utf8');
        console.log(`Updated header width in ${p}`);
      }
    }
  });
}
console.log("Sweep complete.");
