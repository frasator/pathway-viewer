#!/usr/bin/env node

'use strict';

const Vulcanize = require('vulcanize');
const async = require('async');
const path = require('path');
const shell = require('shelljs');
const fs = require('fs');

var name = "pathway-viewer";
var element = "pathway-viewer";

// Default
var bp = path.join(__dirname, "build");
var indexHTML = path.join(__dirname, name + '-index.html');
var buildIndexHTML = path.join(bp, 'index.html');
var elementHTML = path.join(__dirname, element + '.html');
var buildElementHTML = path.join(bp, element + '.html');

var vulcan = new Vulcanize({
    inlineScripts: true,
    inlineCss: true,
    stripComments: true
});

async.waterfall([
    function (cb) {
        shell.rm('-rf', bp);
        shell.mkdir('-p', bp);
        shell.mkdir('-p', path.join(bp, "fontawesome"));
        shell.mkdir('-p', path.join(bp, "webcomponentsjs"));

        cb(null);
    },
    function (cb) {
        vulcan.process(elementHTML, function (err, inlinedHtml) {
            fs.writeFile(buildElementHTML, inlinedHtml, function (err) {
                if (err) {
                    cb(err);
                } else {
                    cb(null);
                }
            });
        });
    },
    function (cb) {
        var bowerPath = path.join(__dirname, '..');
        shell.cp('-r', indexHTML, buildIndexHTML);
        shell.cp('-r', path.join(__dirname, 'conf/'), bp);
        shell.cp('-r', path.join(bowerPath, 'network-viewer', 'conf', 'config.js'), path.join(bp, 'conf', 'nv-config.js'));
        shell.cp('-r', path.join(bowerPath, 'normalize-css'), bp);
        shell.cp('-r', path.join(bowerPath, 'stevia-elements', 'fonts'), bp);
        shell.cp('-r', path.join(bowerPath, 'stevia-elements', 'css'), bp);
        shell.cp('-r', path.join(bowerPath, 'fontawesome', 'css'), path.join(bp, "fontawesome/"));
        shell.cp('-r', path.join(bowerPath, 'fontawesome', 'fonts'), path.join(bp, "fontawesome/"));
        shell.cp('-r', path.join(bowerPath, 'webcomponentsjs', '*.min.js'), path.join(bp, "webcomponentsjs/"));

        // fix index.html paths
        shell.sed('-i', '../network-viewer/conf/config.js', 'conf/nv-config.js', buildIndexHTML);
        shell.sed('-i', '../stevia-elements/', '', buildIndexHTML);
        shell.sed('-i', '../normalize-css/', 'normalize-css/', buildIndexHTML);
        shell.sed('-i', '../fontawesome/', 'fontawesome/', buildIndexHTML);
        shell.sed('-i', '../webcomponentsjs/', 'webcomponentsjs/', buildIndexHTML);

        cb(null);
    }
], function (err) {
    if (err) {
        console.log(err);
    }
    console.log("Done.");
});
