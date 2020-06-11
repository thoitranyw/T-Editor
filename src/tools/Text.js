import { EVENT_MOUSE_UP } from "../constants";
import Picker from "vanilla-picker";
import {
    focusContenteditableDiv,
    selectAllText,
    getSelectionText,
    safeMove,
    getSelectionTextInfo,
    firstLetterUpper,
    getCaretPosition,
} from "../helper";
import SelectBaJS from "../libs/select-bajs";

export default class TextTool {
    constructor(parent) {
        this.parent = parent;

        this.colorText = undefined;
        this.flagEmptyText = undefined;
        this.selectFont = undefined;
        this.selectSize = undefined;
        this.enterBreakText = false;

        this.clsSelectFF = `${this.parent.selectorText}-select-ff`;
        this.clsSelectFZ = `${this.parent.selectorText}-select-fz`;
    }

    init = () => {
        this._onLoad();
        this._initTools();

        this._listenToolActionText();
        this._initColorPickerText();
        this._listenChangeLink();

        this.parent.app.addEventListener("keyup", this._eventKeyUp);
        document.addEventListener(EVENT_MOUSE_UP, this._eventMouseUp);
        document.addEventListener("selectionchange", this._eventSelection);
    };

    destroy = () => {
        document.removeEventListener(EVENT_MOUSE_UP, this._eventMouseUp);
        document.removeEventListener("selectionchange", this._eventSelection);
    };

    createTextAt = (currentBlock, text = "") => {
        const noEnter = this.parent.app.querySelector(".no-enter");
        const hasEditor = this.parent.app.querySelector(".bajs-editor");
        if (noEnter && hasEditor) return;
        if (!currentBlock) return;
        currentBlock.insertAdjacentHTML("afterend", this._createText(text));
        const newBlock = currentBlock.nextElementSibling;
        const newEditable = newBlock.querySelector(".bajs-editor");
        focusContenteditableDiv(newEditable);
        this.listenRemoveEditable();
        this.parent.componentTool.addLineToBlock(newBlock);
        this.parent.componentTool.moveButtonAdd(newBlock);
        this.parent.utilsTool.closeTools();
        this.parent.utilsTool.updatePositionCaret(newEditable);
        return newEditable;
    };

    // prettier-ignore
    listenRemoveEditable = () => {
        const els = this.parent.app.querySelectorAll('.bajs-editor');
        [...els].forEach(el => el.removeEventListener('keydown', this._keyDownEditableEmpty));
        [...els].forEach(el => el.addEventListener('keydown', this._keyDownEditableEmpty));

        [...els].forEach(el => el.removeEventListener('focus', this._editableFocus));
        [...els].forEach(el => el.addEventListener('focus', this._editableFocus));

        [...els].forEach(el => el.removeEventListener('blur', this._editableBlur));
        [...els].forEach(el => el.addEventListener('blur', this._editableBlur));

        // Nhập link xong enter đóng Input
        const inpLink = this.parent.app.querySelector(".bajs-tool__link input");
        inpLink && inpLink.addEventListener("keyup", e => {
            if (e.which == 13) {
                e.preventDefault();
                this._toggleEditLink(false);
            }
        });
    }

    // ===================== EVENT =====================

    _eventKeyUp = (e) => {
        // Esc key
        if (e.which == 27) {
            this._toggleToolText(false);
            this._toggleEditLink(false);
        }
    };

    // prettier-ignore
    _eventMouseUp = (e) => {
        if (!this.parent.utilsTool.isSelectCurrentApp()) {
            this._toggleToolText(false);
            this._toggleEditLink(false);
            return;
        }

        const el = e.target;
        this.enterBreakText = false;

        this._clickUpRemoveLink(e);
        this._clickUpEditTextLink(e);
        
        if (getSelectionText().length === 0) {
            this._toggleToolText(false);
        } else {
            this._openToolText(e);
        }

        const elBajsTextOpen = this.parent.app.querySelector(".bajs-tool--text-open");
        if (elBajsTextOpen) {
            // const elToolWrap = el.closest(".bajs-tool--text");
            // const elToolText = el.closest(".bajs-tool__item");
            // const elToolText = el.closest(".bajs-tool__text");
            const elToolEditFallback = this.parent.app.querySelector(".bajs-hashtag-group--open");
            const elToolButton = this.parent.app.querySelector(".bajs-tool--button-open");

            if (elToolEditFallback || elToolButton) {
                this._toggleToolText(false);
            }
        }
    };

