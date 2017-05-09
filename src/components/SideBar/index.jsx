import React from 'react';
import classNames from 'classnames';

import SideBar from './SideBar';
import style from './style.css';
import fa from '../../misc/fa';

export const SideBarButton = ({ icon, active, onActivate, onDeactivate }) => <div
    className={classNames(style.button, { [style.active]: active })}
    onClick={() => active ? onDeactivate() : onActivate()}
>
    <i className={classNames(fa.fa, fa[`fa-${ icon }`])} aria-hidden="true"/>
</div>;

export const SideBarContent = ({ children }) => <div className={style.content}>
    { children }
</div>;

export default SideBar;
