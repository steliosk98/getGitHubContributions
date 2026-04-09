import fs from "fs/promises";

const USERNAME = process.env.TARGET_USERNAME;
const TOKEN = process.env.GITHUB_TOKEN;

if (!USERNAME) throw new Error("Missing TARGET_USERNAME");
if (!TOKEN) throw new Error("Missing GITHUB_TOKEN");

const query = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          months {
            name
            year
            firstDay
            totalWeeks
          }
          weeks {
            firstDay
            contributionDays {
              contributionCount
              contributionLevel
              date
              weekday
            }
          }
        }
      }
    }
  }
`;

const response = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${TOKEN}`,
    "User-Agent": "github-contribution-chart-generator"
  },
  body: JSON.stringify({
    query,
    variables: { login: USERNAME }
  })
});

if (!response.ok) {
  const text = await response.text();
  throw new Error(`GitHub API error ${response.status}: ${text}`);
}

const payload = await response.json();

if (payload.errors) {
  throw new Error(JSON.stringify(payload.errors, null, 2));
}

const calendar =
  payload?.data?.user?.contributionsCollection?.contributionCalendar;

if (!calendar) {
  throw new Error("No contribution calendar returned");
}

const weeks = calendar.weeks;
const months = calendar.months;
const total = calendar.totalContributions;

const CELL = 10;
const GAP = 3;
const STEP = CELL + GAP;
const LEFT_PAD = 28;
const TOP_PAD = 22;
const GRID_WIDTH = weeks.length * STEP;
const GRID_HEIGHT = 7 * STEP;
const WIDTH = LEFT_PAD + GRID_WIDTH + 12;
const HEIGHT = TOP_PAD + GRID_HEIGHT + 20;

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

const monthLabels = months
  .map((month) => {
    const weekIndex = weeks.findIndex((week) => week.firstDay === month.firstDay);
    return { ...month, weekIndex };
  })
  .filter((month) => month.weekIndex >= 0);

const weekdayLabels = [
  { label: "Mon", row: 1 },
  { label: "Wed", row: 3 },
  { label: "Fri", row: 5 }
];

function buildSvg(theme) {
  const palettes = {
    light: {
      bg: "#ffffff",
      text: "#57606a",
      title: "#24292f",
      NONE: "#ebedf0",
      FIRST_QUARTILE: "#9be9a8",
      SECOND_QUARTILE: "#40c463",
      THIRD_QUARTILE: "#30a14e",
      FOURTH_QUARTILE: "#216e39"
    },
    dark: {
      bg: "#0d1117",
      text: "#8b949e",
      title: "#c9d1d9",
      NONE: "#161b22",
      FIRST_QUARTILE: "#0e4429",
      SECOND_QUARTILE: "#006d32",
      THIRD_QUARTILE: "#26a641",
      FOURTH_QUARTILE: "#39d353"
    }
  };

  const colors = palettes[theme];

  let svg = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="${WIDTH}"
     height="${HEIGHT}"
     viewBox="0 0 ${WIDTH} ${HEIGHT}"
     role="img"
     aria-label="${esc(`${USERNAME} made ${total} contributions in the last year`)}">
  <rect width="100%" height="100%" fill="${colors.bg}" />
  <style>
    text {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 9px;
      fill: ${colors.text};
    }
    .count {
      font-size: 12px;
      fill: ${colors.title};
    }
  </style>

  <text x="${LEFT_PAD}" y="12" class="count">${esc(`${total} contributions in the last year`)}</text>
`;

  for (const month of monthLabels) {
    const x = LEFT_PAD + month.weekIndex * STEP;
    svg += `<text x="${x}" y="${TOP_PAD - 6}">${esc(month.name.slice(0, 3))}</text>`;
  }

  for (const item of weekdayLabels) {
    const y = TOP_PAD + item.row * STEP + 8;
    svg += `<text x="0" y="${y}">${esc(item.label)}</text>`;
  }

  weeks.forEach((week, col) => {
    week.contributionDays.forEach((day, row) => {
      const x = LEFT_PAD + col * STEP;
      const y = TOP_PAD + row * STEP;
      const fill = colors[day.contributionLevel] || colors.NONE;

      svg += `
      <rect
        x="${x}"
        y="${y}"
        width="${CELL}"
        height="${CELL}"
        rx="2"
        ry="2"
        fill="${fill}">
        <title>${esc(`${day.contributionCount} contributions on ${day.date}`)}</title>
      </rect>
      `;
    });
  });

  svg += `
</svg>
`;

  return svg;
}

await fs.mkdir("docs/assets", { recursive: true });

await fs.writeFile(
  "docs/assets/contributions-light.svg",
  buildSvg("light"),
  "utf8"
);

await fs.writeFile(
  "docs/assets/contributions-dark.svg",
  buildSvg("dark"),
  "utf8"
);

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${USERNAME} contributions</title>
  <style>
    body {
      margin: 0;
      padding: 32px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      background: #0d1117;
      color: #c9d1d9;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
    }
    .light { display: none; }
    @media (prefers-color-scheme: light) {
      body { background: #ffffff; color: #24292f; }
      .light { display: block; }
      .dark { display: none; }
    }
    @media (prefers-color-scheme: dark) {
      .light { display: none; }
      .dark { display: block; }
    }
  </style>
</head>
<body>
  <img class="light" src="./assets/contributions-light.svg" alt="${USERNAME} contribution chart light">
  <img class="dark" src="./assets/contributions-dark.svg" alt="${USERNAME} contribution chart dark">
</body>
</html>`;

await fs.writeFile("docs/index.html", html, "utf8");

console.log("Generated docs/assets/contributions-light.svg");
console.log("Generated docs/assets/contributions-dark.svg");