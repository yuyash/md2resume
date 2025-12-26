/**
 * English CV Generator
 * Generates HTML for English CV format
 */

import type { PaperSize } from '../types/config.js';
import type { CVMetadata } from '../types/metadata.js';
import type {
  CertificationEntry,
  EducationEntry,
  ExperienceEntry,
  ParsedSection,
  SectionContent,
  SkillEntry,
} from '../types/sections.js';

export interface CVEnOptions {
  readonly paperSize: PaperSize;
}

/**
 * Input for CV generation
 */
export interface CVInput {
  readonly metadata: CVMetadata;
  readonly sections: readonly ParsedSection[];
}

/**
 * Page size dimensions in mm
 */
const PAGE_SIZES: Record<PaperSize, { width: number; height: number }> = {
  a3: { width: 420, height: 297 },
  a4: { width: 210, height: 297 },
  b4: { width: 364, height: 257 },
  b5: { width: 176, height: 250 },
  letter: { width: 215.9, height: 279.4 },
};

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Format date for display
 */
function formatDate(date: Date | undefined): string {
  if (!date) return '';
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Format end date which can be Date or 'present'
 */
function formatEndDate(end: Date | 'present' | undefined): string {
  if (!end) return '';
  if (end === 'present') return 'Present';
  return formatDate(end);
}

/**
 * Format date range
 */
function formatDateRange(start: Date | undefined, end: Date | 'present' | undefined): string {
  const startStr = formatDate(start);
  const endStr = formatEndDate(end);
  if (startStr && endStr) return `${startStr} - ${endStr}`;
  if (startStr) return startStr;
  return '';
}

/**
 * Generate base CSS styles
 */
function generateStyles(paperSize: PaperSize): string {
  const size = PAGE_SIZES[paperSize];

  return `
    @page {
      size: ${size.width}mm ${size.height}mm;
      margin: 15mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #333;
      background: #fff;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #2c3e50;
    }
    h1 {
      color: #2c3e50;
      font-size: 24pt;
      margin-bottom: 8px;
    }
    .contact-info {
      color: #666;
      font-size: 10pt;
    }
    .contact-info a {
      color: #3498db;
      text-decoration: none;
    }
    section {
      margin-bottom: 18px;
    }
    h2 {
      color: #2c3e50;
      font-size: 13pt;
      border-bottom: 1px solid #bdc3c7;
      padding-bottom: 4px;
      margin-bottom: 10px;
    }
    .entry {
      margin-bottom: 12px;
    }
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      flex-wrap: wrap;
    }
    .entry-title {
      font-weight: bold;
      color: #34495e;
    }
    .entry-subtitle {
      font-style: italic;
      color: #555;
      font-size: 10pt;
    }
    .entry-date {
      color: #666;
      font-size: 10pt;
    }
    .entry-location {
      color: #777;
      font-size: 10pt;
    }
    .entry-summary {
      margin-top: 4px;
      font-size: 10pt;
    }
    ul {
      margin-left: 18px;
      margin-top: 4px;
    }
    li {
      margin-bottom: 2px;
      font-size: 10pt;
    }
    p {
      margin-bottom: 8px;
    }
    .role {
      margin-bottom: 10px;
    }
    .role-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .project {
      margin-left: 15px;
      margin-top: 6px;
    }
    .project-name {
      font-weight: 500;
      font-size: 10pt;
    }
    @media print {
      body {
        padding: 0;
        max-width: none;
      }
    }
  `;
}

/**
 * Render education section
 */
function renderEducation(entries: readonly EducationEntry[]): string {
  return entries
    .map((entry) => {
      const dateRange = formatDateRange(entry.start, entry.end);
      let html = '<div class="entry">';
      html += '<div class="entry-header">';
      html += `<span class="entry-title">${escapeHtml(entry.school)}</span>`;
      if (dateRange) {
        html += `<span class="entry-date">${escapeHtml(dateRange)}</span>`;
      }
      html += '</div>';
      if (entry.degree) {
        html += `<div class="entry-subtitle">${escapeHtml(entry.degree)}</div>`;
      }
      if (entry.location) {
        html += `<div class="entry-location">${escapeHtml(entry.location)}</div>`;
      }
      if (entry.details && entry.details.length > 0) {
        html += '<ul>';
        for (const detail of entry.details) {
          html += `<li>${escapeHtml(detail)}</li>`;
        }
        html += '</ul>';
      }
      html += '</div>';
      return html;
    })
    .join('\n');
}

/**
 * Render experience section
 */
function renderExperience(entries: readonly ExperienceEntry[]): string {
  return entries
    .map((entry) => {
      let html = '<div class="entry">';
      html += `<div class="entry-title">${escapeHtml(entry.company)}</div>`;
      if (entry.location) {
        html += `<div class="entry-location">${escapeHtml(entry.location)}</div>`;
      }

      for (const role of entry.roles) {
        const dateRange = formatDateRange(role.start, role.end);
        html += '<div class="role">';
        html += '<div class="role-header">';
        html += `<span class="entry-subtitle">${escapeHtml(role.title)}`;
        if (role.team) {
          html += ` - ${escapeHtml(role.team)}`;
        }
        html += '</span>';
        if (dateRange) {
          html += `<span class="entry-date">${escapeHtml(dateRange)}</span>`;
        }
        html += '</div>';

        if (role.summary && role.summary.length > 0) {
          html += '<div class="entry-summary">';
          html += role.summary.map((s) => escapeHtml(s)).join(' ');
          html += '</div>';
        }

        if (role.highlights && role.highlights.length > 0) {
          html += '<ul>';
          for (const highlight of role.highlights) {
            html += `<li>${escapeHtml(highlight)}</li>`;
          }
          html += '</ul>';
        }

        if (role.projects && role.projects.length > 0) {
          for (const project of role.projects) {
            const projDateRange = formatDateRange(project.start, project.end);
            html += '<div class="project">';
            html += `<span class="project-name">${escapeHtml(project.name)}</span>`;
            if (projDateRange) {
              html += ` <span class="entry-date">(${escapeHtml(projDateRange)})</span>`;
            }
            if (project.bullets && project.bullets.length > 0) {
              html += '<ul>';
              for (const bullet of project.bullets) {
                html += `<li>${escapeHtml(bullet)}</li>`;
              }
              html += '</ul>';
            }
            html += '</div>';
          }
        }

        html += '</div>';
      }

      html += '</div>';
      return html;
    })
    .join('\n');
}

/**
 * Render certifications section
 */
function renderCertifications(entries: readonly CertificationEntry[]): string {
  return entries
    .map((entry) => {
      let html = '<div class="entry">';
      html += '<div class="entry-header">';
      html += `<span class="entry-title">${escapeHtml(entry.name)}</span>`;
      if (entry.date) {
        html += `<span class="entry-date">${escapeHtml(formatDate(entry.date))}</span>`;
      }
      html += '</div>';
      if (entry.issuer) {
        html += `<div class="entry-subtitle">${escapeHtml(entry.issuer)}</div>`;
      }
      html += '</div>';
      return html;
    })
    .join('\n');
}

/**
 * Render skills section
 */
function renderSkills(entries: readonly SkillEntry[]): string {
  return entries
    .map((entry) => {
      let html = '<div class="entry">';
      html += `<div class="entry-title">${escapeHtml(entry.category)}`;
      if (entry.level) {
        html += ` <span class="entry-date">(${escapeHtml(entry.level)})</span>`;
      }
      html += '</div>';
      if (entry.items.length > 0) {
        html += `<div class="entry-subtitle">${entry.items.map((i) => escapeHtml(i)).join(', ')}</div>`;
      }
      html += '</div>';
      return html;
    })
    .join('\n');
}

/**
 * Render section content
 */
function renderSectionContent(content: SectionContent): string {
  switch (content.type) {
    case 'text':
      return `<p>${escapeHtml(content.text)}</p>`;
    case 'list':
      return (
        '<ul>' + content.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n') + '</ul>'
      );
    case 'education':
      return renderEducation(content.entries);
    case 'experience':
      return renderExperience(content.entries);
    case 'certifications':
      return renderCertifications(content.entries);
    case 'skills':
      return renderSkills(content.entries);
    case 'table':
      // Tables are mainly for rirekisho, render as list for resume
      return (
        '<ul>' +
        content.rows.map((row) => `<li>${escapeHtml(row.content)}</li>`).join('\n') +
        '</ul>'
      );
    default:
      return '';
  }
}

/**
 * Render contact info
 */
function renderContactInfo(cv: CVInput): string {
  const parts: string[] = [];

  parts.push(
    `<a href="mailto:${escapeHtml(cv.metadata.email_address)}">${escapeHtml(cv.metadata.email_address)}</a>`,
  );
  parts.push(escapeHtml(cv.metadata.phone_number));

  if (cv.metadata.home_address) {
    parts.push(escapeHtml(cv.metadata.home_address));
  }

  return parts.join(' | ');
}

/**
 * Generate English HTML CV
 */
export function generateCVEnHTML(cv: CVInput, options: CVEnOptions): string {
  const styles = generateStyles(options.paperSize);
  const name = cv.metadata.name;
  const contactHtml = renderContactInfo(cv);

  const sectionsHtml = cv.sections
    .map((section) => {
      return `
<section>
  <h2>${escapeHtml(section.title)}</h2>
  ${renderSectionContent(section.content)}
</section>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(name)} - CV</title>
  <style>${styles}</style>
</head>
<body>
  <header>
    <h1>${escapeHtml(name)}</h1>
    <div class="contact-info">${contactHtml}</div>
  </header>
  <main>
${sectionsHtml}
  </main>
</body>
</html>`;
}
