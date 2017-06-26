import React from 'react';

import style from './style.css';

export default class PathTrack extends React.Component {
    constructor(props) {
        super(props);
        this.pathStateId = this.props.path.stateId;
        this.codeSpaceStateId = this.props.codeSpace.stateId;
    }
    shouldComponentUpdate({ path, codeSpace }) {
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

const memo = {};
const top = (c, i, o) =>
    c ? 'M5,5L5,0 25,0 25,5' :
    i ? 'M5,5L5,0 15,5 25,0 25,5' :
    o ? 'M5,5L15,0 25,5' :
    'M5,5L25,5';
const right = (c, i, o) =>
    c ? ' 30,5 30,25 25,25' :
    i ? ' 30,5 25,15 30,25 25,25' :
    o ? ' 30,15 25,25' :
    ' 25,25';
const bottom = (c, i, o) =>
    c ? ' 25,30 5,30 5,25' :
    i ? ' 25,30 15,25 5,30 5,25' :
    o ? ' 15,30 5,25' :
    ' 5,25';
const left = (c, i, o) =>
    c ? ' 0,25 0,5Z' :
    i ? ' 0,25 5,15 0,5Z' :
    o ? ' 0,15Z' :
    'Z';
function momentD(moment) {
    const { shapeHash } = moment;
    if (memo[shapeHash]) return memo[shapeHash];
    const { cp, cn, i, o } = moment;
    const [ti, to] = [i.y && (i.y > 0), o.y && (o.y < 0)];
    const [ri, ro] = [i.x && (i.x < 0), o.x && (o.x > 0)];
    const [bi, bo] = [i.y && (i.y < 0), o.y && (o.y > 0)];
    const [li, lo] = [i.x && (i.x > 0), o.x && (o.x < 0)];
    return memo[shapeHash] =
        top((ti && cp) || (to && cn), ti, to) +
        right((ri && cp) || (ro && cn), ri, ro) +
        bottom((bi && cp) || (bo && cn), bi, bo) +
        left((li && cp) || (lo && cn), li, lo);
}
