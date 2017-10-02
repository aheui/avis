import * as React from 'react';

import { CodeSpace } from 'appState';
import { Path, Moment } from 'model/path';
import { StateId } from 'model/mutationManager';
import * as style from './style.css';


interface PathTrackProps {
    path: Path;
    codeSpace: CodeSpace;
}

export default class PathTrack extends React.Component<PathTrackProps> {
    pathStateId: StateId;
    codeSpaceStateId: number;
    constructor(props: PathTrackProps) {
        super(props);
        this.pathStateId = this.props.path.stateId;
        this.codeSpaceStateId = this.props.codeSpace.stateId;
    }
    shouldComponentUpdate({ path, codeSpace }: PathTrackProps) {
        return (this.pathStateId !== path.stateId) ||
            (this.codeSpaceStateId !== codeSpace.stateId);
    }
    render() {
        const { path, codeSpace } = this.props;
        const [ w, h ] = [codeSpace.width * 30, codeSpace.height * 30];
        return <svg
            className={style.pathTrack}
            viewBox={`0 0 ${ w } ${ h }`}
            width={w}
            height={h}
        >
            { [...path].map(moment => <path
                key={moment.id}
                className={style.moment}
                d={momentD(moment)}
                transform={`translate(${
                    moment.p.x * 30
                },${
                    moment.p.y * 30
                })`}
                fill={path.color}
                fillOpacity={moment.f / 20}
            />) }
        </svg>;
    }
}

const memo: { [shapeHash: string]: string } = {};
const top = (c: boolean, i: boolean, o: boolean) =>
    c ? 'M5,5L5,0 25,0 25,5' :
    i ? 'M5,5L5,0 15,5 25,0 25,5' :
    o ? 'M5,5L15,0 25,5' :
    'M5,5L25,5';
const right = (c: boolean, i: boolean, o: boolean) =>
    c ? ' 30,5 30,25 25,25' :
    i ? ' 30,5 25,15 30,25 25,25' :
    o ? ' 30,15 25,25' :
    ' 25,25';
const bottom = (c: boolean, i: boolean, o: boolean) =>
    c ? ' 25,30 5,30 5,25' :
    i ? ' 25,30 15,25 5,30 5,25' :
    o ? ' 15,30 5,25' :
    ' 5,25';
const left = (c: boolean, i: boolean, o: boolean) =>
    c ? ' 0,25 0,5Z' :
    i ? ' 0,25 5,15 0,5Z' :
    o ? ' 0,15Z' :
    'Z';
function momentD(moment: Moment) {
    const { shapeHash } = moment;
    if (memo[shapeHash]) return memo[shapeHash];
    const { cp, cn, i, o } = moment;
    const [ti, to] = [i.y > 0, o.y < 0];
    const [ri, ro] = [i.x < 0, o.x > 0];
    const [bi, bo] = [i.y < 0, o.y > 0];
    const [li, lo] = [i.x > 0, o.x < 0];
    const [tx, rx, bx, lx] = [ti && to, ri && ro, bi && bo, li && lo];
    return memo[shapeHash] =
        top(!bx && ((ti && cp) || (to && cn)), bx ? bo : ti, bx ? bi : to) +
        right(!lx && ((ri && cp) || (ro && cn)), lx ? lo : ri, lx ? li : ro) +
        bottom(!tx && ((bi && cp) || (bo && cn)), tx ? to : bi, tx ? ti : bo) +
        left(!rx && ((li && cp) || (lo && cn)), rx ? ro : li, rx ? ri : lo);
}
