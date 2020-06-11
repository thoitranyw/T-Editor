document.addEventListener("click", function (e) {
    const el = e.target;
    const wrap = el.closest(".bajs-select");
    if (!wrap) {
        hideSelect();
        return;
    }
    wrap.classList.toggle("bajs-select--focus");

    const text = wrap.querySelector(".bajs-select__text");
    const dropdown = wrap.querySelector(".bajs-select__dropdown");
    const li = el.closest(".bajs-select__dropdown-item");

    if (li) {
        const label = li.textContent;
        text.innerText = label;
        wrap.classList.remove("bajs-select--focus");
    }
});

function hideSelect() {
    const els = document.querySelectorAll(".bajs-select--focus");
    [...els].forEach(function (el) {
        el.classList.remove("bajs-select--focus");
    });
}
