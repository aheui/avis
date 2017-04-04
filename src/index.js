import qs from 'qs';

import App from './containers/App';
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
    const appState = new AppState({
        content: query.content,
    });
    const appElement = window.document.getElementById('app');
    render(App, appState, appElement);
    if (module.hot) {
        module.hot.accept('./containers/App', () => {
            const App = require('./containers/App').default;
            render(App, appState, appElement);
        });
    }
});
