// Syntax-aware migration: only color string literals, CSS colors, and radii.
const fs = require("fs"), path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { pathToFileURL } = require("url");
const root = path.resolve(__dirname, "../src");
const tokenFile = path.join(root, "theme/designTokens.js");
const colorPattern = /#[\da-f]{8}\b|#[\da-f]{6}\b|#[\da-f]{4}\b|#[\da-f]{3}\b|rgba?\([\d\s.,%]+\)/gi;
const files = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
async function main() {
  const { colors } = await import(pathToFileURL(tokenFile));
  const originalColors = Object.fromEntries(Object.entries(colors).filter(([, value]) => /^#/.test(value)));
  const rgb = hex => { hex = hex.slice(1); if (hex.length < 5) hex = [...hex].map(c => c + c).join(""); return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16)); };
  const brand = new Set(["#0e8f83", "#0e8f9a", "#0b7480", "#08756c", "#fd5622", "#ff641f", "#e04818", "#e95616", "#006666", "#0ea5e9"]);
  const aliases = new Map(); const additions = [];
  let alphaCount = Math.max(0, ...Object.keys(colors).filter(key => /^overlay\d+$/.test(key)).map(key => Number(key.slice(7))));
  function token(value) {
    const lower = value.toLowerCase();
    if (aliases.has(lower)) return aliases.get(lower);
    let key;
    if (brand.has(lower)) key = "primary";
    else if (/^rgba?/.test(lower)) { key = Object.keys(colors).find(key => colors[key].toLowerCase() === lower); if (!key) { key = "overlay" + ++alphaCount; colors[key] = value; additions.push([key, value]); } }
    else {
      const [r, g, b] = rgb(lower);
      key = Object.keys(originalColors).sort((a, bKey) => {
        const distance = name => rgb(originalColors[name]).reduce((sum, channel, index) => sum + ([r, g, b][index] - channel) ** 2, 0);
        return distance(a) - distance(bKey);
      })[0];
      // Old light teal/orange states now consistently use the primary soft token.
      if (["#e6f7f8", "#e5f6f2", "#fff0e8", "#fff7ed", "#f0fbfc", "#d5f1f4", "#ccfbf1"].includes(lower)) key = "primarySoft";
    }
    aliases.set(lower, key); return key;
  }
  let changed = 0;
  for (const file of files(root).filter(file => /\.(jsx?|css)$/.test(file) && file !== tokenFile)) {
    let source = fs.readFileSync(file, "utf8"); const edits = []; let importsColors = false;
    if (file.endsWith(".css")) {
      source = source.replace(colorPattern, value => "var(--" + token(value).replace(/[A-Z]/g, letter => "-" + letter.toLowerCase()) + ")");
      source = source.replace(/border-radius\s*:\s*[^;}]+/g, value => /50%/.test(value) ? value : "border-radius: 4px");
    } else {
      let ast;
      try { ast = parser.parse(source, { sourceType: "module", plugins: ["jsx"] }); } catch (error) { throw new Error(file + ": " + error.message, { cause: error }); }
      traverse(ast, {
        ObjectProperty(nodePath) {
          const node = nodePath.node, key = node.key.name || node.key.value;
          if (/^border.*Radius$/.test(key || "")) {
            if (nodePath.parentPath.parentPath?.node?.key?.name === "shape") return;
            if (node.value.type === "StringLiteral" && node.value.value === "50%") return;
            if (node.value.type === "NumericLiteral" && node.value.value === 0) return;
            edits.push({ start: node.value.start, end: node.value.end, text: '"4px"' }); nodePath.skip();
          }
        },
        JSXAttribute(nodePath) {
          if (/^border.*Radius$/.test(nodePath.node.name.name || "")) { const value = nodePath.node.value; if (value && source.slice(value.start, value.end).includes("50%")) return; if (value) edits.push({ start: value.start, end: value.end, text: '"4px"' }); nodePath.skip(); }
        },
        StringLiteral(nodePath) {
          const node = nodePath.node; colorPattern.lastIndex = 0;
          if (!colorPattern.test(node.value)) return;
          colorPattern.lastIndex = 0;
          const matches = [...node.value.matchAll(colorPattern)];
          let expression;
          if (matches.length === 1 && matches[0][0] === node.value) expression = "themeColors." + token(node.value);
          else { let offset = 0; const parts = []; for (const match of matches) { if (match.index > offset) parts.push(JSON.stringify(node.value.slice(offset, match.index))); parts.push("themeColors." + token(match[0])); offset = match.index + match[0].length; } if (offset < node.value.length) parts.push(JSON.stringify(node.value.slice(offset))); expression = parts.join(" + "); }
          if (nodePath.parent.type === "JSXAttribute") expression = "{" + expression + "}";
          edits.push({ start: node.start, end: node.end, text: expression }); importsColors = true;
        },
        TemplateElement(nodePath) {
          const raw = nodePath.node.value.raw, updated = raw.replace(colorPattern, value => "var(--" + token(value).replace(/[A-Z]/g, letter => "-" + letter.toLowerCase()) + ")");
          if (raw !== updated) edits.push({ start: nodePath.node.start, end: nodePath.node.end, text: updated });
        },
      });
      edits.sort((a, b) => b.start - a.start).forEach(edit => { source = source.slice(0, edit.start) + edit.text + source.slice(edit.end); });
      if (importsColors && !source.includes("colors as themeColors")) { let relative = path.relative(path.dirname(file), tokenFile).replaceAll("\\", "/").replace(/\.js$/, ""); if (!relative.startsWith(".")) relative = "./" + relative; source = 'import { colors as themeColors } from "' + relative + '";\n' + source; }
    }
    source = source.replace(/rounded-(?:lg|xl|2xl|3xl|md|full)\b/g, "rounded-[4px]").replace(/Team leade\b/g, "Team Lead");
    if (source !== fs.readFileSync(file, "utf8")) { fs.writeFileSync(file, source); changed++; }
  }
  if (additions.length) {
    let source = fs.readFileSync(tokenFile, "utf8");
    const lines = additions.map(([key, value]) => "  " + key + ": " + JSON.stringify(value) + ",").join("\n");
    source = source.replace("  tableHeader:", lines + "\n  tableHeader:"); fs.writeFileSync(tokenFile, source);
  }
  console.log("Standardized " + changed + " frontend files; " + aliases.size + " color values mapped to central tokens.");
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
