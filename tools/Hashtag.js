import { EVENT_MOUSE_UP } from "../constants";
import Picker from "vanilla-picker";
import { getSelectionText, replaceAll } from "../helper";

export default class HashtagTool {
    constructor(parent) {
        this.parent = parent;
        this.colorHashtag = undefined;
        this.hashtagFocus = undefined;
        this.placeholder = "If we can't find any content";
    }

    // prettier-ignore
    init = () => {
        this.renderHashtag();
        this._initTools();
        this._initColorPickerHashtag();
        this._listenFallbackHashtagChange();

        document.addEventListener(EVENT_MOUSE_UP, this._eventMouseUp);
        document.addEventListener("keyup", this._eventKeyUp);
    };

    // prettier-ignore
    destroy = () => {
        document.removeEventListener(EVENT_MOUSE_UP, this._eventMouseUp);
        document.removeEventListener('keyup', this._eventKeyUp);
    };

    // prettier-ignore
    renderHashtag = (hashtagNew = undefined) => {
        if (hashtagNew) {
            this.parent.hashtag = hashtagNew;
        }

        const elHashtagList = this.parent.app.querySelector(".bajs-tool--hashtag");
        elHashtagList && elHashtagList.remove();

        const elBajs = this.parent.app.querySelector(".bajs");

        let txtGroup = "";
        for (let i = 0; i < this.parent.hashtag.length; i++) {
            const hashtagTmp = this.parent.hashtag[i];
            const name = hashtagTmp.name;

            let txtItem = "";
            hashtagTmp.data.forEach((item) => {
                txtItem += `<div class="bajs-hashtag__item" data-key="${item.key}" data-label="${item.label}">${item.label}</div>`;
            });

            txtGroup += `
            <div class="bajs-hashtag__group">
                <div class="bajs-hashtag__name">${name}</div>
                <div class="bajs-hashtag__list">${txtItem}</div>
            </div>`;
        }

        const temp = `
          <div class="bajs-tool bajs-tool--hashtag">
              <div class="bajs-tool__hashtag">${txtGroup}</div>
          </div>`;

        elBajs.insertAdjacentHTML("beforeend", temp);
    };

    // prettier-ignore
    toggleListHashtag = (selector, isToggle) => {
        const elHashtagList = this.parent.app.querySelector('.bajs-tool--hashtag');
        if (isToggle) {
            elHashtagList.style.display = 'block';
            elHashtagList.style.visibility = 'visible';
        } else {
            elHashtagList.style.display = 'none';
            elHashtagList.style.visibility = 'hidden';
        }

        if (!selector) return;

        const top = selector.offsetTop;
        const left = selector.offsetLeft;
        const width = selector.offsetWidth;

        //
        elHashtagList.style.top = top + 'px';        
        elHashtagList.style.left = left + width - elHashtagList.offsetWidth + 'px';
    };

    // prettier-ignore
    getKeyHashtags = () => {
        let keys = [];
        this.parent.hashtag.length > 0 && this.parent.hashtag.forEach(group => {
            group.data.forEach(item => keys.push(item.key));
        });
        return keys;
    }

    // prettier-ignore
    renderHashtagTextToHTML = text => {
        this.parent.hashtag.length > 0 && this.parent.hashtag.forEach(group => {
            group.data.forEach(item => {
                text = replaceAll(text, item.key, this._createHashtag(item.key, item.label));
            });
        });
        return text;
    };

    // ===================== EVENT =====================

    _eventKeyUp = (e) => {
        const key = e.keyCode || e.charCode;

        // enter key
        if (key == 13) {
            this._toggleBtnHashtag(false);
        }

        // esc key
        if (key == 27) {
            this.parent.utilsTool.closeTools();
        }

        const el = this.parent.app.querySelector("[hashtag-focus='true']");
        // delete key
        if ((key === 46 || key === 8) && el) {
            e.preventDefault();
            if (!this.parent.utilsTool.isSelectCurrentApp()) return;
            this._toggleHashtagEditFallback(false);
            el.remove();
        }
    };

    _eventMouseUp = (e) => {
        const el = e.target;

        // if (!this.parent.utilsTool.isSelectCurrentApp()) {
        //   this._toggleBtnHashtag(false);
        //   return;
        // }

        //
        if (
            !(
                el.classList &&
                (el.classList.contains("bajs-editor") ||
                    el.closest(".bajs-tool--hashtag") ||
                    el.closest(".bajs-hashtag-btn"))
            )
        ) {
            this._toggleBtnHashtag(false);
            this.toggleListHashtag(null, false);
        }

        this._clickUpOpenEditHashtag(e);
        this._clickUpToggleListHashtag(e);
        this._clickUpSelectedHashtag(e);
        this._moveBtnHashtag(e);
    };

