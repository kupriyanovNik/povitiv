#!/usr/bin/env node
// Keep deployment settings on the server, outside the distributable artifact.
const fs = require('node:fs');
const path = require('node:path');

const isEnv = (name) => /^\.env/i.test(name);

function checkTree(root, clean) {
  if (!fs.lstatSync(root).isDirectory()) {
    throw new Error('Artifact root must be a directory, not a symbolic link.');
  }

  function walk(directory, atRoot) {
    for (const name of fs.readdirSync(directory)) {
      const entry = path.join(directory, name);
      const stat = fs.lstatSync(entry);
      const template = atRoot && name === '.env.example' && stat.isFile();
      if (isEnv(name) && !template) {
        if (!clean) throw new Error(`Private env entry: ${JSON.stringify(entry)}`);
        // rm removes the link itself; lstat and walk never follow directory links.
        fs.rmSync(entry, { recursive: true });
      } else if (stat.isDirectory()) {
        walk(entry, false);
      }
    }
  }

  walk(root, true);
  if (!fs.lstatSync(path.join(root, '.env.example')).isFile()) {
    throw new Error('The root .env.example must be a regular file.');
  }
  if (clean) checkTree(root, false);
}

function checkManifest() {
  // A read/tool failure must be an error, never a "no matches" result.
  const entries = fs.readFileSync(0, 'utf8').split('\n');
  if (!entries.includes('./.env.example')) {
    throw new Error('Archive is missing the root .env.example.');
  }
  for (const entry of entries) {
    if (entry !== './.env.example' && /(^|\/)\.env[^/]*(\/|$)/i.test(entry)) {
      throw new Error(`Private env archive entry: ${JSON.stringify(entry)}`);
    }
  }
}

try {
  const [mode, directory, ...extra] = process.argv.slice(2);
  if (mode === 'verify-manifest' && !directory && !extra.length) {
    checkManifest();
  } else if (['clean', 'verify'].includes(mode) && directory && !extra.length) {
    checkTree(path.resolve(directory), mode === 'clean');
  } else {
    throw new Error('Usage: node artifact-env.cjs clean|verify DIRECTORY, or verify-manifest < listing');
  }
} catch (error) {
  console.error(`Artifact env check failed: ${error.message}`);
  process.exitCode = 1;
}
