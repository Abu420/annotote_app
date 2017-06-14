import { Directive, ElementRef, Input, Output, HostListener, EventEmitter, SimpleChanges } from '@angular/core';
import { Events } from 'ionic-angular';

@Directive({
    selector: '[textEditor]'
})
export class TextEditor {
    @Input('textEditor') model: string;
    @Output('contenteditableModelChange') update = new EventEmitter();

    /**
     * By updating this property on keyup, and checking against it during
     * ngOnChanges, we can rule out change events fired by our own onKeyup.
     * Ideally we would not have to check against the whole string on every
     * change, could possibly store a flag during onKeyup and test against that
     * flag in ngOnChanges, but implementation details of Angular change detection
     * cycle might make this not work in some edge cases?
     */
    private lastViewModel: string;

    constructor(public events: Events, private el: ElementRef) {
        events.subscribe('tote:comment', () => {
            console.log('tote:comment')
            this.highlight_();
        });
    }

    @HostListener('touchstart') onTouchStart() {
        console.log('touch_start');
        this.events.publish('show_tote_options', false);
    }

    @HostListener('touchend') onTouchEnd() {
        console.log('touch_end');
        var selected = getSelection(),
            selected_txt = selected.toString();
        if (selected_txt != '')
            this.events.publish('show_tote_options', true);
        else
            this.events.publish('show_tote_options', false);
    }

    @HostListener('selectstart') onSelectStart() {
        var selected = getSelection(),
            selected_txt = selected.toString();
        console.log(selected_txt);
        if (selected_txt != '')
            this.events.publish('show_tote_options', true);
        else
            this.events.publish('show_tote_options', false);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['model'] && changes['model'].currentValue !== this.lastViewModel) {
            this.lastViewModel = this.model;
            this.refreshView();
        }
    }

    /** This should probably be debounced. */
    onKeyup() {
        var value = this.el.nativeElement.innerText;
        this.lastViewModel = value;
        this.update.emit(value);
    }

    selectionChangeEvent() {
        console.log('Selection Change Event');
    }

    onMouseup() {
        console.log('mouse Up')
    }

    private refreshView() {
        this.el.nativeElement.innerText = this.model
    }

    private highlight_() {
        var selected = getSelection(),
            selected_txt = selected.toString();
        if (selected_txt != '') {
            var range = selected.getRangeAt(0);
            if (selected.toString().length > 1) {
                var newNode = document.createElement("span");
                newNode.onclick = function () {
                    console.log('Already created tote')
                }
                newNode.ontouchstart = function () {
                    console.log('Already created tote touch')
                }
                newNode.setAttribute("class", "highlight");
                range.surroundContents(newNode);
            }
            selected.removeAllRanges();
        }
    }
}