    // ===================== END:EVENT =====================

    // prettier-ignore
    _initTools = () => {
        const el = this.parent.app.querySelector(".bajs");
        const temp = `
        <div class="bajs-hashtag-group">
            <div class="bajs-hashtag-group__fallback">
            <div class="bajs-hashtag-group__header">
                <div class="bajs-hashtag-group__header-label">
                    <div class="bajs-hashtag-group__color">
                        <div class="bajs-hashtag-group__color-item" title="Text color"></div>
                    </div>
                </div>
                <div class="bajs-hashtag-group__header-explain">ah find competitor count will be inserted here</div>
            </div>
            <div class="bajs-hashtag-group__body">
                <div class="bajs-hashtag-group__body-label">Fallback</div>
                <div class="bajs-hashtag-group__body-form">
                <input type="text" />
                </div>
            </div>
            </div>
        </div>`;
        el.insertAdjacentHTML("beforeend", temp);
    }

    // prettier-ignore
    _moveBtnHashtag = (e) => {
        const el = e.target;
        const elSelection = document.getSelection();
        const elParent = (elSelection.focusNode && elSelection.focusNode.parentNode) || false;

        this._toggleBtnHashtag(false); 

        if (!this.parent.utilsTool.isSelectCurrentApp()) return;

        // không sử dụng hashtag
        if (this.parent.hashtag.length === 0) return;
        // selection length > 0
        if (getSelectionText().length > 0) return;
        if (!elParent) return;
        const elTypeText = el.closest(".bajs-type-text");
        if (!elTypeText) return;
        const elApp = elParent.closest(".bajs-app");
        if (elParent && !elApp) return;


        if (elParent.classList && elTypeText) {
            const elBtnHashtag = this.parent.app.querySelector('.bajs-hashtag-btn');
            const elBlockWrap = elParent.closest('.bajs-block');
            if (elBlockWrap) {
                const clientRect = elBlockWrap.getBoundingClientRect();
                const top = elBlockWrap.offsetTop + (e.pageY - clientRect.top);
                elBtnHashtag.style.top = top + 'px';
                this._toggleBtnHashtag(true);
            }
        }
    }

    _clickUpToggleListHashtag = (e) => {
        if (!this.parent.utilsTool.isSelectCurrentApp()) return;

        const el = e.target;
        this.toggleListHashtag(null, false);

        const elBtnHashtag = el.closest(".bajs-hashtag-btn");
        elBtnHashtag && this.toggleListHashtag(elBtnHashtag, true, "left");

        const elLinkOpenList = el.closest("[data-action='link-open-hashtag']");
        elLinkOpenList && this.toggleListHashtag(elLinkOpenList, true, "left");
    };

    // prettier-ignore
    _clickUpSelectedHashtag = e => {
        if (!this.parent.utilsTool.isSelectCurrentApp()) return;

        const el = e.target;
        const elHashtagItem = el.closest(".bajs-hashtag__item");
        if (!elHashtagItem) return;

        const key = elHashtagItem.getAttribute("data-key");
        const label = elHashtagItem.getAttribute("data-label");
        document.execCommand("insertHTML", false, this._createHashtag(key, label, true));
        const elFocus = this.parent.app.querySelector('.bajs-hashtag-key[hashtag-focus="true"]');

        if (this.parent.feature.useFallbackHashtag) {
            this.hashtagFocus = elFocus;
            this._focusHashtagEdit(elFocus);
        }
    };

    // prettier-ignore
    _clickUpOpenEditHashtag = (e) => {
        if (!this.parent.utilsTool.isSelectCurrentApp()) {
            this._toggleHashtagEditFallback(false);
            return;
        }

        const el = e.target;

        // click form edit
        const elHashEdit = el.closest(".bajs-hashtag-group");
        if (elHashEdit) return;

        const elHashList = el.closest(".bajs-tool--hashtag");
        const elHashtagKey = el.closest(".bajs-hashtag-key");
        const hasTextToolOpen = this.parent.app.querySelector(".bajs-tool--text-open");

        // remove tất cả hashtag đang được chọn
        const elHashFocus = this.parent.app.querySelectorAll("[hashtag-focus]");
        [...elHashFocus].forEach((el) => el.removeAttribute("hashtag-focus"));

        if (!hasTextToolOpen && elHashtagKey) {
            this.hashtagFocus = elHashtagKey;
            this._focusHashtagEdit(elHashtagKey);
        } else if (!elHashList) {
            this._toggleHashtagEditFallback(false);
        }
    };

