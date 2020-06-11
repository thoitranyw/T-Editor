// prettier-ignore
export function focusContenteditableDiv(el, doc = document, isCursorFirst = false) {
    let sel = window.getSelection();
    let range = doc.createRange();
    range.selectNodeContents(el);
    range.collapse(isCursorFirst);
    sel.removeAllRanges();
    sel.addRange(range);
    el.setAttribute("focus", true);
}

export function getCaretPosition(node) {
    try {
        let range = window.getSelection().getRangeAt(0),
            preCaretRange = range.cloneRange(),
            caretPosition,
            tmp = document.createElement("div");

        preCaretRange.selectNodeContents(node);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        tmp.appendChild(preCaretRange.cloneContents());
        caretPosition = tmp.innerHTML.length;
        return caretPosition;
    } catch (error) {
        return 0;
    }
}

export function setCaretPosition(node, caretPos) {
    var elem = node;

    try {
        if (elem != null) {
            if (elem.createTextRange) {
                var range = elem.createTextRange();
                range.move("character", caretPos);
                range.select();
            } else {
                if (elem.selectionStart) {
                    elem.focus();
                    elem.setSelectionRange(caretPos, caretPos);
                } else elem.focus();
            }
        }
    } catch (error) {
        console.log(error);
    }
}

export function getSelectionTextInfo(el) {
    let atStart = false;
    let atEnd = false;
    let selRange = undefined;
    let testRange = undefined;

    if (window.getSelection) {
        const sel = window.getSelection();
        if (sel.rangeCount) {
            selRange = sel.getRangeAt(0);
            testRange = selRange.cloneRange();

            testRange.selectNodeContents(el);
            testRange.setEnd(selRange.startContainer, selRange.startOffset);
            atStart = testRange.toString() == "";

            testRange.selectNodeContents(el);
            testRange.setStart(selRange.endContainer, selRange.endOffset);
            atEnd = testRange.toString() == "";
        }
    } else if (document.selection && document.selection.type != "Control") {
        selRange = document.selection.createRange();
        testRange = selRange.duplicate();

        testRange.moveToElementText(el);
        testRange.setEndPoint("EndToStart", selRange);
        atStart = testRange.text == "";

        testRange.moveToElementText(el);
        testRange.setEndPoint("StartToEnd", selRange);
        atEnd = testRange.text == "";
    }

    return { atStart: atStart, atEnd: atEnd };
}

export function enterTagInstead(tag = "br") {
    try {
        let docFragment = document.createDocumentFragment();

        //add a new line
        let newEle = document.createTextNode("");
        docFragment.appendChild(newEle);

        //add the br, or p, or something else
        newEle = document.createElement(tag);
        docFragment.appendChild(newEle);

        //make the br replace selection
        let range = window.getSelection().getRangeAt(0);
        range.deleteContents();
        range.insertNode(docFragment);

        //create a new range
        range = document.createRange();
        range.setStartAfter(newEle);
        range.collapse(true);

        //make the cursor there
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } catch (error) {}
}

export function previewImageUpload(input, elPreview, base64) {
    let files = input.target.files || input.dataTransfer.files;

    if (!files && !files[0]) {
        elPreview && elPreview.setAttribute("src", "");
        return false;
    }

    if (files && files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            base64 && base64(e.target.result);
            elPreview && elPreview.setAttribute("src", e.target.result);
        };

        reader.readAsDataURL(files[0]);
        return true;
    }
}

export function validURL(str) {
    var pattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
            "(\\#[-a-z\\d_]*)?$",
        "i"
    ); // fragment locator
    return !!pattern.test(str);
}

export function selectAllText(selector, doc = document) {
    let node = "";
    if (typeof selector === "object") {
        node = selector;
    } else if (typeof selector === "string") {
        node = doc.querySelector(selector);
    }

    if (!node) {
        console.warn("Not found node");
        return;
    }

    if (document.body.createTextRange) {
        const range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
    } else if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        console.warn("Could not select text in node: Unsupported browser.");
    }
}

export function removeClass(selector, cls, doc = document) {
    const els = doc.querySelectorAll(selector);
    [...els].forEach((el) => {
        const split = cls.split(" ");
        [...split].forEach((clsTmp) => el.classList.remove(clsTmp));
    });
}

// prettier-ignore
export function getSelectionText() {
    var text = "";
    var activeEl = document.activeElement;
    var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
    if (
      (activeElTagName == "textarea") || (activeElTagName == "input" &&
      /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&
      (typeof activeEl.selectionStart == "number")
    ) {
        text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
    } else if (window.getSelection) {
        text = window.getSelection().toString();
    }
    return text;
}

export function getSelectionDimensions() {
    let sel = document.selection;
    let range;
    let width = 0;
    let height = 0;
    let top = 0;
    let left = 0;

    if (sel) {
        if (sel.type != "Control") {
            range = sel.createRange();
            width = range.boundingWidth;
            height = range.boundingHeight;
        }
    } else if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0).cloneRange();
            if (range.getBoundingClientRect) {
                let rect = range.getBoundingClientRect();
                width = rect.right - rect.left;
                height = rect.bottom - rect.top;
                top = rect.top;
                left = rect.left;
            }
        }
    }

    return { width: width, height: height, top: top, left: left };
}

