import { Injectable } from "@angular/core";
import { Hierarchy } from "./Hierarchy";
import RRRHierarchy from '../assets/staticFiles/RRRHierarchy.json';
import { Observable, of } from "rxjs";
import SimpleHierarchy from '../assets/staticFiles/SimpleHierarchy.json';

@Injectable({
    providedIn: 'root'
})
export class HierarchyService {

    getHierarchies(): Observable<Hierarchy[]> {
        return of([RRRHierarchy]);
    }

    createHierarchy(hierarchy: Hierarchy): Observable<Hierarchy> {
        return of(RRRHierarchy);
    }
}