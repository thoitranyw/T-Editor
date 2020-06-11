export default class FormProductTable {
    constructor(parent) {
        this.parent = parent;
        this.images = this.parent.imagesRoot.productTableForm;
    }

    init = () => {
        // prettier-ignore
        const hasComponent = this.parent.advanceComponent.includes('formProductTable');
        if (!hasComponent) return;

        this._initInputComponent();
    };

    // prettier-ignore
    _initInputComponent = () => {
        const elAddDropdown = this.parent.app.querySelector(".bajs-add .bajs-add__dropdown");
        const context = `
        <div class="bajs-add__dropdown-item" data-type="form-product-table">
            <span>
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.2783 1.33008H4.90332C4.83457 1.33008 4.77832 1.38633 4.77832 1.45508V2.33008C4.77832 2.39883 4.83457 2.45508 4.90332 2.45508H12.6533V13.2051C12.6533 13.2738 12.7096 13.3301 12.7783 13.3301H13.6533C13.7221 13.3301 13.7783 13.2738 13.7783 13.2051V1.83008C13.7783 1.55352 13.5549 1.33008 13.2783 1.33008ZM11.2783 3.33008H3.27832C3.00176 3.33008 2.77832 3.55352 2.77832 3.83008V12.1223C2.77832 12.2551 2.83145 12.3816 2.9252 12.4754L5.63301 15.1832C5.66738 15.2176 5.70645 15.2457 5.74863 15.2691V15.2988H5.81426C5.86895 15.3191 5.92676 15.3301 5.98613 15.3301H11.2783C11.5549 15.3301 11.7783 15.1066 11.7783 14.8301V3.83008C11.7783 3.55352 11.5549 3.33008 11.2783 3.33008ZM5.74707 13.7082L4.40176 12.3613H5.74707V13.7082ZM10.6533 14.2051H6.74707V11.9863C6.74707 11.641 6.46738 11.3613 6.12207 11.3613H3.90332V4.45508H10.6533V14.2051Z" fill="#0B0B0B"/>
                </svg>
            </span>
            <span>Product table form</span>
        </div>`;
        elAddDropdown.insertAdjacentHTML("beforeend", context);
    };
}
