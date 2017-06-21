import { Directive, ElementRef, Renderer, Input, Output, HostListener, EventEmitter, SimpleChanges } from '@angular/core';
import { Events } from 'ionic-angular';

@Directive({
    selector: '[search-field]'
})
export class SearchField {

    constructor(public renderer: Renderer, public elementRef: ElementRef) {
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.renderer.invokeElementMethod(this.elementRef.nativeElement, 'focus', []);
            this.elementRef.nativeElement.setSelectionRange(0, 10000);
        }, 1000);
    }
}