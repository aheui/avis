import qs from 'qs';

import { AppState } from './appState';
import { render } from './app';


new Promise(resolve => {
    switch (document.readyState) {
    case 'interactive':
    case 'complete':
        resolve();
        break;
    default:
        window.addEventListener('DOMContentLoaded', resolve);
        break;
    }
}).then(() => {
    const query = qs.parse(window.location.search.slice(1));
    render(
        new AppState({
            content: query.content,
        }),
        window.document.getElementById('app'),
    );
});
