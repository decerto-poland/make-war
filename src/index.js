#!/usr/bin/env node

const makeWar = require('./make-war');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);


const defaultOpts = {
    'input-dir': 'dist',
    'description': 'Single Page Application',
    'name': 'SPA',
    'version': '0.0.0-SNAPSHOT',
    'pass-through': [],
    'urlrewritefilter-jar-url': 'http://central.maven.org/maven2/org/tuckey/urlrewritefilter/4.0.3/urlrewritefilter-4.0.3.jar',
};

const opts = require('node-getopt').create([
    ['c', 'config=ARG', 'use defaults value for name, version and description from given json file'],
    ['o', 'output=ARG', `output file (default is {name}-{version}.war)`],
    ['i', 'input-dir=ARG', `root directory from which the files are taken (default is ${defaultOpts['input-dir']})`],
    ['d', 'description=ARG', 'application description'],
    ['n', 'name=ARG', `application display name (default is ${defaultOpts.name})`],
    ['v', 'version=ARG', `application version (default is ${defaultOpts.version})`],
    ['p', 'pass-through=ARG+', 'regexp to pass through'],
    ['U', 'urlrewritefilter-jar-url=ARG', `specify custom location for urlrewritefilter jar (default is ${defaultOpts['urlrewritefilter-jar-url']})`],
    ['h', 'help', 'display this help'],
])
    .bindHelp()
    .parseSystem();

loadConfig(opts.options['config'])
    .then(config => makeWar({...defaultOpts, ...config, ...opts.options}))
    .catch(e => console.error(e));

function loadConfig(path) {
    return readFile(path)
        .then(buff => JSON.parse(buff.toString()))
        .then(({name, version, description}) => ({name: fixName(name), version, description}))
        .catch(() => ({}));
}

function fixName(name) {
    return name
        .replace(/\W/g, ' ')
        .trim()
        .replace(/ +/g, '-');
}
