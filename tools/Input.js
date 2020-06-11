import { EVENT_MOUSE_UP } from "../constants";
import Picker from "vanilla-picker";
import { removeClass } from "../helper";

export default class InputTool {
    constructor(parent) {
        this.parent = parent;

        this.color = undefined;
        this.lastInput = undefined;

        this.elToolApp = undefined;
        this.elToolAppThank = undefined;
        this.elToolAppPlaceholder = undefined;
    }

    init = () => {
        this._initTools();
        this._initColorPicker();

        document.addEventListener(EVENT_MOUSE_UP, this._eventMouseUp);
        document.addEventListener("keyup", this._eventKeyUp);
    };

    destroy = () => {
        document.removeEventListener(EVENT_MOUSE_UP, this._eventMouseUp);
        document.removeEventListener("keyup", this._eventKeyUp);
    };

    // ===================== EVENT =========================

    _eventMouseUp = (e) => {
        const el = e.target;

        const elTool = el.closest(".bajs-tool--input");
        const elInput = el.closest(".bajs-input");

        if (elInput) {
            this.lastInput = elInput;
        }

        if (elTool || elInput) {
            this._openTool(e);
            this._toggleShowTool(true);
        } else {
            this._toggleShowTool(false);
        }
    };

    // prettier-ignore
    _eventKeyUp = (e) => {
        const el = e.target;
        if (!this.lastInput) return;

        // update [data-success]
        const elInputThank = el.closest(".bajs-tool__input-thank");
        if (elInputThank) {
            const val = elInputThank.value;
            const elDataSuccess = this.lastInput.closest("[data-success]");
            elDataSuccess && elDataSuccess.setAttribute("data-success", val);
        }

        // update .bajs-input[placeholder] 
        const elInputPlaceholder = el.closest(".bajs-tool__input-placeholder");
        if (elInputPlaceholder) {
            const val = elInputPlaceholder.value;
            this.lastInput.setAttribute("placeholder", val);
        }
    };

    // ===================== END:EVENT =====================

    _openTool = (e) => {
        const el = e.target;
        const elInput = el.closest(".bajs-input");

        if (elInput) {
            this._initDefault(elInput);
            this._updatePosition(elInput);
        }
    };

    // prettier-ignore
    _initDefault = (input) => {
        const elInputThank = this.parent.app.querySelector(".bajs-tool__input-thank");
        const elInputPlaceholder = this.parent.app.querySelector(".bajs-tool__input-placeholder");

        const placeholder = input.getAttribute("placeholder");
        if (placeholder) {
            elInputPlaceholder.value = placeholder;
        }
        
        let dataSuccess = input.closest("[data-success]");
        if (dataSuccess) {
            elInputThank.value = dataSuccess.getAttribute("data-success");
        }
        
        const dataColor = input.closest("[data-color]");
        if (dataColor) {
            this.color.setColor(dataColor.getAttribute("data-color"));
        }
    }

    _updatePosition = (node) => {
        try {
            const x = node.offsetLeft;
            const width = node.offsetWidth;

            const elBlockWrap = node.closest(".bajs-block");
            const wrapY = elBlockWrap.offsetTop;

            const elTool = this.elToolApp;
            const heightTool = elTool.offsetHeight;
            const widthTool = elTool.offsetWidth;

            const padLeft = this.parent.utilsTool.getPaddingApp().left;
            const padTop = this.parent.utilsTool.getPaddingApp().top;

            elTool.style.top = wrapY + padTop - heightTool - 10 + "px";
            elTool.style.left = x + padLeft + width / 2 - widthTool / 2 + "px";
            elTool.style.right = "inherit";
        } catch (error) {}
    };

    // prettier-ignore
    _initColorPicker = () => {
        const el = this.parent.app.querySelector(".bajs-tool__picker--color");
        if (!el) return;

        this.color = new Picker({
            parent: el,
            color: "#fff",
        });

        // update [data-color]
        this.color.onChange = (color) => {
            el.style.backgroundColor = color.rgbaString;

            const elDataSuccess = this.lastInput.closest("[data-success]");
            elDataSuccess && elDataSuccess.setAttribute("data-color", color.rgbaString);
        };

        // Update position > screen
        this.color.onOpen = () => {};
    };

    _toggleShowTool = (isBoolean = false) => {
        const elBajs = this.parent.app.querySelector(".bajs");
        const act = isBoolean ? "add" : "remove";
        elBajs.classList[act]("bajs-tool--input-open");
    };

    // prettier-ignore
    _initTools = () => {
        const el = this.parent.app.querySelector(".bajs");
        const temp = `
        <div class="bajs-tool bajs-tool--input">
            <div class="bajs-tool__row">
                <input 
                    type="text" 
                    class="bajs-tool__input bajs-tool__input-thank" 
                    placeholder=""
                />
                <div    
                    class="bajs-tool__picker bajs-tool__picker--color" 
                    style="background-color: #fff;">
                </div>
            </div>

            <div class="bajs-tool__row">
                <input 
                    type="text" 
                    class="bajs-tool__input bajs-tool__input-placeholder" 
                    placeholder="" 
                />
            </div>
        </div>`;
        el.insertAdjacentHTML("beforeend", temp);

        this.elToolApp = this.parent.app.querySelector(".bajs-tool--input");
        this.elToolAppThank = this.parent.app.querySelector(".bajs-tool__input-thank");
        this.elToolAppPlaceholder = this.parent.app.querySelector(".bajs-tool__input-placeholder");
    }
}
