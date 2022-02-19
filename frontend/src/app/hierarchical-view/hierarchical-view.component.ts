import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Hierarchy, Node } from '../Hierarchy';
import { getSelectedHierarchy } from '../state';
import { HierarchyState } from '../state/hierarchy.reducer';

@Component({
    selector: 'app-hierarchical-view',
    templateUrl: './hierarchical-view.component.html',
    styleUrls: ['./hierarchical-view.component.scss']
})
export class HierarchicalViewComponent implements OnInit, AfterViewInit {
    hierarchyLevels: Node[][] = [];
    elem: Element | null = null;

    constructor(private store: Store<HierarchyState>) { }

    ngOnInit(): void {
        this.store.select(getSelectedHierarchy)
            .subscribe(hierarchy => {
                if (hierarchy) {
                    this.hierarchyLevels = this.sortNodesToLevels(hierarchy);
                }
            });
    }

    ngAfterViewInit() {
        this.elem = document.getElementById("31");
        console.log(this.elem?.getBoundingClientRect());
    }

    sortNodesToLevels(hierarchy: Hierarchy): Node[][] {
        let levels: Node[][] = [];
        let addNodesToLevel = (node: Node, currentLevel: number) => {
            if (!levels[currentLevel]) {
                levels.push([]);
            }
            levels[currentLevel].push(node);
            let nextLevel = currentLevel + 1;
            node.children.forEach(child => addNodesToLevel(child, nextLevel));
        }
        hierarchy.nodes.forEach(node => addNodesToLevel(node, 0));
        return levels;
    }
}
