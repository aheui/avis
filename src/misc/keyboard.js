import EventEmitter from 'events';

const emitter = new EventEmitter();
const map = {};

function keydown(e) {
    const key = e.key.toLowerCase();
    const down = true;
    map[key] = down;
    emitter.emit(key, down);
}

function keyup(e) {
    const key = e.key.toLowerCase();
    const down = false;
    map[key] = down;
    emitter.emit(key, down);
}

window.addEventListener('keydown', keydown, true);
window.addEventListener('keyup', keyup, true);

export function on(event, listener) {
    emitter.addListener(event.toLowerCase(), listener);
}

export function off(event, listener) {
    emitter.removeListener(event.toLowerCase(), listener);
}

export function key(key) {
    return !!map[key.toLowerCase()];
}

export function keys(...keys) {
    const result = {};
    for (let key of keys) {
        const _key = key.toLowerCase();
        result[_key] = !!map[_key];
    }
    return result;
}
