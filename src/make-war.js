const archiver = require('archiver');
const fs = require('fs');
const util = require('util');
require('util.promisify').shim();
const glob = util.promisify(require('glob'));
const download = require('download');
const readFile = util.promisify(fs.readFile);
const access = util.promisify(fs.access);
const crypto = require('crypto');

const {
    urlrewriteXmlContent,
    webXmlContent,
} = require('./templates');

const zipOptions = {
    store: true,
    zlib: {level: 0}
};


function webXml(archive, displayName, description) {
    return Promise.resolve()
        .then(() => archive.append(webXmlContent(displayName, description), {name: 'WEB-INF/web.xml'}));
}

function urlrewriteXml(archive, files, passThrough, indexHtmlOptions) {
    return Promise.resolve()
        .then(() => urlrewriteXmlContent(files, passThrough, indexHtmlOptions))
        .then(content => archive.append(content, {name: 'WEB-INF/urlrewrite.xml'}));
}

function receiveUrlrewritefilterJar(urlrewritefilterJarUrl) {
    return access(urlrewritefilterJarUrl)
        .then(() => readFile(urlrewritefilterJarUrl))
        .catch(() => download(urlrewritefilterJarUrl));
}

function urlrewritefilterJar(archive, urlrewritefilterJarUrl) {
    return receiveUrlrewritefilterJar(urlrewritefilterJarUrl)
        .then(buffer => archive.append(buffer, {name: 'WEB-INF/lib/urlrewritefilter.jar'}));
}

function source(archive, srcDir) {
    return glob(`${srcDir}/**`, {nosort: true, nodir: true})
        .then(files => Promise.all(files
            .map(file => readFile(file)
                .then(buffer => {
                    const hash = crypto.createHash('sha256');
                    const name = file.replace(`${srcDir}/`, '');
                    archive.append(buffer, {name});
                    return {name, hash: hash.update(buffer).digest('hex')};
                }))));
}

function newWar(outputFile) {
    const archive = archiver('zip', zipOptions);
    const output = fs.createWriteStream(outputFile);

    archive.on('error', err => {
        throw err
    });
    archive.pipe(output);
    return archive;
}

function makeWar(opts = {}) {
    const srcDir = opts['input-dir'];
    const description = opts['description'];
    const displayName = opts['name'];
    const version = opts['version'];
    const passThrough = opts['pass-through'];
    const outputFile = opts['output'] || `${displayName}-${version}.war`;
    const contentSecurityPolicy = opts['content-security-policy'];
    const contentSecurityPolicyReportOnly = opts['content-security-policy-report-only'];
    const preventCacheForIndexHtml = opts['prevent-cache-for-index-html'];
    const header = opts['header'];
    const urlrewritefilterJarUrl = opts['urlrewritefilter-jar-url'];

    const archive = newWar(outputFile);
    const indexHtmlOptions = {header, preventCacheForIndexHtml, contentSecurityPolicy, contentSecurityPolicyReportOnly};

    return source(archive, srcDir)
        .then(files => Promise.all([
            urlrewritefilterJar(archive, urlrewritefilterJarUrl),
            urlrewriteXml(archive, files, passThrough, indexHtmlOptions),
            webXml(archive, displayName, description)
        ]))
        .then(() => archive.finalize());
}

module.exports = makeWar;
