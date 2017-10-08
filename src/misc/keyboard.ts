import * as EventEmitter from 'events';

const emitter = new EventEmitter();
const keyMap: { [key: string]: boolean } = {};
const codeMap: { [code: string]: boolean } = {};

function keydown(e: KeyboardEvent) {
    const key = e.key.toLowerCase();
    const code = e.code.toLowerCase();
    const down = true;
    keyMap[key] = down;
    codeMap[code] = down;
    emitter.emit(key, down);
    if (key !== code) emitter.emit(code, down);
}

function keyup(e: KeyboardEvent) {
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

export function on(event: string, listener: (down: boolean) => void) {
    emitter.addListener(event.toLowerCase(), listener);
}

export function off(event: string, listener: (down: boolean) => void) {
    emitter.removeListener(event.toLowerCase(), listener);
}

export function key(keyOrCode: string) {
    const _keyOrCode = keyOrCode.toLowerCase();
    return !!keyMap[_keyOrCode] || !!codeMap[_keyOrCode];
}

export function keys(...keyOrCodes: string[]) {
    const result: { [keyOrCode: string]: boolean } = {};
    for (let keyOrCode of keyOrCodes) {
        const _keyOrCode = keyOrCode.toLowerCase();
        result[_keyOrCode] = !!keyMap[_keyOrCode] || !!codeMap[_keyOrCode];
    }
    return result;
}
