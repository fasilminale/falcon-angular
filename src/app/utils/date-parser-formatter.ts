import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Injectable } from '@angular/core';

@Injectable()
export class DateParserFormatter extends NgbDateParserFormatter {

    parse(value: string): NgbDateStruct { //parse receive your string dd/mm/yyy
            //return a NgbDateStruct
        if (value === '') {
            return {year:0, month:0, day:0};
        }
        
        const dateString: string = value;
        const dateValues = dateString.split('-');
        if (dateValues.length !== 3) {
            return {year:0, month:0, day:0};
        }
        return {year:parseInt(dateValues[2]), month:parseInt(dateValues[0]), day:parseInt(dateValues[1])};
    }

    format(date: NgbDateStruct): string { //receive a NgbDateStruct- go ahead
        //return a string
        if(!date || date.year === 0) {
            return '';
        }
        const month = date.month < 10 ? '0'+date.month : ''+ date.month;
        const day = date.day < 10 ? '0'+date.day : ''+ date.day;
        return ''+ month +'-'+ day +'-'+date.year;
    }
}