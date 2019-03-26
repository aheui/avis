import * as Aheui from 'naheui';

import { CodeSpace } from 'appState';
import mutationManager, {
    MutationManager,
    Executor,
    StateId,
} from './mutationManager';

export class Vec2 {
    constructor(
        public x: number,
        public y: number,
    ) { }
}

// 모이면 path를 이루는 각각의 순간
let momentId = 0;
export class Moment implements MutationManager {
    // MutationManager
    stateId: StateId;
    mutate: (executor: Executor) => void;
    onMutate?: () => void;
    // Moment
    id: number;
    constructor(
        public cp: boolean, // connected with prev
        public cn: boolean, // connected with next
        public i: Vec2, // in vector
        public o: Vec2, // out vector
        public p: Vec2, // position
        public f: number, // fuel
    ) {
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
    clone(cn: boolean) {
        const { cp, i, o, p, f } = this;
        const _cn = (cn == null) ? this.cn : cn;
        return new Moment(cp, _cn, i, o, p, f);
    }
    static fromMachineState(
        machine: Aheui.Machine,
        codeSpace: CodeSpace,
        cp: boolean,
        f: number,
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
    // MutationManager
    stateId: number;
    mutate: (executor: Executor) => void;
    onMutate?: () => void;
    // Path
    color: string;
    moments: Moment[];
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
    get lastMoment(): Moment | null {
        return this.moments[this.moments.length - 1] || null;
    }
    step(moment: Moment) {
        this.mutate(() => {
            this.burn();
            const { lastMoment } = this;
            if (lastMoment) lastMoment.cn = moment.cp;
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
