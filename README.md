# 📊 GitHub Contributions Chart (Cross-Account + Dark Mode)

Generate a **GitHub-style contribution heatmap** for any user and embed it anywhere — including your profile README.

This project uses **GitHub Actions + GitHub Pages** to generate a daily-updated SVG that mimics the official GitHub contributions chart.

---

## ✨ Features

* 📈 GitHub-style contribution heatmap (almost pixel-perfect)
* 🔄 Auto-updated daily via GitHub Actions
* 🌗 Light / Dark mode support (auto-switch)
* 👤 Works for **any GitHub username** (not just your own)
* 🚫 No secrets required (uses built-in `GITHUB_TOKEN`)
* 📦 Fully forkable & customizable

---

## 🚀 Quick Setup (2 minutes)

### 1. Fork this repository

Click **Fork** and create your own copy.

---

### 2. Set your target username

Go to:

**Settings → Secrets and variables → Actions → Variables**

Add:

```
Name: TARGET_USERNAME
Value: your-work-github-username
```

Example:

```
TARGET_USERNAME = <gh-username>
```

---

### 3. Enable GitHub Pages

Go to:

**Settings → Pages**

* Source: `Deploy from a branch`
* Branch: `main`
* Folder: `/docs`

Save.

---

### 4. Run the workflow once

Go to:

**Actions → Build contribution chart → Run workflow**

This will generate your SVG files.

---

### 5. Get your chart URL

After the workflow runs, your chart will be available at:

```
https://YOUR_USERNAME.github.io/YOUR_REPO/assets/contributions-light.svg
https://YOUR_USERNAME.github.io/YOUR_REPO/assets/contributions-dark.svg
```

---

### 6. Add to your GitHub README

```html
## Contributions at Work GitHub Account

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://YOUR_USERNAME.github.io/YOUR_REPO/assets/contributions-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://YOUR_USERNAME.github.io/YOUR_REPO/assets/contributions-light.svg">
  <img alt="Work GitHub contributions chart" src="https://YOUR_USERNAME.github.io/YOUR_REPO/assets/contributions-light.svg">
</picture>
```

---

## 🛠️ How it works

1. GitHub Action runs daily
2. Fetches contribution data via GitHub GraphQL API
3. Generates SVG heatmap (light + dark)
4. Publishes to GitHub Pages
5. Your README embeds the SVG

---

## ⏱️ Schedule

Runs automatically once per day:

```
17 2 * * *
```

You can modify this in:

```
.github/workflows/build-contributions.yml
```

---

## ⚠️ Limitations

* Only **public contributions** are guaranteed to show
* Private contributions depend on GitHub API visibility
* Not an official GitHub widget (custom renderer)

---

## 🧪 Troubleshooting

### Chart not showing?

* Check if Pages is enabled
* Verify the workflow ran successfully
* Confirm the SVG URL works in browser

### Showing both light & dark?

* Make sure you're using `<picture>` (not `<img>` or markdown)

### Empty chart?

* Verify `TARGET_USERNAME` is correct

---

## 💡 Customization ideas

* Combine multiple users into one chart
* Change color palette
* Add animations
* Show contribution stats (streaks, totals)
* Generate charts for multiple accounts

---

## 📄 License

MIT — use it, modify it, share it.

---

## ⭐️ If this helped you

Drop a star ⭐ and share it with others!
