import EmojiButton from "@joeattardi/emoji-button";
import { setCaretPosition } from "../../helper";
import "./index.css";

export default class SortableTool {
    constructor(parent) {
        this.parent = parent;
        this.picker = undefined;
    }

    init = () => {
        const isHide = this.parent.disableComponents.includes("emoji");
        if (isHide) return;
        this._initInputComponent();
        this._initEmoji();
    };

    destroy = () => {};

    // prettier-ignore
    _initInputComponent = () => {
        const elAddDropdown = this.parent.app.querySelector(".bajs-add .bajs-add__dropdown");
        const context = `
        <div class="bajs-add__dropdown-item" data-type="emoji">
            <span>
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.77832 6.9082C4.77832 7.10712 4.85734 7.29788 4.99799 7.43853C5.13864 7.57919 5.32941 7.6582 5.52832 7.6582C5.72723 7.6582 5.918 7.57919 6.05865 7.43853C6.1993 7.29788 6.27832 7.10712 6.27832 6.9082C6.27832 6.70929 6.1993 6.51853 6.05865 6.37787C5.918 6.23722 5.72723 6.1582 5.52832 6.1582C5.32941 6.1582 5.13864 6.23722 4.99799 6.37787C4.85734 6.51853 4.77832 6.70929 4.77832 6.9082ZM10.2783 6.9082C10.2783 7.10712 10.3573 7.29788 10.498 7.43853C10.6386 7.57919 10.8294 7.6582 11.0283 7.6582C11.2272 7.6582 11.418 7.57919 11.5587 7.43853C11.6993 7.29788 11.7783 7.10712 11.7783 6.9082C11.7783 6.70929 11.6993 6.51853 11.5587 6.37787C11.418 6.23722 11.2272 6.1582 11.0283 6.1582C10.8294 6.1582 10.6386 6.23722 10.498 6.37787C10.3573 6.51853 10.2783 6.70929 10.2783 6.9082ZM8.27832 1.33008C4.4127 1.33008 1.27832 4.46445 1.27832 8.33008C1.27832 12.1957 4.4127 15.3301 8.27832 15.3301C12.1439 15.3301 15.2783 12.1957 15.2783 8.33008C15.2783 4.46445 12.1439 1.33008 8.27832 1.33008ZM12.3877 12.4395C11.8533 12.9738 11.2314 13.3926 10.5393 13.6863C9.8252 13.9895 9.06426 14.1426 8.27832 14.1426C7.49238 14.1426 6.73145 13.9895 6.01582 13.6863C5.32468 13.3944 4.69689 12.971 4.16738 12.4395C3.63301 11.9051 3.21426 11.2832 2.92051 10.591C2.61895 9.87695 2.46582 9.11602 2.46582 8.33008C2.46582 7.54414 2.61895 6.7832 2.92207 6.06758C3.21396 5.37644 3.63744 4.74864 4.16895 4.21914C4.70332 3.68477 5.3252 3.26602 6.01738 2.97227C6.73145 2.6707 7.49238 2.51758 8.27832 2.51758C9.06426 2.51758 9.8252 2.6707 10.5408 2.97383C11.232 3.26572 11.8598 3.6892 12.3893 4.2207C12.9236 4.75508 13.3424 5.37695 13.6361 6.06914C13.9377 6.7832 14.0908 7.54414 14.0908 8.33008C14.0908 9.11602 13.9377 9.87695 13.6346 10.5926C13.343 11.2834 12.9195 11.9108 12.3877 12.4395ZM10.6533 8.6582H9.90176C9.83613 8.6582 9.77988 8.7082 9.7752 8.77383C9.71582 9.54727 9.06738 10.1582 8.27832 10.1582C7.48926 10.1582 6.83926 9.54727 6.78145 8.77383C6.77676 8.7082 6.72051 8.6582 6.65488 8.6582H5.90332C5.88637 8.65818 5.86958 8.66161 5.854 8.66828C5.83841 8.67495 5.82434 8.68472 5.81265 8.697C5.80095 8.70927 5.79188 8.7238 5.78598 8.7397C5.78008 8.75559 5.77747 8.77252 5.77832 8.78945C5.84707 10.1066 6.94238 11.1582 8.27832 11.1582C9.61426 11.1582 10.7096 10.1066 10.7783 8.78945C10.7792 8.77252 10.7766 8.75559 10.7707 8.7397C10.7648 8.7238 10.7557 8.70927 10.744 8.697C10.7323 8.68472 10.7182 8.67495 10.7026 8.66828C10.6871 8.66161 10.6703 8.65818 10.6533 8.6582Z" fill="#0B0B0B"/>
                </svg>
            </span>
            <span>Emoji</span>
        </div>`;
        elAddDropdown.insertAdjacentHTML("beforeend", context);
  }

    // prettier-ignore
    _initEmoji = () => {
        const el = document.querySelector("[data-type='emoji']");
        const icon = document.querySelector(".bajs-add__btn");

        this.picker = new EmojiButton({
            showPreview: false,
            showRecents: false,
            showSearch: false,
            autoFocusSearch: false,
            autoHide: false,
            emojiSize: "1.2em",
            position: "bottom-start",
            emojisPerRow: 7,
            zIndex: 1001,
            categories: [ "smileys", "people", "animals", "food", "activities", "objects", "symbols", "flags"]
        });
        
        this.picker.on('emoji', emoji => {
            setCaretPosition(this.parent.lastTextFocus.el, this.parent.lastTextFocus.position)
            document.execCommand('insertText', false, emoji);
        });

        el.addEventListener('click', (e) => {
            e.preventDefault();
            this.picker.togglePicker(icon);

            const elPicker = document.querySelector(".emoji-picker");
            if (elPicker) {
                const elWrap = elPicker.closest(".wrapper");
                if (elWrap) {
                    elWrap.style.zIndex = 2000;
                    elWrap.classList.add("bajs-emoji")
                }
            }
        });
    };
}
