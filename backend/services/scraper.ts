import { execSync } from "child_process";
import fs from "node:fs";
import puppeteerModule, { type PuppeteerExtra } from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { logger } from "../libs/logger.js";
import { sanitizeDisplayText } from "../libs/text.js";
import type { ScrapedJob } from "../types/job.types.js";

const puppeteer = puppeteerModule as unknown as PuppeteerExtra;
puppeteer.use(StealthPlugin());

// ── Chrome path detection ──────────────────────────────────────────────────
function findChromePath(): string | undefined {
  // 1. Explicit env var (highest priority — set in Render dashboard)
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    logger.info(
      { path: process.env.PUPPETEER_EXECUTABLE_PATH },
      "Using PUPPETEER_EXECUTABLE_PATH from env",
    );
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  // 2. Check saved path file written by render-build.sh
  const savedPathFiles = [
    "/opt/render/project/chrome-path.txt",
    // Also check relative to CWD (dist folder copy)
    new URL("chrome-path.txt", import.meta.url).pathname,
  ];

  for (const file of savedPathFiles) {
    try {
      if (fs.existsSync(file)) {
        const saved = fs.readFileSync(file, "utf-8").trim();
        if (saved && fs.existsSync(saved)) {
          logger.info({ path: saved, source: file }, "Chrome path loaded from file");
          return saved;
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Search in common puppeteer cache directories
  const searchDirs = [
    process.env.XDG_CACHE_HOME
      ? `${process.env.XDG_CACHE_HOME}/puppeteer`
      : null,
    process.env.PUPPETEER_CACHE_DIR ?? null,
    "/opt/render/project/puppeteer",
    "/opt/render/.cache/puppeteer",
    `${process.env.HOME ?? "/root"}/.cache/puppeteer`,
  ].filter((d): d is string => Boolean(d));

  for (const dir of searchDirs) {
    if (!fs.existsSync(dir)) continue;
    try {
      const result = execSync(
        `find "${dir}" -name "chrome" -type f 2>/dev/null | head -1`,
      )
        .toString()
        .trim();
      if (result && fs.existsSync(result)) {
        logger.info({ path: result, searchDir: dir }, "Chrome binary found via search");
        return result;
      }
    } catch {
      // ignore
    }
  }

  // 4. System Chrome fallbacks
  const systemPaths = [
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/snap/bin/chromium",
  ];

  for (const p of systemPaths) {
    if (fs.existsSync(p)) {
      logger.info({ path: p }, "Using system Chrome");
      return p;
    }
  }

  logger.warn("No Chrome binary found — Puppeteer will use its bundled Chromium");
  return undefined;
}

// ── Skills extraction ──────────────────────────────────────────────────────
const KNOWN_SKILLS = [
  "typescript",
  "javascript",
  "node",
  "express",
  "react",
  "next.js",
  "postgresql",
  "prisma",
  "mongodb",
  "redis",
  "docker",
  "kubernetes",
  "aws",
  "gcp",
  "azure",
  "python",
  "java",
  "golang",
  "c++",
  "langchain",
  "llm",
  "machine learning",
  "ai",
  "graphql",
  "rest",
  "tailwind",
  "html",
  "css",
  "git",
  "ci/cd",
  "problem solving",
  "communication",
  "leadership",
];

function extractSkills(description: string): string[] {
  const lower = description.toLowerCase();
  return KNOWN_SKILLS.filter((skill) => lower.includes(skill));
}

function normalizeSearchQuery(query: string): string {
  return query.replace(/\s+/g, " ").trim();
}

type ScrapeOptions = {
  preferredLocation?: string;
  includeRemote?: boolean;
};

// ── Main scraper ───────────────────────────────────────────────────────────
export async function scrapeJobListings(
  searchQuery?: string,
  options?: ScrapeOptions,
): Promise<ScrapedJob[]> {
  const chromePath = findChromePath();

  const launchArgs = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-blink-features=AutomationControlled",
    "--disable-dev-shm-usage",        // Critical for Render — uses /tmp instead of /dev/shm
    "--disable-gpu",
    "--no-zygote",                    // Reduces memory usage on cloud
    "--single-process",               // Important for Render free tier
    "--disable-extensions",
    "--disable-background-networking",
    "--disable-sync",
    "--metrics-recording-only",
    "--mute-audio",
    "--no-first-run",
    "--safebrowsing-disable-auto-update",
  ];

  const browser = await puppeteer.launch({
  headless: true,
  ...(chromePath ? { executablePath: chromePath } : {}),
  args: launchArgs,
});

  const results: ScrapedJob[] = [];
  const openPages: any[] = [];

  try {
    const page = await browser.newPage();
    openPages.push(page);
    await page.setViewport({ width: 1280, height: 800 });
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
    page.setDefaultNavigationTimeout(45000);
    page.setDefaultTimeout(45000);

    const baseTechQuery =
      "software engineer OR developer OR programmer OR react OR node OR typescript";
    const seniorityQuery =
      "internship OR fresher OR junior OR mid-level OR senior OR lead";
    const normalized = searchQuery ? normalizeSearchQuery(searchQuery) : "";
    const finalQuery = normalized
      ? `${normalized} (${baseTechQuery})`
      : `(${seniorityQuery}) (${baseTechQuery})`;
    const query = encodeURIComponent(finalQuery);

    const preferredLocation = normalizeSearchQuery(
      options?.preferredLocation ?? "",
    );
    const locationSet = new Set<string>();
    if (preferredLocation) locationSet.add(preferredLocation);
    if (options?.includeRemote ?? true) locationSet.add("Remote");
    locationSet.add("India");
    const locations = Array.from(locationSet);

    const processedLinks = new Set<string>();

    for (const location of locations) {
      const locationParam = encodeURIComponent(location);
      const searchUrl = `https://www.indeed.com/jobs?q=${query}&l=${locationParam}&fromage=7`;

      try {
        await page.goto(searchUrl, {
          waitUntil: "domcontentloaded",
          timeout: 60_000,
        });
      } catch (navErr) {
        logger.warn({ navErr, searchUrl }, "Failed to navigate to search page, skipping location");
        continue;
      }

      const jobLinks = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll("a.jcs-JobTitle"));
        const hrefs = anchors
          .map((a) => a.getAttribute("href"))
          .filter((href): href is string => Boolean(href))
          .map((href) =>
            href.startsWith("http")
              ? href
              : `https://www.indeed.com${href}`,
          );
        return Array.from(new Set(hrefs)).slice(0, 20); // Reduced from 25 to save memory
      });

      for (const link of jobLinks) {
        if (processedLinks.has(link)) continue;
        processedLinks.add(link);

        let detailPage: any = null;
        try {
          detailPage = await browser.newPage();
          openPages.push(detailPage);
          await detailPage.setViewport({ width: 1280, height: 800 });
          await detailPage.setExtraHTTPHeaders({
            "Accept-Language": "en-US,en;q=0.9",
          });
          detailPage.setDefaultNavigationTimeout(45000);
          detailPage.setDefaultTimeout(45000);

          await detailPage.goto(link, {
            waitUntil: "domcontentloaded",
            timeout: 45_000,
          });

          const job = await detailPage.evaluate((sourceUrl: string) => {
            let title = document
              .querySelector("h1.jobsearch-JobInfoHeader-title span")
              ?.textContent?.trim();
            if (!title)
              title =
                document
                  .querySelector(
                    "h1[data-testid='jobsearch-JobInfoHeader-title']",
                  )
                  ?.textContent?.trim() || "";

            const companyAnchor =
              document.querySelector(
                "[data-company-name='true'][data-testid='inlineHeader-companyName'] a",
              ) ||
              document.querySelector(
                "[data-testid='inlineHeader-companyName'] a",
              );
            let company = companyAnchor?.textContent?.trim();
            if (!company) {
              const aria =
                companyAnchor?.getAttribute("aria-label")?.trim() || "";
              company = aria
                .replace(/\s*\(opens in a new tab\)\s*$/i, "")
                .trim();
            }
            if (!company)
              company = document
                .querySelector("[data-testid='inlineHeader-companyName']")
                ?.textContent?.trim();
            if (!company)
              company =
                document
                  .querySelector(
                    "div.jobsearch-CompanyInfoWithoutHeaderImage div",
                  )
                  ?.textContent?.trim() || "";

            const locationCandidates = [
              document.querySelector(
                "[data-testid='inlineHeader-companyLocation'] div",
              )?.textContent,
              document.querySelector("div[data-testid='job-location']")
                ?.textContent,
              document.querySelector("div.css-1fajx0z.eu4oa1w0 > div")
                ?.textContent,
            ];
            const location =
              locationCandidates
                .map((value) => value?.trim() || "")
                .find((value) => value.length > 0) || "";

            const salaryAndJobType = document
              .querySelector("#salaryInfoAndJobType")
              ?.textContent?.trim();
            let salary = "";
            let jobType = "";
            if (salaryAndJobType) {
              const spans = Array.from(
                document.querySelectorAll("#salaryInfoAndJobType span"),
              );
              if (spans.length > 0) {
                salary = spans[0]?.textContent?.trim() || "";
                jobType =
                  spans[1]?.textContent
                    ?.replace(/^-?\s*/, "")
                    .replace("<!-- -->", "")
                    .trim() || "";
              }
            }

            let description = document
              .querySelector("#jobDescriptionText")
              ?.textContent?.trim();
            if (!description)
              description =
                document
                  .querySelector(
                    "div[data-testid='jobsearch-JobComponent-description']",
                  )
                  ?.textContent?.trim() || "";

            return {
              title,
              company,
              location,
              salary,
              jobType,
              description,
              sourceUrl,
            };
          }, link);

          const cleanedJob = {
            ...job,
            title: sanitizeDisplayText(job.title),
            company: sanitizeDisplayText(job.company),
            location: sanitizeDisplayText(job.location),
            salary: sanitizeDisplayText(job.salary ?? ""),
            jobType: sanitizeDisplayText(job.jobType ?? ""),
            description: sanitizeDisplayText(job.description),
          };

          if (!cleanedJob.title || !cleanedJob.company || !cleanedJob.description) {
            continue;
          }

          results.push({
            ...cleanedJob,
            skills: extractSkills(cleanedJob.description),
          });
        } catch (error) {
          logger.warn({ error, link }, "Skipping failed job detail page");
        } finally {
          if (detailPage) {
            try {
              const index = openPages.indexOf(detailPage);
              if (index > -1) openPages.splice(index, 1);
              await Promise.race([
                detailPage.close().catch(() => {}),
                new Promise((resolve) => setTimeout(resolve, 5000)),
              ]);
            } catch (closeError) {
              logger.warn({ error: closeError }, "Failed to close detail page");
            }
          }
        }
      }
    }

    return results;
  } catch (error) {
    logger.error({ error }, "Job scraping failed");
    return results;
  } finally {
    for (const page of openPages) {
      try {
        await Promise.race([
          page.close().catch(() => {}),
          new Promise((resolve) => setTimeout(resolve, 3000)),
        ]);
      } catch (error) {
        logger.warn({ error }, "Failed to close page in cleanup");
      }
    }

    try {
      await Promise.race([
        browser.close().catch(() => {}),
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ]);
    } catch (error) {
      logger.error({ error }, "Failed to close browser");
    }
  }
}