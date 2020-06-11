import { EVENT_MOUSE_UP } from "../constants";
import { previewImageUpload } from "../helper";

export default class ImageTool {
    constructor(parent) {
        this.parent = parent;
        this.elImageFocusClick = undefined;
    }

    init = () => {
        const isHide = this.parent.disableComponents.includes("image");
        if (isHide) return;

        this._initInputComponent();
        this._initTools();
        this._changeFile();
        this._listenToolActionImage();

        document.addEventListener(EVENT_MOUSE_UP, this._eventMouseUp);
        this.parent.app.addEventListener(EVENT_MOUSE_UP, this._eventMouseUpApp);
        document.addEventListener("keyup", this._eventKeyUp);
    };

    destroy = () => {
        document.removeEventListener("keyup", this._eventKeyUp);
        document.removeEventListener(EVENT_MOUSE_UP, this._eventMouseUp);
    };

    createImage = (key) => {
        return `
      <div class="bajs-block bajs-drag">
          <div class="bajs-block-wrap">
              <div class="bajs-type-photo">
                  <div class="bajs-align" style="text-align: ${this.parent.alignDefault};">
                      <img class="bajs-img" data-id="${key}" />
                  </div>
              </div>
          </div>
      </div>
      `;
    };

    // ===================== EVENT =====================

    // prettier-ignore
    _eventKeyUp = e => {
        this._keyDeleteRemove(e);

        if (e.which == 27) {
            this._toggleToolImage(false);
        }

        if (e.which == 13) {
            e.preventDefault();
            const elImage = this.parent.app.querySelector('.bajs-img.bajs-clicked');

            if (elImage) {
                const elBlock = elImage.closest('.bajs-block');
                this.parent.textTool.createTextAt(elBlock);
                elImage.classList.remove('bajs-clicked');
                this.parent.elClicked = null;
            }
        }
    };

    // prettier-ignore
    _eventMouseUp = e => {
        const el = e.target;

        // if (!this.parent.utilsTool.isSelectCurrentApp()) {
        //   return;
        // }

        this.parent.elClicked = el;
        
        // open tool image
        const elImg = el.closest('.bajs-img');
        const elToolImg = el.closest(".bajs-tool--image");
        const elBajsImgOpen = this.parent.app.querySelector(".bajs-tool--image-open");

        if (!elImg && elBajsImgOpen && !elToolImg) {
            
            this._toggleToolImage(false);
        }
    };

    //   prettier-ignore
    _eventMouseUpApp = e => {
        const el = e.target;
        this.parent.elClicked = el;

        // open tool image
        const elImg = el.closest('.bajs-img');
        const elToolImg = el.closest('.bajs-tool--image');
        const elBajsImgOpen = this.parent.app.querySelector('.bajs-tool--image-open');

        if (elImg) {
            this._openToolImage(elImg);
            this.elImageFocusClick = elImg;
        } else if (elBajsImgOpen && !elToolImg) {
            // this.elImageFocusClick = null;
            // this._toggleToolImage(false);
        }
    };

    // ===================== END: EVENT =====================

    // prettier-ignore
    _initInputComponent = () => {
        const elAddDropdown = this.parent.app.querySelector(".bajs-add .bajs-add__dropdown");
        const context = `
        <label class="bajs-add__dropdown-item">
            <span>
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.9258 2.75635H1.92578C1.64922 2.75635 1.42578 2.97979 1.42578 3.25635V13.2563C1.42578 13.5329 1.64922 13.7563 1.92578 13.7563H14.9258C15.2023 13.7563 15.4258 13.5329 15.4258 13.2563V3.25635C15.4258 2.97979 15.2023 2.75635 14.9258 2.75635ZM14.3008 12.6313H2.55078V12.0079L4.71484 9.44072L7.06016 12.222L10.7086 7.89697L14.3008 12.1563V12.6313ZM14.3008 10.6032L10.8039 6.45635C10.7539 6.39697 10.6633 6.39697 10.6133 6.45635L7.06016 10.6688L4.81016 8.00166C4.76016 7.94229 4.66953 7.94229 4.61953 8.00166L2.55078 10.4548V3.88135H14.3008V10.6032ZM5.17578 7.38135C5.35635 7.38135 5.53515 7.34578 5.70197 7.27668C5.86879 7.20758 6.02037 7.1063 6.14805 6.97862C6.27573 6.85094 6.37702 6.69936 6.44612 6.53254C6.51522 6.36571 6.55078 6.18692 6.55078 6.00635C6.55078 5.82578 6.51522 5.64698 6.44612 5.48016C6.37702 5.31334 6.27573 5.16176 6.14805 5.03408C6.02037 4.9064 5.86879 4.80511 5.70197 4.73601C5.53515 4.66691 5.35635 4.63135 5.17578 4.63135C4.81111 4.63135 4.46137 4.77621 4.20351 5.03408C3.94565 5.29194 3.80078 5.64167 3.80078 6.00635C3.80078 6.37102 3.94565 6.72076 4.20351 6.97862C4.46137 7.23648 4.81111 7.38135 5.17578 7.38135ZM5.17578 5.56885C5.41797 5.56885 5.61328 5.76416 5.61328 6.00635C5.61328 6.24854 5.41797 6.44385 5.17578 6.44385C4.93359 6.44385 4.73828 6.24854 4.73828 6.00635C4.73828 5.76416 4.93359 5.56885 5.17578 5.56885Z" fill="#0B0B0B"/>
                </svg>
            </span>
            <span>Insert image</span>
            <input type="file" accept="image/*" id="create-image" />
        </label>`;
        elAddDropdown.insertAdjacentHTML("beforeend", context);
    };

