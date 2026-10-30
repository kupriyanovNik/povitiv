#!/usr/bin/env node
// Keep deployment settings and personal data on the server, outside the
// distributable artifact: private .env* files and the lead journal
// (data/leads, *.jsonl — names and phone numbers of visitors).
const fs = require('node:fs');
const path = require('node:path');

const isEnv = (name) => /^\.env/i.test(name);
const isJournal = (name) => /\.jsonl(\.|$)/i.test(name);
// data/leads at any depth: Next file tracing can copy it next to server.js
const isLeadsDir = (directory, name) =>
  name === 'leads' && path.basename(directory) === 'data';

function checkTree(root, clean) {
  if (!fs.lstatSync(root).isDirectory()) {
    throw new Error('Artifact root must be a directory, not a symbolic link.');
  }

  function walk(directory, atRoot) {
    for (const name of fs.readdirSync(directory)) {
      const entry = path.join(directory, name);
      const stat = fs.lstatSync(entry);
      const template = atRoot && name === '.env.example' && stat.isFile();
      const isPrivate =
        (isEnv(name) && !template) ||
        isJournal(name) ||
        isLeadsDir(directory, name);
      if (isPrivate) {
        if (!clean) throw new Error(`Private entry: ${JSON.stringify(entry)}`);
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
    const env =
      entry !== './.env.example' && /(^|\/)\.env[^/]*(\/|$)/i.test(entry);
    const journal =
      /(^|\/)data\/leads(\/|$)/i.test(entry) || /\.jsonl(\.[^/]*)?$/i.test(entry);
    if (env || journal) {
      throw new Error(`Private archive entry: ${JSON.stringify(entry)}`);
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
  console.error(`Artifact check failed: ${error.message}`);
  process.exitCode = 1;
}
