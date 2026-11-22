// Builds the public website (index.html at the repo root) from the dashboard page source.
// The dashboard runs inside claude.ai, which provides `dash` (data loading, calculations, drawing).
// Here a small runtime (site/runtime.js) provides the same calls, reading the CSV files in data/.
// Usage: node scripts/build_site.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
let page = fs.readFileSync(path.join(root, 'dashboard_page.html'), 'utf8');

// The page is written for the dashboard frame: drop its frame marker and point scripts at repo paths.
page = page.replace('<meta name="dash-one-writer">', '');
page = page.replace('<script src="world.js"></script>', '<script src="data/world.js"></script>');
page = page.replace('<script src="il.js"></script>', '<script src="data/il.js"></script>');
page = page.replace('<script src="gifenc.js"></script>', '<script src="site/gifenc.js"></script>');

const footer = `
<footer class="site-foot">
  <p><span class="lf-en">Sources: OECD municipal waste statistics (DF_MUNW); World Bank, What a Waste 2.0; UN Statistics Division environment statistics (waste questionnaires); Israel Ministry of Environmental Protection, Pollutant Release and Transfer Register (data.gov.il); State Comptroller of Israel, July 2025; State Comptroller annual report 72A, 2021; Efeh landfill request for information, November 2023; S. Earle, Environmental Geology (open textbook); Knesset Research and Information Center, January 2026; World Bank GDP and population via Our World in Data.</span><span class="lf-he-t" lang="he">מקורות: סטטיסטיקת הפסולת העירונית של OECD; הבנק העולמי, What a Waste 2.0; החטיבה הסטטיסטית של האו"ם (שאלוני פסולת); המשרד להגנת הסביבה, המרשם לפליטות ולהעברות של מזהמים (data.gov.il); מבקר המדינה, יולי 2025; מבקר המדינה, דוח שנתי 72א, 2021; בקשת מידע של מטמנת אפעה, נובמבר 2023; S. Earle, Environmental Geology (ספר לימוד פתוח); מרכז המחקר והמידע של הכנסת, ינואר 2026; תוצר ואוכלוסייה של הבנק העולמי דרך Our World in Data.</span></p>
  <p><a href="https://github.com/royposmanik/landfill-trends"><span class="lf-en">Code and data on GitHub</span><span class="lf-he-t" lang="he">הקוד והנתונים ב-GitHub</span></a></p>
</footer>`;
// Footer goes inside the page root so the language switch applies to it.
const rootClose = page.lastIndexOf('</div>', page.indexOf('<script'));
page = page.slice(0, rootClose) + footer + '\n' + page.slice(rootClose);

const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Landfill Trends: the world and Israel</title>
<meta name="description" content="Interactive dashboard of municipal solid waste landfilling worldwide and in Israel: trends over time, income, landfill sites and remaining landfill space. Technion, Solid Waste Management (0160338).">
<link rel="icon" href="logo/logo.svg" type="image/svg+xml">
<link rel="icon" href="logo/logo-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="logo/logo-192.png">
<meta property="og:title" content="Landfill Trends: the world and Israel">
<meta property="og:description" content="Municipal waste landfilling worldwide and in Israel, year by year.">
<meta property="og:image" content="logo/logo-512.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="site/site.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
<script src="site/runtime.js"></script>
</head>
<body>
<main class="site">
`;
const tail = `
</main>
<script>dash.start();</script>
</body>
</html>
`;
fs.writeFileSync(path.join(root, 'index.html'), head + page + tail);
console.log('index.html written', (head + page + tail).length, 'bytes');
