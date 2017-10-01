import * as qs from 'qs';

import { decode } from './compat/content';
import App from './components/App';
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
    const content = query.content ? decode(query.content) : '';
    const appState = new AppState({
        content,
    });
    const appElement = window.document.getElementById('app');
    render(App, appState, appElement!);
    if ((module as any).hot) {
        (module as any).hot.accept('./components/App', () => {
            const App = require('./components/App').default;
            render(App, appState, appElement!);
        });
    }
});
