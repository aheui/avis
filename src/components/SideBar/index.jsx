import React from 'react';
import classNames from 'classnames';

import SideBar from './SideBar';
import style from './style.css';
import FontAwesome from '../FontAwesome';

export const SideBarButton = ({ icon, active, onActivate, onDeactivate }) => <div
    className={classNames(style.button, { [style.active]: active })}
    onClick={() => active ? onDeactivate() : onActivate()}
><FontAwesome icon={icon}/></div>;

export const SideBarContent = ({ title, children }) => <div className={style.content}>
    <div className={style.sidebarTitle}>{ title }</div>
    { children }
</div>;

export const SideBarContentFolder = ({ title, open, onBarClick, children, className }) => (
    <div className={classNames(style.folder, { [style.open]: open }, className)}>
        <div className={style.bar} onClick={() => onBarClick(open)}>
            <FontAwesome icon='caret-right' className={style.caret}/>
            { title }
        </div>
        { open && <div className={style.scrollArea}>{ children }</div> }
    </div>
);

export const Label = ({ title, children, className }) => (
    <label className={classNames(style.label, className)}>
        <div className={style.title}>{ title }</div>
        <div className={style.children}>{ children }</div>
    </label>
);

export default SideBar;
