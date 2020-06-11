import { previewImageUpload } from "../helper";
import { EVENT_MOUSE_UP, EVENT_MOVE } from "../constants";
import Picker from "vanilla-picker";

export default class CustomBackgroundTool {
    constructor(parent) {
        this.parent = parent;
        this.color = undefined;
        this.borderColor = undefined;
    }

    init = () => {
        if (this.parent.disableTool.customBackground) return;

        this._renderItem();
        this._renderItemContent();
        this.listenEvent();

        this.parent.app.addEventListener(EVENT_MOUSE_UP, this._eventMouseUpApp);
        document.addEventListener(EVENT_MOVE, this._eventMouseMove);
        document.addEventListener(EVENT_MOUSE_UP, this._eventMouseUp);
    };

    destroy = () => {
        if (this.parent.disableTool.customBackground) return;

        const elCSBGApp = this.parent.app.querySelector(".bajs-csbg-tool");
        elCSBGApp && elCSBGApp.remove();
        document.removeEventListener(EVENT_MOVE, this._eventMouseMove);
        document.removeEventListener(EVENT_MOUSE_UP, this._eventMouseUp);
    };

    listenEvent = () => {
        this._initColorPicker();
        this._initColorPickerBorder();
        this._borderWidthRange();
        this._borderRadiusRange();
        this._onChangeInpBgColor();
        this._onChangeInpBorderColor();
        this._uploadBackground();
        this._chooseTool();
        this._initDefault();
    };

    _eventMouseUpApp = (e) => {
        const el = e.target;
        if (el.classList.contains("bajs") || el.hasAttribute("data-csbg")) {
            this._toggleShowTool(false);
            this._closeAllToolContent();
            this._toggleActive(true, el);
        }
    };

    // prettier-ignore
    _eventMouseUp = (e) => {
        const el = e.target;
        const elToolMenu = el.closest(".bajs-csbg-tool__menu");
        const elToolContent = el.closest(".bajs-csbg-content");
        if (!this.parent.utilsTool.isSelectCurrentApp() && !elToolMenu && !elToolContent) {
            this._toggleActive(false);
            this._toggleShowTool(false);
            this._closeAllToolContent();
        }
    };

    _eventMouseMove = (e) => {
        const el = e.target;
        this._toogleTool(el);
    };

    _toogleTool = (el) => {
        if (!el.closest(".bajs-app")) {
            this._toggleFocus(false);
            return;
        }

        if (el.classList.contains("bajs") || el.hasAttribute("data-csbg")) {
            this._toggleFocus(true, el);
        } else {
            this._toggleFocus(false, el);
        }
    };

    // prettier-ignore
    _chooseTool = () => {
        const els = this.parent.app.querySelectorAll(".bajs-csbg-tool__menu li");
        [...els].forEach(el => el.addEventListener("click", e => {
            const action = el.getAttribute("data-action");
            this._closeAllToolContent();
            el.classList.add("bajs-csbg-tool__menu-active");

            if (action === "bg-file") {
                const el = this.parent.app.querySelector("[data-action='bg-file'] input[type='file']");
                el.removeAttribute("disabled")
                this._toggleShowTool(false);
            } else {
                this._initDefault();

                const elsContentAction = this.parent.app.querySelectorAll(`.bajs-csbg-content[data-content]`);
                [...elsContentAction].find(_el => {
                    if (_el.getAttribute("data-content") === action) {
                        _el.style.display = "flex";
                    }
                });
            }
        }));
    }

