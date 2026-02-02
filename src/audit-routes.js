#!/usr/bin/env node

/**
 * Atlas Route & Navigation Audit Script
 * 
 * This script scans your React codebase and generates a report of:
 * 1. All defined routes
 * 2. All navigation links (Link, NavLink, navigate())
 * 3. All onClick handlers and their implementation status
 * 4. Potential mismatches and issues
 * 
 * Usage: node audit-routes.js [src-directory]
 * Default: ./src
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = process.argv[2] || './src';
const OUTPUT_FILE = './route-audit-report.md';

// Results storage
const results = {
  routes: [],
  links: [],
  navigateCalls: [],
  onClickHandlers: [],
  issues: []
};

// Patterns to search for
const patterns = {
  // Route definitions
  routePath: /<Route\s+[^>]*path=["']([^"']+)["'][^>]*>/g,
  routePathAlt: /<Route\s+[^>]*path=\{["']([^"']+)["']\}[^>]*>/g,
  routeElement: /<Route\s+[^>]*path=["']([^"']+)["'][^>]*element=\{[^}]*<(\w+)/g,
  createRoute: /path:\s*["']([^"']+)["']/g,
  
  // Navigation
  linkTo: /<Link\s+[^>]*to=["']([^"']+)["']/g,
  linkToDynamic: /<Link\s+[^>]*to=\{([^}]+)\}/g,
  navLinkTo: /<NavLink\s+[^>]*to=["']([^"']+)["']/g,
  navigateCall: /navigate\(["']([^"']+)["']\)/g,
  navigateDynamic: /navigate\(([^)]+)\)/g,
  useNavigate: /const\s+(\w+)\s*=\s*useNavigate\(\)/g,
  
  // Click handlers
  onClickEmpty: /onClick=\{?\s*\(\)\s*=>\s*\{\s*\}\s*\}?/g,
  onClickHandler: /onClick=\{([^}]+)\}/g,
  onClickInline: /onClick=\{\s*\(\)\s*=>\s*\{([^}]*)\}\s*\}/g,
  
  // Buttons without handlers
  buttonNoClick: /<Button[^>]*>(?![^<]*onClick)/g
};

/**
 * Recursively get all TypeScript/TSX files
 */
