import * as React from 'react';
import * as classNames from 'classnames';

import fa from '../misc/fa';

interface FontAwesomeProps {
    icon: string;
    className?: string;
}

const FontAwesome: React.SFC<FontAwesomeProps> = ({ icon, className }) => (
    <i className={classNames(
        fa.fa,
        fa[`fa-${ icon }`],
        className
    )} aria-hidden="true"/>
);

export default FontAwesome;
