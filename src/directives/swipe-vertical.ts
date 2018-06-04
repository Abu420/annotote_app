import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { Gesture } from 'ionic-angular/gestures/gesture';
import { NavController, Content } from 'ionic-angular';
import { UtilityMethods } from '../services/utility_methods';
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
    selector: '[swipe-vertical]' // Attribute selector
})
export class SwipeVertical implements OnInit, OnDestroy {
    // @Input('swipeUp') actionUp: any;
    // @Input('swipeDown') actionDown: any;

    private el: HTMLElement
    private swipeGesture: Gesture
    private swipeDownGesture: Gesture
    @Input() content: Content;

    constructor(el: ElementRef, public navCtrl: NavController,
        public utils: UtilityMethods) {
        this.el = el.nativeElement
    }

    ngOnInit() {
        this.swipeGesture = new Gesture(this.el, {
            recognizers: [
                [Hammer.Swipe, { direction: Hammer.DIRECTION_HORIZONTAL }],
                [Hammer.Swipe, { direction: Hammer.DIRECTION_VERTICAL }]
            ]
        });
        this.swipeGesture.listen()
        this.swipeGesture.on('swipeleft', e => {
            // console.log('left');
        })
        this.swipeGesture.on('swiperight', e => {
            this.navCtrl.pop();
            // console.log('right');
        })
        this.swipeGesture.on('swipeup', e => {
            if (this.utils.whichPlatform() == 'android')
                this.content.scrollTo(0, e.distance);
        })
        this.swipeGesture.on('swipedown', e => {
            if (this.utils.whichPlatform() == 'android')
                this.content.scrollTo(0, e.distance);
        })
    }

    ngOnDestroy() {
        this.swipeGesture.destroy()
    }
}