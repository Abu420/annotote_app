import { Pipe } from '@angular/core';

@Pipe({
    name: 'onlytime'
})
export class OnlyTime {
    transform(value, args) {
        //console.log(value);
        return "08:30PM";
    }
}