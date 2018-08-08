import { Component, Input, HostListener, ChangeDetectorRef, Output, EventEmitter } from "@angular/core";
import { UtilityMethods } from "../../services/utility_methods";

@Component({
    selector: 'custom-actions-area',
    templateUrl: 'custom-textarea.html',

})
export class CustomActions {
    @Input('text') anotote_txt: string;
    @Input() stream: string;
    @Output('update-please') changed: EventEmitter<string> = new EventEmitter<string>();
    removedSomethingWithSelection: boolean = false;
    barcketsPlace: { start: number, end: number } = {
        start: 0,
        end: 0
    }
    takeAction: any;
    constructor(public cd: ChangeDetectorRef,
        public utilityMethods: UtilityMethods) {
        console.log('inside');
    }

    ionViewDidLoad() {
        var box = document.getElementById('actualContent');

    }

    @HostListener('document:keydown', ['$event'])
    pressed(event) {
        if (event.target.id == 'actualContent') {
            let textarea: HTMLTextAreaElement = event.target;
            if (event.key == "Backspace") {
                if (this.actionNeeded(textarea.selectionStart - 1)) {
                    this.removedSomethingWithSelection = false;
                    let charToDelete = this.anotote_txt.substr(textarea.selectionStart - 1, 1);
                    if ((charToDelete == " " || textarea.selectionStart == 0) && textarea.selectionStart != textarea.selectionEnd) {
                        if (this.anotote_txt.substring(textarea.selectionStart, textarea.selectionEnd) != '"..."' || this.anotote_txt.substring(textarea.selectionStart, textarea.selectionEnd) != '"...' || this.anotote_txt.substring(textarea.selectionStart, textarea.selectionEnd) != '"..' || this.anotote_txt.substring(textarea.selectionStart, textarea.selectionEnd) != '".' || this.anotote_txt.substring(textarea.selectionStart, textarea.selectionEnd) != '"') {
                            var firstHalf = this.anotote_txt.substr(0, textarea.selectionStart).trim();
                            firstHalf += ' "..." ';
                            firstHalf += this.anotote_txt.substr(textarea.selectionEnd, this.anotote_txt.length).trim();
                            this.anotote_txt = firstHalf;
                            this.cd.detectChanges();
                            setTimeout((place) => {
                                var text: any = document.getElementById('actualContent');
                                text.setSelectionRange(place, place);
                                this.changed.emit(this.anotote_txt);
                                this.cd.detectChanges();
                            }, 200, textarea.selectionStart + 5);
                        } else {
                            event.preventDefault();
                            textarea.setSelectionRange(textarea.selectionEnd, textarea.selectionEnd);
                        }
                        return;
                    }
                    let nextChar = this.anotote_txt.substr(textarea.selectionStart, 1);
                    if (nextChar == " " || nextChar == "" || this.utilityMethods.conatains_special_chars(nextChar)) {
                        var start = textarea.selectionStart;
                        var end = textarea.selectionStart;

                        while (this.anotote_txt.substr(start - 1, 1) != " " && start - 1 >= 0) {
                            start -= 1;
                        }
                        if (start != end) {
                            event.preventDefault();
                            textarea.setSelectionRange(start, end);
                        }
                    }
                } else {
                    if (this.anotote_txt[textarea.selectionStart - 1] == '[')
                        event.preventDefault();
                    else if (this.anotote_txt[textarea.selectionEnd - 1] == ']') {
                        event.preventDefault();
                        textarea.setSelectionRange(textarea.selectionEnd, textarea.selectionEnd);
                    }
                }
            } else {
                if (this.takeAction)
                    clearTimeout(this.takeAction)
                if (this.actionNeeded(textarea.selectionStart - 1)) {
                    if (event.keyCode != 32 && event.keyCode >= 65 && event.keyCode <= 90) {
                        if (this.barcketsPlace.start == 0) {
                            this.barcketsPlace.start = event.target.selectionStart;
                            this.barcketsPlace.end = event.target.selectionEnd;
                            if (event.target.selectionEnd > event.target.selectionStart) {
                                this.removedSomethingWithSelection = true;
                                // event.preventDefault();
                            }
                        } else {
                            this.barcketsPlace.end = event.target.selectionStart + 1;
                        }
                        this.takeAction = setTimeout((textarea) => {
                            if (this.removedSomethingWithSelection) {
                                this.removedSomethingWithSelection = false;
                                var temporary = ' "..." [' + this.anotote_txt.slice(this.barcketsPlace.start, textarea.selectionStart) + '] ';
                            } else
                                var temporary = ' [' + this.anotote_txt.slice(this.barcketsPlace.start, textarea.selectionStart) + '] ';
                            this.anotote_txt = this.anotote_txt.slice(0, this.barcketsPlace.start).trim() + temporary + this.anotote_txt.slice((textarea.selectionStart), this.anotote_txt.length).trim();
                            this.barcketsPlace.end++;
                            setTimeout((textarea) => {
                                textarea.setSelectionRange(this.barcketsPlace.end, this.barcketsPlace.end);
                                this.changed.emit(this.anotote_txt);
                                this.cd.detectChanges();
                            }, 200, textarea);
                        }, 1000, textarea);
                    }
                }
            }
            this.changed.emit(this.anotote_txt);
        }
    }

