const clone = Symbol('clone');

export interface Cloneable<T> {
    clone: () => Cloneable<T>;
}

export default function cloneable<T>() {
    return function (target: T): T & Cloneable<T> {
        const { prototype } = target as any;
        if (!prototype.clone) {
            if (prototype instanceof Array) {
                (prototype as any).clone = function () {
                    return this.map((item: any) => {
                        return item[clone] ? item[clone]() : item;
                    });
                };
            } else {
                prototype.clone = function () {
                    const result: {
                        [key: string]: any;
                    } = { __proto__: this.__proto__ };
                    for (let key of Reflect.ownKeys(this)) {
                        if (this[key][clone]) {
                            result[key] = this[key][clone]();
                        } else {
                            result[key] = this[key];
                        }
                    }
                    return result;
                };
            }
        }
        prototype[clone] = prototype.clone;
        return target as any;
    }
}
