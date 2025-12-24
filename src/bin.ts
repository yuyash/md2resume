#!/usr/bin/env node
/**
 * CLI entry point
 */

import { main } from './cli/index.js';

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
