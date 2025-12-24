/**
 * MHLW Standard Rirekisho (履歴書) Generator
 * Based on 厚生労働省 履歴書様式例 format
 * A3 (420x297mm) or B4 (364x257mm) landscape double-page spread
 */

import type { ChronologicalOrder, PaperSize } from '../types/config.js';
import type { CVMetadata } from '../types/metadata.js';
import type {
  CertificationEntry,
  EducationEntry,
  ExperienceEntry,
  ParsedSection,
  SectionContent,
  TableRow,
} from '../types/sections.js';

export interface RirekishoOptions {
  readonly paperSize: PaperSize;
  readonly chronologicalOrder?: ChronologicalOrder;
}

export interface RirekishoInput {
  readonly metadata: CVMetadata;
  readonly sections: readonly ParsedSection[];
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

type RirekishoPaperSize = 'a3' | 'b4';

const DIM: Record<RirekishoPaperSize, { w: number; h: number }> = {
  a3: { w: 420, h: 297 },
  b4: { w: 364, h: 257 },
};

function css(size: RirekishoPaperSize): string {
  const d = DIM[size];
  const s = size === 'b4' ? 0.86 : 1;
  const margin = 25;
  const centerGap = 12 * s;
  const pageW = (d.w - margin * 2 - centerGap) / 2;
  const thinBorder = '0.5px';
  const thickBorder = '2.0px';

  return `
@page{size:${d.w}mm ${d.h}mm landscape;margin:0}
*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:"Noto Serif JP","Yu Mincho","MS Mincho",serif;font-size:${10 * s}pt;color:#000;background:#fff}
.spread{width:${d.w}mm;height:${d.h}mm;display:flex;padding:${margin}mm;overflow:hidden;background:#fff}
.left,.right{width:${pageW}mm;height:${d.h - margin * 2}mm;overflow:hidden}
.left{margin-right:${centerGap / 2}mm}
.right{margin-left:${centerGap / 2}mm}
table{width:100%;border-collapse:collapse}
td,th{border:${thinBorder} solid #000;padding:0;vertical-align:middle;font-weight:normal;height:${8.5 * s}mm}
.nb{border:none!important}.nbt{border-top:none!important}.nbb{border-bottom:none!important}.nbl{border-left:none!important}.nbr{border-right:none!important}
.btk{border-top:${thickBorder} solid #000!important}.bbk{border-bottom:${thickBorder} solid #000!important}.blk{border-left:${thickBorder} solid #000!important}.brk{border-right:${thickBorder} solid #000!important}
.c{text-align:center}.l{text-align:left}.r{text-align:right}.vt{vertical-align:top}.vm{vertical-align:middle}
.sm{font-size:${8 * s}pt}.xs{font-size:${7 * s}pt}.xxs{font-size:${6 * s}pt}.bold{font-weight:bold}
.title{font-size:${22 * s}pt;letter-spacing:${6 * s}mm}.name-large{font-size:${16 * s}pt}
.pad{padding:${1 * s}mm ${2 * s}mm}.year-col{width:${18.75 * s}mm}.month-col{width:${10.5 * s}mm}
.photo-box{width:${30 * s}mm;height:${40 * s}mm;border:${thinBorder} solid #000;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;font-size:${6 * s}pt;line-height:1.4;text-align:center;padding-top:${2 * s}mm}
.cell{display:flex;align-items:center;border:${thinBorder} solid #000;min-height:${7 * s}mm}
.cell.thick-top{border-top-width:${thickBorder}}.cell.thick-bottom{border-bottom-width:${thickBorder}}.cell.thick-left{border-left-width:${thickBorder}}.cell.thick-right{border-right-width:${thickBorder}}
.cell.no-top{border-top:none}.cell.no-bottom{border-bottom:none}.cell.no-left{border-left:none}.cell.no-right{border-right:none}
.cell .lbl{width:${14 * s}mm;font-size:${7 * s}pt;text-align:center;flex-shrink:0;align-self:stretch;display:flex;align-items:center;justify-content:center}
.cell .val{flex:1;padding:${1 * s}mm ${2 * s}mm}.cell .val.lg{font-size:${16 * s}pt}
@media print{html,body{width:${d.w}mm;height:${d.h}mm;overflow:hidden!important;max-height:${d.h}mm!important}*{page-break-inside:avoid}.spread{page-break-after:always;page-break-before:avoid}}
@media screen{html{height:100%}body{background:#888;min-height:100%;display:flex;align-items:center;justify-content:center;padding:20px}.spread{box-shadow:0 2px 12px rgba(0,0,0,.5);flex-shrink:0}}
`;
}

function parseDateOfBirth(str: string): { year: number; month: number; day: number } | null {
  if (!str) return null;
  const s = str.trim();
  let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (m) return { year: parseInt(m[1]!, 10), month: parseInt(m[2]!, 10), day: parseInt(m[3]!, 10) };
  m = s.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
  if (m) return { year: parseInt(m[1]!, 10), month: parseInt(m[2]!, 10), day: parseInt(m[3]!, 10) };
  m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (m) return { year: parseInt(m[3]!, 10), month: parseInt(m[1]!, 10), day: parseInt(m[2]!, 10) };
  return null;
}

function calculateAge(dob: { year: number; month: number; day: number }, refDate: Date): number {
  let age = refDate.getFullYear() - dob.year;
  const monthDiff = refDate.getMonth() + 1 - dob.month;
  if (monthDiff < 0 || (monthDiff === 0 && refDate.getDate() < dob.day)) age--;
  return age;
}

function formatDateJapanese(d: { year: number; month: number; day: number }): {
  year: string;
  month: string;
  day: string;
} {
  return { year: String(d.year), month: String(d.month), day: String(d.day) };
}

/**
 * Parse date string in various formats (YYYY-MM, YYYY年M月, etc.)
 */
function parseJapaneseDate(str: string): { year: string; month: string } | null {
  if (!str) return null;
  const s = str.trim();

  // YYYY-MM format
  let m = s.match(/^(\d{4})-(\d{1,2})/);
  if (m) return { year: m[1]!, month: m[2]! };

  // YYYY年M月 format
  m = s.match(/^(\d{4})年(\d{1,2})月/);
  if (m) return { year: m[1]!, month: m[2]! };

  // YYYY/MM format
  m = s.match(/^(\d{4})\/(\d{1,2})/);
  if (m) return { year: m[1]!, month: m[2]! };

  return null;
}

function calculateEmailFontSize(email: string, cellWidthMm: number, scale: number): number {
  const maxFontPt = 10 * scale;
  const minFontPt = 6 * scale;
  const paddingMm = 7;
  const availableWidthMm = cellWidthMm - paddingMm;
  const charWidthFactor = 0.18;
  const requiredFontPt = availableWidthMm / (email.length * charWidthFactor);
  return Math.max(minFontPt, Math.min(maxFontPt, requiredFontPt));
}

function extractTableRows(content: SectionContent): TableRow[] {
  if (content.type === 'table') return [...content.rows];
  return [];
}

/**
 * Extract education entries as table rows for rirekisho
 */
function educationToTableRows(entries: readonly EducationEntry[]): TableRow[] {
  const rows: TableRow[] = [];
  for (const entry of entries) {
    // Parse start date
    if (entry.start) {
      const parsed = parseJapaneseDate(entry.start);
      if (parsed) {
        rows.push({
          year: parsed.year,
          month: parsed.month,
          content: `${entry.school}${entry.degree ? ' ' + entry.degree : ''} 入学`,
        });
      }
    }
    // Parse end date
    if (entry.end) {
      const parsed = parseJapaneseDate(entry.end);
      if (parsed) {
        const suffix = entry.degree?.includes('修士') ? '修了' : '卒業';
        rows.push({
          year: parsed.year,
          month: parsed.month,
          content: `${entry.school}${entry.degree ? ' ' + entry.degree : ''} ${suffix}`,
        });
      }
    }
  }
  return rows;
}

/**
 * Extract experience entries as table rows for rirekisho
 */
function experienceToTableRows(entries: readonly ExperienceEntry[]): TableRow[] {
  const rows: TableRow[] = [];
  for (const entry of entries) {
    for (const role of entry.roles) {
      // Parse start date
      if (role.start) {
        const parsed = parseJapaneseDate(role.start);
        if (parsed) {
          rows.push({
            year: parsed.year,
            month: parsed.month,
            content: `${entry.company} 入社`,
          });
        }
      }
      // Parse end date (if not present)
      if (role.end && role.end.toLowerCase() !== 'present' && role.end !== '現在') {
        const parsed = parseJapaneseDate(role.end);
        if (parsed) {
          rows.push({
            year: parsed.year,
            month: parsed.month,
            content: '一身上の都合により退職',
          });
        }
      }
    }
  }
  return rows;
}

/**
 * Extract certification entries as table rows for rirekisho
 */
function certificationsToTableRows(entries: readonly CertificationEntry[]): TableRow[] {
  const rows: TableRow[] = [];
  for (const entry of entries) {
    if (entry.date) {
      const parsed = parseJapaneseDate(entry.date);
      if (parsed) {
        rows.push({
          year: parsed.year,
          month: parsed.month,
          content: entry.name,
        });
      } else {
        // Try year only format
        const yearMatch = entry.date.match(/^(\d{4})$/);
        if (yearMatch) {
          rows.push({
            year: yearMatch[1]!,
            month: '',
            content: entry.name,
          });
        } else {
          rows.push({ year: '', month: '', content: entry.name });
        }
      }
    } else {
      rows.push({ year: '', month: '', content: entry.name });
    }
  }
  return rows;
}

/**
 * Sort table rows by date
 * @param rows - Table rows to sort
 * @param order - 'asc' for oldest first, 'desc' for newest first
 */
function sortTableRows(rows: TableRow[], order: ChronologicalOrder): TableRow[] {
  return [...rows].sort((a, b) => {
    const yearA = parseInt(a.year, 10) || 0;
    const yearB = parseInt(b.year, 10) || 0;
    const monthA = parseInt(a.month, 10) || 0;
    const monthB = parseInt(b.month, 10) || 0;

    const dateA = yearA * 100 + monthA;
    const dateB = yearB * 100 + monthB;

    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

function buildHistory(
  sections: readonly ParsedSection[],
  order: ChronologicalOrder = 'asc',
): Array<[string, string, string]> {
  const rows: Array<[string, string, string]> = [];
  const edu = sections.find((s) => s.id === 'education');
  if (edu) {
    rows.push(['', '', '学歴']);
    let tableRows: TableRow[];
    if (edu.content.type === 'education') {
      tableRows = educationToTableRows(edu.content.entries);
    } else {
      tableRows = extractTableRows(edu.content);
    }
    // Sort education rows
    tableRows = sortTableRows(tableRows, order);
    for (const row of tableRows) {
      rows.push([row.year, row.month, row.content]);
    }
  }
  const work = sections.find((s) => s.id === 'experience');
  if (work) {
    rows.push(['', '', '職歴']);
    let tableRows: TableRow[];
    if (work.content.type === 'experience') {
      tableRows = experienceToTableRows(work.content.entries);
    } else {
      tableRows = extractTableRows(work.content);
    }
    // Sort experience rows
    tableRows = sortTableRows(tableRows, order);
    for (const row of tableRows) {
      rows.push([row.year, row.month, row.content]);
    }
  }
  if (!rows.some((r) => r[2] === '現在に至る')) rows.push(['', '', '現在に至る']);
  if (!rows.some((r) => r[2] === '以上')) rows.push(['', '', '以上']);
  return rows;
}

function buildLicense(
  sections: readonly ParsedSection[],
  order: ChronologicalOrder = 'asc',
): Array<[string, string, string]> {
  const sec = sections.find((s) => s.id === 'certifications');
  if (!sec) return [];
  let tableRows: TableRow[];
  if (sec.content.type === 'certifications') {
    tableRows = certificationsToTableRows(sec.content.entries);
  } else {
    tableRows = extractTableRows(sec.content);
  }
  // Sort certification rows
  tableRows = sortTableRows(tableRows, order);
  return tableRows.map((row) => [row.year, row.month, row.content]);
}

function getText(sections: readonly ParsedSection[], ids: string[]): string {
  for (const id of ids) {
    const sec = sections.find((s) => s.id === id);
    if (sec && sec.content.type === 'text') {
      return escapeHtml(sec.content.text);
    }
  }
  return '';
}

function historyRows(
  data: Array<[string, string, string]>,
  count: number,
  isOuter: boolean,
): string {
  return Array.from({ length: count }, (_, i) => {
    const d = data[i];
    const align =
      d && (d[2] === '学歴' || d[2] === '職歴')
        ? 'c'
        : d && (d[2] === '以上' || d[2] === '現在に至る')
          ? 'r pad'
          : 'l pad';
    const isLast = i === count - 1;
    const leftBorder = isOuter ? 'blk' : '';
    const rightBorder = isOuter ? 'brk' : '';
    const bottomBorder = isLast && isOuter ? 'bbk' : '';
    return `<tr><td class="year-col c vm ${leftBorder} ${bottomBorder}">${d?.[0] ?? ''}</td><td class="month-col c vm ${bottomBorder}">${d?.[1] ?? ''}</td><td class="${align} vm ${rightBorder} ${bottomBorder}">${d?.[2] ?? ''}</td></tr>`;
  }).join('');
}

function licenseRows(data: Array<[string, string, string]>, count: number): string {
  return Array.from({ length: count }, (_, i) => {
    const d = data[i];
    const isLast = i === count - 1;
    const bottomBorder = isLast ? 'bbk' : '';
    return `<tr><td class="year-col c vm blk ${bottomBorder}">${d?.[0] ?? ''}</td><td class="month-col c vm ${bottomBorder}">${d?.[1] ?? ''}</td><td class="l pad vm brk ${bottomBorder}">${d?.[2] ?? ''}</td></tr>`;
  }).join('');
}

export function generateRirekishoHTML(resume: RirekishoInput, options: RirekishoOptions): string {
  const paperSize = options.paperSize;
  const size: RirekishoPaperSize = paperSize === 'b4' ? 'b4' : 'a3';
  const s = size === 'b4' ? 0.86 : 1;
  const m = resume.metadata;

  const name = escapeHtml(m.name_ja ?? m.name);
  const furi = escapeHtml(m.name_furigana ?? '');
  const phone = m.phone_number ? escapeHtml(m.phone_number) : '';
  const phone2 = m.phone_number2 ? escapeHtml(m.phone_number2) : '';
  const loc = m.home_address ? escapeHtml(m.home_address) : '';
  const locFuri = escapeHtml(m.home_address_furigana ?? '');
  const postCode = escapeHtml(m.post_code ?? '');
  const loc2 = escapeHtml(m.home_address2 ?? '');
  const loc2Furi = escapeHtml(m.home_address2_furigana ?? '');
  const postCode2 = escapeHtml(m.post_code2 ?? '');
  const email = escapeHtml(m.email_address);
  const email2 = escapeHtml(m.email_address2 ?? '');

  const genderRaw = (m.gender ?? '').toLowerCase();
  const isMale = genderRaw === '男' || genderRaw === 'male' || genderRaw === 'm';
  const isFemale = genderRaw === '女' || genderRaw === 'female' || genderRaw === 'f';
  const genderDisplay = isMale ? '男' : isFemale ? '女' : escapeHtml(m.gender ?? '');

  const today = new Date();
  const presentDate = {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };
  const dobParsed = m.dob ? parseDateOfBirth(m.dob) : null;
  const dobFormatted = dobParsed ? formatDateJapanese(dobParsed) : { year: '', month: '', day: '' };
  const age = dobParsed ? calculateAge(dobParsed, today) : '';

  const hist = buildHistory(resume.sections, options.chronologicalOrder ?? 'asc');
  const lic = buildLicense(resume.sections, options.chronologicalOrder ?? 'asc');
  const motiv = getText(resume.sections, ['motivation']);
  const pref = getText(resume.sections, ['notes']);

  const leftHistoryRows = size === 'b4' ? 15 : 17;
  const rightHistoryRows = 9;
  const licenseRowCount = 6;
  const motivRows = 7;
  const photoW = 62 * s;
  const contactW = 45 * s;
  const emailFontSize = calculateEmailFontSize(m.email_address, contactW, s);
  const email2FontSize = m.email_address2
    ? calculateEmailFontSize(m.email_address2, contactW, s)
    : emailFontSize;
  const thinBorder = '0.5px';
  const thickBorder = '2.0px';
  const grayBorder = `${thinBorder} solid #ccc`;
  const thinBlack = `${thinBorder} solid #000`;
  const thickBlack = `${thickBorder} solid #000`;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>${name} - 履歴書</title>
<style>${css(size)}</style>
</head>
<body class="rirekisho">
<div class="spread">
<div class="left" style="display:flex;flex-direction:column">
<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:${3 * s}mm">
<span class="title bold">履歴書</span>
<span style="margin-right:${photoW}mm;font-size:${9 * s}pt">${presentDate.year} 年 ${presentDate.month} 月 ${presentDate.day} 日現在</span>
</div>
<div style="display:flex;position:relative">
<div style="flex:1">
<div class="cell thick-top thick-left thick-right" style="margin-right:${photoW}mm">
<div class="lbl">ふりがな</div>
<div class="val sm">${furi}</div>
</div>
<div class="cell no-top thick-left thick-right" style="height:${16 * s}mm;margin-right:${photoW}mm">
<div class="lbl">氏&#x3000;名</div>
<div class="val lg">${name}</div>
</div>
<div class="cell no-top thick-left thick-right no-bottom" style="margin-right:${photoW}mm;display:flex;padding:0">
<div class="lbl"></div>
<div class="val" style="flex:1;display:flex;align-items:center;font-size:${9 * s}pt">
<span>${dobFormatted.year ? dobFormatted.year + ' 年 ' : '&#x3000;&#x3000;&#x3000;&#x3000;年 '}${dobFormatted.month ? dobFormatted.month + ' 月 ' : '&#x3000;&#x3000;月 '}${dobFormatted.day ? dobFormatted.day + ' 日生' : '&#x3000;&#x3000;日生'}（満 ${age !== '' ? age : '&#x3000;&#x3000;'} 歳）</span>
</div>
<div style="width:${33 * s}mm;border-left:${thinBlack};display:flex;align-items:center;padding:0 ${2 * s}mm;align-self:stretch">
<span class="xs">※性別</span>
<span class="sm" style="margin-left:${2 * s}mm">${genderDisplay}</span>
</div>
</div>
<div style="border-top:${thickBlack}"></div>
<div style="display:flex;height:${21 * s}mm">
<div class="cell thick-left no-right no-bottom" style="flex:1;align-items:flex-start;border-top:none;border-bottom:${thinBlack};flex-direction:column">
<div style="display:flex;width:100%;height:${7.2 * s}mm;border-bottom:${grayBorder};align-items:center">
<div class="lbl xs" style="padding-left:${2 * s}mm;align-items:center;justify-content:flex-start">ふりがな</div>
<div class="val sm">${locFuri}</div>
</div>
<div style="display:flex;width:100%;flex:1;flex-direction:column">
<div style="display:flex;align-items:center;padding:${1 * s}mm 0 0 ${2 * s}mm">
<span class="xs">現住所</span>
<span class="xs" style="margin-left:${4 * s}mm">〒${postCode}</span>
</div>
<div style="flex:1;display:flex;align-items:center;padding:0 ${2 * s}mm 0 ${10 * s}mm;font-size:${12 * s}pt">${loc}</div>
</div>
</div>
<div style="width:${contactW}mm;border:${thickBlack};border-top:none;border-left:${thinBlack};border-bottom:${thinBlack};display:flex;flex-direction:column">
<div style="height:${7.2 * s}mm;border-bottom:${grayBorder};display:flex;align-items:center;justify-content:center;position:relative">
<span class="xs" style="position:absolute;top:50%;left:${1 * s}mm;transform:translateY(-50%)">電話</span>
<span class="sm">${phone}</span>
</div>
<div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative">
<span class="xs" style="position:absolute;top:${1 * s}mm;left:${1 * s}mm">E-mail</span>
<span style="font-size:${emailFontSize}pt">${email}</span>
</div>
</div>
</div>
<div style="display:flex;height:${21 * s}mm">
<div class="cell thick-bottom thick-left no-right no-top" style="flex:1;align-items:flex-start;flex-direction:column">
<div style="display:flex;width:100%;height:${7.2 * s}mm;border-bottom:${grayBorder};align-items:center">
<div class="lbl xs" style="padding-left:${2 * s}mm;align-items:center;justify-content:flex-start">ふりがな</div>
<div class="val sm">${loc2Furi}</div>
</div>
<div style="display:flex;width:100%;flex:1;flex-direction:column;position:relative">
<div style="display:flex;align-items:center;padding:${1 * s}mm 0 0 ${2 * s}mm">
<span class="xs">連絡先</span>
<span class="xs" style="margin-left:${4 * s}mm">〒${postCode2}</span>
<span class="xxs" style="position:absolute;top:${1 * s}mm;right:${2 * s}mm">（現住所以外に連絡を希望する場合のみ記入）</span>
</div>
<div style="flex:1;display:flex;align-items:center;padding:0 ${2 * s}mm 0 ${10 * s}mm;font-size:${12 * s}pt">${loc2}</div>
</div>
</div>
<div style="width:${contactW}mm;border:${thickBlack};border-top:none;border-left:${thinBlack};display:flex;flex-direction:column">
<div style="height:${7.2 * s}mm;border-bottom:${grayBorder};display:flex;align-items:center;justify-content:center;position:relative">
<span class="xs" style="position:absolute;top:50%;left:${1 * s}mm;transform:translateY(-50%)">電話</span>
<span class="sm">${phone2}</span>
</div>
<div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative">
<span class="xs" style="position:absolute;top:${1 * s}mm;left:${1 * s}mm">E-mail</span>
<span style="font-size:${email2FontSize}pt">${email2}</span>
</div>
</div>
</div>
</div>
<div style="position:absolute;right:0;top:${-14 * s}mm;width:${photoW}mm">
<div class="photo-box" style="margin:0 auto;justify-content:center">
<div style="margin-bottom:${1 * s}mm">写真をはる位置</div>
<div style="font-size:${5.5 * s}pt;line-height:1.5">写真をはる必要が<br>ある場合<br>1. 縦 36〜40mm<br>横 24〜30mm<br>2. 本人単身胸から上<br>3. 裏面のりづけ</div>
</div>
</div>
</div>
<div style="margin-top:${3 * s}mm;flex:1;display:flex;flex-direction:column">
<table style="flex:1">
<colgroup><col class="year-col"><col class="month-col"><col></colgroup>
<tr><td class="c blk btk" style="font-size:${10 * s}pt">年</td><td class="c btk" style="font-size:${10 * s}pt">月</td><td class="c brk btk" style="font-size:${10 * s}pt">学 歴 ・ 職 歴</td></tr>
${historyRows(hist.slice(0, leftHistoryRows), leftHistoryRows, true)}
</table>
<div style="font-size:${6 * s}pt;height:${4 * s}mm;display:flex;align-items:center">※「性別」欄：記載は任意です。未記載とすることも可能です。</div>
</div>
</div>
<div class="right" style="display:flex;flex-direction:column">
<table>
<colgroup><col class="year-col"><col class="month-col"><col></colgroup>
<tr><td class="c blk btk" style="font-size:${10 * s}pt">年</td><td class="c btk" style="font-size:${10 * s}pt">月</td><td class="c brk btk" style="font-size:${10 * s}pt">学 歴 ・ 職 歴</td></tr>
${historyRows(hist.slice(leftHistoryRows), rightHistoryRows, true)}
</table>
<table style="margin-top:${3 * s}mm">
<colgroup><col class="year-col"><col class="month-col"><col></colgroup>
<tr><td class="c blk btk" style="font-size:${10 * s}pt">年</td><td class="c btk" style="font-size:${10 * s}pt">月</td><td class="c brk btk" style="font-size:${10 * s}pt">免許・資格</td></tr>
${licenseRows(lic, licenseRowCount)}
</table>
<div style="margin-top:${3 * s}mm;border:${thickBlack}">
<div style="padding:${1 * s}mm;border-bottom:${thinBlack};font-size:${10 * s}pt">志望の動機、特技、自己PR、アピールポイントなど</div>
<div style="min-height:${(motivRows - 1) * 7 * s}mm;padding:${2 * s}mm" class="sm">${motiv}</div>
</div>
<div style="margin-top:${3 * s}mm;flex:1;display:flex;flex-direction:column">
<div style="border:${thickBlack};flex:1;display:flex;flex-direction:column">
<div style="padding:${1 * s}mm;border-bottom:${thinBlack};font-size:${10 * s}pt">本人希望記入欄<span style="font-size:${8 * s}pt">（特に給料・職種・勤務時間・勤務地・その他についての希望などがあれば記入）</span></div>
<div style="flex:1;padding:${2 * s}mm" class="sm">${pref}</div>
</div>
<div style="height:${3.2 * s}mm"></div>
</div>
</div>
</div>
</body>
</html>`;
}
