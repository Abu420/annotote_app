import { Directive, ElementRef, Renderer, Input, Output, HostListener, EventEmitter, SimpleChanges } from '@angular/core';
import { Events } from 'ionic-angular';

@Directive({
    selector: '[search-field]'
})
export class SearchField {
    @Input() selection: boolean;

    constructor(public renderer: Renderer, public elementRef: ElementRef) {
    }

    ngAfterViewInit() {
        setTimeout(() => {
            //console.log(this.elementRef.nativeElement);
            this.renderer.invokeElementMethod(this.elementRef.nativeElement, 'focus', []);
            if (!this.selection)
                this.elementRef.nativeElement.setSelectionRange(0, 10000);
        }, 1000);
    }
}