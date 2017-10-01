export type Executor = () => void;

export interface MutationManager {
    readonly stateId: number;
    mutate: (executor: Executor) => void;
    onMutate?: () => void;
}

export default function mutationManager() {
    return function <T>(target: T): T & MutationManager {
        const mutating = Symbol('mutating');
        const stateId = Symbol('stateId');
        const { prototype } = target as any;
        Object.defineProperty(prototype, 'stateId', {
            get() { return (this as any)[stateId] || 0; }
        });
        prototype.mutate = function (executor: Executor) {
            if (!this[mutating]) {
                try {
                    this[mutating] = true;
                    executor();
                } finally {
                    this[mutating] = false;
                    this[stateId] = this.stateId + 1;
                    this.onMutate && this.onMutate();
                }
            } else {
                executor();
            }
        };
        return target as any;
    };
}
