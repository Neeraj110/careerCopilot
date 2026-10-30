// NOTE: This file is loaded with dynamic() + ssr:false from the export page.
// Do NOT add "use client" — react-pdf components are not React DOM components.

import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
} from "@react-pdf/renderer";

const C = {
  ink: "#000000",
  inkMuted: "#4B5563",
  blueHeader: "#28559B",
  rule: "#28559B",
  bg: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontSize: 9.75,
    color: C.ink,
    fontFamily: "Times-Roman",
    backgroundColor: C.bg,
    lineHeight: 1.35,
  },

  // Centered Header
  headerWrap: {
    textAlign: "center",
    marginBottom: 10,
    alignItems: "center",
  },
  name: {
    fontSize: 22,
    fontFamily: "Times-Bold",
    letterSpacing: 0.5,
    color: C.ink,
    textAlign: "center",
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    fontSize: 9,
    color: C.inkMuted,
    fontFamily: "Times-Roman",
  },
  contactItem: {
    marginHorizontal: 3,
  },
  contactSep: {
    marginHorizontal: 3,
    color: C.inkMuted,
  },
  link: {
    color: C.blueHeader,
    textDecoration: "underline",
  },

  // Sections (Jake's Resume blue title + full underline)
  section: {
    marginTop: 10,
  },
  sectionHeaderWrap: {
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    letterSpacing: 0.5,
    color: C.blueHeader,
    textTransform: "uppercase",
  },
  sectionRule: {
    height: 0.8,
    backgroundColor: C.rule,
    marginTop: 2,
    marginBottom: 4,
  },

  // Summary
  summary: {
    fontSize: 9.5,
    lineHeight: 1.38,
    color: C.ink,
    textAlign: "justify",
  },

  // Skills
  skillCategoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 2.5,
    fontSize: 9.5,
    lineHeight: 1.35,
  },
  skillCategoryLabel: {
    fontFamily: "Times-Bold",
    color: C.ink,
  },
  skillCategoryItems: {
    fontFamily: "Times-Roman",
    color: C.ink,
  },

  // Experience & Education Row Styles
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 1,
  },
  boldLeft: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    color: C.ink,
  },
  italicRight: {
    fontSize: 9,
    fontFamily: "Times-Italic",
    color: C.inkMuted,
  },
  italicLeft: {
    fontSize: 9,
    fontFamily: "Times-Italic",
    color: C.inkMuted,
  },

  // Experience
  expItem: {
    marginBottom: 7,
  },

  // Bullets
  bullet: {
    flexDirection: "row",
    marginTop: 1.5,
    marginBottom: 1.5,
    paddingLeft: 6,
  },
  bulletDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: C.ink,
    marginRight: 6,
    marginTop: 5,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.25,
    lineHeight: 1.3,
    color: C.ink,
  },

  // Projects
  projItem: {
    marginBottom: 7,
  },
  projSubtitle: {
    fontSize: 8.75,
    fontFamily: "Times-Italic",
    color: C.inkMuted,
    marginTop: 1,
    marginBottom: 2,
    paddingLeft: 6,
  },
  projLiveLink: {
    fontSize: 9,
    fontFamily: "Times-Roman",
    color: C.blueHeader,
    textDecoration: "underline",
  },

  // Education
  eduItem: {
    marginBottom: 4,
  },

  // Certifications
  certItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    paddingLeft: 6,
  },
});

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeaderWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionRule} />
    </View>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bullet} wrap={false}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{children as any}</Text>
    </View>
  );
}

