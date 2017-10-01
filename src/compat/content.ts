export function encode(text: string) {
    return btoa(encodeURIComponent(text).replace(
        /%([0-9A-F]{2})/g,
        (_, p1) => String.fromCharCode(parseInt(p1, 16))
    ));
}

export function decode(text: string) {
    return decodeURIComponent(
        [...atob(decodeURIComponent(text))].map(
            char => `%${ `00${ char.charCodeAt(0).toString(16) }`.slice(-2) }`
        ).join('')
    );
}
