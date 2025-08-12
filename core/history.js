export class History {
  constructor(limit = 100) {
    this.stack = [];
    this.index = -1;
    this.limit = limit;
    this._onChange = () => {};
  }

  onChange(fn) { this._onChange = fn; }

  push(state, label = 'Edit') {
    this.stack = this.stack.slice(0, this.index + 1);
    this.stack.push({ state: JSON.stringify(state), label });
    if (this.stack.length > this.limit) this.stack.shift();
    this.index = this.stack.length - 1;
    this._onChange();
  }

  undo(apply) {
    if (this.index <= 0) return;
    this.index -= 1;
    const { state } = this.stack[this.index];
    apply(JSON.parse(state));
    this._onChange();
  }

  redo(apply) {
    if (this.index >= this.stack.length - 1) return;
    this.index += 1;
    const { state } = this.stack[this.index];
    apply(JSON.parse(state));
    this._onChange();
  }

  goTo(idx, apply) {
    if (idx < 0 || idx >= this.stack.length) return;
    this.index = idx;
    const { state } = this.stack[this.index];
    apply(JSON.parse(state));
    this._onChange();
  }
}