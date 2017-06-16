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
        events.subscribe('tote:comment', (data) => {
            this.highlight_(data);
        });

        document.addEventListener("selectionchange", function () {
            var selection = getSelection(),
                selected_txt = selection.toString();
            if (selected_txt != '') {
                var range = selection.getRangeAt(0);
                var current_selection = { "startContainer": range.startContainer, "startOffset": range.startOffset, "endContainer": range.endContainer, "endOffset": range.endOffset };
                events.publish('show_tote_options', { flag: true, txt: selected_txt, selection: current_selection });
            }
        });
    }

    // @HostListener('selectstart') onSelectStart() {
    // }

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

    private refreshView() {
        this.el.nativeElement.innerText = this.model
    }

    private highlight_(data) {
        try {
            var self = this;
            var _selected = data.selection;
            var selection = window.getSelection();
            var range = document.createRange();
            range.setStart(_selected.startContainer, _selected.startOffset);
            range.setEnd(_selected.endContainer, _selected.endOffset);
            var newNode = document.createElement("span");
            newNode.onclick = function (this, evt) {
                evt.stopPropagation();
                // // get the element's parent node
                // var parent = this.parentNode;

                // // move all children out of the element
                // while (this.firstChild) parent.insertBefore(this.firstChild, this);

                // // remove the empty element
                // parent.removeChild(this);
                var text = this.getAttribute('data-txt');
                self.events.publish('show_anotation_details', { txt: text });
            }
            newNode.setAttribute("data-txt", data.selected_txt);
            newNode.setAttribute("class", "highlight");
            range.surroundContents(newNode);
            selection.removeAllRanges();
        } catch (e) {
        }
    }
}