export function object(props, propName, componentName, location, propFullName) {
    const propValue = props[propName];
    if (propValue == null) {
        return null;
    }
    if (propValue && typeof propValue === 'object' && !Array.isArray(propValue)) {
        return null;
    }
    return new TypeError(`${componentName}: wrong ${propName}`);
}

export function objectIsRequired(props, propName, componentName, location, propFullName) {
    const propValue = props[propName];
    if (propValue == null) {
        return new TypeError(`${componentName}: wrong ${propName}`);
    }
    return object(props, propName, componentName, location, propFullName);
}
