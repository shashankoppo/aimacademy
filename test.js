import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', exception => console.log('PAGE ERROR:', exception));
  
  await page.goto('http://localhost:8081/');
  console.log('Page loaded');
  await new Promise(r => setTimeout(r, 2000));
  
  const content = await page.content();
  if (!content.includes('hero')) {
      console.log('Hero section not found in HTML!');
  }
  
  await browser.close();
  console.log('Done');
})();
