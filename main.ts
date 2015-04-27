import Promise = require('bluebird');
import { parseHtml, wrapHtml } from './helpers';
import { processPatches } from './processDomDiff';
var domdiff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');

export function getHtmlDiff(before: string, after: string): Promise<string> {
    return Promise.all([parseHtml(wrapHtml(before)), parseHtml(wrapHtml(after))])
    .spread(function(treeBefore, treeAfter) {
        var patches = domdiff(treeBefore, treeAfter);
        var rootNode = createElement(treeBefore);
        processPatches(rootNode, patches);
        patch(rootNode, patches);
        var result = '';
        rootNode.childNodes.forEach(function(node) {
            result += node.toString();
        });
        return result;
    })
    .then(function(result: string) {
        return result;
    });
}

module.exports = {
    getHtmlDiff: getHtmlDiff
};