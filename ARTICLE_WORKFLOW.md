# Article workflow

The folder `src/content/articles` is an Obsidian-ready vault and the source of the website's article archive.

## One-time setup

1. In Obsidian, choose **Open folder as vault** and select `src/content/articles`.
2. Keep **Use Wikilinks** disabled and use relative Markdown links. The committed vault settings already select these options.
3. Enable Obsidian's core **Templates** plugin and set `_templates` as the template folder.

## Create an article

1. Create the folder, Markdown file, and local media directory with the included helper:

   ```sh
   pnpm article:new kerberos-delegation
   ```

   This produces:

   ```text
   src/content/articles/kerberos-delegation/index.md
   src/content/articles/kerberos-delegation/assets/
   ```

2. Write in `index.md`. Pasted attachments will be stored in the article's local `assets` folder.
3. Insert images and animated GIFs with standard Markdown and meaningful alternative text:

   ```md
   ![BloodHound path showing the delegation relationship.](./assets/delegation-path.webp)
   ![Demonstration of the request flow.](./assets/request-flow.gif)
   ```

4. Preview the site with `pnpm dev`. Keep `draft: true` while writing.
5. When the article is ready, set `draft: false`, update the date, and run `pnpm build`.
6. Publish it:

   ```sh
   git add src/content/articles
   git commit -m "Publish Kerberos delegation article"
   git push origin main
   ```

Cloudflare will rebuild the static site from the pushed commit. A local commit alone does not reach GitHub and therefore does not trigger the deployment.

## Media rules

- Prefer WebP, AVIF, JPEG, or PNG for still images. Astro processes local Markdown images at build time.
- Keep GIFs only when animation communicates something useful. They work with the same relative Markdown syntax, but can be much heavier than still images.
- Use lowercase, URL-safe filenames such as `attack-flow.webp`; avoid spaces and generic names such as `image1.png`.
- Keep each article and its assets together. Deleting or moving one folder then cannot silently affect another article.
- Do not use Obsidian embeds such as `![[image.png]]`; those are Obsidian-specific. Use `![alt](./assets/image.png)` so Obsidian, Astro, GitHub, and other Markdown tools all understand the file.

## Frontmatter fields

- `title`: article title.
- `description`: short archive and SEO summary.
- `publishedAt`: publication date in `YYYY-MM-DD` format.
- `updatedAt`: optional last substantial revision date.
- `tags`: list of subjects.
- `cover`: optional image relative to `index.md`.
- `coverAlt`: required in practice whenever a cover is present.
- `featured`: highlights the article at the top of the archive.
- `draft`: `true` hides it from production; change to `false` to publish.
