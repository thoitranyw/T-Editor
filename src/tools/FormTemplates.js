export default class FormTemplates {
    constructor(parent) {
        this.parent = parent;
    }

    init = () => {};

    destroy = () => {};

    renderItem = (key, item) => {
        return `
        <div class="bajs-block">
            <div class="bajs-block-wrap">
                <div class="bajs-delete-component" style="visibility: hidden;">
                    <div>
                        <i class="fa fa-trash-o" aria-hidden="true"></i>
                    </div>
                </div>

                <div class="bajs-ms-form" data-key="${key}" data-id="${item.id}" style="text-align: center;">
                    <img src="${item.image}" data-render="${item.variant}" style="max-width: 100%;" />
                </div>
            </div>
        </div>
        `;
    };
}
