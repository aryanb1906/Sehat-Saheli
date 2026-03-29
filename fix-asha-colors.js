const fs = require('fs');
const filePath = 'app/asha/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Main wrapper
content = content.replace('className="min-h-screen bg-gradient-to-b from-trust/10 via-background to-background dark:from-[#141B28] dark:via-[#12141A] dark:to-[#111318]"', 'className="min-h-screen bg-background"');

// Header Card
content = content.replace(/className="animate-fade-up overflow-hidden border-border\/70 bg-white shadow-sm dark:border-\[#2A3040\] dark:bg-\[#1A1E27\]"/g, 'className="animate-fade-up overflow-hidden border-border bg-card shadow-sm"');
content = content.replace('className="bg-gradient-to-r from-trust to-accent px-5 py-6 text-white dark:from-[#2A3D56] dark:to-[#3A3552] md:px-7"', 'className="bg-primary text-primary-foreground px-5 py-6 md:px-7"');

// Header text colors
content = content.replace('className="text-white hover:bg-white/20"', 'className="text-primary-foreground hover:bg-black/10"');
content = content.replace('className="text-3xl font-bold tracking-tight md:text-4xl"', 'className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl"');
content = content.replace('className="mt-2 text-base font-medium text-white/90"', 'className="mt-2 text-base font-medium text-primary-foreground/90"');

// Week badge
content = content.replace('className="rounded-xl bg-white/20 px-4 py-3 backdrop-blur-sm"', 'className="rounded-xl border border-white/20 bg-black/10 px-4 py-3 backdrop-blur-sm shadow-inner"');
content = content.replace('className="text-xs font-semibold uppercase tracking-wide text-white/85"', 'className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/80"');
content = content.replace('className="mt-1 text-lg font-semibold"', 'className="mt-1 text-lg font-semibold text-primary-foreground"');

// Grid section wrapper
content = content.replace('className="grid gap-4 border-t border-border/70 bg-muted/20 p-5 dark:bg-[#141925] md:grid-cols-4 md:p-6"', 'className="grid gap-4 border-t border-border bg-card p-5 md:grid-cols-4 md:p-6"');

// Replace standard dark cards
content = content.replace(/className="border-border\/70 bg-white p-4 shadow-none dark:border-\[#2A3040\] dark:bg-\[#1A1E27\]"/g, 'className="border-border bg-card p-4 shadow-none"');
content = content.replace(/className="border-alert\/30 bg-alert\/10 p-4 shadow-none dark:bg-alert\/20"/g, 'className="border-alert/30 bg-alert/10 p-4 shadow-none"');
content = content.replace(/className="border-warning\/30 bg-warning\/10 p-4 shadow-none dark:bg-warning\/20"/g, 'className="border-warning/30 bg-warning/10 p-4 shadow-none"');
content = content.replace(/className="border-success\/30 bg-success\/10 p-4 shadow-none dark:bg-success\/20"/g, 'className="border-success/30 bg-success/10 p-4 shadow-none"');


// Patient Directory
content = content.replace(/className="border-border\/70 bg-white p-3 shadow-sm dark:border-\[#2A3040\] dark:bg-\[#1A1E27\] md:p-4"/g, 'className="border-border bg-card p-3 shadow-sm md:p-4"');
content = content.replace(/className="border-border\/70 bg-white p-4 shadow-sm dark:border-\[#2A3040\] dark:bg-\[#1A1E27\]"/g, 'className="border-border bg-card p-4 shadow-sm"');
content = content.replace(/className="cursor-pointer border-border\/80 bg-white p-4 shadow-sm transition-all hover:border-trust\/40 hover:bg-trust\/5 dark:border-\[#2A3040\] dark:bg-\[#1A1E27\] dark:hover:bg-trust\/20"/g, 'className="cursor-pointer border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:bg-secondary/40"');
content = content.replace(/className="border-border\/70 bg-white p-6 text-center shadow-sm dark:border-\[#2A3040\] dark:bg-\[#1A1E27\]"/g, 'className="border-border bg-card p-6 text-center shadow-sm"');

// Generic text cleanup
content = content.replace(/text-foreground dark:text-white/g, 'text-foreground');
content = content.replace(/dark:bg-white\/15/g, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('ASHA styles fixed');
