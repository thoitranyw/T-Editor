export default class SelectBaJS {
    constructor(payload) {
        this.app = undefined;
        this.selector = payload.selector;
        this.selectorText = payload.selector.replace(/[\#, \.]/g, "");
        this.prefix = "bajs-";
        this.onChange = payload.onChange;
        this.selects = [];

        setTimeout(() => this.init(), 500);
    }

    // prettier-ignore
    init = () => {
        this._renderItem();
        document.addEventListener("click", this._listenClick);
    };

    destroy = () => {
        if (!this.app) return;
        document.removeEventListener("click", this._listenClick);
    };

    // prettier-ignore
    setValue = (value) => {
        if (!value) return;
        if (!this.app) return;
        const elLI = this.app.querySelector(`li[value='${value}']`);
        const elText = this.app.querySelector(".bajs-select__text");
        const selected = this.app.querySelector(".bajs-select__dropdown-item-selected");
        if (selected) selected.classList.remove("bajs-select__dropdown-item-selected");
        elLI.classList.add("bajs-select__dropdown-item-selected");
        elText && (elText.innerText = elLI.textContent);
    };

    // prettier-ignore
    _renderItem = () => {
        const elSelect = document.querySelector(this.selector);
        if (!elSelect) return;
        const elNext = elSelect.nextElementSibling;
        if (elNext && elNext.nodeName === "DIV" && elNext.classList.contains("bajs-select")) return;

        const options = elSelect.querySelectorAll("option");
        const optionSelected = elSelect.querySelector("option[selected]");
        const labelSelected = optionSelected ? optionSelected.innerText : "";
        const elDiv = document.createElement("DIV");
        elDiv.classList.add(...elSelect.classList);
        elSelect.insertAdjacentElement("afterend", elDiv);

        let tempLI = "";
        [...options].forEach((opt) => {
            const label = opt.innerText;
            const value = opt.getAttribute("value");
            let valueSelected = optionSelected ? optionSelected.getAttribute("value") : "";
            valueSelected = valueSelected === value ? ` bajs-select__dropdown-item-selected` : ""
            tempLI += `<li class="bajs-select__dropdown-item${valueSelected}" value="${value}" style="font-family: ${value}">${label}</li>`;
        });

        const temp = `
            <div class="bajs-select__label">
                <span class="bajs-select__text">${labelSelected}</span>
                <span class="bajs-select__triangle bajs-arrow-down"></span>
            </div>

            <div class="bajs-select__dropdown">
                <ul>
                    ${tempLI}
                </ul>
            </div>
        `;
        elDiv.insertAdjacentHTML("afterbegin", temp);
        this.app = elDiv;
        this._listenSelect();
    };

    // prettier-ignore
    _listenSelect = () => {
        this.app.addEventListener("click", () => {
            this.app.classList.toggle("bajs-select--focus");
        });

        const elLIs = this.app.querySelectorAll("LI");
        [...elLIs].forEach((elLI) => elLI.addEventListener("click", this._listenLI));
    };

    // prettier-ignore
    _listenLI = (e) => {
        const el = e.target;
        const elLI = el.closest("LI");
        if (!elLI) return;
        const wrap = el.closest(".bajs-select");
        const label = elLI.textContent;
        const selected = wrap.querySelector(".bajs-select__dropdown-item-selected");

        const elText = wrap.querySelector(".bajs-select__text");
        elText.innerText = label;
        if (selected) selected.classList.remove("bajs-select__dropdown-item-selected");
        elLI.classList.add("bajs-select__dropdown-item-selected");

        this.onChange && this.onChange(elLI.getAttribute("value"));
    };

    _listenClick = (e) => {
        const el = e.target;
        // Close dropdown tool khác Select đang click
        const isCurrent = this._isCurrentApp(el);
        if (!isCurrent) {
            this._closeDropdown();
        }
    };

    _isCurrentApp = (el) => {
        if (!el) return false;
        const app = el.closest(".bajs-select") || null;
        if (!app) return;
        if (app && app.classList.contains(this.selectorText)) return true;
        return false;
    };

    _closeDropdown = () => {
        this.app && this.app.classList.remove("bajs-select--focus");
    };

    _hideSelect = () => {
        const els = document.querySelectorAll(".bajs-select--focus");
        [...els].forEach(function (el) {
            el.classList.remove("bajs-select--focus");
        });
    };
}
