import _ = require('lodash');
import { getTextDiff, IDiffMapper } from './helpers';
import validator = require('validator');
var h = require('virtual-dom/h');
var domIndex = require('./node_modules/virtual-dom/vdom/dom-index');

interface IVNode {
    tagName: string;
    properties: any;
    children: Array<IVNode|IVText>;
    namespace: string;
    hasWidgets: boolean;
    hasThunks: boolean;
    count: number;
}
interface IVText {
    text: string;
}
interface IVPatch {
    type: number;
    vNode: IVNode|IVText;
    patch: IVNode|IVText|any;
}

// enum, see: https://github.com/Matt-Esch/virtual-dom/blob/master/vnode/vpatch.js
var VPatch = {
    NONE: 0,
    VTEXT: 1,
    VNODE: 2,
    WIDGET: 3,
    PROPS: 4,
    ORDER: 5,
    INSERT: 6,
    REMOVE: 7,
    THUNK: 8
};

var diffMapper: IDiffMapper = {
    added: function (line) {
        return h('span.diff-added', validator.escape(line));
    },
    removed: function (line) {
        return h('span.diff-removed', validator.escape(line));   
    },
    unchanged: function (line) {
        return h('span', validator.escape(line));
    }
};

function parseVPatch(item): IVPatch {
    return item.hasOwnProperty('type') ? <IVPatch>item : null;
}
function parseVText(item): IVText {
    return item.hasOwnProperty('text') ? <IVText>item : null;
}
function parseVNode(item): IVNode {
    return item.hasOwnProperty('tagName') ? <IVNode>item : null;
}


function processRemoveNode(patch: IVPatch) {
    if (patch && patch.type === VPatch.REMOVE) {
        let origText = parseVText(patch.vNode);
        if (origText) {
            patch.type = VPatch.VNODE;
            patch.patch = h('span.diff-removed', origText.text);
        } else {
            patch.type = VPatch.PROPS;
            let origNode = parseVNode(patch.vNode);
            let className = modifyClassName(origNode, 'diff-removed');
            patch.patch = { className: className };
        }
    }
}

function processAddNode(patch: IVPatch) {
    if (patch && patch.type === VPatch.INSERT) {
        let patchText = parseVText(patch.patch);
        if (patchText) {
            patch.patch = h('span.diff-added', patchText.text);
        } else {
            let patchNode = parseVNode(patch.patch);
            let className = modifyClassName(patchNode, 'diff-added');

            mergeNodeProperties(patchNode, { className: className });
        }
    }
}

function processReplaceNode(patch: IVPatch) {
    if (patch && patch.type === VPatch.VNODE) {
        let patchNode = parseVNode(patch.patch);
        let className = modifyClassName(patchNode, 'diff-changed');

        mergeNodeProperties(patchNode, { className: className });   
    }
}

function processReplaceText(patch: IVPatch, parentKey: string, patches: any) {
    if (patch && patch.type === VPatch.VTEXT) {
        let origText = parseVText(patch.vNode);
        let patchText = parseVText(patch.patch);
        if (origText) {
            let diffs = <Array<IVNode>>getTextDiff(origText.text, patchText.text, diffMapper);
            let head = diffs.splice(0, 1)[0];
            let newPatches = diffs.map(function (diff): IVPatch {
                return {
                    type: VPatch.INSERT,
                    vNode: null,
                    patch: diff
                };
            });
            if (patches.hasOwnProperty(parentKey)) {
                if (_.isArray(patches[parentKey])) {
                    patches[parentKey].concat(newPatches);
                } else {
                    patches[parentKey] = [patches[parentKey]].concat(newPatches);
                }
            } else {
                patches[parentKey] = newPatches;
            }
            patch.type = VPatch.VNODE;
            patch.patch = head;
        } else {
            patch.type = VPatch.VNODE;
            patch.patch = h('span.diff-changed', patchText.text);
        }
    }
}

export function processPatches(rootNode, patches) {
    var indices = patchIndices(patches);
    var domindex = domIndex(rootNode, patches.a, indices);
    var key;
    for (key in patches) {
        if (key !== 'a') {
            if (_.isArray(patches[key])) {
                patches[key].forEach(function(x) {
                    let patch = parseVPatch(x);
                    processPatch(patch, key, patches);
                });
            } else {
                let patch = parseVPatch(patches[key]);
                
                processPatch(patch, key, patches);
            }
        }
    }

    function processPatch(patch: IVPatch, key: string, patches: any) {
        switch (patch.type) {
            case VPatch.REMOVE:
                processRemoveNode(patch);
                break;
            case VPatch.INSERT:
                processAddNode(patch);
                break;
            case VPatch.VNODE:
                processReplaceNode(patch);
                break;
            case VPatch.VTEXT:
                processReplaceText(patch, findNode(domindex[key].parentNode), patches);
                break;
        }
    }

    function patchIndices(patches): Array<number> {
        var indices = [];
        var key;
        for (key in patches) {
            if (key !== 'a') {
                indices.push(parseInt(key));
            }
        }
        return indices;
    }
    function findNode(node) {
        var key;
        for (key in domindex) {
            if (_.isEqual(domindex[key], node)) {
                return key;
            }
        }
        return null;
    }
}

function modifyClassName(vnode: IVNode, className: string): string {
    var result = '';
    if (vnode.properties && vnode.properties.hasOwnProperty('className')) {
        result = vnode.properties.className;
    }
    if (result) {
        result += ' ' + className;
    } else {
        result = className;
    }
    return result;
}
function mergeNodeProperties(vnode: IVNode, patch: any) {
    var oldProps = vnode.properties || {};
    var merged = _.merge(oldProps, patch);
    vnode.properties = merged;
}