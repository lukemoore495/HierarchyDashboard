export interface TreeNode {
    id: string
    name: string;
    weight?: number;
    measurementNode: boolean
    children: TreeNode[];
}