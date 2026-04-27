import type { Response } from "express";
import {
  alignRequestSchema,
  atsRequestSchema,
  selectResumeSchema,
} from "../schemas/resume.schemas.js";
import { resumeService } from "../services/resume.service.js";
import type { AuthenticatedRequest } from "../types/auth.types.js";

function getClientIp(req: AuthenticatedRequest): string {
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (typeof xForwardedFor === "string" && xForwardedFor.length > 0) {
    return xForwardedFor.split(",")[0]!.trim();
  }
  if (Array.isArray(xForwardedFor) && xForwardedFor.length > 0) {
    return xForwardedFor[0]!.trim();
  }
  return req.ip || "";
}

function fallbackCountryFromLanguage(req: AuthenticatedRequest): string {
  const acceptLanguage = req.headers["accept-language"];
  if (typeof acceptLanguage !== "string" || !acceptLanguage) {
    return "";
  }

  const first = acceptLanguage.split(",")[0] || "";
  const regionPart = first.split("-")[1] || first.split("_")[1] || "";
  if (!regionPart) {
    return "";
  }

  const map: Record<string, string> = {
    IN: "India",
    US: "United States",
    UK: "United Kingdom",
    GB: "United Kingdom",
    CA: "Canada",
    AU: "Australia",
    SG: "Singapore",
    DE: "Germany",
    FR: "France",
    ES: "Spain",
    IT: "Italy",
    BR: "Brazil",
    AE: "United Arab Emirates",
  };

  return map[regionPart.toUpperCase()] || "";
}

function isLocalOrPrivateIp(ip: string): boolean {
  if (!ip) return true;
  if (ip === "::1" || ip === "127.0.0.1") return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("172.")) {
    const second = Number(ip.split(".")[1]);
    return second >= 16 && second <= 31;
  }
  return false;
}

class ResumeController {
  async detectLocation(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const ip = getClientIp(req);
      const normalizedIp = ip.includes("::ffff:") ? ip.replace("::ffff:", "") : ip;
      const isLocalIp = isLocalOrPrivateIp(normalizedIp);

      if (normalizedIp && !isLocalIp) {
        try {
          const response = await fetch(`https://ipapi.co/${normalizedIp}/json/`, {
            headers: { Accept: "application/json" },
          });

          if (response.ok) {
            const data = (await response.json()) as {
              country_name?: string;
              country?: string;
              city?: string;
            };

            const country = (data.country_name || "").trim();
            const city = (data.city || "").trim();
            const location = city && country ? `${city}, ${country}` : country;

            if (location) {
              return res.json({
                source: "ip",
                location,
                country,
                ip: normalizedIp,
                fetchedAt: new Date().toISOString(),
              });
            }
          }
        } catch {
          // Fall through to language-based fallback.
        }
      }

      if (isLocalIp) {
        return res.json({
          source: "unknown",
          location: "",
          country: "",
          ip: normalizedIp,
          fetchedAt: new Date().toISOString(),
        });
      }

      const fallbackCountry = fallbackCountryFromLanguage(req);
      return res.json({
        source: fallbackCountry ? "accept-language" : "unknown",
        location: fallbackCountry,
        country: fallbackCountry,
        ip: normalizedIp,
        fetchedAt: new Date().toISOString(),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to detect location";
      return res.status(500).json({ message });
    }
  }

  async upload(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "PDF file is required" });
      }

      const preferredLocation =
        typeof req.body?.preferredLocation === "string"
          ? req.body.preferredLocation.trim().slice(0, 80)
          : "";

      const result = await resumeService.uploadCv(
        req.user.id,
        req.file,
        preferredLocation,
      );
      return res.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upload CV";
      return res.status(500).json({ message });
    }
  }

  async atsScore(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const parsedBody = atsRequestSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }

      const result = await resumeService.getAtsScore(
        req.user.id,
        parsedBody.data.jobDescription,
      );
      return res.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate ATS score";
      return res.status(500).json({ message });
    }
  }

  async align(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const parsedBody = alignRequestSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }

      const result = await resumeService.getAlignment(
        req.user.id,
        parsedBody.data.jobDescription,
      );
      return res.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to align resume";
      return res.status(500).json({ message });
    }
  }

  async status(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await resumeService.getStatus(req.user.id);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch resume status" });
    }
  }

  async select(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const parsedBody = selectResumeSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid request body" });
      }

      const result = await resumeService.selectActiveResume(
        req.user.id,
        parsedBody.data.resumeId,
      );
      return res.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to select resume";
      const statusCode = message === "Resume not found" ? 404 : 500;
      return res.status(statusCode).json({ message });
    }
  }
}

export const resumeController = new ResumeController();
