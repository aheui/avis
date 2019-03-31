const clone = Symbol('clone');

export interface Cloneable<T> {
    clone: () => Cloneable<T>;
}

export default function cloneable<TConstructor, TInstance>(
    afterCloneHook?: (src: TInstance, dst: TInstance) => (TInstance | void),
) {
    return function (target: TConstructor): TConstructor & Cloneable<TConstructor> {
        const applyAfterCloneHook = (src: TInstance, dst: TInstance) => {
            if (!afterCloneHook) return dst;
            return afterCloneHook(src, dst) || dst;
        };
        const { prototype } = target as any;
        if (!prototype.clone) {
            if (prototype instanceof Array) {
                (prototype as any).clone = function () {
                    return applyAfterCloneHook(
                        this,
                        this.map((item: any) => {
                            return item[clone] ? item[clone]() : item;
                        }),
                    );
                };
            } else {
                prototype.clone = function () {
                    const result: {
                        [key: string]: any;
                    } = { __proto__: this.__proto__ };
                    for (let key of Reflect.ownKeys(this)) {
                        if (this[key][clone]) {
                            result[key as string] = this[key][clone]();
                        } else {
                            result[key as string] = this[key];
                        }
                    }
                    return applyAfterCloneHook(this, result as TInstance);
                };
            }
        }
        prototype[clone] = prototype.clone;
        return target as any;
    }
}
