import { EVENT_MOVE, EVENT_MOUSE_UP, EVENT_MOUSE_DOWN } from "../constants";

export default class ComponentTool {
    constructor(parent) {
        this.parent = parent;
    }

    // prettier-ignore
    init() {
        this.parent.app.addEventListener(EVENT_MOVE, this._eventMouseMove);
        document.addEventListener(EVENT_MOUSE_UP, this._eventMouseUp);
        this.parent.app.addEventListener('keyup', this._eventKeyUp);
        this.parent.app.addEventListener(EVENT_MOUSE_UP, this._eventMouseUpAppAddComponent);
    }

    destroy = () => {
        document.removeEventListener(EVENT_MOUSE_UP, this._eventMouseUp);
    };

    addLineToBlock = (elBlock) => {
        const elLine = this.parent.app.querySelector(".bajs-block-line");
        const top = elBlock.offsetTop + elBlock.offsetHeight;
        elLine.style.top = top - elLine.offsetHeight / 2 + "px";
    };

    moveButtonAdd = (elBlock) => {
        const top = elBlock.offsetTop + elBlock.offsetHeight;
        const el = this.parent.app.querySelector(".bajs-add");
        el.style.top = top - el.offsetHeight / 2 + "px";
    };

    closeButtonAddDropdown = () => {
        const el = this.parent.app.querySelector(".bajs-add--open-dropdown");
        el && el.classList && el.classList.remove("bajs-add--open-dropdown");
    };

    setLineAddTopFirstLoad = () => {
        const elFirstBlock = this.parent.app.querySelector(".bajs-block");
        if (!elFirstBlock) return;
        this.parent.elBlockFocusMove = elFirstBlock;
        this.parent.elFocusMove = elFirstBlock;
        this.addLineToBlock(elFirstBlock);
        this.moveButtonAdd(elFirstBlock);
    };

    // ===================== EVENT =====================

    _eventKeyUp = (e) => {
        // key esc
        if (e.which == 27) {
            this.closeButtonAddDropdown();
        }
    };

    _eventMouseMove = (e) => {
        this._listenMove(e);
    };

    _eventMouseUpAppAddComponent = (e) => {
        this._listenAddComponent(e);
    };

    _eventMouseUp = (e) => {
        this.closeButtonAddDropdown();

        const el = e.target;
        const elBajsApp = el.closest(".bajs-app");
        if (!elBajsApp) return;

        // Click vào button remove sẽ xóa luôn Block đó
        const elBtnDeleteComp = el.closest(".bajs-delete-component");
        if (elBtnDeleteComp) {
            const elBlock = el.closest(".bajs-block");
            elBlock && elBlock.remove();
        }

        // Click vào line --- sẽ tạo thêm 1 bajs-text
        // const elLine = el.closest(".bajs-block-line");
        // elLine && this._addComponent("text");

        //
        const elItem = el.closest(".bajs-add__dropdown-item");
        const elAdd = el.closest(".bajs-add");
        if (!elItem && elAdd) {
            this._openButtonAddDropdown(elAdd);
        }
    };

    // ===================== END:EVENT =====================

    // prettier-ignore
    _addComponent = type => {
        this.closeButtonAddDropdown();

        switch (type) {
            case "button":
                this._renderHTML(this.parent.buttonTool.renderItem());
                break;
            case "text":
                if(this.parent.elFocusMove) {
                this.parent.textTool.createTextAt(this.parent.elFocusMove);
                }
                break;
            case "form-product-table": 
                this._renderHTML(this.parent.formTemplates.renderItem('product_table', this.parent.dataFormTemplates['product_table'][0]));
                break;
            case "form-review": 
                this._renderHTML(this.parent.formTemplates.renderItem('email_request_review', this.parent.dataFormTemplates['email_request_review'][0]));
                break;
            case "form-opt-in": 
                this._renderHTML(this.parent.formOptIn.renderItem());
                break;
        }

        this.parent.sortableTool.refrestSortable();
    }

    _renderHTML = (textHTML) => {
        if (!this.parent.elFocusMove) return;
        let elBlockNext = null;
        this.parent.elFocusMove.insertAdjacentHTML("afterend", textHTML);
        elBlockNext = this.parent.elFocusMove.nextElementSibling;
        elBlockNext && this.parent.textTool.createTextAt(elBlockNext);
    };

    _listenAddComponent = (e) => {
        const el = e.target;
        const elTypeComponent = el.closest(".bajs-add__dropdown-item");
        if (!elTypeComponent) return;
        const type = elTypeComponent.getAttribute("data-type");
        this._addComponent(type);
    };

    // prettier-ignore
    _listenMove = e => {
        const el = e.target;
        // add line to block + move button add
        const elBlock = el.closest(".bajs-block");
        const hasOpenDropdownAdd = this.parent.app.querySelector(".bajs-add--open-dropdown");

        if (elBlock && !hasOpenDropdownAdd) {
            this.addLineToBlock(elBlock);
            this.moveButtonAdd(elBlock);
            this.parent.elFocusMove = elBlock;
        }
    };

    // prettier-ignore
    _openButtonAddDropdown = (elAdd) => {
        elAdd.classList.add("bajs-add--open-dropdown");

        // Refresh position
        const elListComponent = this.parent.app.querySelector(".bajs-add__dropdown");
        const rect = elListComponent.getBoundingClientRect();

        elListComponent.style.right = "inherit";
        elListComponent.style.left = "0";

        if (rect.x - rect.width < 0) {
            elListComponent.style.left = "0";
            elListComponent.style.right = "inherit";
        }
    };
}
