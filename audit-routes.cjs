#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const SRC_DIR = process.argv[2] || './src';
const OUTPUT_FILE = './route-audit-report.md';
const results = { routes: [], links: [], navigateCalls: [], onClickHandlers: [], issues: [] };

function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) { console.error(`Directory not found: ${dir}`); process.exit(1); }
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build'].includes(item)) getFiles(fullPath, files);
    } else if (/\.(tsx?|jsx?)$/.test(item)) files.push(fullPath);
  }
  return files;
}

function extractWithLineNumbers(content, pattern, filePath) {
  const lines = content.split('\n');
  const matches = [];
  lines.forEach((line, index) => {
    const lineMatches = line.matchAll(new RegExp(pattern.source, 'g'));
    for (const match of lineMatches) {
      matches.push({ file: filePath, line: index + 1, match: match[0], captured: match[1] || null, fullLine: line.trim() });
    }
  });
  return matches;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(SRC_DIR, filePath);
  
  // Routes
  [/<Route\s+[^>]*path=["']([^"']+)["'][^>]*>/g, /path:\s*["']([^"']+)["']/g].forEach(p => {
    extractWithLineNumbers(content, p, relativePath).forEach(m => {
      if (m.captured && !results.routes.find(r => r.path === m.captured && r.file === m.file)) {
        results.routes.push({ path: m.captured, file: m.file, line: m.line });
      }
    });
  });
  
  // Links
  [/<Link\s+[^>]*to=["']([^"']+)["']/g, /<NavLink\s+[^>]*to=["']([^"']+)["']/g].forEach(p => {
    extractWithLineNumbers(content, p, relativePath).forEach(m => {
      if (m.captured) results.links.push({ to: m.captured, file: m.file, line: m.line, type: m.match.includes('NavLink') ? 'NavLink' : 'Link' });
    });
  });
  
  // Dynamic links
  extractWithLineNumbers(content, /<Link\s+[^>]*to=\{([^}]+)\}/g, relativePath).forEach(m => {
    if (m.captured) results.links.push({ to: m.captured, file: m.file, line: m.line, type: 'Dynamic', isDynamic: true });
  });
  
  // Navigate calls
  extractWithLineNumbers(content, /navigate\(["']([^"']+)["']\)/g, relativePath).forEach(m => {
    if (m.captured) results.navigateCalls.push({ to: m.captured, file: m.file, line: m.line });
  });
  
  // Dynamic navigate
  extractWithLineNumbers(content, /navigate\(([^)]+)\)/g, relativePath).forEach(m => {
    if (m.captured && !m.captured.startsWith('"') && !m.captured.startsWith("'")) {
      if (!results.navigateCalls.find(n => n.file === m.file && n.line === m.line)) {
        results.navigateCalls.push({ to: m.captured, file: m.file, line: m.line, isDynamic: true });
      }
    }
  });
  
  // Empty onClick
  extractWithLineNumbers(content, /onClick=\{\s*\(\)\s*=>\s*\{\s*\}\s*\}/g, relativePath).forEach(m => {
    results.onClickHandlers.push({ file: m.file, line: m.line, status: 'EMPTY', code: m.fullLine });
    results.issues.push({ type: 'EMPTY_ONCLICK', file: m.file, line: m.line, message: 'Empty onClick handler', code: m.fullLine });
  });
  
  // Console-only onClick
  extractWithLineNumbers(content, /onClick=\{\s*\(\)\s*=>\s*console\.log/g, relativePath).forEach(m => {
    if (!results.onClickHandlers.find(h => h.file === m.file && h.line === m.line)) {
      results.onClickHandlers.push({ file: m.file, line: m.line, status: 'CONSOLE_ONLY', code: m.fullLine });
      results.issues.push({ type: 'ONCLICK_CONSOLE_ONLY', file: m.file, line: m.line, message: 'onClick only logs to console', code: m.fullLine });
    }
  });
}