    _eventSelection = () => {
        if (getSelectionText().length === 0) {
            this._toggleToolText(false);
        }
    };

    // ===================== END: EVENT =====================

    // prettier-ignore
    _onLoad = () => {
        const elFirstBlock = this.parent.app.querySelector('.bajs-block--first');
        const newEl = this.createTextAt(elFirstBlock);
        // this.parent.lastTextFocus = newEl;
        this.parent.utilsTool.updatePositionCaret(newEl);
        this._initSelect();
    };

    _initSelect = () => {
        const hasUseFontFamily = this.parent.feature.fontFamily;
        if (!hasUseFontFamily) return;

        this.selectSize = new SelectBaJS({
            selector: `.${this.clsSelectFZ}`,
            onChange: (fz) => {
                this.parent.utilsTool.commandFontSize(fz);
            },
        });

        this.selectFont = new SelectBaJS({
            selector: `.${this.clsSelectFF}`,
            onChange: (font) => {
                this.parent.utilsTool.commandFontFamily(font);
            },
        });
    };

    _toggleToolText = (isBoolean) => {
        if (this.parent.disableTool.text) return;
        const action = isBoolean ? "add" : "remove";
        const elBajs = this.parent.app.querySelector(".bajs");
        elBajs.classList[action]("bajs-tool--text-open");
    };

    // prettier-ignore
    _initTools = () => {
        const el = this.parent.app.querySelector(".bajs");

        let tempOptionFz = "";
        for (let i = 1; i <= 7; i++) {
            const isSelected = i === 1 ? "selected" : "";
            tempOptionFz += `<option value="${i}" ${isSelected}>Size ${i}</option>`;
        }

        let tempOptionFf = "";
        for (let i = 0; i < this.parent.fontFamily.length; i++) {
            const ff = this.parent.fontFamily[i];
            const name = ff.name;
            const key = ff.key;
            const isSelected = key === this.parent.fontFamilyDefault ? "selected" : "";
            tempOptionFf += `<option value="${key}" ${isSelected}>${name}</option>`;
        }

        const temp = `
        <div class="bajs-tool bajs-tool--text">
            <div class="bajs-tool__text">
                <div class="bajs-tool__row">
                    <div class="bajs-select__font-family">
                        <select class="bajs-select ${this.clsSelectFF}">
                            ${tempOptionFf}
                        </select>
                    </div>

                    <div class="bajs-select__font-size">
                        <select class="bajs-select ${this.clsSelectFZ}">
                            ${tempOptionFz}
                        </select>
                    </div>
                </div>

                <div class="bajs-tool__row">
                    <div class="bajs-tool__item" data-action="bold">
                        <i class="fa fa-bold" aria-hidden="true"></i>
                    </div>
                    <div class="bajs-tool__item" data-action="italic">
                        <i class="fa fa-italic" aria-hidden="true"></i>
                    </div>
                    <div class="bajs-tool__item" data-action="underline">
                        <i class="fa fa-underline" aria-hidden="true"></i>
                    </div>
                    <div class="bajs-tool__item" data-action="strikethrough">
                        <i class="fa fa-strikethrough" aria-hidden="true"></i>
                    </div>
                    <div class="bajs-tool__item bajs-tool__item-bg">
                        <div class="bajs-tool__text-color" title="Text color" style="background-color: #fff;"></div>
                    </div>
                    <div class="bajs-tool__item" data-action="left">
                        <i class="fa fa-align-left" aria-hidden="true"></i>
                    </div>
                    <div class="bajs-tool__item" data-action="center">
                        <i class="fa fa-align-center" aria-hidden="true"></i>
                    </div>
                    <div class="bajs-tool__item" data-action="right">
                        <i class="fa fa-align-right" aria-hidden="true"></i>
                    </div>
                    <div class="bajs-tool__item" data-action="link">
                        <i class="fa fa-link" aria-hidden="true"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="bajs-tool bajs-tool--link">
            <div class="bajs-tool__link">
                <input type="text" placeholder="Enter a link" />
                <div class="bajs-tool__row">
                    <div class="bajs-tool__item" data-action="remove-link">
                        <i class="fa fa-times-circle" aria-hidden="true"></i>
                    </div>
                </div>
            </div>
        </div>
        `;
        el.insertAdjacentHTML("beforeend", temp);
    }

