import * as React from 'react';

import {
    connect,
    CodeSpace,
} from '../appState';

interface CodeSpaceStateViewerProps {
    codeSpace: CodeSpace;
}

export default connect<CodeSpaceStateViewerProps, { codeSpace: CodeSpace }>(
    appState => ({
        codeSpace: appState.codeSpace,
    }),
)(class CodeSpaceStateViewer extends React.Component<CodeSpaceStateViewerProps> {
    private stateId: number;
    constructor(props: CodeSpaceStateViewerProps) {
        super(props);
        this.stateId = this.props.codeSpace.stateId;
    }
    shouldComponentUpdate({ codeSpace }: CodeSpaceStateViewerProps) {
        return this.stateId !== codeSpace.stateId;
    }
    render() {
        const { codeSpace, children } = this.props;
        this.stateId = codeSpace.stateId;
        return React.Children.only(children);
    }
});
