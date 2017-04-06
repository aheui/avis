import assert from 'assert';


export function encode(text) {
    return btoa(encodeURIComponent(text).replace(
        /%([0-9A-F]{2})/g,
        (_, p1) => String.fromCharCode(`0x${ p1 }`)
    ));
}

export function decode(text) {
    return decodeURIComponent(
        [...atob(decodeURIComponent(text))].map(
            char => `%${ `00${ char.charCodeAt().toString(16) }`.slice(-2) }`
        ).join('')
    );
}

test: {
    const encoded = encode('아희');
    const decoded = decode(encoded);
    assert.equal(decoded, '아희');
}
