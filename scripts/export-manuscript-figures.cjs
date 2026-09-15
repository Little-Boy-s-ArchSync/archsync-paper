// Requires Playwright and Chromium. Exports current editable SVGs without rasterizing.
// Optional argument: 1 or 2 to export only that figure.
const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({headless:true,
    ...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {})});
  try {
    const page = await browser.newPage({colorScheme:'light', javaScriptEnabled:false});
    // The local draw.io exports need no network or executable page content.
    await page.route('**/*', route => route.abort());
    const selected = process.argv[2] ? [Number(process.argv[2])] : [1,2];
    if (selected.some(n => ![1,2].includes(n))) throw new Error("Figure must be 1 or 2");
    for (const number of selected) {
      const base = path.resolve(__dirname, `../figures/Fig-${number}`);
      const svg = await fs.readFile(`${base}.svg`, 'utf8');
      if (/<script\b|\son\w+\s*=|javascript:/i.test(svg)) {
        throw new Error(`Executable content is not permitted in Fig-${number}.svg`);
      }
      const [,width,height] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
      await page.setContent(`<html><head><style>@page{size:${width}px ${height}px;margin:0}html,body{margin:0;padding:0;color-scheme:light}svg{display:block}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style></head><body>${svg.replace(/<\?xml[^>]*>|<!DOCTYPE[^>]*>/g,'')}</body></html>`);
      await page.evaluate(() => document.fonts.ready);
      await page.pdf({path:`${base}.pdf`,preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
      console.log(`Exported ${path.basename(base)}.pdf`);
    }
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
