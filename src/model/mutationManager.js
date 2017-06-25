export default function mutationManager(stateIdFieldName='stateId') {
    return function (target) {
        const mutating = Symbol('mutating');
        const stateId = Symbol('stateId');
        return class extends target {
            get [stateIdFieldName]() { return this[stateId] || 0; }
            mutate(executor) {
                if (!this[mutating]) {
                    try {
                        this[mutating] = true;
                        executor();
                    } finally {
                        this[mutating] = false;
                        this[stateId] = this[stateIdFieldName] + 1;
                        this.onMutate && this.onMutate();
                    }
                } else {
                    executor();
                }
            }
        };
    };
}
