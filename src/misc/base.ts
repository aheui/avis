export function base26(num: number) {
    let _num = num | 0;
    const result = [];
    while (_num >= 0) {
        const one = _num % 26;
        result.push(String.fromCharCode(one + 65));
        _num = ((_num - one) / 26) - 1;
    }
    return result.reverse().join('');
}

export function base30(num: number) {
    let _num = num | 0;
    const result = [];
    while (_num >= 0) {
        const one = _num % 30;
        result.push(String.fromCharCode(one + 12593));
        _num = ((_num - one) / 30) - 1;
    }
    return result.reverse().join('');
}
