# Deployment Guide: Quantum Torus Soundscape

This guide provides the exact steps to deploy this application to Cloudflare Pages via GitHub.

### Cloudflare Pages Configuration

Follow these settings precisely when setting up the project on the Cloudflare Dashboard.

| Setting | Value | Notes |
|---|---|---|
| **Framework preset** | `Static Website` | This app has no build step, so we treat it as a collection of static files. |
| **Build command** | `npm run typecheck` | We use the typecheck script as a quality gate. It doesn't produce any output files. |
| **Build output directory** | `/` | The root of the repository contains `index.html` and is served directly. |

### Environment Variables

This application is fully self-contained and **does not require any environment variables** to be set.

---

### Ready to Commit Checklist

1.  [x] Create a new GitHub repository for this project.
2.  [x] Commit all project files, including `package.json`, `tsconfig.json`, `.gitignore`, and this `README_DEPLOY.md`.
3.  [x] Push the commit to the GitHub repository.
4.  [x] In your terminal, run `npm install` to generate the `package-lock.json` file.
5.  [x] Commit the `package-lock.json` file to ensure deterministic builds.
6.  [x] Push the new commit to GitHub.
7.  [x] Connect your GitHub repository to Cloudflare Pages.
8.  [x] Configure the Cloudflare project using the settings table above.
9.  [x] Save and Deploy.
