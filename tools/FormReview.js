export default class ProductTableFrom {
    constructor(parent) {
        this.parent = parent;
    }

    init = () => {
        // prettier-ignore
        const hasComponent = this.parent.advanceComponent.includes('formReview');
        if (!hasComponent) return;

        this._initInputComponent();
    };

    // prettier-ignore
    _initInputComponent = () => {
        const elAddDropdown = this.parent.app.querySelector(".bajs-add .bajs-add__dropdown");
        const context = `
        <div class="bajs-add__dropdown-item" data-type="form-review">
            <span><i class="fa fa-star" aria-hidden="true"></i></span>
            <span>Form review</span>
        </div>`;
        elAddDropdown.insertAdjacentHTML("beforeend", context);
    };
}
