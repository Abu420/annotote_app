import { Component, Input, HostListener, ChangeDetectorRef, Output, EventEmitter } from "../../../node_modules/@angular/core";
import { UtilityMethods } from "../../services/utility_methods";

@Component({
    selector: 'custom-actions-area',
    templateUrl: 'custom-textarea.html',
})
export class CustomActions {
    @Input('text') anotote_txt: string;
    @Input() stream: string;
    @Output('update-please') changed: EventEmitter<string> = new EventEmitter<string>();
    shouldPreventDefault: boolean = false;
    waitingMode = [];
    waitingTime: number;
    barcketsPlace: { start: number, end: number } = {
        start: 0,
        end: 0
    }
    takeAction: any;
    constructor(public cd: ChangeDetectorRef,
        public utilityMethods: UtilityMethods) {
    }

    ionViewDidLoad() {
        var box = document.getElementById('actualContent');
        autosize(box);
        box.addEventListener('paste', (event) => {
            let textarea: any = event.target;
            if (this.actionNeeded(textarea.selectionStart) && event.clipboardData.getData('Text') != '') {
                if (textarea.selectionStart == textarea.selectionEnd)
                    var pastedValue = " [" + event.clipboardData.getData('Text') + "] ";
                else
                    var pastedValue = ' "..." [' + event.clipboardData.getData('Text') + "] ";
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
        })
    }

    @HostListener('document:keydown', ['$event'])
    pressed(event) {
        if (event.target.id == 'actualContent') {
            let textarea: HTMLTextAreaElement = event.target;
            if (event.key == "Backspace") {
                if (this.actionNeeded(textarea.selectionStart - 1)) {
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
                        if (this.barcketsPlace.start == 0)
                            this.barcketsPlace.start = event.target.selectionStart;
                        else
                            this.barcketsPlace.end = event.target.selectionStart + 1;
                        this.takeAction = setTimeout((textarea) => {
                            this.shouldPreventDefault = true;
                            var temporary = ' [' + this.anotote_txt.slice(this.barcketsPlace.start, this.barcketsPlace.end) + '] ';
                            this.anotote_txt = this.anotote_txt.slice(0, this.barcketsPlace.start).trim() + temporary + this.anotote_txt.slice(this.barcketsPlace.end, this.anotote_txt.length).trim();
                            setTimeout((textarea) => {
                                textarea.setSelectionRange(this.barcketsPlace.end, this.barcketsPlace.end);
                                this.changed.emit(this.anotote_txt);
                                this.cd.detectChanges();
                            }, 200, textarea);
                        }, 1000, textarea);
                        // if (this.shouldPreventDefault == false) {
                        //     this.shouldPreventDefault = true;
                        //     var result = this.anotote_txt.substr(0, textarea.selectionStart - 1).trim();
                        //     result += ' [' + event.key + '] ';
                        //     var sec = this.anotote_txt.substring(textarea.selectionStart, this.anotote_txt.length).trim();
                        //     this.anotote_txt = result + sec;
                        //     setTimeout((place) => {
                        //         var word = '';
                        //         for (let wait of this.waitingMode) {
                        //             word += wait;
                        //         }
                        //         var result = this.anotote_txt.substr(0, place - 1).trim();
                        //         result += word + ']';
                        //         result += this.anotote_txt.substr(place, this.anotote_txt.length);
                        //         this.anotote_txt = result;
                        //         setTimeout((area) => {
                        //             this.shouldPreventDefault = false;
                        //             this.waitingMode = [];
                        //             this.waitingTime = 500;
                        //             var text: any = document.getElementById('actualContent');
                        //             text.setSelectionRange(area, area);
                        //             this.changed.emit(this.anotote_txt);
                        //             this.cd.detectChanges();
                        //         }, 200, (place + this.waitingMode.length) - 1);
                        //     }, this.waitingTime, textarea.selectionStart + 3);
                        // } else {
                        //     this.waitingMode.push(event.key);
                        //     this.waitingTime += 200;
                        // }
                    }
                }
            }
            this.changed.emit(this.anotote_txt);
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