    // prettier-ignore
    _renderItem = () => {
        const temp = `
        <div class="bajs-csbg-tool">
            <ul class="bajs-csbg-tool__menu">
                <li data-action="bg-solid">
                    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0)">
                        <path d="M9.39893 0.581055C4.43018 0.581055 0.398926 4.6123 0.398926 9.58105C0.398926 14.5498 4.43018 18.5811 9.39893 18.5811C9.79675 18.5811 10.1783 18.423 10.4596 18.1417C10.7409 17.8604 10.8989 17.4789 10.8989 17.0811C10.9014 16.7087 10.7619 16.3493 10.5089 16.0761C10.317 15.8596 10.1918 15.5924 10.1483 15.3064C10.1048 15.0205 10.145 14.728 10.2638 14.4644C10.3827 14.2007 10.5753 13.977 10.8184 13.8203C11.0615 13.6635 11.3447 13.5804 11.6339 13.5809H13.3988C14.7247 13.5805 15.9962 13.0537 16.9338 12.1161C17.8715 11.1786 18.3984 9.90714 18.3989 8.58121C18.3989 4.1609 14.3677 0.581055 9.39893 0.581055ZM3.89908 9.58105C3.60241 9.58105 3.3124 9.49308 3.06573 9.32826C2.81905 9.16344 2.62679 8.92917 2.51326 8.65508C2.39973 8.38099 2.37003 8.07939 2.4279 7.78842C2.48578 7.49745 2.62864 7.23017 2.83842 7.02039C3.0482 6.81062 3.31547 6.66775 3.60645 6.60988C3.89742 6.552 4.19902 6.5817 4.47311 6.69524C4.7472 6.80877 4.98146 7.00103 5.14629 7.2477C5.31111 7.49437 5.39908 7.78438 5.39908 8.08105C5.39908 8.47888 5.24105 8.86041 4.95974 9.14171C4.67844 9.42302 4.29691 9.58105 3.89908 9.58105ZM6.89908 5.58121C6.60241 5.58121 6.3124 5.49324 6.06573 5.32842C5.81905 5.16359 5.62679 4.92933 5.51326 4.65524C5.39973 4.38115 5.37003 4.07955 5.4279 3.78858C5.48578 3.4976 5.62864 3.23033 5.83842 3.02055C6.0482 2.81077 6.31547 2.66791 6.60645 2.61003C6.89742 2.55216 7.19902 2.58186 7.47311 2.69539C7.7472 2.80892 7.98146 3.00118 8.14629 3.24786C8.31111 3.49453 8.39908 3.78454 8.39908 4.08121C8.39908 4.27819 8.36028 4.47325 8.2849 4.65524C8.20952 4.83722 8.09903 5.00258 7.95974 5.14187C7.82045 5.28116 7.6551 5.39165 7.47311 5.46703C7.29112 5.54241 7.09606 5.58121 6.89908 5.58121ZM11.8988 5.58121C11.6021 5.58121 11.3121 5.49324 11.0654 5.32842C10.8187 5.16359 10.6265 4.92933 10.5129 4.65524C10.3994 4.38115 10.3697 4.07955 10.4276 3.78858C10.4855 3.4976 10.6283 3.23033 10.8381 3.02055C11.0479 2.81077 11.3152 2.66791 11.6061 2.61003C11.8971 2.55216 12.1987 2.58186 12.4728 2.69539C12.7469 2.80892 12.9812 3.00118 13.146 3.24786C13.3108 3.49453 13.3988 3.78454 13.3988 4.08121C13.3988 4.27819 13.36 4.47325 13.2846 4.65524C13.2092 4.83722 13.0987 5.00258 12.9594 5.14187C12.8201 5.28116 12.6548 5.39165 12.4728 5.46703C12.2908 5.54241 12.0958 5.58121 11.8988 5.58121ZM14.8988 9.58105C14.6021 9.58105 14.3121 9.49308 14.0654 9.32826C13.8187 9.16344 13.6265 8.92917 13.513 8.65508C13.3994 8.38099 13.3697 8.07939 13.4276 7.78842C13.4855 7.49745 13.6283 7.23017 13.8381 7.02039C14.0479 6.81062 14.3152 6.66775 14.6061 6.60988C14.8971 6.552 15.1987 6.5817 15.4728 6.69524C15.7469 6.80877 15.9812 7.00103 16.146 7.2477C16.3108 7.49437 16.3988 7.78438 16.3988 8.08105C16.3988 8.27804 16.36 8.47309 16.2846 8.65508C16.2092 8.83707 16.0987 9.00243 15.9594 9.14171C15.8201 9.281 15.6548 9.39149 15.4728 9.46687C15.2908 9.54226 15.0958 9.58105 14.8988 9.58105Z" fill="#0B0B0B"/>
                        </g>
                        <defs>
                        <clipPath id="clip0">
                        <rect x="0.398926" y="0.581055" width="18" height="18" fill="white"/>
                        </clipPath>
                        </defs>
                    </svg>
                </li>
                <li data-action="bg-file">
                    <label>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0)">
                            <path d="M10.5909 7.97153C11.4696 8.85025 11.4696 10.2749 10.5909 11.1536C9.71216 12.0323 8.2875 12.0323 7.40879 11.1536C6.53008 10.2749 6.53008 8.85025 7.40879 7.97153C8.2875 7.09282 9.71216 7.09282 10.5909 7.97153Z" fill="black"/>
                            <path d="M15.75 3.37508H14.1953L13.0698 1.125H4.92917L3.80467 3.37618L2.25225 3.37895C1.01462 3.38116 0.00711222 4.38973 0.00604355 5.62792L0 14.6249C0 15.8658 1.00912 16.8755 2.25008 16.8755H15.75C16.9909 16.8755 18 15.8664 18 14.6254V5.62512C18 4.3842 16.9909 3.37508 15.75 3.37508ZM8.99972 14.0629C6.51837 14.0629 4.49957 12.0441 4.49957 9.56275C4.49957 7.08139 6.51837 5.06259 8.99972 5.06259C11.4811 5.06259 13.4999 7.08139 13.4999 9.56275C13.4999 12.0441 11.4811 14.0629 8.99972 14.0629Z" fill="black"/>
                            </g>
                            <defs>
                            <clipPath id="clip0">
                            <rect width="18" height="18" fill="white"/>
                            </clipPath>
                            </defs>
                        </svg>

                        <input type="file" accept="image/png, image/jpeg, image/pjpeg" style="display: none;" />
                    </label>
                </li>
                <li data-action="bg-style">
                    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0)">
                        <path d="M18.3989 5.33789V0.428711H13.4902V2.06494H5.3081V0.428711H0.398926V5.33789H2.03516V13.52H0.398926V18.4287H5.3081V16.7925H13.4902V18.4287H18.3989V13.52H16.7627V5.33789H18.3989ZM2.03516 2.06494H3.67187V3.70166H2.03516V2.06494ZM3.67187 16.7925H2.03516V15.1562H3.67187V16.7925ZM13.4902 15.1562H5.3081V13.52H3.67187V5.33789H5.3081V3.70166H13.4902V5.33789H15.1265V13.52H13.4902V15.1562ZM16.7627 16.7925H15.1265V15.1562H16.7627V16.7925ZM15.1265 3.70166V2.06494H16.7627V3.70166H15.1265Z" fill="black"/>
                        </g>
                        <defs>
                        <clipPath id="clip0">
                        <rect x="0.398926" y="0.428711" width="18" height="18" fill="white"/>
                        </clipPath>
                        </defs>
                    </svg>
                </li>
            </ul>
        </div>`;

        const elBajs = this.parent.app.querySelector(".bajs");
        elBajs.insertAdjacentHTML("beforeend", temp);
    }

