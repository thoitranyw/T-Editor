import ComponentTool from "./tools/Component";
import TextTool from "./tools/Text";
import HashtagTool from "./tools/Hashtag";
import ImageTool from "./tools/Image";
import ButtonTool from "./tools/Button";
import UtilsTool from "./tools/Utils";
import FormProductTable from "./tools/FormProductTable";
import FormReview from "./tools/FormReview";
import CustomBackground from "./tools/CustomBackground";
import FormTemplates from "./tools/FormTemplates";
import InputTool from "./tools/Input";
import ProductCard from "./tools/ProductCard";

import SortableTool from "./plugins/SortableTool";
import EmojiButton from "./plugins/EmojiButton";

import getFormTemplates from "./data/form-templates";

import { removeClass } from "./helper";
import styleFrontEnd from "./style-front-end";
import fontFamilyDefault from "./data/font-family";

import "./libs/w3color";
import "./styles/index.scss";

export default class EditorBaJS {
    constructor(payload = {}) {
        this.app = undefined;
        this.selector = document.querySelector(payload.selector);
        this.selectorText = payload.selector.replace(/[\#, \.]/g, "");
        this.wrapClass = payload.wrapClass || "";
        this.limitSize = payload.limitSize || 5242880;
        this.delayOnChange = 0;
        this.acceptImage = "";
        this.alignDefault = payload.alignDefault || "center";
        this.hashtag = payload.hashtag || [];
        this.feature = {
            enterSMS: false,
            component: true,
            lineAddText: false,
            useFallbackHashtag: true,
            fontFamily: true,
            ...payload.feature,
        };
        this.disableDelete = payload.disableDelete || false;
        this.disableEnter = payload.disableEnter || false;
        this.disableTool = {
            text: false,
            customBackground: true,
            ...payload.disableTool,
        };
        this.disableComponents = payload.disableComponents || []; // image | button | emoji
        this.advanceComponent = payload.advanceComponent || []; // formProductTable | formReview | form-opt-in
        this.dirImage = payload.dirImage || window.location.origin;

        // Font family
        this.fontFamilyDefault = "Roboto";
        this.fontFamily = payload.fontFamily || fontFamilyDefault;

        // prettier-ignore
        this.imagesRoot = {
            productTableForm: {
                app: `${this.dirImage}/images/imgs-of-editer-template/form_product_table.png`,
                TShirt: `${this.dirImage}/images/imgs-of-editer-template/demo-t-shirt.png`
            },
            review: {
                app: `${this.dirImage}/images/imgs-of-editer-template/form_review.png`,
                thumbnail: `${this.dirImage}/images/imgs-of-editer-template/review-thumbnail.png`
            }
        }

        this.dataFormTemplates = getFormTemplates({
            dirImage: this.dirImage,
        });

        if (!this.selector) return;

        //
        this.files = [];
        this.elClicked = undefined;
        this.elFocusMove = undefined;
        this.countHashtag = 0;
        this.countImage = 0;
        this.lastTextFocus = undefined;

        //
        this.utilsTool = new UtilsTool(this);
        this.componentTool = new ComponentTool(this);
        this.hashtagTool = new HashtagTool(this);
        this.imageTool = new ImageTool(this);
        this.buttonTool = new ButtonTool(this);
        this.sortableTool = new SortableTool(this);
        this.emojiButton = new EmojiButton(this);
        this.textTool = new TextTool(this);
        this.formProductTable = new FormProductTable(this);
        this.formReview = new FormReview(this);
        this.customBackground = new CustomBackground(this);
        this.formTemplates = new FormTemplates(this);
        this.inputTool = new InputTool(this);
        this.productCard = new ProductCard(this);

        // TOOLS
        this.init();
        this.resetFeature();
        this.utilsTool.init();
        this.componentTool.init();
        this.hashtagTool.init();
        this.imageTool.init();
        this.buttonTool.init();
        this.textTool.init();
        this.formProductTable.init();
        this.formReview.init();
        this.customBackground.init();
        this.formTemplates.init();
        this.inputTool.init();
        this.productCard.init();

        // PLUGINS
        this.sortableTool.init();
        this.utilsTool.initGoogleFont();
        this.emojiButton.init();

        this.onChange();
    }

    init = () => {
        document.execCommand("styleWithCSS", true, null);
        const disableDelete = this.disableDelete ? "no-del" : "";
        const disableEnter = this.disableEnter ? "no-enter" : "";

        const elEditor = `
        <div class="bajs-app" id="bajs-${this.selectorText}">
            <div class="bajs">
                <div class="">
                    <div class="bajs-wrap">
                        <div class="bajs-body ${this.wrapClass} ${disableDelete} ${disableEnter}" style="background-color: #fff;">
                            <div class="bajs-body-wrap">
                                <div class="bajs-block bajs-block--first"><div class="bajs-block-wrap"></div></div>
                            </div>
                        </div>

                        <div class="bajs-cs-app" data-csbg>
                            <div class="bajs-cs-app__left" data-csbg>
                                <div class="bajs-cs-app__vertical-top"></div>
                                <div class="bajs-cs-app__vertical-center"></div>
                                <div class="bajs-cs-app__vertical-bottom"></div>
                            </div>
                            <div class="bajs-cs-app__top" data-csbg>
                                <div class="bajs-cs-app__horizontal-center"></div>
                            </div>
                            <div class="bajs-cs-app__right" data-csbg>
                                <div class="bajs-cs-app__vertical-top"></div>
                                <div class="bajs-cs-app__vertical-center"></div>
                                <div class="bajs-cs-app__vertical-bottom"></div>
                            </div>
                            <div class="bajs-cs-app__bottom" data-csbg>
                                <div class="bajs-cs-app__horizontal-center"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bajs-add">
                    <div class="bajs-add-wrap">
                        <div class="bajs-add__btn"><i class="fa fa-plus" aria-hidden="true"></i></div>
                        <div class="bajs-add__dropdown"></div>
                        <div class="bajs-add__dropdown-sub js-emoji"></div>
                    </div>
                </div>
                
                <div class="bajs-hashtag-btn"><span class="bajs-hashtag-icon">{...}</span></div>
                <div class="bajs-block-line"><div></div></div>
            </div>
        </div>
        `;

        // prettier-ignore
        const elFont = document.getElementById(`bajs-font-${this.selectorText}`);
        elFont && elFont.remove();

        // add font-awesome
        this.selector.insertAdjacentHTML(
            "afterend",
            `<link rel="stylesheet" id="bajs-font-${this.selectorText}" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" />`
        );
        this.selector.insertAdjacentHTML("afterend", elEditor);

        // hide textarea
        this.selector.style.opacity = 0;
        this.selector.style.width = 0;
        this.selector.style.height = 0;

        //
        this.app = document.getElementById(`bajs-${this.selectorText}`);
        this.componentTool.setLineAddTopFirstLoad();
        this.app.style.fontFamily = "Roboto, Arial, Helvetica, sans-serif";
    };

    destroy = () => {
        document.execCommand("styleWithCSS", false, null);
        if (!this.selector) return;

        if (
            this.buttonTool &&
            this.componentTool &&
            this.hashtagTool &&
            this.imageTool &&
            this.textTool &&
            this.utilsTool &&
            this.sortableTool &&
            this.customBackground &&
            this.inputTool
        ) {
            this.buttonTool.destroy && this.buttonTool.destroy();
            this.componentTool.destroy && this.componentTool.destroy();
            this.hashtagTool.destroy && this.hashtagTool.destroy();
            this.imageTool.destroy && this.imageTool.destroy();
            this.textTool.destroy && this.textTool.destroy();
            this.utilsTool.destroy && this.utilsTool.destroy();
            this.sortableTool.destroy && this.sortableTool.destroy();
            this.inputTool.destroy && this.inputTool.destroy();
            this.customBackground.destroy && this.customBackground.destroy();

            this.app.remove();
        }
    };

    getFiles = () => {
        if (!this.selector) return;
        return this.files;
    };

    setHashtag = (hashtagTmp = []) => {
        if (!this.selector) return;
        this.hashtag = hashtagTmp;
        if (Array.isArray(hashtagTmp))
            this.hashtagTool.renderHashtag(hashtagTmp);
    };

    // prettier-ignore
    get = (payload = {}) => {
        try {
            if (!this.selector) return;
            const { urls = [] } = payload;
            const elBody = this.app.querySelector(".bajs-body");

            const serializer = new XMLSerializer();
            const serializerTmp = serializer.serializeToString(elBody);

            const parser = new DOMParser();
            let doc = parser.parseFromString(serializerTmp, "text/html");
            
            // remove contenteditable
            const elsEditable = doc.querySelectorAll(".bajs-editor");
            [...elsEditable].forEach(el => {
                el.removeAttribute("contenteditable");
                el.removeAttribute("spellcheck");
                el.removeAttribute("focus");
            });

            // tranform url button
            const urlButtons = doc.querySelectorAll("[data-link]");
            [...urlButtons].forEach(el => {
                const url = el.getAttribute("data-link");
                el.setAttribute("href", url);
            });

            // remove class
            removeClass(".bajs", "bajs-tool--button-open bajs-tool--text-open bajs-tool--image-open", doc);

            if (urls.length > 0) {
                urls.forEach(({ key, url }) => {
                    const img = doc.querySelector(`img[data-id="${key}"]`);
                    if (!img) return;
                    img.setAttribute("src", url);
                });
            }

            // remove all bajs-drag
            const elsBlock = doc.querySelectorAll(".bajs-block");
            [...elsBlock].forEach(el => el.classList.remove("bajs-drag"));

            // remove draggable
            const elsDraggable = doc.querySelectorAll("[draggable]");
            [...elsDraggable].forEach(el => el.removeAttribute("draggable"));

            // img
            const elsImg = doc.querySelectorAll("img[data-id]");
            [...elsImg].forEach(el => el.removeAttribute("data-id"));

            // remove .bajs-clicked
            removeClass(".bajs-clicked", "bajs-clicked", doc);

            // hashtag #2 remove css
            const elsHashtagKey = doc.querySelectorAll(".bajs-hashtag-key");
            [...elsHashtagKey].forEach(el => {
                el.classList.remove("bajs-hashtag-key");
                el.classList.remove("bajs-hashtag-key--warning");
                el.removeAttribute("contenteditable");

                // transform data-key
                const elLabel = el.querySelector("span");
                if (elLabel) {
                    elLabel.innerText = el.getAttribute("data-key");
                    elLabel.removeAttribute("style");
                }
            });

            // transform add link to text
            const elsLink = this.app.querySelectorAll(".bajs-href");
            [...elsLink].forEach(el => {
                const href = el.getAttribute("data-href");
                href && el.setAttribute("href", href);
            });

            // remove input:file bajs-change-img
            const elsFile = doc.querySelectorAll(".bajs-change-img");
            [...elsFile].forEach(item => {
                const img = item.nextElementSibling;
                img.style.cursor = "default";
                item.remove()
            });

            // remove element of grammarly-extension
            const elsGrams = doc.querySelectorAll("grammarly-extension");
            [...elsGrams].forEach(el => el.remove());
            
            // refresh google font
            this.utilsTool.refreshGoogleFont(doc);

            // transform TO dataFormTemplates (FormProductTable, FormReview)
            const forms =  doc.querySelectorAll(".bajs-ms-form");
            [...forms].forEach(el => {
                const img = el.querySelector("img");
                if (!img) return;
                const variant = img.getAttribute("data-render");
                el.innerText = variant;
            })

            let text = serializer.serializeToString(doc.querySelector(".bajs-body"));

            return text;
        } catch (error) {
            console.log(error);
        }
    }

    // prettier-ignore
    set = context => {
        try {
            if (!this.selector) return;
            const serializer = new XMLSerializer();

            const elBody = this.app.querySelector('.bajs-body');
            elBody && elBody.remove();

            // remove style mail wrapper
            elBody && elBody.classList.remove("bajs-body-mail-style")

            const parser = new DOMParser();
            const doc = parser.parseFromString(context, 'text/html');

            // add tool text
            const elTexts = doc.querySelectorAll('.bajs-editor');
            [...elTexts].forEach(el => {
                el.setAttribute('contenteditable', true);
                el.setAttribute('spellcheck', false);
            });

            // tranform url button
            const urlButtons = doc.querySelectorAll("[data-link]");
            [...urlButtons].forEach(el => el.removeAttribute("href"));

            // add bajs-drag
            const elsBlock = doc.querySelectorAll('.bajs-block');
            [...elsBlock].forEach(el => {
                if (!el.classList.contains('bajs-block--first')) {
                    el.classList.add('bajs-drag');
                }
            });

            // hashtag add css
            const elsHashtagKey = doc.querySelectorAll('.bajs-hashtag-key--js');
            [...elsHashtagKey].forEach(el => {
                el.classList.add('bajs-hashtag-key');
                el.setAttribute('contenteditable', false);

                // transform data-key
                const elLabel = el.querySelector('span');
                const textLabel = elLabel.textContent;
                const dataHashtag = this.hashtag.map(item => item.data).flat(3);
                const hashtagTmp = dataHashtag.find(item => item.key === textLabel);

                if (hashtagTmp) {
                    elLabel.innerText = hashtagTmp.label;

                    // nếu có dùng fallback và empty thì add class warning
                    if (this.feature.useFallbackHashtag) {
                        const valFallback = el.getAttribute('data-fallback');
                        valFallback.length === 0 && el.classList.add('bajs-hashtag-key--warning');
                    }
                } else {
                    elLabel.innerText = '';
                    el.classList.remove('bajs-hashtag-key');
                }
            });

            // update countHasgtag
            const countHashtagTmp = this.app.querySelectorAll('.bajs-hashtag-key--js');
            const arrId = [...countHashtagTmp].map(el => Number(el.getAttribute('data-id')));
            this.countHashtag = arrId.length > 0 ? Math.max(...arrId) : 0;

            // transform remove link to text
            const elsLink = this.app.querySelectorAll('.bajs-href');
            [...elsLink].forEach(el => el.removeAttribute('href'));

            // transform FROM dataFormTemplates (FormProductTable, FormReview)
            const forms =  doc.querySelectorAll(".bajs-ms-form");
            [...forms].forEach(el => {
                const id = el.getAttribute("data-id");
                const key = el.getAttribute("data-key");
                const data = this.dataFormTemplates.hasOwnProperty(key);
                
                if (data) {
                    let forms = this.dataFormTemplates?.[key];
                    const form = forms.find(item => Number(item.id) === Number(id));
                    if (form) {
                        const temp = `
                        <div class="bajs-ms-form" data-key="${key}" data-id="${form.id}" style="text-align: center;">
                            <img src="${form.image}" data-render="${form.variant}" style="max-width: 100%;" />
                        </div>`;
                        el.innerHTML = temp;
                    }
                } else {
                    el.style.display = "none";
                }
            });

            const elWrap = this.app.querySelector('.bajs-wrap');
            elWrap.insertAdjacentHTML('afterbegin', serializer.serializeToString(doc));

            this.textTool.listenRemoveEditable();
            this.sortableTool.refrestSortable();
            this.onChange();
            this.utilsTool.initGoogleFont();
            
        } catch (error) {
            console.log(error);
        }
    };

    /**
     * keepHashtag:
     *  + true: lấy content vẫn giữ element ".bajs-hashtag-key--js"
     *  + false: remove tất cả element ".bajs-hashtag-key--js"
     */
    // prettier-ignore
    getText = (payload = {}) => {
        if (!this.selector) return;
        const {
            keepHashtag = true
        } = payload;

        const elBody = this.app.querySelector('.bajs-body');

        const serializer = new XMLSerializer();
        const serializerTmp = serializer.serializeToString(elBody);

        const parser = new DOMParser();
        const doc = parser.parseFromString(serializerTmp, "text/html");

        // transform key variant
        const elKeys = doc.querySelectorAll(".bajs-hashtag-key");
        [...elKeys].forEach(el => {
            if (keepHashtag) {
                const key = el.getAttribute("data-key");
                el.querySelector("span").innerText = key;
            } else {
                el.remove();
            }
        });

        const elBodyDoc = doc.querySelector(".bajs-body");

        let text = elBodyDoc.innerHTML.replace(/<(?!(\/)?\s*?br\s*\/?)[^>]+>/g, "");
        text = text.replace(/[\u200B|]/g,"").replace(/[\u00A0]/gi, ' ').replace(/&nbsp;/g, ' ').replace(/\s\s+/g, ' ').trim();
        return text;
    };

    // prettier-ignore
    setText = (context = undefined) => {
        if (!this.selector || !context) return;
        this.clear();
        context = this.hashtagTool.renderHashtagTextToHTML(String(context));
        this.textTool.createTextAt(this.elFocusMove, context);
        
        this.textTool.listenRemoveEditable();
        this.sortableTool.refrestSortable();

        this.onChange();
    };

    // prettier-ignore
    buildMail = (payload = {}) => {
        const serializer = new XMLSerializer();
        const template = this.get(payload);
        const parser = new DOMParser();
        const doc = parser.parseFromString(template, 'text/html');
        doc.head.insertAdjacentHTML('beforeend', `<style>${styleFrontEnd}</style>`);

        // remove Google font
        const els = doc.querySelectorAll(".bajs-font-cs");
        [...els].forEach((item) => item.remove());

        // style mail wrapper
        const elBody = doc.querySelector(".bajs-body");
        elBody && elBody.classList.add("bajs-body-mail-style")

        return serializer.serializeToString(doc);
    };

    // prettier-ignore
    clear = () => {
        if (!this.selector) return;
        const els = this.app.querySelectorAll('.bajs-block:not(.bajs-block--first)');
        [...els].forEach(el => el.remove());
    }

    // prettier-ignore
    resetFeature = () => {
        if (!this.selector) return;
        const elLine = this.app.querySelector(".bajs-block-line");
        elLine && (elLine.style.visibility = this.feature.lineAddText ? "" : "hidden");
    
        const elBtnAdd = this.app.querySelector(".bajs-add");
        elBtnAdd && (elBtnAdd.style.visibility = this.feature.component ? "" : "hidden");
    
        const elToolFallback = this.app.querySelector(".bajs-hashtag-group__fallback");
        elToolFallback && (elToolFallback.style.display = this.feature.useFallbackHashtag ? "" : "none");

        const elToolCSBackground = this.app.querySelector(".bajs-cs-app");
        elToolCSBackground && (elToolCSBackground.style.display = this.disableTool.customBackground ? "none" : "");
    }

    getFormsComponent = () => {
        return this.dataFormTemplates();
    };

    // prettier-ignore
    isEmpty = () => {
        try {
            if (!this.selector) return;
            const els = this.app.querySelectorAll(".bajs-block:not(.bajs-block--first)");
            // Nhiều hơn 2 block -> not empty
            if (els.length > 1) return false;
            const el = els[0];
            const elEditor = el.querySelector(".bajs-editor");

            // nếu block đầu tiên không phải là editor -> not empty
            if (!elEditor) return false;

            // block đầu tiên là editor và có value -> not empty
            if (elEditor.innerHTML) return false
            return true;
        } catch (error) {
            return false;
        }
    }

    // prettier-ignore
    onChange = cb => {
        if (!this.selector) return;
        let time = undefined;
        // Select the node that will be observed for mutations
        const targetNode = document.querySelector(`#bajs-${this.selectorText} .bajs-wrap`);
        let observer = new MutationObserver(mutations => {
            for (let mutation of mutations) {
                // examine new nodes, is there anything to highlight?
                clearTimeout(time);
                time = setTimeout(() => {
                    cb && cb();
                }, 500);
            }
        });

        observer.observe(targetNode, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true,
        });
    };
}
