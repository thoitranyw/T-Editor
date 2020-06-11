// http://localhost:3000/images/imgs-of-editer-template/product_table_form_discount.png

export default function getFormTemplates(payload = {}) {
    const { dirImage = "" } = payload;

    return {
        product_table: [
            {
                id: 1,
                image: `${dirImage}/images/imgs-of-editer-template/form_product_table.png`,
                variant: "{{ms_product_table:1}}",
            },
            {
                id: 2,
                image: `${dirImage}/images/imgs-of-editer-template/product_table_form_discount.png`,
                variant: "{{ms_product_table:2}}",
            },
        ],
        email_request_review: [
            {
                id: 1,
                image: `${dirImage}/images/imgs-of-editer-template/form_review.png`,
                variant: "{{ms_email_request_review:1}}",
            },
        ],
    };
}
