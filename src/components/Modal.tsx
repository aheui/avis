import * as React from 'react';

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
}

export default class Modal extends React.Component<ModalProps> {
    pane: HTMLDivElement;
    render() {
        const {
            title,
            children,
            prompt,
            closeModal,
        } = this.props;
        return <div
            className={style.modal}
            onClick={closeModal}>
            <div
                ref={ref => this.pane = ref!}
                className={style.pane}
                onClick={e => {
                    if (!this.pane.contains(e.target as Node)) return;
                    e.stopPropagation();
                }}>
                <div className={style.title}>{ title }</div>
                <div className={style.children}>{ children }</div>
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