    _renderItemContent = () => {
        const temp = `
        <div class="bajs-csbg-content" data-content="bg-solid">
            <div class="bajs-csbg-content__item">
                <div>
                    <div class="bajs-bg-solid-title">Color</div>
                    <div class="bajs-input-color">
                        <input type="text" class="bajs-input-editor" />
                        <div class="bajs-input-color__btn" data-picker="bajs-color"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="bajs-csbg-content" data-content="bg-style">
            <div class="bajs-csbg-content__item">
                <div style="margin-bottom: 16px;">
                    <div class="bajs-bg-solid-title">Border</div>
                    <div class="bajs-input-color">
                        <input type="text" class="bajs-input-editor" />
                        <div class="bajs-input-color__btn" data-picker="bajs-border"></div>
                    </div>
                </div>

                <div data-slider="bajs-border-width" style="margin-bottom: 16px;">
                    <div class="bajs-slider__title">
                        <span>Weight</span>
                        <span class="bajs-slider__result">0</span>
                    </div>

                    <div class="bajs-slider-container">
                        <input type="range" min="0" max="5" value="0" class="bajs-slider">
                    </div>
                </div>

                <div data-slider="bajs-border-radius">
                    <div class="bajs-slider__title">
                        <span>Rounded corner</span>
                        <span class="bajs-slider__result">0</span>
                    </div>

                    <div class="bajs-slider-container">
                        <input type="range" min="0" max="100" value="0" class="bajs-slider">
                    </div>
                </div>
            </div>
        </div>
        `;

        const elBGContent = this.parent.app.querySelector(".bajs-csbg-tool");
        elBGContent.insertAdjacentHTML("beforeend", temp);
    };

    // prettier-ignore
    _initColorPicker = () => {
        const el = this.parent.app.querySelector("[data-picker='bajs-color']");
        if (!el) return;

        let oldColor = undefined;

        this.color = new Picker({
            parent: el,
            color: "#fff"
        });

        this.color.onChange = (color) =>  {
            const inp = this.parent.app.querySelector("[data-content='bg-solid'] input")
            inp && (inp.value = color.rgbaString);

            const result = this.parent.app.querySelector("[data-content='bg-solid'] .bajs-input-color__btn")
            result && (result.style.backgroundColor = color.rgbaString);
            
            const bajsBody = this.parent.app.querySelector(".bajs-body");
            bajsBody && (bajsBody.style.backgroundColor = color.rgbaString);
            
            if (oldColor && (oldColor !== color.rgbaString)) {
                bajsBody && (bajsBody.style.backgroundImage = "");
                oldColor = color.rgbaString;
            }
        };

        this.color.onOpen = (color) =>  {
            const inp = this.parent.app.querySelector("[data-content='bg-solid'] input")
            inp && (oldColor = color.rgbaString);
        }
    }

