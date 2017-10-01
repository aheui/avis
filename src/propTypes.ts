interface Props {
    [key: string]: any;
}

export function object(props: Props, propName: string, componentName: string, _location: string, _propFullName: string) {
    const propValue = props[propName];
    if (propValue == null) {
        return null;
    }
    if (propValue && typeof propValue === 'object' && !Array.isArray(propValue)) {
        return null;
    }
    return new TypeError(`${componentName}: wrong ${propName}`);
}

export function objectIsRequired(props: Props, propName: string, componentName: string, location: string, propFullName: string) {
    const propValue = props[propName];
    if (propValue == null) {
        return new TypeError(`${componentName}: wrong ${propName}`);
    }
    return object(props, propName, componentName, location, propFullName);
}
