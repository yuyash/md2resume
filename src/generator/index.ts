/**
 * Output Generator module
 * Generates PDF and HTML outputs
 */

import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';

import type { Logger } from '../cli/index.js';
import type {
  ChronologicalOrder,
  OutputFormat,
  OutputType,
  PaperSize,
  ResolvedConfig,
} from '../types/config.js';
import type { CVMetadata } from '../types/metadata.js';
import type { ParsedSection } from '../types/sections.js';
import { generateCVEnHTML } from './resume_en.js';
import { generateCVJaHTML } from './resume_ja.js';
import { generateRirekishoHTML } from './rirekisho-mhlw.js';

// Re-export generators
export { generateCVEnHTML, generateCVJaHTML, generateRirekishoHTML };

/**
 * Input for CV generation (internal type)
 */
interface CVInput {
  readonly metadata: CVMetadata;
  readonly sections: readonly ParsedSection[];
}

/**
 * Page size dimensions in mm
 */
export const PAGE_SIZES: Record<PaperSize, { width: number; height: number }> = {
  a3: { width: 420, height: 297 },
  a4: { width: 210, height: 297 },
  b4: { width: 364, height: 257 },
  b5: { width: 176, height: 250 },
  letter: { width: 215.9, height: 279.4 },
};

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Detect language from CV content
 */
function detectLanguage(cv: CVInput): 'en' | 'ja' {
  // Check if name_ja exists or if sections have Japanese titles
  if (cv.metadata.name_ja) return 'ja';

  for (const section of cv.sections) {
    // Check for Japanese characters in title
    if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(section.title)) {
      return 'ja';
    }
  }

  return 'en';
}

/**
 * Generate HTML for CV format
 */
function generateCVHTML(
  cv: CVInput,
  paperSize: PaperSize,
  _chronologicalOrder?: ChronologicalOrder,
): string {
  const language = detectLanguage(cv);
  // TODO: Add chronological order support for CV format

  if (language === 'ja') {
    return generateCVJaHTML(cv, { paperSize });
  }
  return generateCVEnHTML(cv, { paperSize });
}

/**
 * Generate PDF from HTML
 */
async function generatePDF(
  html: string,
  paperSize: PaperSize,
  isRirekisho: boolean,
): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: ['load', 'networkidle0'] });

    const size = PAGE_SIZES[paperSize];

    let pdfOptions: Parameters<typeof page.pdf>[0];

    if (isRirekisho) {
      // Rirekisho uses landscape A3/B4
      const rirekishoSize = paperSize === 'b4' ? PAGE_SIZES.b4 : PAGE_SIZES.a3;
      await page.setViewport({
        width: Math.round(rirekishoSize.width * 3.78),
        height: Math.round(rirekishoSize.height * 3.78),
        deviceScaleFactor: 2,
      });

      pdfOptions = {
        width: `${rirekishoSize.width}mm`,
        height: `${rirekishoSize.height}mm`,
        printBackground: true,
        margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
        preferCSSPageSize: false,
        scale: 1,
      };
    } else {
      pdfOptions = {
        width: `${size.width}mm`,
        height: `${size.height}mm`,
        printBackground: true,
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
        preferCSSPageSize: true,
      };
    }

    const pdfUint8Array = await page.pdf(pdfOptions);
    return Buffer.from(pdfUint8Array);
  } finally {
    await browser.close();
  }
}

/**
 * Generate output files
 */
export async function generateOutput(
  cv: CVInput,
  config: ResolvedConfig,
  logger: Logger,
): Promise<string[]> {
  const generatedFiles: string[] = [];
  const formats: OutputFormat[] = config.format === 'both' ? ['cv', 'rirekisho'] : [config.format];
  const outputTypes: OutputType[] =
    config.outputType === 'both' ? ['html', 'pdf'] : [config.outputType];

  // Ensure output directory exists
  const outputDir = path.dirname(config.output);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const format of formats) {
    logger.debug(`Generating ${format}...`);

    // Determine chronological order
    // rirekisho always uses 'asc' (oldest first), cv uses config value or defaults to 'desc'
    const chronologicalOrder: ChronologicalOrder =
      format === 'rirekisho' ? 'asc' : (config.chronologicalOrder ?? 'desc');

    // Generate HTML
    let html: string;
    if (format === 'rirekisho') {
      html = generateRirekishoHTML(cv, { paperSize: config.paperSize, chronologicalOrder });
    } else {
      html = generateCVHTML(cv, config.paperSize, chronologicalOrder);
    }

    const baseName = path.basename(config.output);
    const suffix = format === 'rirekisho' ? '_rirekisho' : '_cv';

    for (const outputType of outputTypes) {
      const ext = outputType === 'pdf' ? '.pdf' : '.html';
      const outputPath = path.join(outputDir, `${baseName}${suffix}${ext}`);

      if (outputType === 'html') {
        fs.writeFileSync(outputPath, html, 'utf-8');
      } else {
        const pdfBuffer = await generatePDF(html, config.paperSize, format === 'rirekisho');
        fs.writeFileSync(outputPath, pdfBuffer);
      }

      generatedFiles.push(outputPath);
      logger.debug(`Generated: ${outputPath}`);
    }
  }

  return generatedFiles;
}

export default generateOutput;