    // prettier-ignore
    _initColorPickerBorder = () => {
        const el = this.parent.app.querySelector("[data-picker='bajs-border']");
        if (!el) return;

        this.borderColor = new Picker({
            parent: el,
            color: "#fff"
        });

        this.borderColor.onChange = (color) => {
            const inp = this.parent.app.querySelector("[data-content='bg-style'] input")
            inp && (inp.value = color.rgbaString);

            const result = this.parent.app.querySelector("[data-content='bg-style'] .bajs-input-color__btn")
            result && (result.style.backgroundColor = color.rgbaString);
            
            const bajsBody = this.parent.app.querySelector(".bajs-body");
            bajsBody && (bajsBody.style.borderColor = color.rgbaString);
        };
    }

    // prettier-ignore
    _borderWidthRange = () => {
        const el = this.parent.app.querySelector("[data-slider='bajs-border-width'] input");
        el.addEventListener("input", (e) => {
            const bajsBody = this.parent.app.querySelector(".bajs-body");
            bajsBody && (bajsBody.style.borderWidth = e.target.value + "px");

            const result = this.parent.app.querySelector("[data-slider='bajs-border-width'] .bajs-slider__result");
            result && (result.innerText = e.target.value);
        })
    }

    // prettier-ignore
    _borderRadiusRange = () => {
        const el = this.parent.app.querySelector("[data-slider='bajs-border-radius'] input");
        el.addEventListener("input", (e) => {
            const bajsBody = this.parent.app.querySelector(".bajs-body");
            bajsBody && (bajsBody.style.borderRadius = e.target.value + "px");

            const result = this.parent.app.querySelector("[data-slider='bajs-border-radius'] .bajs-slider__result");
            result && (result.innerText = e.target.value);
        })
    }

    // prettier-ignore
    _onChangeInpBgColor = () => {
        const el = this.parent.app.querySelector("[data-content='bg-solid'] input");
        el.addEventListener("change", (e) => {
            const _color = window.w3color(e.target.value).toRgbaString();
            el.value = _color;
            this.color.setColor(_color);
        });
    }

    // prettier-ignore
    _onChangeInpBorderColor = () => {
        const el =  this.parent.app.querySelector("[data-content='bg-style'] input");
        el.addEventListener("change", (e) => {
            const _color = window.w3color(e.target.value).toRgbaString();
            el.value = _color;
            this.borderColor.setColor(_color);
        });
    }

    // prettier-ignore
    _uploadBackground = () => {
        const el = this.parent.app.querySelector("[data-action='bg-file'] input[type='file']");
        el.addEventListener("change", (input) => {
            const files = input.target.files || input.dataTransfer.files;
            const elPreview = document.querySelector('#bns-preview');

            if (files && files[0]) {
                if (files[0].size > this.parent.limitSize) {
                    alert("File upload limit 5 MB");
                    return;
                }

                if (!files[0].name.match(/.(jpg|jpeg|png)$/i)) {
                    alert("File format is not appropriate");
                    return;
                }
            }

            previewImageUpload(input, elPreview, base64 => {
                if (!base64) return;
                const bajsBody = this.parent.app.querySelector(".bajs-body");
                bajsBody && (bajsBody.style.backgroundImage = `url(${base64})`);

                el.setAttribute("disabled", true);
                el.value = "";
                this._toggleShowTool(false);
                this._closeAllToolMenu();
            });
        })
    }

