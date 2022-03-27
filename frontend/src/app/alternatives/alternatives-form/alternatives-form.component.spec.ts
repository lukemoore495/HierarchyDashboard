import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlternativesFormComponent } from './alternatives-form.component';

describe('AlternativesComponent', () => {
    let component: AlternativesFormComponent;
    let fixture: ComponentFixture<AlternativesFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ AlternativesFormComponent ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AlternativesFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
