import Promise = require('bluebird');
import _ = require('lodash');
import validator = require('validator');
var h = require('virtual-dom/h');
var jsdiff = require('diff');
var vm = require('vm');
var parser = require('./lib/html2hscript/index');

export function parseHtml(rawHtml: string): Promise<any> {
    var sandbox = { h: h };
    var context = vm.createContext(sandbox);
    return new Promise(function(resolve: (result: any) => void, reject) {
        parser(rawHtml, function(err, script) {
            if (err) { reject(err); }
            else {
                let x = new vm.Script(script);
                let hnode = x.runInContext(context);
                resolve(hnode);
            }
        });
    });
}

export function wrapHtml(rawHtml: string): string {
    rawHtml = rawHtml || '';
    return `<div id="container">
${rawHtml}
</div>`;
}

export function getTextDiff(before: string, after: string, diffMapper: IDiffMapper): Array<any> {
    before = before || '';
    before = splitByNewline(before).join('\n');
    after = after || '';
    after = splitByNewline(after).join('\n');
    var diffs: Array<IJsDiff> = jsdiff.diffWordsWithSpace(before, after);
    var lines = [];

    diffs.forEach(function (diff) {
        var temp;
        if (diff.added) {
            temp = splitByNewline(diff.value)
                .filter((line) => !!line)
                .map(diffMapper.added);
        } else if (diff.removed) {
            temp = splitByNewline(diff.value)
                .filter((line) => !!line)
                .map(diffMapper.removed);
        } else {
            temp = splitByNewline(diff.value)
                .filter((line) => !!line)
                .map(diffMapper.unchanged);
        }
        lines.push(temp);
    });

    return _.flatten(lines);
}

function splitByNewline(text: string): Array<string> {
    var parts = text.split('\r\n').map((x) => x.split('\n'));
    return <Array<string>>_.flatten(parts);
}

interface IJsDiff {
    added?: boolean;
    removed?: boolean;
    value: string;
}

export interface IDiffMapper {
    added: (line: string) => any;
    removed: (line: string) => any;
    unchanged: (line: string) => any;
}

module.exports = {
    parseHtml: parseHtml,
    wrapHtml: wrapHtml,
    getTextDiff: getTextDiff
};