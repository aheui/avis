import * as React from 'react';
import * as classNames from 'classnames';

import Button, { ButtonType } from './input/Button';
import * as style from './Modal.css';


type PromptItem = [
    string, // label
    ButtonType | null | void, // type
    () => (void | Promise<void>) // handler
]

interface ModalProps {
    title: string;
    prompt: PromptItem[];
    closeModal: () => void;
    bodyClassName?: string;
}

export default class Modal extends React.Component<ModalProps> {
    pane: HTMLDivElement;
    render() {
        const {
            title,
            children,
            prompt,
            closeModal,
            bodyClassName,
        } = this.props;
        return <div
            className={style.modal}
            onMouseDown={closeModal}>
            <div
                ref={ref => this.pane = ref!}
                className={style.pane}
                onMouseDown={e => {
                    if (!this.pane.contains(e.target as Node)) return;
                    e.stopPropagation();
                }}>
                <div className={style.title}>{ title }</div>
                <div className={classNames(
                    style.body,
                    bodyClassName,
                )}>{ children }</div>
                <div className={style.buttons}>
                    { prompt.map((item, index) => <Button
                        className={style.button}
                        key={index}
                        label={item[0]}
                        type={item[1]}
                        onClick={item[2]}
                    />) }
                </div>
            </div>
        </div>;
    }
}