function findMismatches() {
  const definedPaths = new Set(results.routes.map(r => r.path));
  results.links.filter(l => !l.isDynamic).forEach(link => {
    const normalizedTo = link.to.replace(/\/$/, '') || '/';
    const pathExists = [...definedPaths].some(p => {
      const np = p.replace(/\/$/, '') || '/';
      if (np.includes(':')) return new RegExp('^' + np.replace(/:[^/]+/g, '[^/]+') + '$').test(normalizedTo);
      return np === normalizedTo;
    });
    if (!pathExists && !link.to.startsWith('http') && !link.to.startsWith('#')) {
      results.issues.push({ type: 'MISSING_ROUTE', file: link.file, line: link.line, message: `Link to "${link.to}" has no matching route`, to: link.to });
    }
  });
  results.navigateCalls.filter(n => !n.isDynamic).forEach(nav => {
    const normalizedTo = nav.to.replace(/\/$/, '') || '/';
    const pathExists = [...definedPaths].some(p => {
      const np = p.replace(/\/$/, '') || '/';
      if (np.includes(':')) return new RegExp('^' + np.replace(/:[^/]+/g, '[^/]+') + '$').test(normalizedTo);
      return np === normalizedTo;
    });
    if (!pathExists && !nav.to.startsWith('http') && nav.to !== '-1' && nav.to !== '..') {
      results.issues.push({ type: 'MISSING_ROUTE', file: nav.file, line: nav.line, message: `navigate("${nav.to}") has no matching route`, to: nav.to });
    }
  });
}

function generateReport() {
  let r = `# Route Audit Report\nGenerated: ${new Date().toISOString()}\n\n`;
  r += `## Summary\n- Routes: ${results.routes.length}\n- Links: ${results.links.length}\n- Navigate calls: ${results.navigateCalls.length}\n- Problem handlers: ${results.onClickHandlers.length}\n- **Issues: ${results.issues.length}**\n\n`;
  
  if (results.issues.length > 0) {
    r += `## Issues Found\n\n`;
    const byType = {};
    results.issues.forEach(i => { if (!byType[i.type]) byType[i.type] = []; byType[i.type].push(i); });
    for (const [type, issues] of Object.entries(byType)) {
      r += `### ${type} (${issues.length})\n`;
      issues.forEach(i => r += `- **${i.file}:${i.line}** - ${i.message}\n`);
      r += '\n';
    }
  }
  
  r += `## Defined Routes\n| Path | File | Line |\n|------|------|------|\n`;
  results.routes.sort((a,b) => a.path.localeCompare(b.path)).forEach(route => r += `| \`${route.path}\` | ${route.file} | ${route.line} |\n`);
  
  r += `\n## Navigation Links\n| To | Type | File | Line |\n|----|------|------|------|\n`;
  results.links.forEach(l => r += `| \`${l.isDynamic ? '_dynamic_' : l.to}\` | ${l.type} | ${l.file} | ${l.line} |\n`);
  
  r += `\n## Navigate Calls\n| To | File | Line |\n|----|------|------|\n`;
  results.navigateCalls.forEach(n => r += `| \`${n.isDynamic ? '_dynamic_' : n.to}\` | ${n.file} | ${n.line} |\n`);
  
  if (results.onClickHandlers.length > 0) {
    r += `\n## Problem Handlers\n| Status | File | Line |\n|--------|------|------|\n`;
    results.onClickHandlers.forEach(h => r += `| ${h.status} | ${h.file} | ${h.line} |\n`);
  }
  
  return r;
}

console.log(`\n🔍 Scanning ${SRC_DIR}...\n`);
const files = getFiles(SRC_DIR);
console.log(`Found ${files.length} source files\n`);
files.forEach(f => analyzeFile(f));
findMismatches();
fs.writeFileSync(OUTPUT_FILE, generateReport());
console.log(`✅ Done!\n`);
console.log(`📊 Summary:`);
console.log(`   Routes: ${results.routes.length}`);
console.log(`   Links: ${results.links.length}`);
console.log(`   Navigate calls: ${results.navigateCalls.length}`);
console.log(`   Problem handlers: ${results.onClickHandlers.length}`);
console.log(`   Issues: ${results.issues.length}`);
console.log(`\n📄 Report: ${OUTPUT_FILE}\n`);
if (results.issues.length > 0) {
  console.log(`🚨 Top issues:`);
  results.issues.slice(0,5).forEach((i,n) => console.log(`   ${n+1}. [${i.type}] ${i.file}:${i.line}`));
}
