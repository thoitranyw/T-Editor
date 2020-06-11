import { removeClass, getCaretPosition, getSelectedNodes } from "../helper";
import { EVENT_MOUSE_UP } from "../constants";

export default class UtilsTool {
    constructor(parent) {
        this.parent = parent;
    }

    init = () => {
        this.parent.app.addEventListener(EVENT_MOUSE_UP, this._eventMouseUp);
    };

    destroy = () => {};

    // prettier-ignore
    closeTools() {
    const elBajs = this.parent.app.querySelector('.bajs');
    if (!elBajs) return;
    removeClass('.bajs', 'bajs-tool--button-open bajs-tool--image-open bajs-tool--text-open');
    removeClass('.bajs-tool--text-open', 'bajs-tool--text-open');
    removeClass('.bajs-hashtag-group--open', 'bajs-hashtag-group--open');
    removeClass('.bajs-add--open-dropdown', 'bajs-add--open-dropdown');
    removeClass('.bajs-clicked', 'bajs-clicked');
    this.parent.hashtagTool.toggleListHashtag(null, false);
    const elHashtagFocus = this.parent.app.querySelectorAll("[hashtag-focus='true']");
    elHashtagFocus.forEach(item => item.removeAttribute("hashtag-focus"));
  }

    // prettier-ignore
    isSelectCurrentApp = () => {
        const elSelection = document.getSelection();
        const elParent = (elSelection.focusNode && elSelection.focusNode.parentNode) || false;

        const elApp = elParent && elParent.closest(".bajs-app") || null;
        const id = elApp && elApp.getAttribute("id") || null;
        if(id && id === `bajs-${this.parent.selectorText}`) {
            return true;
        };

        return false;
    }

    updatePositionCaret = (node) => {
        this.parent.lastTextFocus = {
            el: node,
            position: getCaretPosition(node),
        };
    };

    getElPropertyValue = (selector = ".bajs", prop, isFormatNumber = false) => {
        if (typeof selector === "string") {
            selector = this.parent.app.querySelector(selector);
        }
        if (!selector) return undefined;
        let value = selector.currentStyle || window.getComputedStyle(selector);
        value = value.getPropertyValue(prop);
        if (isFormatNumber) {
            value = value ? Number(value.replace(/\D/g, "")) : 0;
        }
        return value;
    };

    // prettier-ignore
    getPaddingApp = () => {
        let padLeftBajs = this.getElPropertyValue('.bajs', 'padding-left', true);
        let padTopBajs = this.getElPropertyValue('.bajs', 'padding-top', true);
        let borderWidthBajs = this.getElPropertyValue('.bajs', 'border-width', true);

        let padLeftBajsWrap = this.getElPropertyValue('.bajs-wrap', 'padding-left', true);
        let padTopBajsWrap = this.getElPropertyValue('.bajs-wrap', 'padding-top', true);
        let borderWidthBajsWrap = this.getElPropertyValue('.bajs-wrap', 'border-width', true);

        let padLeftBajsBody = this.getElPropertyValue('.bajs-body', 'padding-left', true);
        let padTopBajsBody = this.getElPropertyValue('.bajs-body', 'padding-top', true);
        let borderWidthBajsBody = this.getElPropertyValue('.bajs-body', 'border-width', true);

        const borderWidth = borderWidthBajs + borderWidthBajsBody + borderWidthBajsWrap;

        return {
            left: padLeftBajs + padLeftBajsBody + padLeftBajsWrap + borderWidth,
            top: padTopBajs + padTopBajsBody + padTopBajsWrap + borderWidth,
        }
    }

    // prettier-ignore
    offset = (el) => {
        var rect = el.getBoundingClientRect(),
        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
    }

    commandFontSize = (size, unit = "px") => {
        document.execCommand("fontSize", false, `${size}${unit}`);
    };

    commandColor(color) {
        document.execCommand("foreColor", false, color);
    }

    commandFontFamily = (font) => {
        font = `${font}, Roboto, sans-serif`;
        document.execCommand("fontName", false, font);
    };

    createTag = (nodeName, style) => {
        const el = document.createElement(nodeName);
        el.style.cssText = style;
        this.wrapSelection(el);
    };

    wrapSelection = (tags) => {
        var select = window.getSelection();
        if (select.rangeCount) {
            var range = select.getRangeAt(0).cloneRange();
            range.surroundContents(tags);
            select.removeAllRanges();
            select.addRange(range);
        }
    };

