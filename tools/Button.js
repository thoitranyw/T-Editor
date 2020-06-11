import { EVENT_MOUSE_UP } from "../constants";
import Picker from "vanilla-picker";
import { removeClass } from "../helper";

export default class ButtonTool {
    constructor(parent) {
        this.parent = parent;
        this.elButtonFocusClick = undefined;
        this.colorButton = undefined;
        this.colorButtonBg = undefined;

        this.default = {
            color: "rgb(255, 255, 255)",
            backgroundColor: "rgb(47, 84, 235)",
        };
    }

    init = () => {
        const isHide = this.parent.disableComponents.includes("button");
        if (isHide) return;

        this._initInputComponent();
        this._initTools();
        this._listenToolChangeLabelButton();
        this._listenToolActionButton();
        this._initColorPickerButton();
        this._initColorPickerBgButton();

        document.addEventListener(EVENT_MOUSE_UP, this._eventMouseUp);
        document.addEventListener("keypress", this._eventKeyPress);
    };

    destroy = () => {
        document.removeEventListener(EVENT_MOUSE_UP, this._eventMouseUp);
        document.removeEventListener("keypress", this._eventKeyPress);
    };

    renderItem = () => {
        return `
        <div class="bajs-block bajs-drag">
            <div class="bajs-block-wrap">
                <div class="bajs-type-btn">
                    <div class="bajs-align" style="text-align: ${this.parent.alignDefault};">
                        <a class="bajs-btn" style="color: ${this.default.color}, background-color: ${this.default.backgroundColor}" target="_blank">Button</a>
                    </div>
                </div>
            </div>
        </div>`;
    };

    // ===================== EVENT =====================

    // prettier-ignore
    _eventKeyPress = e => {
        const key = e.keyCode || e.charCode;

        // esc key
        const elTool = this.parent.app.querySelector(".bajs-tool--button-open");
        if (key == 27 && elTool) {
            e.preventDefault();
            this._toggleToolButton(false);
        }
        

        const elBtn = this.parent.app.querySelector(".bajs-btn.bajs-clicked");
        // enter key
        if (key == 13 && elBtn) {
            e.preventDefault();
            const elBlock = elBtn.closest(".bajs-block");
            this.parent.textTool.createTextAt(elBlock);
            elBtn.classList.remove("bajs-clicked");
            this.parent.elClicked = null;
        }
    };

    // prettier-ignore
    _eventMouseUp = e => {
        const el = e.target;

        if (!this.parent.utilsTool.isSelectCurrentApp()) {
            this.elButtonFocusClick = null;
            this._toggleToolButton(false);
            this._clickedFocus(e);
            return;
        }

        this.parent.elClicked = el;
    
        // open tool button
        const elButton = el.closest(".bajs-btn");
        const elToolButton = el.closest(".bajs-tool--button");
        const elBajsBtnOpen = this.parent.app.querySelector(".bajs-tool--button-open");

        if (elButton) {
            this.elButtonFocusClick = elButton;
            this._styleToTool();
            this._openToolButton(elButton);
        } 
        else if (elBajsBtnOpen && !elToolButton) {
            this.elButtonFocusClick = null;
            this._toggleToolButton(false);
        }

        this._clickedFocus(e);
    };

    // ===================== END:EVENT =====================

    _toggleToolButton = (isBoolean) => {
        const action = isBoolean ? "add" : "remove";
        const elBajs = this.parent.app.querySelector(".bajs");
        elBajs && elBajs.classList[action]("bajs-tool--button-open");
    };

    // prettier-ignore
    _initInputComponent = () => {
        const elAddDropdown = this.parent.app.querySelector(".bajs-add .bajs-add__dropdown");
        const context = `
        <div class="bajs-add__dropdown-item" data-type="button">
            <span>
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.1758 2.00635H2.67578C2.39922 2.00635 2.17578 2.22979 2.17578 2.50635V14.0063C2.17578 14.2829 2.39922 14.5063 2.67578 14.5063H14.1758C14.4523 14.5063 14.6758 14.2829 14.6758 14.0063V2.50635C14.6758 2.22979 14.4523 2.00635 14.1758 2.00635ZM13.5508 13.3813H3.30078V3.13135H13.5508V13.3813Z" fill="#0B0B0B"/>
                </svg>
            </span>
            <span>Insert button</span>
        </div>`;
        elAddDropdown.insertAdjacentHTML("beforeend", context);
    }

