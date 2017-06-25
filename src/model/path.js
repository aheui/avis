import Aheui from 'naheui';

import mutationManager from './mutationManager';

export class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// 모이면 path를 이루는 각각의 순간
let momentId = 0;
export class Moment {
    constructor(cp, cn, i, o, p, f) {
        this.cp = cp; // connected with prev
        this.cn = cn; // connected with next
        this.i = i; // in vector
        this.o = o; // out vector
        this.p = p; // position
        this.f = f; // fuel
        this.id = ++momentId;
    }
    get shapeHash() {
        const { cp, cn, i, o } = this;
        return `${ +cp }${ +cn }${
            i.x + 2 }${ i.y + 2
        }${
            o.x + 2 }${ o.y + 2
        }`;
    }
    clone(cn) {
        const { cp, i, o, p, f } = this;
        const _cn = (cn == null) ? this.cn : cn;
        return new Moment(cp, _cn, i, o, p, f);
    }
    static fromMachineState(
        machine,
        codeSpace,
        cp,
        f,
    ) {
        const { cursor } = machine;
        const { x, y, xSpeed, ySpeed } = cursor;
        const code = cursor.point(codeSpace);
        const i = new Vec2(xSpeed, ySpeed);
        const o = (() => {
            if (!code) return i;
            const [dx, dy] = [
                Aheui.xSpeedTable[code.jung],
                Aheui.ySpeedTable[code.jung],
            ];
            const xSpeed =
                (dx === 'reflect') ? -i.x :
                (dx == null) ? i.x :
                dx;
            const ySpeed =
                (dy === 'reflect') ? -i.y :
                (dy == null) ? i.y :
                dy;
            return new Vec2(xSpeed, ySpeed);
        })();
        const p = new Vec2(x, y);
        return new Moment(cp, false, i, o, p, f);
    }
}

@mutationManager()
export class Path {
    constructor(color='rgb(0, 122, 204)') {
        this.color = color;
        this.moments = [];
    }
    *[Symbol.iterator]() {
        const l = this.moments.length - 2;
        if (l < 0) return;
        for (let i = 0; i < l; ++i) yield this.moments[i];
        yield this.moments[l].clone(false);
    }
    get lastMoment() {
        return this.moments[this.moments.length - 1] || null;
    }
    step(moment) {
        this.mutate(() => {
            this.burn();
            this.moments.push(moment);
        });
    }
    burn() {
        this.mutate(() => {
            const { moments } = this;
            for (let moment of moments) --moment.f;
            const rest = moments.filter(moment => moment.f >= 0);
            this.clear();
            moments.push(...rest);
        });
    }
    clear() {
        this.mutate(() => {
            this.moments.length = 0;
        });
    }
}
