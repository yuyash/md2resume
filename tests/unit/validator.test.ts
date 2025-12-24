/**
 * Validator unit tests
 */

import { describe, expect, it, vi } from 'vitest';
import type { Logger } from '../../src/cli/index.js';
import type { ParsedCV } from '../../src/parser/index.js';
import type { ValidationError } from '../../src/types/index.js';
import { validateCV } from '../../src/validator/index.js';

const mockLogger: Logger = {
  info: vi.fn(),
  debug: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Helper to reset mocks
function resetMocks(): void {
  vi.clearAllMocks();
}

describe('validateCV', () => {
  it('should pass validation with all required fields', () => {
    const cv: ParsedCV = {
      metadata: {
        name: 'John Doe',
        email_address: 'john@example.com',
        phone_number: '123-456-7890',
      },
      sections: [
        {
          id: 'experience',
          title: '職歴',
          content: { type: 'text', text: 'Some experience' },
        },
      ],
      rawContent: '',
    };

    const result = validateCV(cv, 'cv', mockLogger);
    expect(result.ok).toBe(true);
  });

  it('should fail validation when required metadata is missing', () => {
    const cv: ParsedCV = {
      metadata: {
        name: 'John Doe',
        email_address: '',
        phone_number: '123-456-7890',
      },
      sections: [],
      rawContent: '',
    };

    const result = validateCV(cv, 'cv', mockLogger);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.some((e: ValidationError) => e.message.includes('email_address'))).toBe(
        true,
      );
    }
  });

  it('should fail validation when required section is missing', () => {
    const cv: ParsedCV = {
      metadata: {
        name: 'John Doe',
        email_address: 'john@example.com',
        phone_number: '123-456-7890',
      },
      sections: [],
      rawContent: '',
    };

    const result = validateCV(cv, 'cv', mockLogger);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.some((e: ValidationError) => e.message.includes('experience'))).toBe(
        true,
      );
    }
  });

  it('should warn about unknown sections', () => {
    resetMocks();
    const cv: ParsedCV = {
      metadata: {
        name: 'John Doe',
        email_address: 'john@example.com',
        phone_number: '123-456-7890',
      },
      sections: [
        {
          id: 'experience',
          title: '職歴',
          content: { type: 'text', text: 'Some experience' },
        },
      ],
      rawContent: '# Unknown Section\n\nSome content',
    };

    validateCV(cv, 'cv', mockLogger);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(vi.mocked(mockLogger.warn)).toHaveBeenCalled();
  });
});