    // prettier-ignore
    refreshGoogleFont = (doc) => {
        const elBody = doc.querySelector(".bajs-body");
        const fonts = elBody.querySelectorAll("[style]");

        let keysFF = this.parent.fontFamily.map(item => item.key.toUpperCase());

        let attrStyles = [];
        [...fonts].forEach((el) => {
            const style = el.hasAttribute("style");
            if (style) {
                attrStyles.push(el.getAttribute("style"));
            }
        });
        attrStyles = [...new Set(attrStyles)];

        let useFonts = [];
        attrStyles.forEach(item => {
            keysFF.forEach(font => {
                if (item.toUpperCase().indexOf(font) > -1) {
                    useFonts.push(font);
                }
            })
        });
        useFonts = [...new Set(useFonts)];

        const els = doc.querySelectorAll(".bajs-font-cs");
        [...els].forEach((item) => item.remove());
        
        // init Google font
        const elBodyWrap = doc.querySelector(".bajs-body");
        this.parent.fontFamily.forEach(item => {
            if (useFonts.join(" ").includes(item.key.toUpperCase())) {
                elBodyWrap.insertAdjacentHTML("afterbegin", item.link);
            }
        });
    };

    // prettier-ignore
    initGoogleFont = () => {
        const elsFontCS = this.parent.app.querySelectorAll(".bajs-font-cs");
        [...elsFontCS].forEach(item => item.remove());
        
        // setTimeout(() => {
            const elBodyWrap = this.parent.app.querySelector(".bajs-body");
            this.parent.fontFamily.forEach((item) => {
                elBodyWrap && elBodyWrap.insertAdjacentHTML("afterbegin", item.link);
            });
        // }, 1000)
    };

    // prettier-ignore
    getStylesTool = (node = undefined) => {
        try {
            let nodes = [];

            if (node) {
                nodes = [node];
            } else {
                const elSelection = document.getSelection();
                const elParent = (elSelection.focusNode && elSelection.focusNode.parentNode) || false;
                const nodesSel = getSelectedNodes();
                nodes = [...nodesSel, elParent];
            }
            
            let style = {};
            nodes.forEach(node => {
                if (node && node.nodeType && node.nodeType === 1) {
                    const comp = node.currentStyle || window.getComputedStyle(node);
                    const fontWeight = comp.getPropertyValue('font-weight');
                    const textDecoration = comp.getPropertyValue('text-decoration-line');
                    const italic = comp.getPropertyValue('font-style');
                    const color = comp.getPropertyValue('color');
                    const backgroundColor = comp.getPropertyValue('background-color');
                    const fontSize = comp.getPropertyValue('font-size');
                    const fontFamily = comp.getPropertyValue('font-family');

                    if (!style.bold && fontWeight === "700") {
                        Object.assign(style, { bold: true })
                    }
                    
                    if (!style.underline && (textDecoration === "underline" || textDecoration === "underline line-through")) {
                        Object.assign(style, { underline: true })
                    }
        
                    if (!style.lineThrough && (textDecoration === "line-through" || textDecoration === "underline line-through")) {
                        Object.assign(style, { lineThrough: true })
                    }

                    if (!style.italic && italic === "italic") {
                        Object.assign(style, { italic: true })
                    }

                    if (!style.color && color) {
                        Object.assign(style, { color: color })
                    }

                    if (!style.backgroundColor && backgroundColor) {
                        Object.assign(style, { backgroundColor: backgroundColor })
                    }

                    if (!style.fontSize && fontSize) {
                        Object.assign(style, { fontSize: fontSize })
                    }

                    if (!style.fontFamily && fontFamily) {
                        const _ff = this.detectFontFamily(fontFamily.split(",")[0]);
                        Object.assign(style, { fontFamily: _ff })
                    }
                }

                if (node && node.nodeType && node.nodeType === 1) {
                    const elTextAlign = node.closest(".bajs-align");
                    const compAlign = elTextAlign.currentStyle || window.getComputedStyle(elTextAlign);
                    const align = compAlign.getPropertyValue('text-align');

                    if (!style.alignLeft && align === "left") {
                        Object.assign(style, { alignLeft: true })
                    }
        
                    if (!style.alignRight && align === "right") {
                        Object.assign(style, { alignRight: true })
                    }
        
                    if (!style.alignCenter && align === "center") {
                        Object.assign(style, { alignCenter: true })
                    }
                }
            });
            return style;
        } catch (error) {
            return {};
        }
    }

    convertFontSize = (fz) => {
        switch (fz) {
            case "10px":
                return 1;
            case "13px":
                return 2;
            case "16px":
                return 3;
            case "18px":
                return 4;
            case "24px":
                return 5;
            case "32px":
                return 6;
            case "48px":
                return 7;
            default:
                return 3;
        }
    };

    // prettier-ignore
    detectFontFamily = (fontFamily = "") => {
        let keysFF = this.parent.fontFamily.map(item => item.key.split(",")[0].toUpperCase());
        let _font = "";
        keysFF.find(font => {
            if (fontFamily.toUpperCase().indexOf(font) > -1) {
                _font = font;
            }
        });
        return _font;
    }

    _eventMouseUp = (e) => {
        const el = e.target;
        if (!el.closest(".bajs-app")) this.closeTools();
    };
}
