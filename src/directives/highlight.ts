import { Directive, ElementRef, Renderer, Input, Output, HostListener, EventEmitter, SimpleChanges } from '@angular/core';
import { Events } from 'ionic-angular';

@Directive({
    selector: '[highlight_quote]'
})
export class Highlight {

    constructor(public renderer: Renderer, public elementRef: ElementRef) {
        console.log('highlight_quote')
    }
}