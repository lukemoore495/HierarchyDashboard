import { Component, OnInit } from '@angular/core';
import { ValueSet } from './valueSet';

@Component({
  selector: 'app-value-set-form',
  templateUrl: './value-set-form.component.html',
  styleUrls: ['./value-set-form.component.scss']
})
export class ValueSetFormComponent {

  model = new ValueSet("18", "55%");

  submitted = false;

  onSubmit() { this.submitted = true; }

}