export function safeMove(event) {
    let curRange, i, loops, nodes, previousNode, r, range, sel, selection;
    const el = event.target;

    try {
        if (window.getSelection && event.which === 39) {
            sel = window.getSelection();
            nodes = sel.anchorNode.childNodes;
            selection = sel.anchorOffset;
            loops = 0;
            i = selection;
            if (
                nodes.length > 0 ||
                (nodes.length === 0 &&
                    sel.anchorNode.length === selection &&
                    sel.anchorNode.nextSibling !== null)
            ) {
                r = document.createRange();
                if (
                    nodes.length === 0 &&
                    sel.anchorNode.length === selection &&
                    sel.anchorNode.nextSibling !== null
                ) {
                    r.setStartBefore(sel.anchorNode.nextSibling);
                    r.setEndAfter(sel.anchorNode.nextSibling);
                } else {
                    while (i < nodes.length) {
                        loops += 1;
                        if (nodes[i].nodeType !== 3) {
                            break;
                        }
                        i++;
                    }
                    r.setEnd(el, selection + loops);
                    r.setStart(el, selection);
                }
                sel.removeAllRanges();
                sel.addRange(r);
                el.focus();
            }
        }

        if (
            window.getSelection &&
            event.type === "keydown" &&
            event.which === 8
        ) {
            selection = window.getSelection();
            if (!selection.isCollapsed || !selection.rangeCount) {
                return;
            }
            curRange = selection.getRangeAt(selection.rangeCount - 1);
            if (
                curRange.commonAncestorContainer.nodeType === 3 &&
                curRange.startOffset > 0
            ) {
                return;
            }
            range = document.createRange();
            if (selection.anchorNode !== el) {
                range.selectNodeContents(el);
                range.setEndBefore(selection.anchorNode);
            } else if (selection.anchorOffset > 0) {
                range.setEnd(el, selection.anchorOffset);
            } else {
                return;
            }
            nodes = selection.anchorNode.childNodes;
            loops = 0;
            i = nodes.length - 1;
            if (
                nodes[i] &&
                (nodes[i].nodeType !== 3 || nodes[i].length === 0)
            ) {
                while (i >= 0) {
                    loops += 1;
                    if (
                        nodes[i].nodeType !== 3 ||
                        (nodes[i].nodeType === 3 && nodes[i].length > 0)
                    ) {
                        break;
                    }
                    i--;
                }
                range.setStart(el, range.endOffset - loops);
                previousNode = range.cloneContents().lastChild;
                if (previousNode) {
                    range.deleteContents();
                    event.preventDefault();
                }
            }
        }
    } catch (error) {}
}

export function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
}

export function getAllSiblings(elem, filters = []) {
    var sibs = [];
    elem = elem.parentNode.firstChild;
    do {
        if (elem.nodeType === 3) continue; // text node

        const nodeName = elem.nodeName.toUpperCase();
        if (Array.isArray(filters)) {
            filters = filters.map((item) => item.toUpperCase());
        }
        if (filters.length > 0) {
            if (filters.includes(nodeName)) sibs.push(elem);
            continue;
        }
        sibs.push(elem);
    } while ((elem = elem.nextSibling));
    return sibs;
}

export function getNextSiblings(elem, filters = []) {
    var sibs = [];
    while ((elem = elem.nextSibling)) {
        if (elem.nodeType === 3) continue; // text node
        const nodeName = elem.nodeName.toUpperCase();
        if (Array.isArray(filters)) {
            filters = filters.map((item) => item.toUpperCase());
        }
        if (filters.length > 0) {
            if (filters.includes(nodeName)) sibs.push(elem);
            continue;
        }
        sibs.push(elem);
    }
    return sibs;
}

//this will start from the current element and get all the previous siblings

export function getPreviousSiblings(elem, filters = []) {
    var sibs = [];
    while ((elem = elem.previousSibling)) {
        if (elem.nodeType === 3) continue; // text node
        const nodeName = elem.nodeName.toUpperCase();
        if (Array.isArray(filters)) {
            filters = filters.map((item) => item.toUpperCase());
        }
        if (filters.length > 0) {
            if (filters.includes(nodeName)) sibs.push(elem);
            continue;
        }
        sibs.push(elem);
    }
    return sibs;
}

export function getSelectedNodes() {
    if (window.getSelection) {
        var sel = window.getSelection();
        if (!sel.isCollapsed) {
            return getRangeSelectedNodes(sel.getRangeAt(0));
        }
    }
    return [];
}

export function titleCase(str) {
    try {
        return str
            .toLowerCase()
            .split(" ")
            .map(function (word) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(" ");
    } catch (error) {
        return str;
    }
}

export function firstLetterUpper(str) {
    try {
        return str
            .toLowerCase()
            .replace(/(^\s*\w|[\.\!\?]\s*\w)/g, function (c) {
                return c.toUpperCase();
            });
    } catch (error) {
        return str;
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function nextNode(node) {
    if (node.hasChildNodes()) {
        return node.firstChild;
    } else {
        while (node && !node.nextSibling) {
            node = node.parentNode;
        }
        if (!node) {
            return null;
        }
        return node.nextSibling;
    }
}

function getRangeSelectedNodes(range) {
    var node = range.startContainer;
    var endNode = range.endContainer;

    // Special case for a range that is contained within a single node
    if (node == endNode) {
        return [node];
    }

    // Iterate nodes until we hit the end container
    var rangeNodes = [];
    while (node && node != endNode) {
        rangeNodes.push((node = nextNode(node)));
    }

    // Add partially selected nodes at the start of the range
    node = range.startContainer;
    while (node && node != range.commonAncestorContainer) {
        rangeNodes.unshift(node);
        node = node.parentNode;
    }

    return rangeNodes;
}
