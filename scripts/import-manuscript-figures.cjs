// Import the author's supplied diagrams; correct only two stale Fig-2 labels.
// Usage: node scripts/import-manuscript-figures.cjs <directory-with-Fig-1-and-2.svg>
// Requires Playwright/Chromium, as does export-manuscript-figures.cjs.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { chromium } = require('playwright');
const hash = value => createHash('sha256').update(value).digest('hex');
const supplied = [
  'ce1678a85602454be4464aa75b97a44e0966296f84b562ab38cfae673e767393',
  '484881cfeb4e013c426dfa216a6f1816679001f2d45811dc92785c7c2e06eff2',
];
const corrections = [
  ['D1 EVIDENCE', 'TP/FP/FN + P/R/F1', 'Matched/extra/missed'],
  ['P3 EVIDENCE', '571189 files parsed', '57 / 189 files parsed'],
];
(async () => {
  assert.ok(process.argv[2], 'Supply the directory containing the two author SVGs');
  const sources = await Promise.all([1, 2].map(n => fs.readFile(path.join(process.argv[2], `Fig-${n}.svg`))));
  sources.forEach((bytes, i) => assert.equal(hash(bytes), supplied[i], `Unexpected supplied Fig-${i + 1}.svg revision`));
  let svg = sources[1].toString('utf8');
  for (const [, before, after] of corrections) {
    assert.equal(svg.split(before).length, 2, `Expected exactly one '${before}' label`);
    svg = svg.replace(before, after);
  }
  assert.ok(!/<script\b|\son\w+\s*=|javascript:/i.test(svg), 'No executable SVG content');
  const browser = await chromium.launch({headless:true,
    ...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {})});
  try {
    const page = await browser.newPage({colorScheme:'light', javaScriptEnabled:false, viewport:{width:929,height:348}, deviceScaleFactor:2});
    await page.route('**/*', route => route.abort());
    await page.setContent(`<html><head><style>html,body{margin:0;padding:0;color-scheme:light}svg{display:block}</style></head><body>${svg.replace(/<\?xml[^>]*>|<!DOCTYPE[^>]*>/g,'')}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    // Refresh just the two fallback PNGs, so non-foreignObject viewers cannot
    // display the obsolete labels. Positions, fonts and shapes are unchanged.
    for (const [heading] of corrections) {
      const clip = await page.evaluate(heading => {
        const group = [...document.querySelectorAll('switch')].find(el => el.textContent.includes(heading));
        const image = group.querySelector('image');
        const matrix = image.parentElement.getScreenCTM();
        const point = new DOMPoint(Number(image.getAttribute('x')), Number(image.getAttribute('y'))).matrixTransform(matrix);
        return {x:point.x, y:point.y, width:Number(image.getAttribute('width')) * matrix.a, height:Number(image.getAttribute('height')) * matrix.d};
      }, heading);
      const png = await page.screenshot({clip, omitBackground:false});
      const pattern = new RegExp(`(${heading}[\\s\\S]*?<image[^>]*?xlink:href=")[^"]+(")`);
      assert.ok(pattern.test(svg), `Missing fallback for ${heading}`);
      svg = svg.replace(pattern, (_, prefix, suffix) => prefix + 'data:image/png;base64,' + png.toString('base64') + suffix);
    }
  } finally { await browser.close(); }
  const root = path.resolve(__dirname, '../figures');
  await fs.writeFile(path.join(root, 'Fig-1.svg'), sources[0]);
  await fs.writeFile(path.join(root, 'Fig-2.svg'), svg);
  console.log(JSON.stringify({supplied_sha256:supplied, canonical_svg_sha256:[hash(sources[0]), hash(svg)], corrections:corrections.map(([heading,before,after])=>({heading,before,after}))},null,2));
})().catch(error => { console.error(error); process.exitCode=1; });
