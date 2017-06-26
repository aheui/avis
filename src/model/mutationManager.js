export default function mutationManager(
    stateIdFieldName='stateId',
    mutateFieldName='mutate',
    onMutateFieldName='onMutate',
) {
    return function (target) {
        const mutating = Symbol('mutating');
        const stateId = Symbol('stateId');
        Object.defineProperty(target.prototype, stateIdFieldName, {
            get() { return this[stateId] || 0; }
        });
        target.prototype[mutateFieldName] = function (executor) {
            if (!this[mutating]) {
                try {
                    this[mutating] = true;
                    executor();
                } finally {
                    this[mutating] = false;
                    this[stateId] = this[stateIdFieldName] + 1;
                    this[onMutateFieldName] && this[onMutateFieldName]();
                }
            } else {
                executor();
            }
        };
    };
}