    @HostListener('document:paste', ['$event'])
    pasting(event) {
        if (event.target.id == 'actualContent') {
            let textarea: any = event.target;
            if (this.actionNeeded(textarea.selectionStart) && ((this.utilityMethods.whichPlatform() == 'android' && event.clipboardData.getData('Text') != '') || (this.utilityMethods.whichPlatform() == 'ios' && event.clipboardData.getData('public.text') != ''))) {
                if (textarea.selectionStart == textarea.selectionEnd)
                    var pastedValue = this.utilityMethods.whichPlatform() == 'android' ? " [" + event.clipboardData.getData('Text') + "] " : " [" + event.clipboardData.getData('public.text') + "] ";
                else
                    var pastedValue = this.utilityMethods.whichPlatform() == 'android' ? ' "..." [' + event.clipboardData.getData('Text') + "] " : ' "..." [' + event.clipboardData.getData('public.text') + "] ";
                event.preventDefault();
                var result = this.anotote_txt.substr(0, textarea.selectionStart - 1).trim();
                result += pastedValue;
                var sec = this.anotote_txt.substring(textarea.selectionStart, this.anotote_txt.length).trim();
                this.anotote_txt = result + sec;
                this.changed.emit(this.anotote_txt);
                setTimeout((place) => {
                    var temp: any = document.getElementById('actualContent');
                    temp.setSelectionRange(place, place);
                    this.cd.detectChanges();
                }, 200, textarea.selectionStart + pastedValue.length - 3);
            }
        }
        this.changed.emit(this.anotote_txt);
    }

    @HostListener('document:input', ['$event'])
    androidInputEvent(event) {
        if (this.utilityMethods.whichPlatform() == 'android') {
            if (event.target.id == 'actualContent') {
                if (this.takeAction)
                    clearTimeout(this.takeAction)
                if (event.inputType == 'insertCompositionText') {
                    let textarea: HTMLTextAreaElement = event.target;
                    if (this.actionNeeded(textarea.selectionStart - 1)) {
                        if (this.barcketsPlace.start == 0)
                            this.barcketsPlace.start = event.target.selectionStart - 1;
                        this.takeAction = setTimeout((event) => {
                            var temporary = ' [' + this.anotote_txt.slice(this.barcketsPlace.start, event.target.selectionStart) + '] ';
                            this.anotote_txt = this.anotote_txt.slice(0, this.barcketsPlace.start).trim() + temporary + this.anotote_txt.slice((textarea.selectionStart), this.anotote_txt.length).trim();
                            setTimeout((event) => {
                                textarea.setSelectionRange(event.target.selectionStart, event.target.selectionStart);
                                this.changed.emit(this.anotote_txt);
                                this.cd.detectChanges();
                            }, 200, event)
                        }, 1000, event)
                    }
                }
            }
        }
    }

    actionNeeded(index) {
        while (index > 0) {
            if (this.anotote_txt[index] == ']' || index - 1 == 0) {
                return true;
            } else if (this.anotote_txt[index] == '[') {
                return false;
            }
            index--;
        }
    }
}