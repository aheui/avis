import axios from 'axios';
import * as qs from 'qs';
import * as GitHub from 'github-api';

import { decode } from './compat/content';
import App from './components/App';
import { AppState } from './appState';
import { render } from './app';


new Promise<void>(resolve => {
    switch (document.readyState) {
    case 'interactive':
    case 'complete':
        resolve();
        break;
    default:
        window.addEventListener('DOMContentLoaded', () => resolve());
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
});

async function resolveContent(query?: string): Promise<string> {
    const gistPrefix = 'gist:';
    const githubPrefix = 'github:';
    if (!query) return '';
    if (query.startsWith(gistPrefix)) {
        try {
            const github = new GitHub();
            const gist = github.getGist(query.substr(gistPrefix.length));
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
    // github:aheui/snippets/master/99dan/99dan.aheui
    if (query.startsWith(githubPrefix)) {
        try {
            const [, // remove first
                userName,
                repoName,
                refName,
                pathName,
            ] = /^(.+?)\/(.+?)\/(.+?)\/(.+)$/.exec(
                query.substr(githubPrefix.length),
            ) as string[];
            const github = new GitHub();
            const repo = github.getRepo(userName, repoName);
            const { data } = await repo.getContents(refName, pathName);
            if (data.type !== 'file') return '';
            return await (await axios({
                method: 'get',
                url: data.download_url
            })).data;
        } catch (err) {
            console.error(err);
            return '';
        }
    }
    return decode(query);
}
