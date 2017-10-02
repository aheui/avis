import * as qs from 'qs';
import * as GitHub from 'github-api';

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
}).then(async () => {
    const query: {
        content?: string,
    } = qs.parse(window.location.search.slice(1));
    const content = await resolveContent(query.content);
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

async function resolveContent(query?: string): Promise<string> {
    if (!query) return '';
    if (query.startsWith('gist:')) {
        try {
            const github = new GitHub();
            const gist = github.getGist(query.substr(5));
            const result = await gist.read();
            const { files } = result.data;
            const fileNames = Object.keys(files);
            const aheuiFile = fileNames.find(
                fileName =>
                    fileName.endsWith('.aheui') ||
                    fileName.endsWith('.ah') ||
                    fileName.endsWith('.아희') ||
                    fileName.endsWith('.ㅇㅎ')
            );
            if (aheuiFile) return files[aheuiFile].content;
            return files[fileNames[0]].content;
        } catch (err) {
            console.error(err);
            return '';
        }
    }
    return decode(query);
}
