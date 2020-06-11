import Sortable from 'sortablejs';
import { removeClass } from '../../helper';

export default class SortableTool {
    constructor(parent) {
        this.parent = parent;
    }

    init = () => {};

    destroy = () => {};

    // prettier-ignore
    refrestSortable = () => {
    const self = this;
    const el = self.parent.app.querySelector(".bajs-body");
    if (!el) return;
    
    Sortable.create(el, {
      delay: 300,
      animation: 150,
      draggable: ".bajs-drag",
      setData: function(dataTransfer) {
        dataTransfer.setDragImage(document.createElement("div"), 0, 0);
      },
      onEnd: function() {
        const elsBlock = self.parent.app.querySelectorAll(".bajs-block");
        [...elsBlock].forEach(el => (el.style.position = ""));
      },
      onChoose: function() {
        self.parent.app.classList.add("bajs-draging");
        const elsBlock = self.parent.app.querySelectorAll(".bajs-block");
        [...elsBlock].forEach(el => (el.style.position = "relative"));
        removeClass(".bajs", "bajs-tool--button-open bajs-tool--text-open bajs-tool--image-open", self.parent.app);
      },
      onUnchoose: function() {
        self.parent.app.classList.remove("bajs-draging");
      },
    });
  };
}