function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    process.exit(1);
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other non-essential directories
      if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
        getFiles(fullPath, files);
      }
    } else if (/\.(tsx?|jsx?)$/.test(item)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Extract matches from content with line numbers
 */
function extractWithLineNumbers(content, pattern, filePath) {
  const lines = content.split('\n');
  const matches = [];
  
  lines.forEach((line, index) => {
    const lineMatches = line.matchAll(new RegExp(pattern.source, 'g'));
    for (const match of lineMatches) {
      matches.push({
        file: filePath,
        line: index + 1,
        match: match[0],
        captured: match[1] || null,
        fullLine: line.trim()
      });
    }
  });
  
  return matches;
}

/**
 * Analyze a single file
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(SRC_DIR, filePath);
  
  // Find route definitions
  const routeMatches = [
    ...extractWithLineNumbers(content, patterns.routePath, relativePath),
    ...extractWithLineNumbers(content, patterns.routePathAlt, relativePath),
    ...extractWithLineNumbers(content, patterns.createRoute, relativePath)
  ];
  
  routeMatches.forEach(m => {
    if (m.captured && !results.routes.find(r => r.path === m.captured && r.file === m.file)) {
      results.routes.push({
        path: m.captured,
        file: m.file,
        line: m.line
      });
    }
  });
  
  // Find Link components
  const linkMatches = [
    ...extractWithLineNumbers(content, patterns.linkTo, relativePath),
    ...extractWithLineNumbers(content, patterns.navLinkTo, relativePath)
  ];
  
  linkMatches.forEach(m => {
    if (m.captured) {
      results.links.push({
        to: m.captured,
        file: m.file,
        line: m.line,
        type: m.match.includes('NavLink') ? 'NavLink' : 'Link'
      });
    }
  });
  
  // Find dynamic links
  const dynamicLinks = extractWithLineNumbers(content, patterns.linkToDynamic, relativePath);
  dynamicLinks.forEach(m => {
    if (m.captured) {
      results.links.push({
        to: m.captured,
        file: m.file,
        line: m.line,
        type: 'Dynamic Link',
        isDynamic: true
      });
    }
  });
  
  // Find navigate() calls
  const navCalls = extractWithLineNumbers(content, patterns.navigateCall, relativePath);
  navCalls.forEach(m => {
    if (m.captured) {
      results.navigateCalls.push({
        to: m.captured,
        file: m.file,
        line: m.line
      });
    }
  });
  
  // Find dynamic navigate calls
  const dynamicNavCalls = extractWithLineNumbers(content, patterns.navigateDynamic, relativePath);
  dynamicNavCalls.forEach(m => {
    if (m.captured && !m.captured.startsWith('"') && !m.captured.startsWith("'")) {
      // Filter out the static ones we already caught
      if (!results.navigateCalls.find(n => n.file === m.file && n.line === m.line)) {
        results.navigateCalls.push({
          to: m.captured,
          file: m.file,
          line: m.line,
          isDynamic: true
        });
      }
    }
  });
  
  // Find empty onClick handlers
  const emptyClicks = extractWithLineNumbers(content, patterns.onClickEmpty, relativePath);
  emptyClicks.forEach(m => {
    results.onClickHandlers.push({
      file: m.file,
      line: m.line,
      status: 'EMPTY',
      code: m.fullLine
    });
    results.issues.push({
      type: 'EMPTY_ONCLICK',
      file: m.file,
      line: m.line,
      message: 'Empty onClick handler - button does nothing',
      code: m.fullLine
    });
  });
  
  // Find onClick handlers and check if they have implementations
  const clickHandlers = extractWithLineNumbers(content, patterns.onClickHandler, relativePath);
  clickHandlers.forEach(m => {
    if (m.captured) {
      const isEmptyArrow = /^\s*\(\)\s*=>\s*\{\s*\}\s*$/.test(m.captured);
      const isJustConsoleLog = /^\s*\(\)\s*=>\s*console\.log/.test(m.captured);
      const isPlaceholder = /TODO|FIXME|placeholder/i.test(m.captured);
      
      let status = 'OK';
      if (isEmptyArrow) status = 'EMPTY';
      else if (isJustConsoleLog) status = 'CONSOLE_ONLY';
      else if (isPlaceholder) status = 'PLACEHOLDER';
      
      if (status !== 'OK' && !results.onClickHandlers.find(h => h.file === m.file && h.line === m.line)) {
        results.onClickHandlers.push({
          file: m.file,
          line: m.line,
          status,
          handler: m.captured.substring(0, 50),
          code: m.fullLine
        });
        
        if (status !== 'OK') {
          results.issues.push({
            type: `ONCLICK_${status}`,
            file: m.file,
            line: m.line,
            message: status === 'CONSOLE_ONLY' 
              ? 'onClick only logs to console - no real action'
              : status === 'PLACEHOLDER'
              ? 'onClick contains placeholder/TODO comment'
              : 'onClick handler issue',
            code: m.fullLine
          });
        }
      }
    }
  });
}

/**
 * Find route mismatches
 */
function findMismatches() {
  const definedPaths = new Set(results.routes.map(r => r.path));
  
  // Check static links against defined routes
  results.links.forEach(link => {
    if (!link.isDynamic) {
      // Normalize paths for comparison
      const normalizedTo = link.to.replace(/\/$/, '') || '/';
      const pathExists = [...definedPaths].some(p => {
        const normalizedP = p.replace(/\/$/, '') || '/';
        // Handle dynamic segments like :id
        if (normalizedP.includes(':')) {
          const regex = new RegExp('^' + normalizedP.replace(/:[^/]+/g, '[^/]+') + '$');
          return regex.test(normalizedTo);
        }
        return normalizedP === normalizedTo;
      });
      
      if (!pathExists && !link.to.startsWith('http') && !link.to.startsWith('#')) {
        results.issues.push({
          type: 'MISSING_ROUTE',
          file: link.file,
          line: link.line,
          message: `Link points to "${link.to}" but no matching route found`,
          to: link.to
        });
      }
    }
  });
  
  // Check navigate calls
  results.navigateCalls.forEach(nav => {
    if (!nav.isDynamic) {
      const normalizedTo = nav.to.replace(/\/$/, '') || '/';
      const pathExists = [...definedPaths].some(p => {
        const normalizedP = p.replace(/\/$/, '') || '/';
        if (normalizedP.includes(':')) {
          const regex = new RegExp('^' + normalizedP.replace(/:[^/]+/g, '[^/]+') + '$');
          return regex.test(normalizedTo);
        }
        return normalizedP === normalizedTo;
      });
      
      if (!pathExists && !nav.to.startsWith('http') && nav.to !== '-1' && nav.to !== '..') {
        results.issues.push({
          type: 'MISSING_ROUTE',
          file: nav.file,
          line: nav.line,
          message: `navigate() calls "${nav.to}" but no matching route found`,
          to: nav.to
        });
      }
    }
  });
}

/**
 * Generate markdown report
 */
function generateReport() {
  let report = `# Atlas Route & Navigation Audit Report
Generated: ${new Date().toISOString()}

## Summary
- **Defined Routes:** ${results.routes.length}
- **Navigation Links:** ${results.links.length}
- **Navigate Calls:** ${results.navigateCalls.length}
- **Problematic Handlers:** ${results.onClickHandlers.length}
- **Total Issues Found:** ${results.issues.length}

---

## 🚨 Issues Found (${results.issues.length})

${results.issues.length === 0 ? '_No issues found!_\n' : ''}
`;

  // Group issues by type
  const issuesByType = {};
  results.issues.forEach(issue => {
    if (!issuesByType[issue.type]) issuesByType[issue.type] = [];
    issuesByType[issue.type].push(issue);
  });

  for (const [type, issues] of Object.entries(issuesByType)) {
    report += `### ${type.replace(/_/g, ' ')} (${issues.length})\n\n`;
    issues.forEach(issue => {
      report += `- **${issue.file}:${issue.line}**\n`;
      report += `  - ${issue.message}\n`;
      if (issue.code) {
        report += `  - \`${issue.code.substring(0, 100)}${issue.code.length > 100 ? '...' : ''}\`\n`;
      }
    });
    report += '\n';
  }

  report += `---

## 📍 Defined Routes (${results.routes.length})

| Path | File | Line |
|------|------|------|
`;

  results.routes.sort((a, b) => a.path.localeCompare(b.path)).forEach(route => {
    report += `| \`${route.path}\` | ${route.file} | ${route.line} |\n`;
  });

  report += `
---

## 🔗 Navigation Links (${results.links.length})

| Destination | Type | File | Line |
|-------------|------|------|------|
`;

  results.links.forEach(link => {
    const dest = link.isDynamic ? `_dynamic:_ ${link.to}` : link.to;
    report += `| \`${dest}\` | ${link.type} | ${link.file} | ${link.line} |\n`;
  });

  report += `
---

## 🧭 Navigate Calls (${results.navigateCalls.length})

| Destination | File | Line |
|-------------|------|------|
`;

  results.navigateCalls.forEach(nav => {
    const dest = nav.isDynamic ? `_dynamic:_ ${nav.to}` : nav.to;
    report += `| \`${dest}\` | ${nav.file} | ${nav.line} |\n`;
  });

  report += `
---

## ⚠️ Problematic Click Handlers (${results.onClickHandlers.length})

| Status | File | Line | Code |
|--------|------|------|------|
`;

  results.onClickHandlers.forEach(handler => {
    const codeSnippet = handler.code ? handler.code.substring(0, 60).replace(/\|/g, '\\|') : '';
    report += `| ${handler.status} | ${handler.file} | ${handler.line} | \`${codeSnippet}...\` |\n`;
  });

  report += `
---

## How to Fix Common Issues

### MISSING_ROUTE
The link or navigate call points to a path that doesn't exist in your router.
- Check if the route was never created
- Check for typos in the path
- If the route should exist, add it to your router configuration

### EMPTY_ONCLICK
The button has an onClick handler that does nothing.
\`\`\`tsx
// Bad
<Button onClick={() => {}}>Save</Button>

// Good
<Button onClick={handleSave}>Save</Button>
\`\`\`

### CONSOLE_ONLY
The onClick handler only logs to console with no real functionality.
Implement the actual handler logic or connect it to your service layer.

### PLACEHOLDER
The handler contains TODO/FIXME comments indicating incomplete implementation.
Complete the implementation based on the TODO notes.

---

## Next Steps

1. Sort issues by priority (MISSING_ROUTE and EMPTY_ONCLICK are highest)
2. Fix routes first - they're often quick wins
3. For empty handlers, check if there's a corresponding service function to call
4. Test each fix by clicking through the UI

`;

  return report;
}

/**
 * Main execution
 */
function main() {
  console.log(`\n🔍 Scanning ${SRC_DIR} for route and navigation issues...\n`);
  
  const files = getFiles(SRC_DIR);
  console.log(`Found ${files.length} source files to analyze\n`);
  
  files.forEach(file => {
    analyzeFile(file);
  });
  
  findMismatches();
  
  const report = generateReport();
  fs.writeFileSync(OUTPUT_FILE, report);
  
  console.log(`✅ Analysis complete!\n`);
  console.log(`📊 Summary:`);
  console.log(`   - Routes defined: ${results.routes.length}`);
  console.log(`   - Navigation links: ${results.links.length}`);
  console.log(`   - Navigate calls: ${results.navigateCalls.length}`);
  console.log(`   - Problematic handlers: ${results.onClickHandlers.length}`);
  console.log(`   - Issues found: ${results.issues.length}`);
  console.log(`\n📄 Full report saved to: ${OUTPUT_FILE}\n`);
  
  if (results.issues.length > 0) {
    console.log(`🚨 Top issues to fix:\n`);
    results.issues.slice(0, 5).forEach((issue, i) => {
      console.log(`   ${i + 1}. [${issue.type}] ${issue.file}:${issue.line}`);
      console.log(`      ${issue.message}\n`);
    });
  }
}

main();