export function ResumeDocument({ user, version, title }: { user: any; version: any; title: string }) {
  const p = version?.parsedSections || {};
  const basics = p.basics || {};

  const displayName = basics.name?.trim() || user?.name || "Candidate Name";
  const displayEmail = basics.email?.trim() || user?.email || "";
  const phone = basics.phone?.trim() || "";
  const location = basics.location?.trim() || "";
  const github = basics.github?.trim() || "";
  const linkedin = basics.linkedin?.trim() || "";
  const portfolio = basics.portfolio?.trim() || "";

  // Build clean contact items
  const contactItems: { text: string; href?: string }[] = [];
  if (location) contactItems.push({ text: location });
  if (phone) contactItems.push({ text: phone, href: `tel:${phone.replace(/[^0-9+]/g, "")}` });
  if (displayEmail) contactItems.push({ text: displayEmail, href: `mailto:${displayEmail}` });
  if (github) {
    const clean = github.replace(/^https?:\/\/(www\.)?github\.com\//i, "");
    contactItems.push({ text: `github.com/${clean}`, href: `https://github.com/${clean}` });
  }
  if (linkedin) {
    const clean = linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "");
    contactItems.push({ text: `linkedin.com/in/${clean}`, href: `https://linkedin.com/in/${clean}` });
  }
  if (portfolio) {
    const clean = portfolio.replace(/^https?:\/\/(www\.)?/i, "");
    contactItems.push({ text: clean || "Portfolio", href: portfolio.startsWith("http") ? portfolio : `https://${portfolio}` });
  }
  if (Array.isArray(basics.links)) {
    for (const l of basics.links) {
      if (l?.url && !github.includes(l.url) && !linkedin.includes(l.url)) {
        contactItems.push({ text: l.label || l.url, href: l.url });
      }
    }
  }

  // Parse categorized skills
  const skillCategories: { label: string; items: string }[] = [];
  const rawSkills = p.skills;
  if (rawSkills) {
    if (typeof rawSkills === "object" && !Array.isArray(rawSkills)) {
      for (const [cat, val] of Object.entries(rawSkills)) {
        if (!val) continue;
        const formattedCat = cat.replace(/([A-Z])/g, " $1").trim();
        const itemsStr = Array.isArray(val) ? val.join(", ") : String(val);
        skillCategories.push({
          label: `${formattedCat.charAt(0).toUpperCase() + formattedCat.slice(1)}: `,
          items: itemsStr,
        });
      }
    } else if (Array.isArray(rawSkills) && rawSkills.length > 0) {
      const standalone: string[] = [];
      for (const sk of rawSkills) {
        if (typeof sk === "string" && sk.includes(":")) {
          const [cat, ...rest] = sk.split(":");
          skillCategories.push({
            label: `${cat.trim()}: `,
            items: rest.join(":").trim(),
          });
        } else {
          standalone.push(String(sk));
        }
      }
      if (standalone.length > 0) {
        if (skillCategories.length > 0) {
          skillCategories.push({ label: "Other Skills: ", items: standalone.join(", ") });
        } else {
          skillCategories.push({ label: "Technical Skills: ", items: standalone.join(", ") });
        }
      }
    }
  }

  return (
    <Document title={title || displayName || "Resume"} author={displayName}>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.headerWrap}>
          <Text style={styles.name}>{displayName}</Text>
          <View style={styles.contactRow}>
            {contactItems.map((item, idx) => (
              <View key={idx} style={{ flexDirection: "row", alignItems: "center" }}>
                {idx > 0 && <Text style={styles.contactSep}> | </Text>}
                {item.href ? (
                  <Link src={item.href} style={styles.link}>
                    {item.text}
                  </Link>
                ) : (
                  <Text style={styles.contactItem}>{item.text}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Professional Summary */}
        {p.summary ? (
          <View style={styles.section}>
            <SectionHeader title="Professional Summary" />
            <Text style={styles.summary}>{p.summary}</Text>
          </View>
        ) : null}

        {/* Core Technical Skills */}
        {skillCategories.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Core Technical Skills" />
            {skillCategories.map((cat, idx) => (
              <View key={idx} style={styles.skillCategoryRow}>
                <Text style={styles.skillCategoryLabel}>{cat.label}</Text>
                <Text style={styles.skillCategoryItems}>{cat.items}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Professional Experience */}
        {Array.isArray(p.experience) && p.experience.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Professional Experience" />
            {p.experience.map((exp: any, i: number) => (
              <View key={i} style={styles.expItem} wrap={false}>
                <View style={styles.rowBetween}>
                  <Text style={styles.boldLeft}>{exp.role || "Developer"}</Text>
                  {exp.period ? <Text style={styles.italicRight}>{exp.period}</Text> : null}
                </View>
                {(exp.company || exp.location) && (
                  <View style={styles.rowBetween}>
                    <Text style={styles.italicLeft}>{exp.company || ""}</Text>
                    {exp.location ? <Text style={styles.italicRight}>{exp.location}</Text> : null}
                  </View>
                )}
                {Array.isArray(exp.bullets) &&
                  exp.bullets.map((b: string, j: number) => <Bullet key={j}>{b}</Bullet>)}
              </View>
            ))}
          </View>
        ) : null}

        {/* Projects */}
        {Array.isArray(p.projects) && p.projects.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Projects" />
            {p.projects.map((proj: any, i: number) => {
              const subtitle =
                proj.subtitle ||
                (proj.description && (!Array.isArray(proj.bullets) || !proj.bullets.includes(proj.description))
                  ? proj.description
                  : "");

              const stackItems = Array.isArray(proj.tech)
                ? proj.tech.join(", ")
                : proj.stack
                ? Array.isArray(proj.stack)
                  ? proj.stack.join(", ")
                  : String(proj.stack)
                : "";

              return (
                <View key={i} style={styles.projItem} wrap={false}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.boldLeft}>{proj.name || "Project"}</Text>
                    {proj.link ? (
                      <Link src={proj.link} style={styles.projLiveLink}>
                        Live ↗
                      </Link>
                    ) : null}
                  </View>
                  {subtitle ? <Text style={styles.projSubtitle}>{subtitle}</Text> : null}
                  {Array.isArray(proj.bullets) &&
                    proj.bullets.map((b: string, j: number) => <Bullet key={j}>{b}</Bullet>)}
                  {stackItems ? (
                    <View style={styles.bullet}>
                      <View style={styles.bulletDot} />
                      <Text style={styles.bulletText}>
                        <Text style={{ fontFamily: "Times-Bold" }}>Stack: </Text>
                        {stackItems}
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Education */}
        {Array.isArray(p.education) && p.education.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Education" />
            {p.education.map((edu: any, i: number) => {
              const scoreVal = edu.score || edu.cgpa;
              const school = edu.school || "";
              const schoolAndScore = scoreVal ? `${school} | Score: ${scoreVal}` : school;

              return (
                <View key={i} style={styles.eduItem} wrap={false}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.boldLeft}>{edu.degree || "Degree"}</Text>
                    <Text style={styles.italicRight}>{edu.year || edu.period || ""}</Text>
                  </View>
                  <View style={styles.rowBetween}>
                    <Text style={styles.italicLeft}>{schoolAndScore}</Text>
                    {edu.location ? <Text style={styles.italicRight}>{edu.location}</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Certifications */}
        {Array.isArray(p.certifications) && p.certifications.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Certifications" />
            {p.certifications.map((c: any, i: number) => (
              <View key={i} style={styles.certItem}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={{ fontFamily: "Times-Bold" }}>{c.name}</Text>
                  {c.year ? ` (${c.year})` : ""}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
