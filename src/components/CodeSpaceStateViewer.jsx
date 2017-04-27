import React from 'react';

import { connect } from '../appState';

export default connect(
    appState => ({
        codeSpace: appState.codeSpace,
    }),
)(class CodeSpaceStateViewer extends React.Component {
    constructor(props) {
        super(props);
        this.stateId = this.props.codeSpace.stateId;
    }
    shouldComponentUpdate({ codeSpace }) {
        return this.stateId !== codeSpace.stateId;
    }
    render() {
        const { codeSpace, children } = this.props;
        this.stateId = codeSpace.stateId;
        return React.Children.only(children);
    }
});