    // prettier-ignore
    _initTools = () => {
        const el = this.parent.app.querySelector(".bajs");
        const temp = `
        <div class="bajs-tool bajs-tool--image">
            <div class="bajs-tool__photo">
                <div class="bajs-tool__row">
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
            </div>
        </div>`;
        el.insertAdjacentHTML("beforeend", temp);
    }

    _changeFile = () => {
        const file = this.parent.app.querySelector("#create-image");
        file.addEventListener("change", this._listenCreateImageChange);
    };

    _listenCreateImageChange = (e) => {
        const parent = this.parent;
        const elInput = e;
        const files = elInput.target.files || elInput.dataTransfer.files;
        const type = files[0].type;
        const ext = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
        if (!ext.includes(type)) {
            alert("This is not a valid image file");
            return;
        }

        if (files[0].size > parent.limitSize) {
            alert("File upload limit 5 MB");
            return;
        }
        const key = `${parent.selectorText}-${parent.countImage}`;

        parent.elFocusMove.insertAdjacentHTML(
            "afterend",
            this.createImage(key)
        );
        const elBlockNext = parent.elFocusMove.nextElementSibling;

        const imgTmp = elBlockNext.querySelector("img");
        previewImageUpload(elInput, imgTmp, (base64) => {
            parent.files.push({
                key: key,
                file: elInput,
                base64: base64,
            });

            //
            parent.componentTool.closeButtonAddDropdown();
            parent.textTool.createTextAt(elBlockNext);
            parent.app.querySelector("#create-image").value = "";
            parent.countImage += 1;
        });
    };

    _listenToolActionImage = () => {
        const els = this.parent.app.querySelectorAll(
            ".bajs-tool--image .bajs-tool__item"
        );
        [...els].forEach((el) =>
            el.addEventListener("click", this._actionImage)
        );
    };

    _actionImage = (e) => {
        const el = e.target;
        const elItem = el.closest(".bajs-tool__item");
        const action = elItem.getAttribute("data-action");

        //
        const elImage = this.elImageFocusClick;
        const elAlign = elImage.closest(".bajs-align");

        switch (action) {
            case "left":
                elAlign && (elAlign.style.textAlign = "left");
                break;
            case "center":
                elAlign && (elAlign.style.textAlign = "center");
                break;
            case "right":
                elAlign && (elAlign.style.textAlign = "right");
                break;
        }

        // update position tool
        if (action !== "delete") {
            this._openToolImage(elImage);
        }
    };

    _toggleToolImage = (isBoolean) => {
        const action = isBoolean ? "add" : "remove";
        const elBajs = this.parent.app.querySelector(".bajs");
        elBajs && elBajs.classList[action]("bajs-tool--image-open");
    };

    // prettier-ignore
    _openToolImage = elImg => {
        if (!elImg) return;
        this._toggleToolImage(true);

        const x = elImg.offsetLeft;
        const widthX = elImg.offsetWidth;

        const elBlockWrap = elImg.closest('.bajs-block');
        const wrapY = elBlockWrap.offsetTop;

        const elTool = this.parent.app.querySelector('.bajs-tool--image');
        const heightTool = elTool.offsetHeight;
        const widthTool = elTool.offsetWidth;

        const padLeft = this.parent.utilsTool.getPaddingApp().left;
        const padTop = this.parent.utilsTool.getPaddingApp().top;
        
        elTool.style.top = wrapY + padTop - heightTool - 10 + 'px';
        elTool.style.left = x + padLeft + widthX / 2 - widthTool / 2 + 'px';
    };

    _keyDeleteRemove = (e) => {
        const key = e.keyCode || e.charCode;
        // delete key
        if (key !== 46 && key !== 8) return;
        e.preventDefault();

        const noDel = this.parent.app.querySelector(".no-del");
        if (noDel) return;

        if (!this.parent.utilsTool.isSelectCurrentApp()) return;

        const elClicked = this.parent.elClicked;
        if (!elClicked) return;
        if (
            elClicked.classList.contains("bajs-btn") ||
            elClicked.classList.contains("bajs-img")
        ) {
            const elBlockWrap = elClicked.closest(".bajs-block");
            this.parent.textTool.createTextAt(elBlockWrap);
            elBlockWrap && elBlockWrap.remove();
            this.parent.utilsTool.closeTools();

            if (elClicked.classList.contains("bajs-img")) {
                const dataId = elClicked.getAttribute("data-id");
                this.parent.files = this.parent.files.filter(
                    (el) => el.key !== dataId
                );
            }

            this.parent.elClicked = null;
        }
    };
}
