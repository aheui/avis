import React from 'react';
import classNames from 'classnames';

import fa from '../misc/fa';

export default ({ icon, className }) => (
    <i className={classNames(
        fa.fa,
        fa[`fa-${ icon }`],
        className
    )} aria-hidden="true"/>
);
