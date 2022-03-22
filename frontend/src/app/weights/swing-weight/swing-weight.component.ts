import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { HierarchyState } from '../../state/hierarchy.reducer';
import { Hierarchy, Node } from '../../Hierarchy';
import { getSelectedHierarchy } from '../../state';
import { Subscription } from 'rxjs';
import { OnDestroy } from '@angular/core';

@Component({
    selector: 'app-swing-weight',
    templateUrl: './swing-weight.component.html',
    styleUrls: ['./swing-weight.component.scss']
})
export class SwingWeightComponent implements OnInit, OnDestroy {
    node: Node | null = null;
    nodes: Node[] = [];
    id: string | null = null;
    subscriptions: Subscription[] = [];
    children: Node[] = [];

    constructor(private route: ActivatedRoute, private router: Router, private store: Store<HierarchyState>) {
        const sub = this.store.select(getSelectedHierarchy)
            .subscribe(hierarchy => {
                if (!hierarchy) {
                    return;
                }

                this.nodes = this.getAllNodes(hierarchy);
                if (this.id) {
                    this.node = this.getNodeById(this.id);
                    this.children = this.node?.children ?? [];
                }
            });
        this.subscriptions.push(sub);
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.router.navigate(['/hierarchicalView']);
            return;
        }
        this.id = id;
        if (this.nodes.length > 0) {
            this.node = this.getNodeById(this.id);
            this.children = this.node?.children ?? [];
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    getAllNodes(hierarchy: Hierarchy): Node[] {
        const getNodes = (node: Node): Node[] => {
            const currentNode: Node[] = [];
            node.children.forEach(child => currentNode.push(...getNodes(child)));
            currentNode.push(...node.children);
            return currentNode;
        };

        const allNodes: Node[] = [];
        hierarchy.nodes.forEach(node => allNodes.push(...getNodes(node)));
        allNodes.push(...hierarchy.nodes);

        const topLevel: Node = {
            id: 'topLevel',
            name: 'Top Level',
            children: hierarchy.nodes,
            measurements: [],
            weight: 1
        };
        allNodes.push(topLevel);
        return allNodes;
    }

    getNodeById(id: string): Node | null {
        return this.nodes.find(node => node.id === id) ?? null;
    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.children, event.previousIndex, event.currentIndex);
    }
}
