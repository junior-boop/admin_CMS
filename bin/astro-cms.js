#!/usr/bin/env node
import('../dist/cli/cli.js').catch((err) => {
  console.error(err)
  process.exit(1)
})
