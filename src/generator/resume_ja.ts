/**
 * Japanese CV Generator (職務経歴書スタイル)
 * Generates HTML for Japanese CV format
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

export interface CVJaOptions {
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
 * Format date for Japanese display
 */
function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  if (dateStr.toLowerCase() === 'present' || dateStr === '現在') return '現在';
  const match = dateStr.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
  if (match) {
    return `${match[1]}年${match[2]}月`;
  }
  return dateStr;
}

/**
 * Format date range
 */
function formatDateRange(start: string | undefined, end: string | undefined): string {
  const startStr = formatDate(start);
  const endStr = formatDate(end);
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
      font-family: "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif;
      font-size: 10pt;
      line-height: 1.7;
      color: #333;
      background: #fff;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-feature-settings: "palt";
    }
    header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #2c3e50;
    }
    .furigana {
      font-size: 9pt;
      color: #666;
      margin-bottom: 2px;
    }
    h1 {
      color: #2c3e50;
      font-size: 22pt;
      margin-bottom: 8px;
    }
    .contact-info {
      color: #666;
      font-size: 9pt;
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
      font-size: 12pt;
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
      color: #555;
      font-size: 9pt;
    }
    .entry-date {
      color: #666;
      font-size: 9pt;
    }
    .entry-location {
      color: #777;
      font-size: 9pt;
    }
    .entry-summary {
      margin-top: 4px;
      font-size: 9pt;
    }
    ul {
      margin-left: 18px;
      margin-top: 4px;
    }
    li {
      margin-bottom: 2px;
      font-size: 9pt;
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
      padding: 8px;
      background: #f8f9fa;
      border-left: 3px solid #3498db;
    }
    .project-name {
      font-weight: 500;
      font-size: 9pt;
    }
    .project-period {
      font-size: 8pt;
      color: #666;
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
 * Render experience section with project details
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
          html += ` / ${escapeHtml(role.team)}`;
        }
        html += '</span>';
        if (dateRange) {
          html += `<span class="entry-date">${escapeHtml(dateRange)}</span>`;
        }
        html += '</div>';

        if (role.summary && role.summary.length > 0) {
          html += '<div class="entry-summary">';
          html += role.summary.map((s) => escapeHtml(s)).join('<br>');
          html += '</div>';
        }

        if (role.highlights && role.highlights.length > 0) {
          html += '<ul>';
          for (const highlight of role.highlights) {
            html += `<li>${escapeHtml(highlight)}</li>`;
          }
          html += '</ul>';
        }

        // Render projects with more detail for Japanese resume
        if (role.projects && role.projects.length > 0) {
          for (const project of role.projects) {
            const projDateRange = formatDateRange(project.start, project.end);
            html += '<div class="project">';
            html += `<div class="project-name">【プロジェクト】${escapeHtml(project.name)}</div>`;
            if (projDateRange) {
              html += `<div class="project-period">期間: ${escapeHtml(projDateRange)}</div>`;
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
        html += `<div class="entry-subtitle">${entry.items.map((i) => escapeHtml(i)).join('、')}</div>`;
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
 * Generate Japanese HTML CV
 */
export function generateCVJaHTML(cv: CVInput, options: CVJaOptions): string {
  const styles = generateStyles(options.paperSize);
  const name = cv.metadata.name_ja ?? cv.metadata.name;
  const furigana = cv.metadata.name_furigana;
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
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(name)} - 職務経歴書</title>
  <style>${styles}</style>
</head>
<body>
  <header>
    ${furigana ? `<div class="furigana">${escapeHtml(furigana)}</div>` : ''}
    <h1>${escapeHtml(name)}</h1>
    <div class="contact-info">${contactHtml}</div>
  </header>
  <main>
${sectionsHtml}
  </main>
</body>
</html>`;
}
