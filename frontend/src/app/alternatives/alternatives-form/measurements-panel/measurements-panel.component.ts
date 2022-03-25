import { Component, EventEmitter, Input, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, debounceTime, map, Observable, Subscription, take } from 'rxjs';
import { Measurement, MeasurementDefinition, MeasurementType, Node } from 'src/app/Hierarchy';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Output } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { HierarchyState } from 'src/app/state/hierarchy.reducer';
import { Store } from '@ngrx/store';
import { getSelectedAlternative, getSelectedMeasurementId } from 'src/app/state';
import * as HierarchyActions from '../../../state/hierarchy.actions';
import { MatSelectionList } from '@angular/material/list';
import { AfterViewInit } from '@angular/core';

@Component({
    selector: 'app-measurements-panel',
    templateUrl: './measurements-panel.component.html',
    styleUrls: ['./measurements-panel.component.scss']
})
export class MeasurementsPanelComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() measurementNode: Node | null = null;
    @Input() parentIsSelected?: Observable<boolean>;
    @Input() isTopLevel = false;
    @Output() measurementResultEvent: EventEmitter<Measurement[]>;
    @Output() childNodeOpened: EventEmitter<void>;
    @Output() closed: EventEmitter<void>;
    @ViewChild('measurementSelectList') measurementSelectList?: MatSelectionList;
    form: FormGroup;
    subscriptions: Subscription[] = [];
    selectedMeasurementId: string | null = null;
    $parentNodeOpened: BehaviorSubject<boolean>;
    alternativeMeasurements: Measurement[] = [];
    measurementDefinitions: MeasurementDefinition[] = [];
    alternativeChanged = false;

    constructor(private fb: FormBuilder, private store: Store<HierarchyState>) { 
        const sub = this.store.select(getSelectedAlternative)
            .pipe(
                map(alternative => alternative?.measurements)
            )
            .subscribe(measurements => {
                this.alternativeMeasurements = measurements ?? []; 
                this.setFormValues(this.alternativeMeasurements);
                this.alternativeChanged = true;
            });
        this.subscriptions.push(sub);
    
        this.form = fb.group({});
        this.measurementResultEvent = new EventEmitter<Measurement[]>();
        this.childNodeOpened = new EventEmitter<void>();
        this.closed = new EventEmitter<void>();
        this.$parentNodeOpened = new BehaviorSubject<boolean>(true);
    }

    ngOnInit(): void {        
        const nodes : Node[] = Object.assign([], this.measurementNode?.children);
        for(const node of nodes) {
            const measurementFields = node.measurements ?? [];
            this.measurementDefinitions.push(...measurementFields);
            for(const measurementField of measurementFields) {
                let measurementValue : number | boolean | null
                    = this.alternativeMeasurements.find(m => m.measurementDefinitionId === measurementField.id)?.measure ?? null;
                if(this.isNumberMeasurement(measurementField)){
                    this.form.addControl(measurementField.id, this.fb.control(null, [Validators.pattern('^[0-9]*$')]));
                } else if (this.isPercentageMeasurement(measurementField)) {
                    this.form.addControl(measurementField.id, this.fb.control(null, []));
                } else if (this.isBooleanMeasurement(measurementField)) {
                    this.form.addControl(measurementField.id, this.fb.control(null, []));
                    measurementValue = this.convertNumberToBoolean(measurementValue);
                }
                const formControl = this.getFormControl(measurementField.id);
                formControl?.setValue(measurementValue);
            }
        }

        const measurementSub = this.form?.valueChanges
            .pipe(
                debounceTime(1000),
                map(form => {
                    const measurements : Measurement[] = [];
                    for(const id in form){
                        let measure = form[id];
                        if(this.isBooleanMeasurementUsingId(id)){
                            measure = this.convertBooleanToNumber(measure);
                        }
                        measurements.push({
                            measurementDefinitionId: id,
                            measure: measure
                        });
                    }
                    return measurements;
                })
            )
            .subscribe(formMeasurements => {
                if(this.form.valid && !this.alternativeChanged){
                    this.updateMeasurements(formMeasurements);
                }
                if(this.alternativeChanged) {
                    this.alternativeChanged = false;
                }
            });

        this.subscriptions.push(measurementSub);

        if(this.parentIsSelected){
            const parentSelectedSub = this.parentIsSelected
                .subscribe(parentIsSelected => {
                    if(this.measurementSelectList && parentIsSelected){
                        this.measurementSelectList.deselectAll();
                        this.deselectMeasurement();
                    }
                    this.$parentNodeOpened.next(true);
                });
            this.subscriptions.push(parentSelectedSub);
        }
    }

    ngOnDestroy(): void {
        this.deselectMeasurement();
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    ngAfterViewInit(){
        if(this.isTopLevel) {
            //A hack to work with change detection in afterViewInit. Couldn't find another solution.
            setTimeout(() => {
                this.selectFirstMeasurement();
            }, 0);
        }
    }

    setFormValues(measurements: Measurement[]){
        for(const measurement of measurements) {
            let measurementValue : number | boolean | null = measurement.measure ?? null;
            if (this.isBooleanMeasurementUsingId(measurement.measurementDefinitionId)) {
                measurementValue = this.convertNumberToBoolean(measurementValue);
            }
            const formControl = this.getFormControl(measurement.measurementDefinitionId);
            formControl?.setValue(measurementValue);
        }
    }

    getFormControl(name : string): AbstractControl | null{
        return this.form?.get(name);
    }

    getCheckboxValue(formControlName: string): boolean | null {
        const formControl = this.getFormControl(formControlName);
        return formControl?.value as boolean ?? null;
    }

    checkboxIsIndeterminate(formControlName: string): boolean {
        const value = this.getCheckboxValue(formControlName);
        return value === null;
    }

    hasChildren(node: Node): boolean{
        if(node?.children != undefined && node?.children.length) {
            return true;
        }
        return false;
    }

    convertNumberToBoolean(number: number | null): boolean | null {
        if(number !== null && (number === 0 || number === 1)) {
            return number === 1;
        }
        return null;
    }

    convertBooleanToNumber(bool: boolean): number {
        return bool ? 1 : 0;
    }

    updateMeasurements (newMeasurements: Measurement[]){
        const modifiedMeasurements = [];
        const currentMeasurements = [];
        for(const measure of this.alternativeMeasurements) {
            if(!newMeasurements.some(newMeasure => newMeasure.measurementDefinitionId === measure.measurementDefinitionId)){
                currentMeasurements.push(measure);
            }
        }
        
        for(const newMeasure of newMeasurements) {
            const currentMeasure = this.alternativeMeasurements.find(measure => measure.measurementDefinitionId === newMeasure.measurementDefinitionId) ?? newMeasure;
            if(currentMeasure.measure !== newMeasure.measure) {
                modifiedMeasurements.push(newMeasure);
                currentMeasurements.push(newMeasure);
                continue;
            }
            currentMeasurements.push(currentMeasure);
        }
        this.alternativeMeasurements = currentMeasurements;
        this.measurementResultEvent.emit(modifiedMeasurements);
    }

    isNumberMeasurement(measurement : MeasurementDefinition): boolean {
        return measurement.type === MeasurementType.Number;
    }

    isPercentageMeasurement(measurement : MeasurementDefinition): boolean {
        return measurement.type === MeasurementType.Percentage;
    }

    isBooleanMeasurement(measurement : MeasurementDefinition): boolean {
        return measurement.type === MeasurementType.Boolean;
    }

    isBooleanMeasurementUsingId(measurementDefinitionId : string): boolean {
        const measurement = this.measurementDefinitions.find(m => m.id == measurementDefinitionId);
        if(!measurement){
            return false;
        }
        return this.isBooleanMeasurement(measurement);
    }

    onPanelOpen(){
        this.selectFirstMeasurement();
        this.childNodeOpened.emit();
    }

    onPanelClose(){
        this.deselectMeasurement();
        this.closed.emit();
        this.$parentNodeOpened.next(true);
    }

    deselectAndEmitToParent(){
        this.deselectMeasurement();
        this.childNodeOpened.emit();
    }

    setSelectionAndNotifyChild(){
        this.selectFirstMeasurement();
        this.$parentNodeOpened.next(true);
    }

    selectFirstMeasurement(){
        if(!this.measurementNode || 
            !this.measurementNode.children[0] || 
            !this.measurementNode.children[0].measurements[0])
            return;

        const firstMeasurementId = this.measurementNode.children[0].measurements[0].id;
        this.store.dispatch(HierarchyActions.setSelectedMeasurement({selectedMeasurementId: firstMeasurementId}));
        this.selectedMeasurementId = firstMeasurementId;
        if(this.measurementSelectList){
            this.measurementSelectList.deselectAll();
            this.measurementSelectList.options.first.selected = true;
        }
    }

    deselectMeasurement(){
        this.store.select(getSelectedMeasurementId)
            .pipe(
                take(1)
            )
            .subscribe(id => {
                if(id === this.selectedMeasurementId){
                    this.store.dispatch(HierarchyActions.setSelectedMeasurement({selectedMeasurementId: null}));
                }
            });
        if(this.measurementSelectList){
            this.measurementSelectList.deselectAll();
        }
    }

    selectMeasurement(measurementId: string){
        this.store.dispatch(HierarchyActions.setSelectedMeasurement({selectedMeasurementId: measurementId}));
        this.selectedMeasurementId = measurementId;
        this.$parentNodeOpened.next(true);
        this.childNodeOpened.emit();
    }
}
