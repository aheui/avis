import React from 'react';
import classNames from 'classnames';

import SideBar from './SideBar';
import style from './style.css';
import fa from '../../misc/fa';

export const SideBarButton = ({ icon }) => <div>
    <i className={classNames(fa.fa, fa[`fa-${ icon }`])} aria-hidden="true"/>
</div>;

export const SideBarContent = ({ children }) => <div>
    { children }
</div>;

export default SideBar;
