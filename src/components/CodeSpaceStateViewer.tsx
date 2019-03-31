import * as React from 'react';

import {
    connect,
    CodeSpace,
} from '../appState';
import { StateId } from 'model/mutationManager';

interface CodeSpaceStateViewerProps {
    codeSpace: CodeSpace;
}

export default connect<CodeSpaceStateViewerProps, { codeSpace: CodeSpace }>(
    appState => ({
        codeSpace: appState.codeSpace,
    }),
)(class CodeSpaceStateViewer extends React.Component<CodeSpaceStateViewerProps> {
    private stateId: StateId;
    constructor(props: CodeSpaceStateViewerProps) {
        super(props);
        this.stateId = this.props.codeSpace.stateId;
    }
    shouldComponentUpdate({ codeSpace }: CodeSpaceStateViewerProps) {
        if (this.props.codeSpace !== codeSpace) return true;
        if (this.stateId !== codeSpace.stateId) return true;
        return false;
    }
    render() {
        const { codeSpace, children } = this.props;
        this.stateId = codeSpace.stateId;
        return React.Children.only(children);
    }
});
