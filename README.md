<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/5b98cac5-bec7-4f7e-88d7-571afcf47c4b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

This repository now includes a GitHub Actions workflow that builds and deploys the app to GitHub Pages whenever code is pushed to the `main` branch.

Before the first deployment, open **Settings → Pages** in GitHub and make sure the site is configured to use **GitHub Actions** as the build and deployment source.

After that, every push to `main` will publish the site at:

`https://yish-chen.github.io/Factory-Temperature-Monitor/`
