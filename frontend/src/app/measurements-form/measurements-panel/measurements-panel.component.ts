import { Component, EventEmitter, Input, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, debounceTime, map, Observable, Subscription, take } from 'rxjs';
import { Measurement, MeasurementDefinition, MeasurementType, Node } from 'src/app/Hierarchy';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Output } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { HierarchyState } from 'src/app/state/hierarchy.reducer';
import { Store } from '@ngrx/store';
import { getSelectedMeasurementId } from 'src/app/state';
import * as HierarchyActions from '../../state/hierarchy.actions'
import { MatSelectionList } from '@angular/material/list';

@Component({
  selector: 'app-measurements-panel',
  templateUrl: './measurements-panel.component.html',
  styleUrls: ['./measurements-panel.component.scss']
})
export class MeasurementsPanelComponent implements OnInit, OnDestroy {
    @Input() measurementNode: Node | null = null;
    @Input() parentIsSelected?: Observable<boolean>;
    @Output() measurementResultEvent: EventEmitter<Measurement[]>;
    @Output() childNodeOpened: EventEmitter<void>;
    @Output() closed: EventEmitter<void>;
    @ViewChild('measurementSelectList') measurementSelectList?: MatSelectionList;
    form: FormGroup;
    currentMeasurements: Measurement[] = [];
    subscriptions: Subscription[] = [];
    selectedMeasurementId: string | null = null;
    $parentNodeOpened: BehaviorSubject<boolean>;

    constructor(private fb: FormBuilder, private store: Store<HierarchyState>) { 
        this.form = fb.group({});
        this.measurementResultEvent = new EventEmitter<Measurement[]>();
        this.childNodeOpened = new EventEmitter<void>();
        this.closed = new EventEmitter<void>();
        this.$parentNodeOpened = new BehaviorSubject<boolean>(true);
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

        const measurementSub = this.form?.valueChanges
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

        this.subscriptions.push(measurementSub);

        if(this.parentIsSelected){
            const parentSelectedSub = this.parentIsSelected
                .subscribe(parentIsSelected => {
                    if(this.measurementSelectList && parentIsSelected){
                        this.measurementSelectList.deselectAll()
                        this.deselectMeasurement();
                    }
                    this.$parentNodeOpened.next(true);
                });
            this.subscriptions.push(parentSelectedSub);
        }
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
        this.deselectMeasurement()
        this.childNodeOpened.emit();
    }

    setSelectionAndNotifyChild(){
        this.selectFirstMeasurement();
        this.$parentNodeOpened.next(true);
    }

    selectFirstMeasurement(){
        if(!this.measurementNode)
            return;

        let firstMeasurementId = this.measurementNode.children[0].measurements[0].id;
        this.store.dispatch(HierarchyActions.setSelectedMeasurement({selectedMeasurementId: firstMeasurementId}));
        this.selectedMeasurementId = firstMeasurementId;
        if(this.measurementSelectList){
            this.measurementSelectList.deselectAll()
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
            this.measurementSelectList.deselectAll()
        }
    }

    selectMeasurement(measurementId: string){
        this.store.dispatch(HierarchyActions.setSelectedMeasurement({selectedMeasurementId: measurementId}));
        this.selectedMeasurementId = measurementId;
        this.$parentNodeOpened.next(true);
        this.childNodeOpened.emit();
    }


}
