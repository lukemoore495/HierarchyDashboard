import { Component, EventEmitter, Input, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, debounceTime, map, Observable, Subscription, take, tap } from 'rxjs';
import { Value, MeasurementDefinition, MeasurementType, Node } from '../../../Hierarchy';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Output } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import * as HierarchyActions from '../../../state/hierarchy.actions';
import { MatSelectionList } from '@angular/material/list';
import { AfterViewInit } from '@angular/core';
import { getSelectedAlternative, getSelectedMeasurementId } from '../../../state';
import { HierarchyState } from '../../../state/hierarchy.reducer';

@Component({
    selector: 'app-measurements-panel',
    templateUrl: './measurements-panel.component.html',
    styleUrls: ['./measurements-panel.component.scss']
})
export class MeasurementsPanelComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() measurementNode: Node | null = null;
    @Input() parentIsSelected?: Observable<boolean>;
    @Input() isTopLevel = false;
    @Output() measurementResultEvent: EventEmitter<Value[]>;
    @Output() childNodeOpened: EventEmitter<void>;
    @Output() closed: EventEmitter<void>;
    @ViewChild('measurementSelectList') measurementSelectList?: MatSelectionList;
    form: FormGroup;
    subscriptions: Subscription[] = [];
    selectedMeasurementId: string | null = null;
    $parentNodeOpened: BehaviorSubject<boolean>;
    alternativeMeasurements: Value[] = [];
    measurementNodes: Node[] = [];
    alternativeChanged = false;

    constructor(private fb: FormBuilder, private store: Store<HierarchyState>) { 
        const sub = this.store.select(getSelectedAlternative)
            .pipe(
                map(alternative => alternative?.measurements)
            )
            .subscribe(measurements => {
                if(this.alternativeMeasurements.length !== 0){
                    this.alternativeChanged = true;
                }
                this.alternativeMeasurements = measurements ?? []; 
                this.setFormValues(this.alternativeMeasurements);
            });
        this.subscriptions.push(sub);
    
        this.form = fb.group({});
        this.measurementResultEvent = new EventEmitter<Value[]>();
        this.childNodeOpened = new EventEmitter<void>();
        this.closed = new EventEmitter<void>();
        this.$parentNodeOpened = new BehaviorSubject<boolean>(true);
    }

    ngOnInit(): void {        
        const nodes : Node[] = Object.assign([], this.measurementNode?.children);
        for(const node of nodes) {
            const measurementFields = node.children.filter(child => child.measurementDefinition) ?? [];
            this.measurementNodes.push(...measurementFields);
            for(const measurementField of measurementFields) {
                if(!measurementField.measurementDefinition){
                    continue;
                }

                let measurementValue : number | boolean | null
                    = this.alternativeMeasurements.find(m => m.nodeId === measurementField.id)?.measure ?? null;
                if(this.isNumberMeasurement(measurementField.measurementDefinition)){
                    this.form.addControl(measurementField.id, this.fb.control(null, [Validators.pattern('^[0-9]*$')]));
                } else if (this.isPercentageMeasurement(measurementField.measurementDefinition)) {
                    this.form.addControl(measurementField.id, this.fb.control(null, []));
                } else if (this.isBooleanMeasurement(measurementField.measurementDefinition)) {
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
                    const measurements : Value[] = [];
                    for(const id in form){
                        let measure = form[id];
                        if(this.isBooleanMeasurementUsingId(id)){
                            measure = this.convertBooleanToNumber(measure);
                        }
                        measurements.push({
                            nodeId: id,
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

    setFormValues(measurements: Value[]){
        for(const measurement of measurements) {
            let measurementValue : number | boolean | null = measurement.measure ?? null;
            if (this.isBooleanMeasurementUsingId(measurement.nodeId)) {
                measurementValue = this.convertNumberToBoolean(measurementValue);
            }
            const formControl = this.getFormControl(measurement.nodeId);
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

    convertNumberToBoolean(number: number | null): boolean | null {
        if(number !== null && (number === 0 || number === 1)) {
            return number === 1;
        }
        return null;
    }

    convertBooleanToNumber(bool: boolean): number {
        return bool ? 1 : 0;
    }

    updateMeasurements (newMeasurements: Value[]){
        const modifiedMeasurements = [];
        const currentMeasurements = [];
        for(const measure of this.alternativeMeasurements) {
            if(!newMeasurements.some(newMeasure => newMeasure.nodeId === measure.nodeId)){
                currentMeasurements.push(measure);
            }
        }
        
        for(const newMeasure of newMeasurements) {
            const currentMeasure = this.alternativeMeasurements.find(measure => measure.nodeId === newMeasure.nodeId) ?? null;
            const hasUpdate = currentMeasure?.measure !== newMeasure?.measure;
            if(hasUpdate && newMeasure.measure !== null){
                modifiedMeasurements.push(newMeasure);
            }
            if(hasUpdate) {
                currentMeasurements.push(newMeasure);
                continue;
            }
            currentMeasurements.push(currentMeasure);
        }
        this.alternativeMeasurements = currentMeasurements;
        this.measurementResultEvent.emit(modifiedMeasurements);
    }

    isNumberMeasurement(measurement? : MeasurementDefinition): boolean {
        if(!measurement){
            return false;
        }
        return measurement.measurementType === MeasurementType.Number;
    }

    isPercentageMeasurement(measurement? : MeasurementDefinition): boolean {
        if(!measurement){
            return false;
        }
        return measurement.measurementType === MeasurementType.Percentage;
    }

    isBooleanMeasurement(measurement? : MeasurementDefinition): boolean {
        if(!measurement){
            return false;
        }
        return measurement.measurementType === MeasurementType.Boolean;
    }

    isBooleanMeasurementUsingId(nodeId : string): boolean {
        const measurement = this.measurementNodes.find(m => m.id == nodeId);
        if(!measurement || !measurement.measurementDefinition){
            return false;
        }
        return this.isBooleanMeasurement(measurement.measurementDefinition);
    }

    hasMeasurementNodes(node: Node): boolean {
        return node.children.some(child => child.measurementDefinition);
    }
    
    hasChildMeasurementNodes(node: Node): boolean {
        return node.children.some(child => child.children.some(node => node.measurementDefinition));
    }

    getMeasurements(node: Node): Node[] {
        return node.children.filter(child => child.measurementDefinition);
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
            !this.measurementNode.children[0])
            return;

        const firstMeasurementId = this.measurementNode.children[0]
            .children.filter(node => node.measurementDefinition)[0].id;
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
