#!/usr/bin/env node
/* Rebuild the edited archival highlights; requires local Playwright and ffmpeg. */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { pathToFileURL } = require('node:url');
const { execFileSync } = require('node:child_process');
const { chromium } = require(process.env.DEMO_PLAYWRIGHT || '/tmp/codesign_agentic_browser/node_modules/playwright');

const out = __dirname;
const site = path.resolve(out, '../..');
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'codesign-demo-'));
const data = JSON.parse(fs.readFileSync(path.join(site, 'data/site-data.json')));
const run = data.runs.runs.find(r => r.task === '7d7953f8');
const asset = p => pathToFileURL(path.join(site, p)).href;
const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const brand = `<header><span><b>Co-Design</b> Bench</span><span class="archive">ARCHIVED RUN · EDITED HIGHLIGHTS</span></header>`;
const footer = `<footer><span>qwen3.8-max-0902 · Task 7d7953f8</span><span>Actual archived observations and final output</span></footer>`;
const image = (src, css = '', alt = '') => `<img src="${asset(src)}" class="${css}" alt="${escape(alt)}">`;
const tag = text => `<div class="tag">${text}</div>`;
const shell = body => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:DM Sans;src:url('${asset('vendor/fonts/dm-sans-normal-latin.woff2')}');font-weight:100 1000}
@font-face{font-family:DM Serif;src:url('${asset('vendor/fonts/dm-serif-display-normal-latin.woff2')}')}
*{box-sizing:border-box}body{margin:0;width:1280px;height:720px;background:#faf8f3;color:#232326;font-family:DM Sans,Arial,sans-serif;-webkit-font-smoothing:antialiased}
header{position:absolute;left:48px;right:48px;top:28px;display:flex;justify-content:space-between;align-items:center;font-size:23px;letter-spacing:-.5px}header b{color:#244bb2;font-weight:650}.archive{font-size:16px;letter-spacing:1.8px;color:#67635c;font-weight:600}
footer{position:absolute;left:48px;right:48px;bottom:17px;display:flex;justify-content:space-between;align-items:center;color:#67635c;font-size:16px}
.tag{font-weight:650;letter-spacing:1.5px;font-size:18px;text-transform:uppercase;color:#244bb2;margin-bottom:19px}h1{font-family:DM Serif,Georgia,serif;font-weight:400;font-size:52px;line-height:1.08;letter-spacing:-1.25px;margin:0 0 25px}p{font-size:26px;line-height:1.45;margin:0 0 20px;color:#5f5a52}.left{position:absolute;left:48px;top:150px;width:400px}.right{position:absolute;left:480px;top:119px;width:752px;height:552px}
.photo{width:752px;height:470px;object-fit:cover;border-radius:18px;box-shadow:0 12px 32px #23232616;border:1px solid #ddd7cc}.caption{font-size:16px;line-height:1.35;color:#67635c;margin-top:14px}
.quote{font-size:24px;line-height:1.45;border-left:3px solid #244bb2;padding:2px 0 2px 18px;color:#232326}.tokens{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px}.token{font-size:18px;font-weight:600;padding:9px 13px;border:1px solid #d1daf0;background:#e6ebf7;color:#244bb2;border-radius:7px}
.montage-wrap{background:#f2efe7;border:1px solid #ddd7cc;border-radius:16px;height:535px;display:flex;align-items:center;justify-content:center}.montage{width:608px;height:507px;object-fit:contain}
.effect-card{padding:25px 30px;background:#fffefb;border:1px solid #ddd7cc;border-radius:14px;margin-bottom:16px;display:flex;align-items:center;gap:23px}.number{font-size:28px;color:#244bb2;width:40px;height:40px;display:grid;place-items:center;background:#e6ebf7;border-radius:50%}.effect-card b{display:block;font-size:27px;font-weight:550;line-height:1.3;margin-bottom:4px}.effect-card code{font-size:20px;color:#67635c;font-family:ui-monospace,monospace}
.verify-right{left:540px;width:692px;display:flex;gap:24px;top:115px;height:550px}.verification{width:334px;text-align:center}.verification strong{display:block;font-size:21px;font-weight:550;margin-bottom:14px}.strip{height:482px;max-width:300px;object-fit:contain;border-radius:9px}.verdict{color:#244bb2}.final-left{position:absolute;left:48px;top:190px;width:238px}.final-left h1{font-size:38px;letter-spacing:-.7px}.final-left p{font-size:22px}.final-left .tag{font-size:16px;line-height:1.35}.score{font-family:DM Serif;font-size:62px;color:#244bb2;margin:26px 0 0;line-height:1.05}.score-label{font-size:18px;color:#67635c;margin-top:7px}.video-box{position:absolute;left:320px;top:112px;width:920px;height:575px;border-radius:15px;background:#e8e5df;overflow:hidden}.final-poster{width:100%;height:100%;object-fit:cover}.play-mark{position:absolute;left:calc(50% - 39px);top:calc(50% - 39px);width:78px;height:78px;border:1px solid #ffffffaa;border-radius:50%;display:grid;place-items:center;font-size:30px;color:#fff;background:#244bb2cc;padding-left:5px}
</style></head><body>${brand}${body}${footer}</body></html>`;

const scenes = [
  { name:'01-request', duration:3.75, html:`<div class="left">${tag('01 · A real user request')}<h1>Watch the reference.<br>Change the page.</h1><div class="quote">“The three effects must be distinct, correctly matched to the video, and loop continuously.”</div><p style="font-size:21px;margin-top:24px">Add motion to three marked headings.</p></div><div class="right">${image(run.finalRender,'photo')}<div class="caption">Tideline · final application shown here as a task preview</div></div>` },
  { name:'02-understand', duration:4, html:`<div class="left">${tag('02 · Read the motion')}<h1>Inspect the video<br>frame by frame.</h1><p>120 frames. Three rows.<br>Three different effects.</p><div class="tokens"><span class="token">Shimmer</span><span class="token">Hue cycle</span><span class="token">Letter reveal</span></div></div><div class="right"><div class="montage-wrap">${image(run.steps[1].image,'montage')}</div><div class="caption">Actual reference-frame montage viewed by the agent</div></div>` },
  { name:'03-edit', duration:3.5, html:`<div class="left">${tag('03 · Edit the application')}<h1>Map each effect<br>to its heading.</h1><div class="quote">“${escape(run.steps[4].excerpt)}”</div><p style="font-size:20px;margin-top:20px">Excerpt from the archived Edit step</p></div><div class="right" style="top:160px"><div class="effect-card"><span class="number">1</span><div><b>Hero heading</b><code>fx-shimmer-sweep</code></div></div><div class="effect-card"><span class="number">2</span><div><b>The Shoreline Routine</b><code>fx-hue-cycle</code></div></div><div class="effect-card"><span class="number">3</span><div><b>Founder quotation</b><code>fx-type-wave</code></div></div><div class="caption">Animation names from the agent’s final diagnostic</div></div>` },
  { name:'04-verify', duration:3, html:`<div class="left" style="width:440px">${tag('04 · Check and repair')}<h1>Catch a visual bug.<br>Fix the shimmer.</h1><p>Timed browser captures reveal disappearing text.</p><div class="quote">“Next, fix FX1: switch to <code>repeat-x</code>…”</div></div><div class="right verify-right"><div class="verification"><strong>Before the repair</strong>${image(run.steps[5].image,'strip')}</div><div class="verification"><strong class="verdict">After the repair</strong>${image(run.steps[7].image,'strip')}</div></div>` },
  { name:'05-final', duration:13.75, html:`<div class="final-left">${tag('05 · Final page recording')}<h1>Three titles.<br>Three effects.</h1><p>Shimmer, hue cycling and a character reveal.</p><div class="score">6 / 6</div><div class="score-label">strict criteria passed</div></div><div class="video-box"></div>` }
];

const browserPath = process.env.DEMO_CHROMIUM || '/tmp/paper_reader_qa/browsers/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell';
const ff = args => execFileSync('ffmpeg', ['-hide_banner','-loglevel','error','-y',...args], {stdio:'inherit'});
const enc = ['-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-r','20'];
const posterOnly = process.argv.includes('--poster-only');

(async () => {
  const browser = await chromium.launch({executablePath:browserPath,headless:true,args:['--no-sandbox']});
  const page = await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
  await page.goto(pathToFileURL(path.join(site,'index.html')).href);
  for (const scene of posterOnly ? [] : scenes) {
    await page.setContent(shell(scene.html));
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(im => im.decode())); });
    await page.screenshot({path:path.join(scratch,`${scene.name}.png`)});
  }
  const posterHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box}body{margin:0;width:1280px;height:720px;overflow:hidden;background:#244b60}.poster-page{display:block;width:1280px;height:720px;object-fit:cover;object-position:center top}.poster-play{position:absolute;left:604px;top:324px;width:72px;height:72px;border:1px solid #ffffffb3;border-radius:50%;display:grid;place-items:center;background:#244bb2dc;box-shadow:0 2px 12px #00000018}.poster-play:after{content:'';display:block;margin-left:5px;border-top:12px solid transparent;border-bottom:12px solid transparent;border-left:19px solid #fff}
</style></head><body>${image(run.finalRender,'poster-page')}<span class="poster-play" aria-hidden="true"></span></body></html>`;
  await page.setContent(posterHtml);
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(im => im.decode())); });
  await page.screenshot({path:path.join(scratch,'poster.png')});
  await browser.close();
  ff(['-i',path.join(scratch,'poster.png'),'-c:v','libwebp','-quality','88',path.join(out,'poster.webp')]);
  if (posterOnly) {
    console.log(`Updated ${path.join(out,'poster.webp')} (1280×720), leaving the video and captions unchanged.`);
    console.log(`Intermediate review frame: ${path.join(scratch,'poster.png')}`);
    return;
  }
  for (const scene of scenes.slice(0,-1)) {
    ff(['-loop','1','-i',path.join(scratch,`${scene.name}.png`),'-t',String(scene.duration),...enc,path.join(scratch,`${scene.name}.mp4`)]);
  }
  ff(['-loop','1','-i',path.join(scratch,'05-final.png'),'-i',path.join(site,run.finalVideo),'-filter_complex','[1:v]scale=920:575:flags=lanczos[render];[0:v][render]overlay=320:112:shortest=1,format=yuv420p','-t','13.75','-an',...enc,path.join(scratch,'05-final.mp4')]);
  fs.writeFileSync(path.join(scratch,'concat.txt'),scenes.map(s=>`file '${path.join(scratch,`${s.name}.mp4`)}'`).join('\n'));
  ff(['-f','concat','-safe','0','-i',path.join(scratch,'concat.txt'),'-c','copy','-movflags','+faststart',path.join(out,'agent-edit-highlights.mp4')]);
  fs.writeFileSync(path.join(out,'captions-en.vtt'),`WEBVTT\n\n00:00.000 --> 00:03.750\nA real user asks the agent to reproduce three video effects on three page headings.\n\n00:03.750 --> 00:07.750\nThe agent extracts 120 frames and inspects the three motion patterns.\n\n00:07.750 --> 00:11.250\nIt adds scoped shimmer, hue-cycling and character animations.\n\n00:11.250 --> 00:14.250\nBrowser captures reveal disappearing text. The agent repairs the shimmer.\n\n00:14.250 --> 00:18.600\nFinal page recording: the first heading uses a moving shimmer.\n\n00:18.600 --> 00:23.600\nThe routine heading cycles through hues.\n\n00:23.600 --> 00:28.000\nThe quotation animates per character. All six strict criteria pass.\n`);
  console.log(`Built ${path.join(out,'agent-edit-highlights.mp4')} (28 seconds, 1280×720, 20 fps).`);
  console.log(`Intermediate review frames: ${scratch}`);
})().catch(error => { console.error(error); process.exitCode = 1; });