    // prettier-ignore
    _initTools = () => {
        const el = this.parent.app.querySelector(".bajs");
        const temp = `
        <div class="bajs-tool bajs-tool--button">
            <div class="bajs-tool__button">
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
                    <div class="bajs-tool__item" data-action="left">
                        <i class="fa fa-align-left" aria-hidden="true"></i>
                    </div>
                    <div class="bajs-tool__item" data-action="center">
                        <i class="fa fa-align-center" aria-hidden="true"></i>
                    </div>
                    <div class="bajs-tool__item" data-action="right">
                        <i class="fa fa-align-right" aria-hidden="true"></i>
                    </div>
                </div>

                <div class="bajs-tool__row">
                    <div class="bajs-tool__row-input">
                        <div class="bajs-tool__input-color">
                            <input type="text" placeholder="Input your text" />
                            <div class="bajs-tool__btn-picker bajs-tool__btn-bg-color" title="Background color"></div>
                            <div class="bajs-tool__btn-picker bajs-tool__btn-color" title="Text color"></div>
                        </div>
                        <div class="bajs-tool__input">
                            <input type="text" placeholder="https://" />
                            <span class="bajs-error-explain">This url is not valid</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        el.insertAdjacentHTML("beforeend", temp);
    }

    // prettier-ignore
    _listenToolChangeLabelButton = () => {
    const elInputColor = this.parent.app.querySelector(".bajs-tool__input-color");
    const elInput = this.parent.app.querySelector(".bajs-tool__input");

    elInputColor.addEventListener("keyup", e => {
      const el = this.elButtonFocusClick;
      el && (el.innerText = e.target.value);
    });

    elInput.addEventListener("keyup", e => {
      const el = this.elButtonFocusClick;
      el && el.setAttribute("data-link", e.target.value);
    });
  };

    // prettier-ignore
    _listenToolActionButton = () => {
      const els = this.parent.app.querySelectorAll(".bajs-tool--button .bajs-tool__item");
      [...els].forEach(el => el.addEventListener("click", this._actionButton));
    }

    // prettier-ignore
    _actionButton = e => {
        const el = e.target;
        const elItem = el.closest(".bajs-tool__item");
        const action = elItem.getAttribute("data-action");

        //
        const elButton = this.elButtonFocusClick;
        if (!elButton) return;

        const elAlign = elButton.closest(".bajs-align");
        const compStyles = elButton.currentStyle || window.getComputedStyle(elButton);

        switch (action) {
            case "bold":
                const fontWeight = compStyles.getPropertyValue("font-weight");
                elButton.style.fontWeight = fontWeight === "700" ? 400 : 700;
                break;
            case "italic":
                const fontStyle = compStyles.getPropertyValue("font-style");
                elButton.style.fontStyle = fontStyle === "italic" ? "normal" : "italic";
                break;
            case "underline":
                const textDecoration = compStyles.getPropertyValue("text-decoration-line");
                elButton.style.textDecoration = textDecoration === "underline" ? "none" : "underline";
                break;
            case "strikethrough":
                const lineThrough = compStyles.getPropertyValue("text-decoration-line");
                elButton.style.textDecoration = lineThrough === "line-through" ? "none" : "line-through";
                break;
            case "left":
                elAlign && (elAlign.style.textAlign = "left");
                this._openToolButton(elButton);
                break;
            case "center":
                elAlign && (elAlign.style.textAlign = "center");
                this._openToolButton(elButton);
                break;
            case "right":
                elAlign && (elAlign.style.textAlign = "right");
                this._openToolButton(elButton);
                break;
        }

        this._styleToTool();
    }

    // prettier-ignore
    _openToolButton = elButton => {
        this._toggleToolButton(true);

        const x = elButton.offsetLeft;
        const width = elButton.offsetWidth;

        const elBlockWrap = elButton.closest('.bajs-block');
        const wrapY = elBlockWrap.offsetTop;

        const elTool = this.parent.app.querySelector('.bajs-tool--button');
        const heightTool = elTool.offsetHeight;
        const widthTool = elTool.offsetWidth;

        const padLeft = this.parent.utilsTool.getPaddingApp().left;
        const padTop = this.parent.utilsTool.getPaddingApp().top;

        elTool.style.top = wrapY + padTop - heightTool - 10 + 'px';
        elTool.style.left = x + padLeft + width / 2 - widthTool / 2 + 'px';
        elTool.style.right = 'inherit';

        // Refresh position
        const rect = elTool.getBoundingClientRect();
        if (rect.x < 0) {
            elTool.style.left = '0';
            elTool.style.right = 'inherit';
        }
        if (rect.x + rect.width >= window.innerWidth) {
            elTool.style.left = 'inherit';
            elTool.style.right = '0';
        }
    };

    // prettier-ignore
    _styleToTool = () => {
        try {
            if (!this.parent.app) return;
            // 
            
            const elTool = this.parent.app.querySelector(".bajs-tool--button");
            if (!elTool) return;
            
            if (!this.elButtonFocusClick) return;
            
            const style = this.parent.utilsTool.getStylesTool(this.elButtonFocusClick);
            const label = this.elButtonFocusClick.textContent;
            const url = this.elButtonFocusClick.getAttribute("data-link");
            
            const hasNoUrl = this.elButtonFocusClick.classList.contains("bajs-no-url");
            const elInputUrl = elTool.querySelector(".bajs-tool__input");
            if (elInputUrl) {
                elInputUrl.style.display = hasNoUrl ? "none" : "";
            }

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

            const color = style.hasOwnProperty("color");
            color && this.colorButton.setColor(style.color);
            
            const backgroundColor = style.hasOwnProperty("backgroundColor");
            if (backgroundColor) {
                style.backgroundColor && this.colorButtonBg.setColor(style.backgroundColor);
            }

            const txtLabel = this.parent.app.querySelector(".bajs-tool__input-color input");
            txtLabel.value = label;

            const txtUrl = this.parent.app.querySelector(".bajs-tool__input input");
            txtUrl.value = url;
        } catch (error) {
            console.log(error);
        }
    }

    _initColorPickerButton = () => {
        const el = this.parent.app.querySelector(".bajs-tool__btn-color");
        if (!el) return;

        this.colorButton = new Picker({
            parent: el,
            color: "#fff",
        });

        this.colorButton.onChange = (color) => {
            const elBtn = this.elButtonFocusClick;
            if (!elBtn) return;
            el.style.backgroundColor = color.rgbaString;
            elBtn.style.color = color.rgbaString;
        };

        // Update position > screen
        this.colorButton.onOpen = () => {
            const _elParent = this.colorButton.settings.parent;
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
    };

    _initColorPickerBgButton = () => {
        const el = this.parent.app.querySelector(".bajs-tool__btn-bg-color");
        if (!el) return;

        this.colorButtonBg = new Picker({
            parent: el,
            color: "#fff",
        });

        this.colorButtonBg.onChange = (color) => {
            const elBtn = this.elButtonFocusClick;
            if (!elBtn) return;
            el.style.backgroundColor = color.rgbaString;
            elBtn.style.backgroundColor = color.rgbaString;
        };

        // Update position > screen
        this.colorButtonBg.onOpen = () => {
            const _elParent = this.colorButtonBg.settings.parent;
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
    };

    _clickedFocus = (e) => {
        const el = e.target;
        removeClass(".bajs-clicked", "bajs-clicked", this.parent.app);
        const elBtn = el.closest(".bajs-btn");
        const elImage = el.closest(".bajs-img");
        elBtn && elBtn.classList.add("bajs-clicked");
        elImage && elImage.classList.add("bajs-clicked");
    };
}
