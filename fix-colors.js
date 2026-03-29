const fs = require('fs');
const filePath = 'app/mother/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Main wrapper
content = content.replace('className="min-h-screen bg-gradient-to-b from-[#FDF2F4] via-background to-background dark:from-[#1A1418] dark:via-[#12141A] dark:to-[#111318]"', 'className="min-h-screen bg-background"');

// Header Card
content = content.replace('className="animate-fade-up overflow-hidden border-border/70 bg-white shadow-sm dark:border-[#2A3040] dark:bg-[#1A1E27]"', 'className="animate-fade-up overflow-hidden border-border bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)]"');
content = content.replace('className="bg-gradient-to-r from-[#FADADD] to-[#F5E2F7] px-5 py-6 dark:from-[#3E2A35] dark:to-[#3A2B46] md:px-7"', 'className="bg-primary text-primary-foreground px-5 py-6 md:px-7"');

// Header text colors
content = content.replace('className="text-foreground hover:bg-white/60"', 'className="text-primary-foreground hover:bg-black/10"');
content = content.replace('className="text-3xl font-bold tracking-tight text-foreground dark:text-white md:text-4xl"', 'className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl"');
content = content.replace('className="mt-2 text-sm font-medium text-foreground/80 dark:text-white/85 md:text-base"', 'className="mt-2 text-sm font-medium text-primary-foreground/90 md:text-base"');

// Week badge
content = content.replace('className="rounded-xl border border-white/60 bg-white/65 px-4 py-3 backdrop-blur-sm dark:border-white/20 dark:bg-white/10"', 'className="rounded-xl border border-white/20 bg-black/10 px-4 py-3 backdrop-blur-sm shadow-inner"');
content = content.replace('className="text-xs font-semibold uppercase tracking-wide text-foreground/70"', 'className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/80"');
content = content.replace('className="mt-1 text-xl font-bold text-foreground dark:text-white"', 'className="mt-1 text-xl font-bold text-primary-foreground"');
content = content.replace('className="mt-2 h-6 w-24 bg-white/55 dark:bg-white/20"', 'className="mt-2 h-6 w-24 bg-white/20"');

// Risk Section container
content = content.replace('className="grid gap-4 border-t border-border/70 bg-[#FCFCFC] p-5 dark:bg-[#141925] md:grid-cols-[1.4fr_1fr] md:p-6"', 'className="grid gap-4 border-t border-border bg-card p-5 md:grid-cols-[1.4fr_1fr] md:p-6"');

// Risk cards
content = content.replace(/className="border border-\[#DFF5E1\] bg-\[#F4FFF5\] p-5 shadow-none dark:border-\[#2C4A37\] dark:bg-\[#1A2A22\]"/g, 'className="border border-border bg-secondary/30 p-5 shadow-none"');
content = content.replace(/className="border border-\[#E3F2FD\] bg-\[#F5FAFF\] p-5 shadow-none dark:border-\[#2A3E52\] dark:bg-\[#1A2533\]"/g, 'className="border border-border bg-secondary/30 p-5 shadow-none"');
content = content.replace('className="mt-3 text-sm text-foreground/80 dark:text-white/80"', 'className="mt-3 text-sm text-foreground/80"');
content = content.replace('className="mt-4 h-2.5 rounded-full bg-[#EAF4EC]"', 'className="mt-4 h-2.5 rounded-full bg-border"');
content = content.replace('className="h-2.5 rounded-full bg-gradient-to-r from-[#B7E7BE] to-[#58B56C] transition-all"', 'className="h-2.5 rounded-full bg-gradient-to-r from-success/50 to-success transition-all"');


// Primary actions
content = content.replace('? "border-[#BEDBF6] bg-[#E3F2FD] text-foreground"\n                                        : "border-[#F2DFDF] bg-[#FFF7F7] text-foreground"', '? "border-primary/20 bg-secondary text-foreground"\n                                        : "border-border bg-card hover:bg-secondary text-foreground"');

// Replace all repetitive dark card components
content = content.replace(/className="border-border\/70 bg-white p-5 shadow-sm dark:border-\[#2A3040\] dark:bg-\[#1A1E27\]"/g, 'className="border-border bg-card p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"');
content = content.replace(/className="border-border\/70 bg-white p-4 dark:border-\[#2A3040\] dark:bg-\[#1A1E27\]"/g, 'className="border-border bg-card p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"');

// Tools section specific
content = content.replace('className="grid grid-cols-3 gap-2 rounded-xl border border-border/80 bg-white p-2 dark:border-[#2A3040] dark:bg-[#1A1E27]"', 'className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-card p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"');
content = content.replace('? "bg-[#FADADD] text-foreground"', '? "bg-primary text-primary-foreground"');
content = content.replace('? "bg-[#E3F2FD] text-foreground"', '? "bg-primary text-primary-foreground"');
content = content.replace('? "bg-[#DFF5E1] text-foreground"', '? "bg-primary text-primary-foreground"');

content = content.replace(/className="flex min-h-\[88px\] items-center justify-between rounded-xl border border-border\/80 bg-white px-4 py-3 text-left shadow-sm transition-all duration-200 hover:border-trust\/40 hover:bg-trust\/5 hover:shadow-md active:scale-\[0\.99\] dark:border-\[#2A3040\] dark:bg-\[#1A1E27\] dark:hover:bg-trust\/20"/g, 'className="flex min-h-[88px] items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-200 hover:border-primary/40 hover:bg-secondary hover:shadow-md active:scale-[0.99]"');
content = content.replace(/text-foreground dark:text-white/g, 'text-foreground');

// Skeleton dark classes
content = content.replace(/dark:bg-white\/15/g, '');


fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed styles.');
