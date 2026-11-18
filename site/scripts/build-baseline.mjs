#!/usr/bin/env node
// Build baseline (PLAT-013): runs `astro build` once as a child process with the same NODE_OPTIONS as the
// website workflow, then prints one JSON object with wall time, peak memory, page count and dist/ size.
// Peak memory comes from `/usr/bin/time` (`-l` on macOS, `-v` on Linux). Its maximum resident set size is the
// largest single process in the build's process tree, not the sum, so it is a floor for total memory use.
// Usage: node scripts/build-baseline.mjs            (writes dist/; Astro clears it first)
// Output is one JSON line on stdout; the build log goes to stderr.

import { execFileSync, spawn } from 'node:child_process';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { cpus, arch, platform, release } from 'node:os';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = fileURLToPath(new URL('../', import.meta.url));
const DIST = join(SITE, 'dist');
const CI_NODE_OPTIONS = '--max-old-space-size=6144';

/** Every file under a folder, as `{ path, bytes }` with "/" separators. */
function walkFiles(root) {
  const out = [];
  const walk = (dir) => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, item.name);
      if (item.isDirectory()) walk(full);
      else if (item.isFile()) out.push({ path: relative(root, full).split(sep).join('/'), bytes: statSync(full).size });
    }
  };
  walk(root);
  return out;
}

/** Peak RSS in bytes from the /usr/bin/time report, or null when the report has no such line. */
function parsePeakBytes(text, platformName = process.platform) {
  if (platformName === 'darwin') {
    // macOS `time -l` prints bytes: "  123456789  maximum resident set size"
    const m = text.match(/(\d+)\s+maximum resident set size/);
    return m ? Number(m[1]) : null;
  }
  // GNU `time -v` prints kilobytes: "Maximum resident set size (kbytes): 123456"
  const m = text.match(/Maximum resident set size \(kbytes\):\s*(\d+)/);
  return m ? Number(m[1]) * 1024 : null;
}

/** YYYY-MM-DD in the machine's local time zone (toISOString would give the UTC date). */
function localDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function gitCommit() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: SITE, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function cpuName() {
  if (process.platform === 'darwin') {
    try {
      return execFileSync('sysctl', ['-n', 'machdep.cpu.brand_string'], { encoding: 'utf8' }).trim();
    } catch {
      /* fall through to the generic name */
    }
  }
  return cpus()[0]?.model ?? 'unknown';
}

function astroVersion() {
  // Read the installed package at run time, so the baseline records the version that built the site.
  return JSON.parse(readFileSync(join(SITE, 'node_modules', 'astro', 'package.json'), 'utf8')).version;
}

function runBuild() {
  if (!existsSync('/usr/bin/time')) throw new Error('/usr/bin/time is needed to record peak memory');
  const timeFlag = process.platform === 'darwin' ? '-l' : '-v';
  const astroBin = join(SITE, 'node_modules', 'astro', 'bin', 'astro.mjs');
  const env = { ...process.env, NODE_OPTIONS: CI_NODE_OPTIONS };
  const started = process.hrtime.bigint();
  return new Promise((resolve, reject) => {
    const child = spawn('/usr/bin/time', [timeFlag, process.execPath, astroBin, 'build'], {
      cwd: SITE,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let timeReport = '';
    child.stdout.on('data', (chunk) => process.stderr.write(chunk));
    child.stderr.on('data', (chunk) => {
      // /usr/bin/time writes its report to stderr after the build exits; keep all of stderr for parsing.
      timeReport += chunk.toString();
      process.stderr.write(chunk);
    });
    child.on('error', reject);
    child.on('close', (code) => {
      const wallSeconds = Number(process.hrtime.bigint() - started) / 1e9;
      resolve({ code, wallSeconds, peakBytes: parsePeakBytes(timeReport) });
    });
  });
}

const { code, wallSeconds, peakBytes } = await runBuild();
if (code !== 0) {
  console.error(`astro build exited with code ${code}`);
  process.exit(code ?? 1);
}
if (peakBytes === null) {
  console.error('Could not read the maximum resident set size from /usr/bin/time output.');
  process.exit(1);
}
const files = walkFiles(DIST);
const htmlPages = files.filter((f) => f.path.endsWith('.html')).length;
const distBytes = files.reduce((sum, f) => sum + f.bytes, 0);
const mib = (bytes) => Math.round((bytes / 1024 / 1024) * 10) / 10;

const result = {
  date: localDate(new Date()),
  commit: gitCommit(),
  machine: { os: `${platform()} ${release()}`, arch: arch(), cpu: cpuName(), logicalCpus: cpus().length },
  node: process.version,
  astro: astroVersion(),
  nodeOptions: CI_NODE_OPTIONS,
  concurrency: Number(process.env.ASTRO_BUILD_CONCURRENCY ?? 2),
  wallSeconds: Math.round(wallSeconds * 10) / 10,
  peakResidentMiB: mib(peakBytes),
  peakResidentMeasure: 'largest single process in the tree (time -l / -v maximum resident set size)',
  htmlPages,
  distFiles: files.length,
  distMiB: mib(distBytes),
};
console.log(JSON.stringify(result));
