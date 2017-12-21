#!/usr/bin/env node

const makeWar = require('./make-war');

const defaultOpts = {
    'output': 'static.war',
    'input-dir': 'dist',
    'description': 'Single Page Application',
    'name': 'SPA',
    'pass-through': [],
    'urlrewritefilter-jar-url': 'http://central.maven.org/maven2/org/tuckey/urlrewritefilter/4.0.3/urlrewritefilter-4.0.3.jar',
};

const opts = require('node-getopt').create([
    ['o', 'output=ARG', `output file (default is ${defaultOpts.output})`],
    ['i', 'input-dir=ARG', `root directory from which the files are taken (default is ${defaultOpts['input-dir']})`],
    ['d', 'description=ARG', 'application description'],
    ['n', 'name=ARG', 'application display name'],
    ['p', 'pass-through=ARG+', 'regexp to pass through'],
    ['U', 'urlrewritefilter-jar-url=ARG', `specify custom location for urlrewritefilter jar (default is ${defaultOpts['urlrewritefilter-jar-url']})`],
    ['h', 'help', 'display this help'],
])
    .bindHelp()
    .parseSystem();

makeWar({...defaultOpts, ...opts.options})
    .catch(e => console.error(e));
