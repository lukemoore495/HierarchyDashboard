import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, map, Subscription, tap } from 'rxjs';
import { Measurement, MeasurementDefinition, MeasurementType, Node } from 'src/app/Hierarchy';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { Output } from '@angular/core';
import { OnDestroy } from '@angular/core';

@Component({
  selector: 'app-measurements-panel',
  templateUrl: './measurements-panel.component.html',
  styleUrls: ['./measurements-panel.component.scss']
})
export class MeasurementsPanelComponent implements OnInit, OnDestroy {
    @Input() measurementNode: Node | null = null;
    @Output() measurementResultEvent: EventEmitter<Measurement[]>;
    form: FormGroup;
    currentMeasurements: Measurement[] = [];
    subscriptions: Subscription[] = [];

    constructor(private fb: FormBuilder) { 
        this.form = fb.group({});
        this.measurementResultEvent = new EventEmitter<Measurement[]>();
    }

    ngOnInit(): void {
        let nodes : Node[] = Object.assign([], this.measurementNode?.children);
        for(let node of nodes) {
            let measurements = node?.measurements ?? [];
            for(let measurement of measurements) {
                if(this.isNumberMeasurement(measurement)){
                    this.form.addControl(measurement.id, this.fb.control(null, [Validators.pattern("^[0-9]*$")]));
                } else if (this.isPercentageMeasurement(measurement)) {
                    this.form.addControl(measurement.id, this.fb.control(null, []));
                } else if (this.isBooleanMeasurement(measurement)) {
                    this.form.addControl(measurement.id, this.fb.control(null, []));
                }
            }
        }

        const sub = this.form?.valueChanges
            .pipe(
                debounceTime(1000),
                map(form => {
                    let measurements : Measurement[] = [];
                    for(const id in form){
                        measurements.push({
                            measurementDefinitionId: id,
                            measure: form[id]
                        });
                    }
                    return measurements;
                })
            )
            .subscribe(formMeasurements => {
                if(this.form.valid){
                    this.updateMeasurements(formMeasurements);
                }
            });

        this.subscriptions.push(sub);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    getFormControl(name : string): AbstractControl | null{
        return this.form.get(name);
    }

    hasChildren(node: Node): boolean{
        if(node?.children != undefined && node?.children.length) {
            return true;
        }
        return false;
    }

    updateMeasurements (newMeasurements: Measurement[]){
        let updatedMeasurements = [];
        for(let currentMeasure of this.currentMeasurements){
            let updatedMeasure = newMeasurements.find(newMeasure => newMeasure.measurementDefinitionId == currentMeasure.measurementDefinitionId) ?? currentMeasure;
            updatedMeasurements.push(updatedMeasure);
        }
        for (let measure of newMeasurements) {
            if(!this.currentMeasurements.some(currentMeasure => currentMeasure.measurementDefinitionId == measure.measurementDefinitionId)){
                updatedMeasurements.push(measure);
            }
        }
        this.currentMeasurements = updatedMeasurements;
        this.measurementResultEvent.emit(this.currentMeasurements);
    }

    isNumberMeasurement(measurement : MeasurementDefinition){
        return measurement.measurementType === MeasurementType.Number;
    }

    isPercentageMeasurement(measurement : MeasurementDefinition){
        return measurement.measurementType === MeasurementType.Percentage;
    }

    isBooleanMeasurement(measurement : MeasurementDefinition){
        return measurement.measurementType === MeasurementType.Boolean;
    }

    hasDirectMeasurements(node: Node): boolean{
        return (!(node?.children?.length) && node?.measurements) as boolean;
    }

}
