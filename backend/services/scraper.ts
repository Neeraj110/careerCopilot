import puppeteerModule, { type PuppeteerExtra } from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { logger } from "../libs/logger.js";
import { sanitizeDisplayText } from "../libs/text.js";
import type { ScrapedJob } from "../types/job.types.js";

const puppeteer = puppeteerModule as unknown as PuppeteerExtra;

puppeteer.use(StealthPlugin());

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

export async function scrapeJobListings(
  searchQuery?: string,
): Promise<ScrapedJob[]> {
  const browser = await puppeteer.launch({
    headless: process.env.NODE_ENV === "production",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const results: ScrapedJob[] = [];

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    // Enforce fetching tech jobs if no specific query is provided
    const baseQuery =
      "software engineer OR developer OR programmer OR react OR node OR typescript";
    const finalQuery = searchQuery ? `${searchQuery} ${baseQuery}` : baseQuery;
    const query = encodeURIComponent(finalQuery);
    // Explicitly add location context for India or Remote per user request
    const locationParam = encodeURIComponent("India");
    const searchUrl = `https://www.indeed.com/jobs?q=${query}&l=${locationParam}&fromage=7`;

    await page.goto(searchUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });

    const jobLinks = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll("a.jcs-JobTitle"));
      const hrefs = anchors
        .map((a) => a.getAttribute("href"))
        .filter((href): href is string => Boolean(href))
        .map((href) =>
          href.startsWith("http") ? href : `https://www.indeed.com${href}`,
        );

      return Array.from(new Set(hrefs)).slice(0, 25);
    });

    for (const link of jobLinks) {
      const detailPage = await browser.newPage();
      try {
        await detailPage.setViewport({ width: 1280, height: 800 });
        await detailPage.setExtraHTTPHeaders({
          "Accept-Language": "en-US,en;q=0.9",
        });
        await detailPage.goto(link, {
          waitUntil: "domcontentloaded",
          timeout: 45_000,
        });

        const job = await detailPage.evaluate((sourceUrl: string) => {
          // Inline querySelector to avoid esbuild __name injection on helper functions
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
            // aria-label is commonly "Company (opens in a new tab)" on Indeed links.
            company = aria.replace(/\s*\(opens in a new tab\)\s*$/i, "").trim();
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

          // Location can appear in multiple header variants across Indeed templates.
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

          // Extract additional details like salary and job type if available
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

        if (
          !cleanedJob.title ||
          !cleanedJob.company ||
          !cleanedJob.description
        ) {
          continue;
        }

        results.push({
          ...cleanedJob,
          skills: extractSkills(cleanedJob.description),
        });
      } catch (error) {
        logger.warn({ error, link }, "Skipping failed job detail page");
      } finally {
        await detailPage.close();
      }
    }

    return results;
  } catch (error) {
    logger.error({ error }, "Job scraping failed");
    return results;
  } finally {
    await browser.close();
  }
}
