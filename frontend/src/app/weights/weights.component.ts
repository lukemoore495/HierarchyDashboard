import { OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { HierarchyState } from '../state/hierarchy.reducer';
import { Store } from '@ngrx/store';
import { getSelectedHierarchy } from '../state';
import { Hierarchy, Node } from '../Hierarchy';

@Component({
    selector: 'app-weights',
    templateUrl: './weights.component.html',
    styleUrls: ['./weights.component.scss']
})
export class WeightsComponent implements OnInit, OnDestroy{
    node$ = new BehaviorSubject<Node | null>(null);
    nodes: Node[] = [];
    id: string | null = null;
    subscriptions: Subscription[] = [];
    hierarchyId: string | null = null;

    constructor(private route: ActivatedRoute, private router: Router, private store: Store<HierarchyState>) {
        const sub = this.store.select(getSelectedHierarchy)
            .subscribe(hierarchy => {
                if (!hierarchy) {
                    return;
                }
                this.hierarchyId = hierarchy.id;

                this.nodes = this.getAllNodes(hierarchy);
                if (this.id) {
                    const newNode = this.getNodeById(this.id);
                    this.node$.next(newNode);
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
            const newNode = this.getNodeById(this.id);
            this.node$.next(newNode);
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
        hierarchy.root.children.forEach(node => allNodes.push(...getNodes(node)));
        allNodes.push(hierarchy.root);
        return allNodes;
    }

    getNodeById(id: string): Node | null {
        return this.nodes.find(node => node.id === id) ?? null;
    }
}
