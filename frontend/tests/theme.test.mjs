import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";
import { createRequire } from "node:module";
import { paletteTokens as colors, defaultThemeTokens, dimensions, createThemeTokens, createCssVariables } from "../src/theme/designTokens.js";
const require = createRequire(import.meta.url), parser = require("@babel/parser"), traverse = require("@babel/traverse").default;
const root = fileURLToPath(new URL("../src", import.meta.url));
const files = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
test("Central palette and dimensions", () => {
  assert.equal(colors.primary, "#F26522"); assert.equal(colors.secondaryDark, "#0C4A5E");
  assert.equal(defaultThemeTokens.radius, 4); assert.equal(dimensions.sidebar, 260);
});
test("primary and muted body text contrast on white cards", () => {
  const luminance = hex => {
    const channels = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  for (const color of [colors.textPrimary, colors.textMuted]) assert.ok((luminance(colors.cardBg) + 0.05) / (luminance(color) + 0.05) >= 4.5);
});
test("no active hard-coded hex colors or oversized radii outside central tokens", () => {
  const errors = [];
  for (const file of files(root).filter(file => /\.(jsx?|css)$/.test(file) && !file.endsWith("designTokens.js"))) {
    const source = fs.readFileSync(file, "utf8");
    if (file.endsWith(".css")) { if (/#[\da-f]{3,8}\b/i.test(source)) errors.push(file + " literal color"); if (/border-radius\s*:\s*(?:[5-9]|\d{2,})px/.test(source)) errors.push(file + " radius"); continue; }
    const ast = parser.parse(source, { sourceType: "module", plugins: ["jsx"] });
    traverse(ast, {
      StringLiteral({ node }) { if (/#[\da-f]{3,8}\b/i.test(node.value)) errors.push(file + ":" + node.loc.start.line + " literal color"); },
      ObjectProperty({ node }) { const key = node.key.name || node.key.value; if (/^border.*Radius$/.test(key || "") && node.value.type === "NumericLiteral" && node.value.value > 4) errors.push(file + " radius"); if (/^border.*Radius$/.test(key || "") && node.value.type === "StringLiteral" && /(?:[5-9]|\d{2,})px/.test(node.value.value)) errors.push(file + " radius"); },
    });
  }
  assert.deepEqual(errors, []);
});

test("one primary override updates palette aliases and CSS consumers", () => { const tokens = createThemeTokens({ primary: colors.info }); const vars = createCssVariables(tokens); assert.equal(tokens.primary, colors.info); assert.equal(tokens.chartPrimary, colors.info); assert.equal(tokens.gradButton, colors.info); assert.equal(tokens.accent, colors.info); assert.equal(tokens.overlay4, "rgba(27,132,255,.35)"); assert.equal(vars["--primary"], colors.info); assert.notEqual(vars["--primary-soft"], colors.primarySoft); assert.notEqual(vars["--primary-hover"], colors.primaryHover); });

test("all table markup belongs to the single shared DataTable", () => { const owners=[]; for(const file of files(root).filter(file=>file.endsWith(".jsx"))) { const ast=parser.parse(fs.readFileSync(file,"utf8"),{sourceType:"module",plugins:["jsx"]}); traverse(ast,{JSXOpeningElement({node}){if(["table","Table"].includes(node.name.name)) owners.push(path.relative(root,file).replaceAll(String.fromCharCode(92),"/"));}}); } assert.deepEqual(owners,["components/common/DataTable.jsx"]); });

test("source has no reference branding, legacy color names or large rounded utilities",()=>{const errors=[];for(const file of files(root).filter(file=>/\.(jsx?|css)$/.test(file)&&!file.endsWith("designTokens.js"))){if(/SmartHR|Dreams|\bteal\b|\borange\b|rounded-(lg|xl|2xl)\b/i.test(fs.readFileSync(file,"utf8")))errors.push(path.relative(root,file));}assert.deepEqual(errors,[]);});
