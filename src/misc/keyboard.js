import EventEmitter from 'events';

const emitter = new EventEmitter();
const keyMap = {};
const codeMap = {};

function keydown(e) {
    const key = e.key.toLowerCase();
    const code = e.code.toLowerCase();
    const down = true;
    keyMap[key] = down;
    codeMap[code] = down;
    emitter.emit(key, down);
    if (key !== code) emitter.emit(code, down);
}

function keyup(e) {
    const key = e.key.toLowerCase();
    const code = e.code.toLowerCase();
    const down = false;
    keyMap[key] = down;
    codeMap[code] = down;
    emitter.emit(key, down);
    if (key !== code) emitter.emit(code, down);
}

window.addEventListener('keydown', keydown, true);
window.addEventListener('keyup', keyup, true);

export function on(event, listener) {
    emitter.addListener(event.toLowerCase(), listener);
}

export function off(event, listener) {
    emitter.removeListener(event.toLowerCase(), listener);
}

export function key(keyOrCode) {
    const _keyOrCode = keyOrCode.toLowerCase();
    return !!keyMap[_keyOrCode] || !!codeMap[_keyOrCode];
}

export function keys(...keyOrCodes) {
    const result = {};
    for (let keyOrCode of keyOrCodes) {
        const _keyOrCode = keyOrCode.toLowerCase();
        result[_keyOrCode] = !!keyMap[_keyOrCode] || !!codeMap[_keyOrCode];
    }
    return result;
}