    // prettier-ignore
    _initDefault = () => {
        const elBodyjs = this.parent.app.querySelector(".bajs-body");
        let bgColor = this.parent.utilsTool.getElPropertyValue(elBodyjs, "background-color");
        let bgImage = this.parent.utilsTool.getElPropertyValue(elBodyjs, "background-image");
        let bgBorderColor = this.parent.utilsTool.getElPropertyValue(elBodyjs, "border-color");
        let bgBorderWidth = this.parent.utilsTool.getElPropertyValue(elBodyjs, "border-width");
        let bgBorderRadius = this.parent.utilsTool.getElPropertyValue(elBodyjs, "border-radius");

        bgColor = window.w3color(bgColor).toRgbaString();
        bgBorderColor = window.w3color(bgBorderColor).toRgbaString();

        // solid background
        elBodyjs.style.backgroundColor = bgColor;
        // solid input tool
        const toolSolidInp = this.parent.app.querySelector("[data-content='bg-solid'] input");
        toolSolidInp && (toolSolidInp.value = bgColor);
        // solid tool picker
        this.color.setColor(bgColor);

        // solid background
        elBodyjs.style.borderColor = bgBorderColor;
        // solid input tool
        const toolBorderColor = this.parent.app.querySelector("[data-content='bg-style'] input");
        toolBorderColor && (toolBorderColor.value = bgBorderColor);
        // solid tool picker
        this.borderColor.setColor(bgBorderColor);

        // border width background
        elBodyjs.style.borderWidth = bgBorderWidth;
        // border width input
        const elInputWidth = this.parent.app.querySelector("[data-slider='bajs-border-width'] input");
        elInputWidth && (elInputWidth.value = bgBorderWidth.replace(/\D/g, ""));
        const elInputWidthResult = this.parent.app.querySelector("[data-slider='bajs-border-width'] .bajs-slider__result");
        elInputWidthResult && (elInputWidthResult.innerText = bgBorderWidth.replace(/\D/g, ""));

        // border width background
        elBodyjs.style.borderRadius = bgBorderRadius;
        // border width input
        const elInputRadius = this.parent.app.querySelector("[data-slider='bajs-border-radius'] input");
        elInputRadius && (elInputRadius.value = bgBorderRadius.replace(/\D/g, ""));
        const elInputRadiusResult = this.parent.app.querySelector("[data-slider='bajs-border-radius'] .bajs-slider__result");
        elInputRadiusResult && (elInputRadiusResult.innerText = bgBorderRadius.replace(/\D/g, ""));

        // nếu có bg image thì disable input file background
        if (bgImage !== "none") {
            const el = this.parent.app.querySelector("[data-action='bg-file'] input[type='file']");
            el.setAttribute("disabled", true);
        }
    };

    // prettier-ignore
    _toggleFocus = (isBoolean, el = undefined) => {
        const elApp = el ? el.closest(".bajs") : this.parent.app.querySelector(".bajs");
        if (!elApp) return;
        const act = isBoolean ? "add" : "remove";
        elApp.classList[act]("bajs-csbg-focus");
    };

    // prettier-ignore
    _toggleActive = (isBoolean, el = undefined) => {
        const elApp = el ? el.closest(".bajs") : this.parent.app.querySelector(".bajs");
        if (!elApp) return;
        const act = isBoolean ? "add" : "remove";
        elApp.classList[act]("bajs-csbg-active");
        this._toggleShowTool(isBoolean);
    };

    // prettier-ignore
    _toggleShowTool = (isBoolean) => {
        return;
        const el = this.parent.app.querySelector(".bajs-csbg-tool");
        el && (el.style.display = isBoolean ? "flex" : "none");

        const elMenu = this.parent.app.querySelector(".bajs-csbg-tool__menu");
        const padLeft = this.parent.utilsTool.getPaddingApp().left;
        const padTop = this.parent.utilsTool.getPaddingApp().top;
        const widthMenu = padLeft - 8;

        this._initDefault();

        // Refresh position
        const rect = el.getBoundingClientRect();
        if (rect.x < 0) {
            el.style.left = `calc(100% - ${widthMenu}px)`;
            el.style.top = `${padTop}px`;
            el.style.right = 'inherit';
            el.style.flexDirection = 'row';
        }

        if (rect.x + 100 >= window.innerWidth) {
            el.style.left = 'inherit';
            el.style.top = `${padTop}px`;
            el.style.right = `calc(100% - ${widthMenu}px)`;
            el.style.flexDirection = 'row-reverse';
        }

        this._closeAllToolMenu();
    }

    // prettier-ignore
    _closeAllToolContent = () => {
        const els = this.parent.app.querySelectorAll(`.bajs-csbg-content[data-content]`);
        [...els].forEach(_el => _el.style.display = "none");

        this._closeAllToolMenu();
    }

    // prettier-ignore
    _closeAllToolMenu = () => {
        const elsMenu = this.parent.app.querySelectorAll(".bajs-csbg-tool__menu-active");
        [...elsMenu].forEach(el => el.classList.remove("bajs-csbg-tool__menu-active"));
    }
}
