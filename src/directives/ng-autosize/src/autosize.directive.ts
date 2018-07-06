import { Input, AfterViewInit, ElementRef, HostListener, Directive } from '@angular/core';

@Directive({
  selector: 'textarea[autosize]'
})

export class Autosize implements AfterViewInit {

  private el: any;
  private _minHeight: string;
  private _maxHeight: string;
  private _clientWidth: number;

  @Input('minHeight')
  get minHeight() {
    return this._minHeight;
  }
  set minHeight(val: string) {
    this._minHeight = val;
    this.updateMinHeight();
  }

  @Input('maxHeight')
  get maxHeight() {
    return this._maxHeight;
  }
  set maxHeight(val: string) {
    this._maxHeight = val;
    this.updateMaxHeight();
  }

  constructor(public element: ElementRef) {
    this.el = element.nativeElement;
    this._clientWidth = this.el.clientWidth;
  }

  ngAfterViewInit(): void {
    // set element resize allowed manually by user
    setTimeout(() => {
      const style = window.getComputedStyle(this.el, null);
      if (style.resize === 'both') {
        this.el.style.resize = 'horizontal';
      }
      else if (style.resize === 'vertical') {
        this.el.style.resize = 'none';
      }
      // run first adjust
      this.adjust();
    }, 200)
  }

  adjust(): void {
    // perform height adjustments after input changes, if height is different
    if (this.el.style.height == this.element.nativeElement.scrollHeight + "px") {
      return;
    }
    this.el.style.overflow = 'scroll';
    this.el.style.height = 'auto';
    if (this.el.scrollHeight > 0)
      this.el.style.height = this.el.scrollHeight + "px";
  }

  updateMinHeight(): void {
    // Set textarea min height if input defined
    this.el.style.minHeight = this._minHeight + 'px';
  }

  updateMaxHeight(): void {
    // Set textarea max height if input defined
    this.el.style.maxHeight = this._maxHeight + 'px';
  }

}