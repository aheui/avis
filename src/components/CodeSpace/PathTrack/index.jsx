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
            { [...path].map(({ id, p, f }) => <rect
                key={id}
                className={style.moment}
                x={p.x * 30 + 5}
                y={p.y * 30 + 5}
                width="20"
                height="20"
                fill={path.color}
                fillOpacity={f / 20}
            />) }
        </svg>;
    }
}