    // prettier-ignore
    _createText = (text = '', align = "center") => {
        const cssEnterSMS = this.parent.feature.enterSMS ? "" : "";
        // const cssEnterSMS = this.parent.feature.enterSMS ? "style='white-space: pre-wrap'" : "";
        return `
        <div class="bajs-block bajs-drag">
            <div class="bajs-block-wrap">
                <div class="bajs-type-text">
                    <div class="bajs-align" style="text-align: ${this.parent.alignDefault || align}">
                        <div class="bajs-editor" contentEditable="true" spellcheck="false" ${cssEnterSMS}>${text}</div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    // prettier-ignore
    _clickUpRemoveLink = e => {
        const el = e.target;
        const elRemoveLink = el.closest("[data-action='remove-link']");
        if (elRemoveLink) {
            const elLinkFocus = this.parent.app.querySelector("[link-focus='true']");
            if (!elLinkFocus) return;
            selectAllText(elLinkFocus);
            elLinkFocus.insertAdjacentHTML("afterend", elLinkFocus.textContent)
            elLinkFocus.remove();
            this._toggleEditLink(false)
        }
    }

    // prettier-ignore
    _keyDownEditableEmpty = e => {
        const key = e.keyCode || e.charCode;
        const parent = this.parent;
        const el = e.target;

        let range = new Range();
        const selection = window.getSelection();
        const pos = selection.focusOffset;

        const elBlockWrap = el.closest(".bajs-block");
        let elTextFocus = this.parent.app.querySelector(".bajs-editor[focus='true']");
        const elBlockWrapFocus = elTextFocus.closest(".bajs-block");
        const statusLine = getSelectionTextInfo(elTextFocus);

        /** Enter key */
        if (key === 13 && elTextFocus) {
            e.preventDefault();
            const noEnter = this.parent.app.querySelector(".no-enter");
            
            if (pos === 0 && !noEnter) {
                if (!elTextFocus || !elBlockWrapFocus) return;
                try {
                    const rangeStart = selection.focusNode;
                    let lastChildNode = elTextFocus?.lastChild?.lastChild || elTextFocus?.lastChild;
                    const nodeType = lastChildNode?.nodeType || 1;
                    const length = nodeType === 3 ? lastChildNode.length : (lastChildNode?.innerText?.length || 0);
                    range.setStart(rangeStart, pos);
                    range.setEnd(lastChildNode, length);
                    let content = range.extractContents();
                    this.createTextAt(elBlockWrapFocus);
                    elTextFocus = parent.app.querySelector(".bajs-editor[focus=true]");
                    elTextFocus.innerHTML = "";
                    elTextFocus.append(content);
                } catch(error) {
                    this.createTextAt(elBlockWrapFocus);
                }
            } else {
                document.execCommand('insertHTML', true, statusLine.atEnd ? '<br><br>' : '<br>');
            }
        }

        /** 
         * Backspace key + delete key  
         * remove block empty
         * */
        if (key === 8 || key === 46) {
            const noDel = this.parent.app.querySelector(".no-del");
            if (noDel) return;
            
            const elBlocks = this.parent.app.querySelectorAll(".bajs-block:not(.bajs-block--first)");
            const prevBlock = elBlockWrap.previousElementSibling;
            
            /** Không remove nữa nếu chỉ còn 1 block editor */
            if (pos === 0 && elBlocks.length <= 1) {
                const elEditor = this.parent.app.querySelectorAll(".bajs-editor");
                if (elEditor.length <= 1) return;
            }

            /** Xóa block trước đó */
            if (el.textContent.length === 0) {
                if (this.flagEmptyText) {
                    e.preventDefault();
                    // focus editor prev
                    const prevEditable = prevBlock.querySelector(".bajs-editor");
                    prevEditable && focusContenteditableDiv(prevEditable);

                    const prevBtn = prevBlock.querySelector(".bajs-btn");
                    if (prevBtn) {
                        prevBtn.classList.add("bajs-clicked");
                        setTimeout(() => (parent.elClicked = prevBtn), 100);
                    }

                    const prevImg = prevBlock.querySelector(".bajs-img");
                    if (prevImg) {
                        prevImg.classList.add("bajs-clicked");
                        setTimeout(() => (parent.elClicked = prevImg), 100);
                    }

                    // xóa block
                    elBlockWrap.remove();
                }
                
                this.flagEmptyText = true;
            } else {
                this.flagEmptyText = false;
            }

            /** nối liền 2 block lại */
            if (pos === 0 && el.textContent.length > 0 && statusLine.atStart) {
                const prev = elBlockWrapFocus.previousElementSibling;
                if (prev) {
                    const prevEditor = prev.querySelector(".bajs-editor");
                    if (prevEditor) {
                        e.preventDefault();

                        range.selectNodeContents(elTextFocus);
                        selection.addRange(range);
                        let content = range.cloneContents();

                        // remove br last child editor focus
                        const prevEditorLastEl = prevEditor.lastElementChild;
                        if (prevEditorLastEl && prevEditorLastEl.nodeName === "BR") {
                            prevEditorLastEl.remove();
                        }

                        if (prevEditor.textContent.length > 0) {
                            focusContenteditableDiv(prevEditor, document, false);
                            prevEditor.append(content);
                        } else {
                            prevEditor.append(content);
                            focusContenteditableDiv(prevEditor, document, true);
                        }

                        elBlockWrap.remove();
                    }
                }
            }

            safeMove(e);
        }

        // keys: < ^ >
        if (key === 37 || key === 38 || key === 39 || key === 40) {
            // up key
            if (key === 38 && statusLine.atStart) {
                const prev = elBlockWrapFocus.previousElementSibling;
                if (prev) {
                    const editor = prev.querySelector(".bajs-editor");
                    editor && focusContenteditableDiv(editor);
                }
            }

            // down key
            if (key === 40 && statusLine.atEnd) {
                const next = elBlockWrapFocus.nextElementSibling;
                if (next) {
                    const editor = next.querySelector(".bajs-editor");
                    editor && focusContenteditableDiv(editor, document, true);
                }
            }

            safeMove(e);
        }
    }

    _editableFocus = (e) => {
        const el = e.target;
        el.setAttribute("focus", true);
        this.flagEmptyText = false;
        this.parent.utilsTool.updatePositionCaret(el);
    };

    _editableBlur = (e) => {
        const el = e.target;
        el.setAttribute("focus", false);
        this.flagEmptyText = false;
    };

    _listenToolActionText = () => {
        const els = this.parent.app.querySelectorAll(
            ".bajs-tool--text .bajs-tool__item"
        );
        [...els].forEach((el) =>
            el.addEventListener("click", this._actionText)
        );
    };

    // prettier-ignore
    _actionText = e => {
        const el = e.target;
        const elItem = el.closest(".bajs-tool__item");
        const action = elItem.getAttribute("data-action");

        const elColor = el.closest(".picker_wrapper");
        if (elColor) return;

        const elSelection = document.getSelection();
        const elParent = (elSelection.focusNode && elSelection.focusNode.parentNode) || false;
        const elAlign = elParent && elParent.closest(".bajs-align") || false;

        switch (action) {
            case "bold":
                document.execCommand("bold", false, null);
                break;
            case "italic":
                document.execCommand("italic", false, null);
                break;
            case "underline":
                document.execCommand("underline", false, null);
                break;
            case "strikethrough":
                document.execCommand("strikeThrough", false, null);
                break;
            case "left":
                elAlign && (elAlign.style.textAlign = "left");
                break;
            case "center":
                elAlign && (elAlign.style.textAlign = "center");
                break;
            case "right":
                elAlign && (elAlign.style.textAlign = "right");
                break;
            case "link":
                document.execCommand('insertHTML', false, '<a class="bajs-href" data-href="" target="_blank" data-focus="true">' + elSelection + '</a>')
                const elLinkFocus = this.parent.app.querySelector(".bajs-href[data-focus='true']");
                if(elLinkFocus) {
                    elLinkFocus.setAttribute("link-focus", true)
                    this._focusEditLink(elLinkFocus)
                }
                break;
        }

        this._styleToTool();
    }

    // prettier-ignore
    _focusEditLink = selector => {
        const elToolEditLink = this.parent.app.querySelector('.bajs-tool--link');

        const top = selector.offsetTop;
        const left = selector.offsetLeft;
        const width = selector.offsetWidth;

        const padLeft = this.parent.utilsTool.getPaddingApp().left;
        const padTop = this.parent.utilsTool.getPaddingApp().top;

        elToolEditLink.style.top = top + padTop - 10 - elToolEditLink.offsetHeight + 'px';
        elToolEditLink.style.left = left + padLeft + width / 2 - elToolEditLink.offsetWidth / 2 + 'px';
        elToolEditLink.style.right = 'inherit';

        // Refresh position
        const rect = elToolEditLink.getBoundingClientRect();
        if (rect.width + rect.left >= window.innerWidth) {
            elToolEditLink.style.left = 'inherit';
            elToolEditLink.style.right = '0';
        }

        const link = selector.getAttribute('data-href');

        const input = elToolEditLink.querySelector('input');
        input && (input.value = link);

        this._toggleEditLink(true);
        this._toggleToolText(false);
    }

    _toggleEditLink = (isToggle) => {
        const el = this.parent.app.querySelector(".bajs-tool--link");
        const action = isToggle ? "add" : "remove";
        el.classList[action]("bajs-tool--link-open");

        // remove focus
        const elFocus = this.parent.app.querySelector(".bajs-href[data-focus]");
        elFocus && elFocus.removeAttribute("data-focus");
    };

    // prettier-ignore
    _clickUpEditTextLink = (e) => {
        const el = e.target;

        if (!el.classList) return;

        const elTool = el.closest(".bajs-tool--link");
        if (!elTool) {
            const els = this.parent.app.querySelectorAll("[link-focus]");
            [...els].forEach((el) => el.removeAttribute("link-focus"));
            this._toggleEditLink(false);
        }

        const hasTextTool = this.parent.app.querySelector(".bajs-tool--text-open");
        if (hasTextTool) return;

        if (el.classList.contains("bajs-href")) {
            this._focusEditLink(el);
            el.setAttribute("link-focus", true);
        }
    };

    // prettier-ignore
    _initColorPickerText = () => {
        const el = this.parent.app.querySelector(".bajs-tool__text-color");
        if (!el) return;

        this.colorText = new Picker({
            parent: el,
            color: "#fff"
        });

        this.colorText.onClose = (color) => {
            const elSelection = document.getSelection();
            const elParent = (elSelection.focusNode && elSelection.focusNode.parentNode) || false;
            if(!elParent) return;
            const elText = elParent.closest(".bajs-editor");
            if(!elText) return;

            this.parent.utilsTool.commandColor(color.rgbaString);
            el.style.backgroundColor = color.rgbaString;
        };

        // Update position > screen
        this.colorText.onOpen = () => {
            const _elParent = this.colorText.settings.parent;
            const _elColor = _elParent.querySelector(".picker_wrapper");

            if (!_elColor) return;
            _elColor.style.left = "100%";
            _elColor.style.right = "inherit";

            // Refresh position
            const rect = _elColor.getBoundingClientRect();
            if (rect.width + rect.left >= window.innerWidth) {
                _elColor.style.left = "inherit";
                _elColor.style.right = "100%";
            }
        };
    }

    // prettier-ignore
    _openToolText = (e) => {
        const el = e.target;
        const elSelection = document.getSelection();
        const elParent = (elSelection.focusNode && elSelection.focusNode.parentNode) || false;

        if (!elParent) return;
        const elText = elParent.closest('.bajs-type-text');
        if (!elText) return;

        // selection length > 0
        if (getSelectionText().length > 0) {
            if (this.parent.app.querySelector(".bajs-tool--link-open")) return;
            if (el.closest(".bajs-tool--text")) return;
            this._styleToTool(elParent);
            this._toggleToolText(true)

            //
            const elBlock = elParent.closest('.bajs-block');
            if (!elBlock) return;

            const clientRect = elBlock.getBoundingClientRect();
            const top = elBlock.offsetTop + (e.pageY - clientRect.top);
            const left = elBlock.offsetLeft + (e.pageX - clientRect.left);

            const padLeft = this.parent.utilsTool.getPaddingApp().left;
            const padTop = this.parent.utilsTool.getPaddingApp().top;

            const elTool = this.parent.app.querySelector('.bajs-tool--text');
            elTool.style.top = top + padTop - 15 - elTool.offsetHeight - 5 + 'px';
            elTool.style.left = left + padLeft - elTool.offsetWidth / 2 + 'px';
        } else {
            this._toggleToolText(false)
        }
    }

    // link
    // prettier-ignore
    _listenChangeLink = () => {
        const parent = this.parent;
        const elInp = this.parent.app.querySelector(".bajs-tool--link input");
        elInp.addEventListener("keyup", (e) => {
            const val = e.target.value;
            const elLinkFocus = parent.app.querySelector("[link-focus='true']");
            elLinkFocus && elLinkFocus.setAttribute("data-href", val);
        });
    };

    // prettier-ignore
    _styleToTool = () => {
        try {
            if (!this.parent.app) return;
            if (this.parent.disableTool.text) return;
            // 
            const style = this.parent.utilsTool.getStylesTool();
            
            const elTool = this.parent.app.querySelector(".bajs-tool--text");
            if (!elTool) return;

            const elBold =  elTool.querySelector("[data-action='bold']");
            const actBold = style.hasOwnProperty("bold") ? "add" : "remove"; 
            elBold.classList[actBold]("bajs-tool__item--active");

            const elItalic =  elTool.querySelector("[data-action='italic']");
            const actItalic = style.hasOwnProperty("italic") ? "add" : "remove"; 
            elItalic.classList[actItalic]("bajs-tool__item--active");

            const elUnderline =  elTool.querySelector("[data-action='underline']");
            const actUnderline = style.hasOwnProperty("underline") ? "add" : "remove"; 
            elUnderline.classList[actUnderline]("bajs-tool__item--active");
            
            const elLineThrough =  elTool.querySelector("[data-action='strikethrough']");
            const actLineThrough = style.hasOwnProperty("lineThrough") ? "add" : "remove"; 
            elLineThrough.classList[actLineThrough]("bajs-tool__item--active");

            const elLeft =  elTool.querySelector("[data-action='left']");
            const actLeft = style.hasOwnProperty("alignLeft") ? "add" : "remove"; 
            elLeft.classList[actLeft]("bajs-tool__item--active");

            const elCenter =  elTool.querySelector("[data-action='center']");
            const actCenter = style.hasOwnProperty("alignCenter") ? "add" : "remove"; 
            elCenter.classList[actCenter]("bajs-tool__item--active");

            const elRight =  elTool.querySelector("[data-action='right']");
            const actRight = style.hasOwnProperty("alignRight") ? "add" : "remove"; 
            elRight.classList[actRight]("bajs-tool__item--active");

            const elColor = this.parent.app.querySelector(".bajs-tool__text-color");
            elColor.style.backgroundColor = style.color;
            this.colorText.setColor(style.color);

            const fontSize = this.parent.utilsTool.convertFontSize(style.fontSize);
            fontSize && this.selectSize.setValue(fontSize);

            if (style.hasOwnProperty("fontFamily")) {
                const fontFamily = this.selectFont?.app?.querySelector(".bajs-select__text");
                fontFamily && (fontFamily.innerText = style?.fontFamily && firstLetterUpper(style.fontFamily) || "Roboto");
            }
        } catch (error) {
            console.log(error);
        }
    }
}
