import { Directive, ElementRef, Input, Output, HostListener, EventEmitter, SimpleChanges } from '@angular/core';
import { Events } from 'ionic-angular';

@Directive({
    selector: '[text-editor]'
})
export class TextEditor {

    constructor(public events: Events, private el: ElementRef) {
        events.subscribe('tote:comment', (data) => {
            if (data.selection != null)
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

    private highlight_(data) {
        try {
            console.log(data);
            var self = this;
            var _selected = data.selection;
            var selection = window.getSelection();
            var range = document.createRange();
            range.setStart(_selected.startContainer, _selected.startOffset);
            range.setEnd(_selected.endContainer, _selected.endOffset);
            var newNode = document.createElement("span");
            newNode.onclick = function (this, evt) {
                evt.stopPropagation();
                var text = this.getAttribute('data-txt');
                self.events.publish('show_anotation_details', { txt: text });
            }
            newNode.setAttribute("data-txt", data.selected_txt);
            if (data.type == 'comment')
                newNode.setAttribute("class", "highlight_comment");
            else
                newNode.setAttribute("class", "highlight_quote");
            range.surroundContents(newNode);
            selection.removeAllRanges();
        } catch (e) {
        }
    }
}