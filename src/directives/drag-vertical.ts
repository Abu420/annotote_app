import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { Gesture } from 'ionic-angular/gestures/gesture';
import { NavController } from 'ionic-angular';
declare var Hammer: any;

/*
  Class for the SwipeVertical directive (attribute (swipe) is only horizontal).

  In order to use it you must add swipe-vertical attribute to the component.
  The directives for binding functions are [swipeUp] and [swipeDown].

  IMPORTANT:
  [swipeUp] and [swipeDown] MUST be added in a component which
  already has "swipe-vertical".
*/

@Directive({
    selector: '[drag-vertical]' // Attribute selector
})
export class DragVertical implements OnInit, OnDestroy {

    private el: HTMLElement
    private swipeGesture: Gesture
    private swipeDownGesture: Gesture

    constructor(el: ElementRef, public navCtrl: NavController) {
        this.el = el.nativeElement
    }

    ngOnInit() {
        this.swipeGesture = new Gesture(this.el, {
            recognizers: [
                [Hammer.Pan, { direction: Hammer.DIRECTION_VERICAL }]
            ]
        });
        this.swipeGesture.listen()
        this.swipeGesture.on('pan', e => {
            console.log('pan');
        })
    }

    ngOnDestroy() {
        this.swipeGesture.destroy()
    }
}