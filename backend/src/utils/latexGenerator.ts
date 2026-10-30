/**
 * Generates Overleaf-ready LaTeX code following the popular Jake's Resume format.
 * Matches clean blue section titles, centered header, categorized skills, and project bullets.
 */

export function escapeLatex(text: string | null | undefined): string {
  if (!text) return "";
  return String(text)
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/&/g, "\\&")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

export function generateResumeLatex(data: any): string {
  const basics = data?.basics || {};
  const name = escapeLatex(basics?.name || "Candidate Name");
  const email = escapeLatex(basics?.email || "");
  const phone = escapeLatex(basics?.phone || "");
  const location = escapeLatex(basics?.location || "");
  const github = escapeLatex(basics?.github || "");
  const linkedin = escapeLatex(basics?.linkedin || "");
  const portfolio = escapeLatex(basics?.portfolio || "");

  // Build contact row
  const contactParts: string[] = [];
  if (location) contactParts.push(location);
  if (phone) contactParts.push(`\\href{tel:${phone.replace(/[^0-9+]/g, "")}}{${phone}}`);
  if (email) contactParts.push(`\\href{mailto:${email}}{\\underline{${email}}}`);
  if (github) {
    const cleanGh = github.replace(/^https?:\/\/(www\.)?github\.com\//i, "");
    contactParts.push(`\\href{https://github.com/${cleanGh}}{\\underline{github.com/${cleanGh}}}`);
  }
  if (linkedin) {
    const cleanLi = linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "");
    contactParts.push(`\\href{https://linkedin.com/in/${cleanLi}}{\\underline{linkedin.com/in/${cleanLi}}}`);
  }
  if (portfolio) {
    const cleanPf = portfolio.replace(/^https?:\/\/(www\.)?/i, "");
    contactParts.push(`\\href{${portfolio.startsWith("http") ? portfolio : `https://${portfolio}`}}{\\underline{${cleanPf || "Portfolio"}}}`);
  }
  if (Array.isArray(basics?.links)) {
    for (const link of basics.links) {
      if (link?.label && link?.url && !github.includes(link.url) && !linkedin.includes(link.url)) {
        contactParts.push(`\\href{${link.url}}{\\underline{${escapeLatex(link.label)}}}`);
      }
    }
  }

  const contactLine = contactParts.join(" $|$ ");

  // Summary
  const summary = escapeLatex(data?.summary || "");

  // Skills
  let skillsLatex = "";
  const skills = data?.skills;
  if (skills) {
    if (typeof skills === "object" && !Array.isArray(skills)) {
      const rows = Object.entries(skills)
        .filter(([_, val]) => Boolean(val))
        .map(([category, items]) => {
          const catName = escapeLatex(category.replace(/([A-Z])/g, " $1").trim());
          const catItems = Array.isArray(items)
            ? items.map(escapeLatex).join(", ")
            : escapeLatex(String(items));
          return `     \\textbf{${catName}}{: ${catItems}} \\\\`;
        });
      if (rows.length > 0) {
        skillsLatex = `\\section{Core Technical Skills}\n \\begin{itemize}[leftmargin=0.15in, label={}]\n    \\small{\\item{\n${rows.join(
          "\n",
        )}\n    }}\n \\end{itemize}\n`;
      }
    } else if (Array.isArray(skills) && skills.length > 0) {
      // Could be strings like "Frontend: React, Next" or individual skill chips
      const categorized: string[] = [];
      const standalone: string[] = [];
      for (const sk of skills) {
        if (typeof sk === "string" && sk.includes(":")) {
          const [cat, ...rest] = sk.split(":");
          categorized.push(
            `     \\textbf{${escapeLatex(cat.trim())}}{: ${escapeLatex(rest.join(":").trim())}} \\\\`,
          );
        } else {
          standalone.push(escapeLatex(String(sk)));
        }
      }

      if (categorized.length > 0) {
        if (standalone.length > 0) {
          categorized.push(`     \\textbf{Other Skills}{: ${standalone.join(", ")}} \\\\`);
        }
        skillsLatex = `\\section{Core Technical Skills}\n \\begin{itemize}[leftmargin=0.15in, label={}]\n    \\small{\\item{\n${categorized.join(
          "\n",
        )}\n    }}\n \\end{itemize}\n`;
      } else {
        skillsLatex = `\\section{Core Technical Skills}\n \\begin{itemize}[leftmargin=0.15in, label={}]\n    \\small{\\item{\n     ${standalone.join(
          ", ",
        )}\n    }}\n \\end{itemize}\n`;
      }
    }
  }

  // Experience
  let experienceLatex = "";
  const experience = data?.experience;
  if (Array.isArray(experience) && experience.length > 0) {
    const expItems = experience.map((exp: any) => {
      const role = escapeLatex(exp?.role || "Developer");
      const company = escapeLatex(exp?.company || "");
      const period = escapeLatex(exp?.period || "");
      const loc = escapeLatex(exp?.location || "");

      let bullets = "";
      if (Array.isArray(exp?.bullets) && exp.bullets.length > 0) {
        bullets = `      \\resumeItemListStart\n${exp.bullets
          .map((b: string) => `        \\resumeItem{${escapeLatex(b)}}`)
          .join("\n")}\n      \\resumeItemListEnd`;
      }

      return `    \\resumeSubheading\n      {${role}}{${period}}\n      {${company}}{${loc}}\n${bullets}`;
    });

    experienceLatex = `\\section{Professional Experience}\n  \\resumeSubHeadingListStart\n${expItems.join(
      "\n",
    )}\n  \\resumeSubHeadingListEnd\n`;
  }

  // Projects
  let projectsLatex = "";
  const projects = data?.projects;
  if (Array.isArray(projects) && projects.length > 0) {
    const projItems = projects.map((p: any) => {
      const name = escapeLatex(p?.name || "Project");
      const link = p?.link ? `\\href{${p.link}}{\\underline{Live $\\nearrow$}}` : "";
      const subtitle = p?.subtitle || (p?.description && (!Array.isArray(p?.bullets) || !p.bullets.includes(p.description)) ? p.description : "");
      const subtitleLatex = subtitle
        ? `        \\item \\textit{\\small ${escapeLatex(subtitle)}}\n`
        : "";

      const stackItems = Array.isArray(p?.tech)
        ? p.tech.map(escapeLatex).join(", ")
        : p?.stack
        ? Array.isArray(p.stack)
          ? p.stack.map(escapeLatex).join(", ")
          : escapeLatex(String(p.stack))
        : "";

      let bullets = "";
      if (Array.isArray(p?.bullets) && p.bullets.length > 0) {
        bullets = p.bullets
          .map((b: string) => `        \\resumeItem{${escapeLatex(b)}}`)
          .join("\n");
      }

      let stackLine = "";
      if (stackItems) {
        stackLine = `\n        \\resumeItem{\\textbf{Stack:} ${stackItems}}`;
      }

      return `      \\resumeProjectHeading\n          {\\textbf{${name}}}{${link}}\n          \\resumeItemListStart\n${subtitleLatex}${bullets}${stackLine}\n          \\resumeItemListEnd`;
    });

    projectsLatex = `\\section{Projects}\n    \\resumeSubHeadingListStart\n${projItems.join(
      "\n",
    )}\n    \\resumeSubHeadingListEnd\n`;
  }

  // Education
  let educationLatex = "";
  const education = data?.education;
  if (Array.isArray(education) && education.length > 0) {
    const eduItems = education.map((edu: any) => {
      const degree = escapeLatex(edu?.degree || "Degree");
      const year = escapeLatex(edu?.year || edu?.period || "");
      const school = escapeLatex(edu?.school || "");
      const scoreVal = edu?.score || edu?.cgpa;
      const scoreStr = scoreVal ? ` $|$ Score: ${escapeLatex(String(scoreVal))}` : "";
      const schoolAndScore = `${school}${scoreStr}`.trim();
      const loc = escapeLatex(edu?.location || "");

      return `    \\resumeSubheading\n      {${degree}}{${year}}\n      {${schoolAndScore}}{${loc}}`;
    });

    educationLatex = `\\section{Education}\n  \\resumeSubHeadingListStart\n${eduItems.join(
      "\n",
    )}\n  \\resumeSubHeadingListEnd\n`;
  }

  // Certifications
  let certsLatex = "";
  const certs = data?.certifications;
  if (Array.isArray(certs) && certs.length > 0) {
    const certItems = certs
      .map((c: any) => {
        const cName = escapeLatex(c?.name || "");
        const cYear = escapeLatex(c?.year || "");
        return cName ? `    \\resumeItem{\\textbf{${cName}}${cYear ? ` (${cYear})` : ""}}` : "";
      })
      .filter(Boolean);

    if (certItems.length > 0) {
      certsLatex = `\\section{Certifications}\n  \\begin{itemize}[leftmargin=0.15in, label={}]\n    \\small{\n${certItems.join(
        "\n",
      )}\n    }\n  \\end{itemize}\n`;
    }
  }

  return `%-------------------------
% Resume in Latex
% Generated by CareerCopilot for Overleaf
% Template: Jake's Resume Standard
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins to standard 0.5in
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting with classic blue horizontal rule
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large\\color[RGB]{40, 85, 155}
}{}{0em}{}[\\color[RGB]{40, 85, 155}\\titlerule \\vspace{-5pt}]

% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${name}} \\\\ \\vspace{1pt}
    \\small ${contactLine}
\\end{center}

${
  summary
    ? `%-----------PROFESSIONAL SUMMARY-----------
\\section{Professional Summary}
${summary}
`
    : ""
}
${skillsLatex}
${experienceLatex}
${projectsLatex}
${educationLatex}
${certsLatex}

\\end{document}
`;
}

