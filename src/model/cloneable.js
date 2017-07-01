const clone = Symbol('clone');

export default function cloneable(
    cloneFieldName='clone'
) {
    return function (target) {
        if (!target.prototype[cloneFieldName]) {
            if (target.prototype instanceof Array) {
                target.prototype[cloneFieldName] = function () {
                    return this.map(item => {
                        return item[clone] ? item[clone]() : item;
                    });
                };
            } else {
                target.prototype[cloneFieldName] = function () {
                    const result = { __proto__: this.__proto__ };
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
        target.prototype[clone] = target.prototype[cloneFieldName];
    }
}
