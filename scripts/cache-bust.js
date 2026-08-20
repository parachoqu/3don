'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const ignoredDirectories = new Set(['.git', '.vercel', 'node_modules']);
const assetHashes = new Map();

function findHtmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignoredDirectories.has(entry.name)) return [];

    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findHtmlFiles(entryPath);
    return entry.isFile() && entry.name.toLowerCase().endsWith('.html') ? [entryPath] : [];
  }).sort();
}

function isLocalUrl(url) {
  return url && !/^(?:[a-z][a-z\d+.-]*:|\/\/|data:|#)/i.test(url);
}

function resolveAssetPath(url, htmlPath) {
  const urlWithoutQuery = url.split(/[?#]/, 1)[0];
  const decodedPath = decodeURIComponent(urlWithoutQuery);
  return decodedPath.startsWith('/')
    ? path.resolve(projectRoot, `.${decodedPath}`)
    : path.resolve(path.dirname(htmlPath), decodedPath);
}

function getAssetHash(assetPath) {
  if (!assetHashes.has(assetPath)) {
    const hash = crypto.createHash('sha256')
      .update(fs.readFileSync(assetPath))
      .digest('hex')
      .slice(0, 12);
    assetHashes.set(assetPath, hash);
  }

  return assetHashes.get(assetPath);
}

function addVersion(url, version) {
  const fragmentIndex = url.indexOf('#');
  const fragment = fragmentIndex === -1 ? '' : url.slice(fragmentIndex);
  const urlWithoutFragment = fragmentIndex === -1 ? url : url.slice(0, fragmentIndex);
  const queryIndex = urlWithoutFragment.indexOf('?');
  const pathname = queryIndex === -1 ? urlWithoutFragment : urlWithoutFragment.slice(0, queryIndex);
  const query = queryIndex === -1 ? '' : urlWithoutFragment.slice(queryIndex + 1);
  const params = query.split('&').filter((part) => part && !/^v=/i.test(part));
  params.push(`v=${version}`);
  return `${pathname}?${params.join('&')}${fragment}`;
}

function versionAssetUrl(url, htmlPath) {
  if (!isLocalUrl(url)) return url;

  const assetPath = resolveAssetPath(url, htmlPath);
  if (!fs.existsSync(assetPath)) {
    throw new Error(`Asset referenciado não encontrado: ${url} em ${path.relative(projectRoot, htmlPath)}`);
  }

  return addVersion(url, getAssetHash(assetPath));
}

function updateAssetReferences(html, htmlPath, tagPattern, isTargetTag) {
  let referencesUpdated = 0;
  const updatedHtml = html.replace(tagPattern, (tag, quote, url) => {
    if (!isTargetTag(tag)) return tag;

    const versionedUrl = versionAssetUrl(url, htmlPath);
    if (versionedUrl === url) return tag;

    referencesUpdated += 1;
    return tag.replace(`${quote}${url}${quote}`, `${quote}${versionedUrl}${quote}`);
  });

  return { html: updatedHtml, referencesUpdated };
}

function updateHtmlFile(htmlPath) {
  const originalHtml = fs.readFileSync(htmlPath, 'utf8');
  const stylesheetResult = updateAssetReferences(
    originalHtml,
    htmlPath,
    /<link\b[^>]*\bhref=(['"])([^'"]+)\1[^>]*>/gi,
    (tag) => /\brel\s*=\s*(['"])stylesheet\1/i.test(tag),
  );
  const scriptResult = updateAssetReferences(
    stylesheetResult.html,
    htmlPath,
    /<script\b[^>]*\bsrc=(['"])([^'"]+)\1[^>]*>/gi,
    () => true,
  );

  if (scriptResult.html !== originalHtml) {
    fs.writeFileSync(htmlPath, scriptResult.html);
  }

  return stylesheetResult.referencesUpdated + scriptResult.referencesUpdated;
}

const htmlFiles = findHtmlFiles(projectRoot);
const updatedReferences = htmlFiles.reduce(
  (total, htmlPath) => total + updateHtmlFile(htmlPath),
  0,
);

console.log(`Cache busting concluído: ${updatedReferences} referência(s) atualizada(s) em ${htmlFiles.length} HTML(s).`);
for (const [assetPath, hash] of assetHashes) {
  console.log(`  ${path.relative(projectRoot, assetPath)}?v=${hash}`);
}
