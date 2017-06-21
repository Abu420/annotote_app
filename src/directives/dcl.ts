import { Component, ViewChild, ViewContainerRef, Compiler, ComponentRef, Type, ComponentFactoryResolver, ElementRef, Input, Output, HostListener, EventEmitter, SimpleChanges } from '@angular/core';
import { Events } from 'ionic-angular';

@Component({
    selector: 'dcl-wrapper',
    template: `<div #target></div>`
})
export class DclWrapper {
    @ViewChild('target', { read: ViewContainerRef }) target: ViewContainerRef;
    @Input() type: Type<Component>;
    cmpRef: ComponentRef<Component>;
    private isViewInitialized: boolean = false;

    constructor(private componentFactoryResolver: ComponentFactoryResolver, private compiler: Compiler) { }

    updateComponent() {
        if (!this.isViewInitialized) {
            return;
        }
        if (this.cmpRef) {
            // when the `type` input changes we destroy a previously 
            // created component before creating the new one
            this.cmpRef.destroy();
        }

        let factory = this.componentFactoryResolver.resolveComponentFactory(this.type);
        this.cmpRef = this.target.createComponent(factory)
        // to access the created instance use
        // this.compRef.instance.someProperty = 'someValue';
        // this.compRef.instance.someOutput.subscribe(val => doSomething());
    }

    ngOnChanges() {
        this.updateComponent();
    }

    ngAfterViewInit() {
        this.isViewInitialized = true;
        this.updateComponent();
    }

    ngOnDestroy() {
        if (this.cmpRef) {
            this.cmpRef.destroy();
        }
    }
}