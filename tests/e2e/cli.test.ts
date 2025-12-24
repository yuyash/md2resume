/**
 * CLI E2E Tests - Full Pattern Coverage
 * Tests all CLI options and combinations
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const OUTPUT_DIR = path.join(__dirname, 'output');
const CLI_PATH = path.join(__dirname, '../../dist/bin.js');

// Helper to run CLI command
function runCLI(args: string): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execSync(`node ${CLI_PATH} ${args}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (error) {
    const e = error as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: e.stdout ?? '',
      stderr: e.stderr ?? '',
      exitCode: e.status ?? 1,
    };
  }
}

// Helper to check if file exists
function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

// Helper to clean output directory
function cleanOutput(): void {
  // if (fs.existsSync(OUTPUT_DIR)) {
  //   const files = fs.readdirSync(OUTPUT_DIR);
  //   for (const file of files) {
  //     const filePath = path.join(OUTPUT_DIR, file);
  //     if (fs.statSync(filePath).isFile()) {
  //       fs.unlinkSync(filePath);
  //     }
  //   }
  // }
}

describe('CLI E2E Tests', () => {
  beforeAll(() => {
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    // Build the project first
    execSync('npm run build', { cwd: path.join(__dirname, '../..'), stdio: 'ignore' });
  });

  afterAll(() => {
    // cleanOutput();
  });

  describe('Basic Options', () => {
    it('should show version with --version', () => {
      const result = runCLI('--version');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('should show help with --help', () => {
      const result = runCLI('--help');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('md2cv');
      expect(result.stdout).toContain('-i, --input');
      expect(result.stdout).toContain('-o, --output');
      expect(result.stdout).toContain('-f, --format');
      expect(result.stdout).toContain('-t, --output-type');
      expect(result.stdout).toContain('-p, --paper-size');
      expect(result.stdout).toContain('-c, --config');
      expect(result.stdout).toContain('--log-format');
      expect(result.stdout).toContain('--debug');
    });

    it('should fail without required -i option', () => {
      const result = runCLI('');
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('--input');
    });

    it('should fail with non-existent input file', () => {
      const result = runCLI('-i /non/existent/file.md');
      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('not found');
    });
  });

  describe('Output Format (-f, --format)', () => {
    beforeAll(() => cleanOutput());

    it('should generate cv format (default)', () => {
      const output = path.join(OUTPUT_DIR, 'format-default');
      const input = path.join(FIXTURES_DIR, 'resume-short-en.md');
      const result = runCLI(`-i ${input} -o ${output}`);

      expect(result.exitCode).toBe(0);
      expect(fileExists(`${output}_cv.pdf`)).toBe(true);
    });

    it('should generate cv format with -f cv', () => {
      const output = path.join(OUTPUT_DIR, 'format-cv');
      const input = path.join(FIXTURES_DIR, 'resume-short-en.md');
      const result = runCLI(`-i ${input} -o ${output} -f cv`);

      expect(result.exitCode).toBe(0);
      expect(fileExists(`${output}_cv.pdf`)).toBe(true);
    });

    it('should generate rirekisho format with -f rirekisho', () => {
      const output = path.join(OUTPUT_DIR, 'format-rirekisho');
      const input = path.join(FIXTURES_DIR, 'resume-rirekisho-ja.md');
      const result = runCLI(`-i ${input} -o ${output} -f rirekisho -p a3`);

      expect(result.exitCode).toBe(0);
      expect(fileExists(`${output}_rirekisho.pdf`)).toBe(true);
    });

    it('should generate both formats with -f both', () => {
      const output = path.join(OUTPUT_DIR, 'format-both');
      const input = path.join(FIXTURES_DIR, 'resume-rirekisho-ja.md');
      const result = runCLI(`-i ${input} -o ${output} -f both -p a3`);

      expect(result.exitCode).toBe(0);
      expect(fileExists(`${output}_cv.pdf`)).toBe(true);
      expect(fileExists(`${output}_rirekisho.pdf`)).toBe(true);
    });
  });

  describe('Output Type (-t, --output-type)', () => {
    beforeAll(() => cleanOutput());

    it('should generate PDF (default)', () => {
      const output = path.join(OUTPUT_DIR, 'type-default');
      const input = path.join(FIXTURES_DIR, 'resume-short-en.md');
      const result = runCLI(`-i ${input} -o ${output}`);

      expect(result.exitCode).toBe(0);
      expect(fileExists(`${output}_cv.pdf`)).toBe(true);
      expect(fileExists(`${output}_cv.html`)).toBe(false);
    });

    it('should generate PDF with -t pdf', () => {
      const output = path.join(OUTPUT_DIR, 'type-pdf');
      const input = path.join(FIXTURES_DIR, 'resume-short-en.md');
      const result = runCLI(`-i ${input} -o ${output} -t pdf`);

      expect(result.exitCode).toBe(0);
      expect(fileExists(`${output}_cv.pdf`)).toBe(true);
    });

    it('should generate HTML with -t html', () => {
      const output = path.join(OUTPUT_DIR, 'type-html');
      const input = path.join(FIXTURES_DIR, 'resume-short-en.md');
      const result = runCLI(`-i ${input} -o ${output} -t html`);

      expect(result.exitCode).toBe(0);
      expect(fileExists(`${output}_cv.html`)).toBe(true);
      expect(fileExists(`${output}_cv.pdf`)).toBe(false);
    });

    it('should generate both PDF and HTML with -t both', () => {
      const output = path.join(OUTPUT_DIR, 'type-both');
      const input = path.join(FIXTURES_DIR, 'resume-short-en.md');
      const result = runCLI(`-i ${input} -o ${output} -t both`);

      expect(result.exitCode).toBe(0);
      expect(fileExists(`${output}_cv.pdf`)).toBe(true);
      expect(fileExists(`${output}_cv.html`)).toBe(true);
    });
  });

  describe('Paper Size (-p, --paper-size)', () => {
    beforeAll(() => cleanOutput());

    it('should use A4 paper size (default)', () => {
      const output = path.join(OUTPUT_DIR, 'paper-default');
      const input = path.join(FIXTURES_DIR, 'resume-short-en.md');
      const result = runCLI(`-i ${input} -o ${output}`);

      expect(result.exitCode).toBe(0);
      expect(fileExists(`${output}_cv.pdf`)).toBe(true);
    });

    it('should use A4 paper size with -p a4', () => {
      const output = path.join(OUTPUT_DIR, 'paper-a4');
      const input = path.join(FIXTURES_DIR, 'resume-short-en.md');
      const result = runCLI(`-i ${input} -o ${output} -p a4`);

      expect(result.exitCode).toBe(0);
      expect(fileExists(`${output}_cv.pdf`)).toBe(true);
    });

    it('should use A3 paper size with -p a3', () => {
      const output = path.join(OUTPUT_DIR, 'paper-a3');
      const input = path.join(FIXTURES_DIR, 'resume-rirekisho-ja.md');
      const result = runCLI(`-i ${input} -o ${output} -f rirekisho -p a3`);

      expect(result.exitCode).toBe(0);
      expect(fileExists(`${output}_rirekisho.pdf`)).toBe(true);
    });

    it('should use B4 paper size with -p b4', () => {
      const output = path.join(OUTPUT_DIR, 'paper-b4');
      const input = path.join(FIXTURES_DIR, 'resume-rirekisho-ja.md');
      const result = runCLI(`-i ${input} -o ${output} -f rirekisho -p b4`);

      expect(result.exitCode).toBe(0);
      expect(fileExists(`${output}_rirekisho.pdf`)).toBe(true);
    });

    it('should use B5 paper size with -p b5', () => {
      const output = path.join(OUTPUT_DIR, 'paper-b5');
      const input = path.join(FIXTURES_DIR, 'resume-short-en.md');
      const result = runCLI(`-i ${input} -o ${output} -p b5`);

      expect(result.exitCode).toBe(0);
      expect(fileExists(`${output}_cv.pdf`)).toBe(true);
    });

    it('should use Letter paper size with -p letter', () => {
      const output = path.join(OUTPUT_DIR, 'paper-letter');
      const input = path.join(FIXTURES_DIR, 'resume-short-en.md');
      const result = runCLI(`-i ${input} -o ${output} -p letter`);

      expect(result.exitCode).toBe(0);
      expect(fileExists(`${output}_cv.pdf`)).toBe(true);
    });
  });

  describe('Config File (-c, --config)', () => {
    beforeAll(() => cleanOutput());

    it('should load JSON config file with explicit format override', () => {
      const output = path.join(OUTPUT_DIR, 'config-json');
      const input = path.join(FIXTURES_DIR, 'resume-rirekisho-ja.md');
      const config = path.join(FIXTURES_DIR, 'config-full.json');
      // Explicitly use -f both to test config file loading works
      const result = runCLI(`-i ${input} -o ${output} -c ${config} -f both -t both -p a3`);

      expect(result.exitCode).toBe(0);
      expect(fileExists(`${output}_cv.pdf`)).toBe(true);
      expect(fileExists(`${output}_cv.html`)).toBe(true);
      expect(fileExists(`${output}_rirekisho.pdf`)).toBe(true);
      expect(fileExists(`${output}_rirekisho.html`)).toBe(true);
    });

    it('should load YAML config file with explicit format override', () => {
      const output = path.join(OUTPUT_DIR, 'config-yaml');
      const input = path.join(FIXTURES_DIR, 'resume-rirekisho-ja.md');
      const config = path.join(FIXTURES_DIR, 'config-full.yaml');
      // Explicitly use -f both to test config file loading works
      const result = runCLI(`-i ${input} -o ${output} -c ${config} -f both -t both -p a3`);

      expect(result.exitCode).toBe(0);
      expect(fileExists(`${output}_cv.pdf`)).toBe(true);
      expect(fileExists(`${output}_cv.html`)).toBe(true);
      expect(fileExists(`${output}_rirekisho.pdf`)).toBe(true);
      expect(fileExists(`${output}_rirekisho.html`)).toBe(true);
    });

    it('should fail with non-existent config file', () => {
      const input = path.join(FIXTURES_DIR, 'resume-short-en.md');
      const result = runCLI(`-i ${input} -c /non/existent/config.json`);

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('not found');
    });

    it('should override config file with CLI options', () => {
      const output = path.join(OUTPUT_DIR, 'config-override');
      const input = path.join(FIXTURES_DIR, 'resume-short-en.md');
      const config = path.join(FIXTURES_DIR, 'config-full.json');
      // config has format: both, but CLI overrides to cv
      const result = runCLI(`-i ${input} -o ${output} -c ${config} -f cv -t pdf`);

      expect(result.exitCode).toBe(0);
      expect(fileExists(`${output}_cv.pdf`)).toBe(true);
      expect(fileExists(`${output}_rirekisho.pdf`)).toBe(false);
    });
  });

  describe('Log Format (--log-format)', () => {
    beforeAll(() => cleanOutput());

    it('should output text format logs (default)', () => {
      const output = path.join(OUTPUT_DIR, 'log-text');
      const input = path.join(FIXTURES_DIR, 'resume-short-en.md');
      const result = runCLI(`-i ${input} -o ${output} --debug`);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('DEBUG');
      expect(result.stdout).toContain('INFO');
      // Text format has timestamps like [2025-12-23 14:00:00.000 -0800]
      expect(result.stdout).toMatch(/\[\d{4}-\d{2}-\d{2}/);
    });

    it('should output text format logs with --log-format text', () => {
      const output = path.join(OUTPUT_DIR, 'log-text-explicit');
      const input = path.join(FIXTURES_DIR, 'resume-short-en.md');
      const result = runCLI(`-i ${input} -o ${output} --debug --log-format text`);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('DEBUG');
    });

    it('should output JSON format logs with --log-format json', () => {
      const output = path.join(OUTPUT_DIR, 'log-json');
      const input = path.join(FIXTURES_DIR, 'resume-short-en.md');
      const result = runCLI(`-i ${input} -o ${output} --debug --log-format json`);

      expect(result.exitCode).toBe(0);
      // JSON format should have structured output
      expect(result.stdout).toContain('"level":"DEBUG"');
      expect(result.stdout).toContain('"timestamp"');
      expect(result.stdout).toContain('"msg"');
    });
  });

  describe('Debug Mode (--debug, --verbose)', () => {
    beforeAll(() => cleanOutput());

    it('should not show debug logs without --debug', () => {
      const output = path.join(OUTPUT_DIR, 'debug-off');
      const input = path.join(FIXTURES_DIR, 'resume-short-en.md');
      const result = runCLI(`-i ${input} -o ${output} --log-format json`);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).not.toContain('"level":"DEBUG"');
      expect(result.stdout).toContain('"level":"INFO"');
    });

    it('should show debug logs with --debug', () => {
      const output = path.join(OUTPUT_DIR, 'debug-on');
      const input = path.join(FIXTURES_DIR, 'resume-short-en.md');
      const result = runCLI(`-i ${input} -o ${output} --debug --log-format json`);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('"level":"DEBUG"');
    });

    it('should show debug logs with --verbose', () => {
      const output = path.join(OUTPUT_DIR, 'verbose-on');
      const input = path.join(FIXTURES_DIR, 'resume-short-en.md');
      const result = runCLI(`-i ${input} -o ${output} --verbose --log-format json`);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('"level":"DEBUG"');
    });
  });

  describe('Language Detection', () => {
    beforeAll(() => cleanOutput());

    it('should generate English CV for English input', () => {
      const output = path.join(OUTPUT_DIR, 'lang-en');
      const input = path.join(FIXTURES_DIR, 'resume-short-en.md');
      const result = runCLI(`-i ${input} -o ${output} -t html`);

      expect(result.exitCode).toBe(0);
      const html = fs.readFileSync(`${output}_cv.html`, 'utf-8');
      expect(html).toContain('lang="en"');
    });

    it('should generate Japanese CV for Japanese input', () => {
      const output = path.join(OUTPUT_DIR, 'lang-ja');
      const input = path.join(FIXTURES_DIR, 'resume-short-ja.md');
      const result = runCLI(`-i ${input} -o ${output} -t html`);

      expect(result.exitCode).toBe(0);
      const html = fs.readFileSync(`${output}_cv.html`, 'utf-8');
      expect(html).toContain('lang="ja"');
    });
  });

  describe('Combined Options', () => {
    beforeAll(() => cleanOutput());

    it('should handle all options combined', () => {
      const output = path.join(OUTPUT_DIR, 'combined');
      const input = path.join(FIXTURES_DIR, 'resume-rirekisho-ja.md');
      const result = runCLI(
        `-i ${input} -o ${output} -f both -t both -p a3 --debug --log-format json`,
      );

      expect(result.exitCode).toBe(0);
      expect(fileExists(`${output}_cv.pdf`)).toBe(true);
      expect(fileExists(`${output}_cv.html`)).toBe(true);
      expect(fileExists(`${output}_rirekisho.pdf`)).toBe(true);
      expect(fileExists(`${output}_rirekisho.html`)).toBe(true);
      expect(result.stdout).toContain('"level":"DEBUG"');
    });
  });

  describe('Input Files', () => {
    beforeAll(() => cleanOutput());

    it('should process resume-short-en.md', () => {
      const output = path.join(OUTPUT_DIR, 'input-short-en');
      const input = path.join(FIXTURES_DIR, 'resume-short-en.md');
      const result = runCLI(`-i ${input} -o ${output}`);

      expect(result.exitCode).toBe(0);
    });

    it('should process resume-short-ja.md', () => {
      const output = path.join(OUTPUT_DIR, 'input-short-ja');
      const input = path.join(FIXTURES_DIR, 'resume-short-ja.md');
      const result = runCLI(`-i ${input} -o ${output}`);

      expect(result.exitCode).toBe(0);
    });

    it('should process resume-long-en.md', () => {
      const output = path.join(OUTPUT_DIR, 'input-long-en');
      const input = path.join(FIXTURES_DIR, 'resume-long-en.md');
      const result = runCLI(`-i ${input} -o ${output}`);

      expect(result.exitCode).toBe(0);
    });

    it('should process resume-long-ja.md', () => {
      const output = path.join(OUTPUT_DIR, 'input-long-ja');
      const input = path.join(FIXTURES_DIR, 'resume-long-ja.md');
      const result = runCLI(`-i ${input} -o ${output}`);

      expect(result.exitCode).toBe(0);
    });

    it('should process resume-rirekisho-ja.md as rirekisho', () => {
      const output = path.join(OUTPUT_DIR, 'input-rirekisho');
      const input = path.join(FIXTURES_DIR, 'resume-rirekisho-ja.md');
      const result = runCLI(`-i ${input} -o ${output} -f rirekisho -p a3`);

      expect(result.exitCode).toBe(0);
    });
  });

  describe('Output Path', () => {
    beforeAll(() => cleanOutput());

    it('should use input directory when output not specified', () => {
      const input = path.join(FIXTURES_DIR, 'resume-short-en.md');
      const result = runCLI(`-i ${input}`);

      expect(result.exitCode).toBe(0);
      // Output should be in fixtures directory
      const expectedOutput = path.join(FIXTURES_DIR, 'resume-short-en_cv.pdf');
      expect(fileExists(expectedOutput)).toBe(true);
      // Clean up
      fs.unlinkSync(expectedOutput);
    });

    it('should create output directory if not exists', () => {
      const output = path.join(OUTPUT_DIR, 'nested/deep/output');
      const input = path.join(FIXTURES_DIR, 'resume-short-en.md');
      const result = runCLI(`-i ${input} -o ${output}`);

      expect(result.exitCode).toBe(0);
      expect(fileExists(`${output}_cv.pdf`)).toBe(true);
      // Clean up nested directories
      fs.rmSync(path.join(OUTPUT_DIR, 'nested'), { recursive: true });
    });
  });
});
