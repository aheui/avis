export type Executor = () => void;

// TODO: uuid?
export type StateId = number;

export interface MutationManager {
    readonly stateId: StateId;
    mutate: (executor: Executor) => void;
    onMutate?: () => void;
}

export default function mutationManager() {
    return function <T>(target: T): T & MutationManager {
        const mutating = Symbol('mutating');
        const stateId = Symbol('stateId');
        const { prototype } = target as any;
        function init(this: any) {
            this[stateId] = (Math.random() * 1000000) | 0;
        }
        Object.defineProperty(prototype, 'stateId', {
            get(this: any) {
                if (this[stateId] == null) init.call(this);
                return this[stateId];
            }
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
