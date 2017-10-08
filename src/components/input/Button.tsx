import * as React from 'react';
import * as classNames from 'classnames';

import FontAwesome from '../FontAwesome';
import * as style from './Button.css';


export type ButtonType = 'default' | 'primary';

interface ButtonProps {
    label: string;
    type?: ButtonType | null | void;
    disabled?: boolean;
    onClick: () => void;
    className?: string;
}

interface ButtonState {
    loading: boolean;
}

export default class extends React.Component<ButtonProps, ButtonState> {
    unmounted: boolean;
    componentWillMount() {
        this.setState({ loading: false });
    }
    componentWillUnmount() {
        this.unmounted = true;
    }
    render() {
        const {
            label,
            type,
            disabled,
            onClick,
            className,
        } = this.props;
        const {
            loading,
        } = this.state;
        return <div
            onClick={async () => {
                if (disabled) return;
                if (this.state.loading) return;
                try {
                    this.setState({ loading: true });
                    await onClick();
                } finally {
                    if (this.unmounted) return;
                    this.setState({ loading: false });
                }
            }}
            className={classNames(style.button, {
                [style.disabled]: disabled,
                [style.primary]: type === 'primary',
            }, className)}>
            <div className={classNames(style.label)}>
                {
                    loading ?
                    <FontAwesome
                        className={style.spinner}
                        icon="circle-o-notch"
                    /> :
                    label
                }
            </div>
        </div>;
    }
}
