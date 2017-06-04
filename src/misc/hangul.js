
export function fromIndices(cho, jung = 0, jong = 0) {
    jung = ~~jung;
    jong = ~~jong;
    return String.fromCharCode(44032 + 28 * (cho * 21 + jung) + jong);
}
