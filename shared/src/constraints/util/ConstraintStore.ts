import { Do } from "./Do"
import { If } from "./If"
import { JSONizable } from "./JSONizable"
import {
    DoObjectNotation,
    IfObjectNotation,
    OperatorObjectNotation,
    NodeObjectNotation,
} from "./ObjectNotation"
import { Operator } from "./Operator"

export class Node<T> implements JSONizable<NodeObjectNotation<T>> {
    public next: Node<T> | null = null
    constructor(public data: T) {}
    toJSON(): NodeObjectNotation<T> {
        return {
            __type: "node",
            __ctor: this.constructor.name,
            data: this.data,
            next: this.next ? this.next.toJSON() : null,
        }
    }
}

export type CStoreNode = Node<IfObjectNotation | OperatorObjectNotation>

export class ConstraintStore /* implements IterableIterator */ {
    protected doList: DoObjectNotation[] = []
    protected addDo(execute: Do) {
        this.doList.push(execute.toJSON())
    }

    protected head: CStoreNode | null = null
    protected get tail(): CStoreNode | null {
        if (!this.head) return null
        let node = this.head
        while (node.next) node = node.next
        return node
    }
    protected insertIfAtEnd(condition: If) {
        const objNot = condition.toJSON()
        if (!this.head) {
            this.head = new Node(objNot)
        } else if (this.tail.data.__type === "if")
            throw new Error("Cannot insert if-node after if-node. Lackig operator-node.")
        else {
            const getLast = (node: CStoreNode): CStoreNode =>
                node.next ? getLast(node.next) : node
            const lastNode = getLast(this.head)
            lastNode.next = new Node(objNot)
        }
    }
    protected insertOperatorAtEnd(data: Operator) {
        if (this.tail.data.__type !== "if")
            throw new Error("Operator can only be inserted after if-node")
        else {
            const getLast = (node: CStoreNode): CStoreNode =>
                node.next ? getLast(node.next) : node
            const lastNode = getLast(this.head)
            lastNode.next = new Node(data.toJSON())
        }
    }
}

export class ConditionIterIter
    implements IterableIterator<IfObjectNotation | OperatorObjectNotation>
{
    constructor(
        private head: NodeObjectNotation<IfObjectNotation | OperatorObjectNotation> | null
    ) {}

    next() {
        if (!this.head) return { done: true, value: null }
        const value = this.head
        this.head = this.head.next
        return { done: false, value: value.data }
    }

    [Symbol.iterator]() {
        return this
    }
}