    // prettier-ignore
    _focusHashtagEdit = selector => {
        if (!selector) return;
        selector.setAttribute("hashtag-focus", true);

        const elHashtagEdit = this.parent.app.querySelector(".bajs-hashtag-group");
        const top = selector.offsetTop;
        const left = selector.offsetLeft;
        const width = selector.offsetWidth;

        const padLeft = this.parent.utilsTool.getPaddingApp().left;
        const padTop = this.parent.utilsTool.getPaddingApp().top;

        elHashtagEdit.style.top = top + padTop - elHashtagEdit.offsetHeight - 8 + "px";
        elHashtagEdit.style.left = left + padLeft - elHashtagEdit.offsetWidth / 2 + width / 2 + "px";
        elHashtagEdit.style.right = 'inherit';

        // Refresh position
        const rect = elHashtagEdit.getBoundingClientRect();
        if (rect.x <= 0) {
            elHashtagEdit.style.right = 'inherit';
            elHashtagEdit.style.left = 0;
        }

        if (rect.x + rect.width >= window.innerWidth) {
            elHashtagEdit.style.left = 'inherit';
            elHashtagEdit.style.right = 0;
        }

        const key = selector.getAttribute("data-key");
        const dataHashtag = this.parent.hashtag.map(item => item.data).flat(3);
        const hashtagTmp = dataHashtag.find(item => item.key === key);

        const valExplain = hashtagTmp?.explain || "";
        const valPlaceholder = hashtagTmp?.placeholder || this.placeholder;
        const valFallback = selector.getAttribute("data-fallback");

        const elExplain = elHashtagEdit.querySelector(".bajs-hashtag-group__header-explain");
        const elFallback = elHashtagEdit.querySelector(".bajs-hashtag-group__body-form input");

        elExplain && (elExplain.innerText = valExplain);
        elFallback && (elFallback.value = valFallback);
        valPlaceholder && (elFallback.setAttribute("placeholder", valPlaceholder));

        const comp = selector.currentStyle || window.getComputedStyle(selector);
        const color = comp.getPropertyValue("color");
        this.colorHashtag.setColor(color);

        this._toggleHashtagEditFallback(true);
    }

    _toggleBtnHashtag = (isToggle) => {
        const el = this.parent.app.querySelector(".bajs-hashtag-btn");
        el && (el.style.display = isToggle ? "inline-flex" : "none");
    };

    _toggleHashtagEditFallback = (isToggle) => {
        if (!this.parent.feature.useFallbackHashtag) return;
        const el = this.parent.app.querySelector(".bajs-hashtag-group");
        const action = isToggle ? "add" : "remove";
        el && el.classList[action]("bajs-hashtag-group--open");

        if (!isToggle) this.hashtagFocus = undefined;
    };

    // prettier-ignore
    _createHashtag = (key, label, isFocus = false) => {
        const hasWarining = this.parent.feature.useFallbackHashtag ? 'bajs-hashtag-key--warning' : '';
        return `<span 
                class="bajs-hashtag-key bajs-hashtag-key--js ${hasWarining}" 
                ${isFocus && "hashtag-focus='true'" || ''} 
                contentEditable="false" 
                data-key="${key}"
                data-label="${label}"
                data-fallback="" 
                data-placeholder="" 
                style="font-weight: bold;"
            >&#8203;<span>${label}</span>&#8203;</span>`;
    }

    // prettier-ignore
    _initColorPickerHashtag = () => {
        const el = this.parent.app.querySelector(".bajs-hashtag-group__color-item");
        if (!el) return;

        this.colorHashtag = new Picker({
            parent: el,
            color: "#fff",
        });
        
        this.colorHashtag.onChange = (color) => {
            const elFocus = this.parent.app.querySelector("[hashtag-focus='true']");
            if (!elFocus) return;
            el.style.backgroundColor = color.rgbaString;
            elFocus.style.color = color.rgbaString;
        };
    };

    // prettier-ignore
    _listenFallbackHashtagChange = () => {
        const el = this.parent.app.querySelector(".bajs-hashtag-group__body-form input");
        el.addEventListener("keyup", e => {
            const elHashtagFocus = this.hashtagFocus;
            const val = e.target.value;
            if (!elHashtagFocus) return;
            elHashtagFocus.setAttribute("data-fallback", val);
            const action = val.length > 0 ? "remove" : "add";
            elHashtagFocus && elHashtagFocus.classList[action]("bajs-hashtag-key--warning");
        });

        el.addEventListener("focus", e => {
            const elHashFocus = this.parent.app.querySelectorAll("[hashtag-focus]");
            [...elHashFocus].forEach((el) => el.removeAttribute("hashtag-focus"));
        });
    }
}
