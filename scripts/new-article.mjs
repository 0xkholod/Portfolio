import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import process from "node:process";

const slug = process.argv[2];

if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error("Usage: pnpm article:new my-url-safe-article-name");
  process.exit(1);
}

const root = process.cwd();
const articleDirectory = path.join(root, "src", "content", "articles", slug);
const articleFile = path.join(articleDirectory, "index.md");
const templateFile = path.join(root, "src", "content", "articles", "_templates", "article.md");

try {
  await access(articleDirectory, constants.F_OK);
  console.error(`The article folder already exists: ${articleDirectory}`);
  process.exit(1);
} catch {
  // A missing folder is the expected state for a new article.
}

const title = slug
  .split("-")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");
const today = new Date().toISOString().slice(0, 10);
const template = await readFile(templateFile, "utf8");
const article = template
  .replace('title: "Article title"', `title: "${title}"`)
  .replace(/publishedAt: \d{4}-\d{2}-\d{2}/, `publishedAt: ${today}`);

await mkdir(path.join(articleDirectory, "assets"), { recursive: true });
await writeFile(articleFile, article, "utf8");

console.log(`Created ${path.relative(root, articleFile)}`);
console.log("The article is a draft. Open it in Obsidian and set draft: false only when it is ready.");
