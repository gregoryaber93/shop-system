import fs from 'node:fs';

const REPORTS = [
  '.github/lighthouse-desktop.json',
  '.github/lighthouse-mobile.json',
];

const THRESHOLDS = {
  performance: 0.8,
  accessibility: 0.8,
  'best-practices': 0.8,
};

function toPct(score) {
  return `${Math.round(score * 100)}%`;
}

function readJson(path) {
  const raw = fs.readFileSync(path, 'utf8');
  return JSON.parse(raw);
}

let hasFailures = false;

for (const reportPath of REPORTS) {
  if (!fs.existsSync(reportPath)) {
    console.error(`[lighthouse-check] Missing report: ${reportPath}`);
    hasFailures = true;
    continue;
  }

  const report = readJson(reportPath);
  const categories = report.categories ?? {};

  console.log(`\n${reportPath}`);

  for (const [categoryName, minScore] of Object.entries(THRESHOLDS)) {
    const score = categories[categoryName]?.score;

    if (typeof score !== 'number') {
      console.error(
        `[FAIL] ${categoryName}: missing score (expected >= ${toPct(minScore)})`
      );
      hasFailures = true;
      continue;
    }

    const pass = score >= minScore;
    const label = pass ? 'PASS' : 'FAIL';

    console.log(
      `[${label}] ${categoryName}: ${toPct(score)} (min ${toPct(minScore)})`
    );

    if (!pass) {
      hasFailures = true;
    }
  }
}

if (hasFailures) {
  console.error('\nLighthouse quality gate failed.');
  process.exit(1);
}

console.log('\nLighthouse quality gate passed.');
