export class Piece {
    constructor(type, color, row, col) {
        this.type = type;
        this.color = color;
        this.clone = null;
        this.square = null;
        this.invisible = false;

        const img = document.createElement('img');
        img.src = `img/${type}.png`;
        img.id = `${type}-${row}-${col}`;  
        img.classList.add('piece', color);
        img.addEventListener('mousedown', this.handleMousedown.bind(this));
        document.addEventListener('mousemove', this.handleMousemove.bind(this));
        this.element = img;
    }

    handleMousedown(e) {
        e.preventDefault();
        this.clone = this.element.cloneNode(true);
        this.clone.style.position = "fixed";
        this.clone.style.pointerEvents = "none";
        this.clone.id = 'clone';
        document.body.appendChild(this.clone);

        this.square = this.element.parentElement;
        this.element.classList.add('invisible');
        this.moveClone(e);
    }

    handleMousemove(e) {
        if (!this.clone) return;
        this.moveClone(e);
    }

    moveClone(e) {
        this.clone.style.left = (e.clientX - this.clone.offsetWidth / 2) + 'px';
        this.clone.style.top = (e.clientY - this.clone.offsetHeight / 2) + 'px';
    }

    deselect() {
        if (!this.element || !this.clone) return;
        this.element.style.position = 'static';
        this.square.appendChild(this.element);
        document.body.removeChild(this.clone);
        this.clone = null;
        this.square = null;
        this.element.classList.remove('invisible');
    }
}
