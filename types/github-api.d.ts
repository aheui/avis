declare module 'github-api' {
    /**
     * A Gist can retrieve and modify gists.
     */
    class Gist {
        /**
         * A Gist can retrieve and modify gists.
         */
        constructor(id: string, auth?: Requestable.auth, apiBase?: string);
        
        /**
         * Fetch a gist.
         * @see https://developer.github.com/v3/gists/#get-a-single-gist
         * @param {Requestable.callback} [cb] - will receive the gist
         * @return {Promise} - the Promise for the http request
         */
        read(cb?: Requestable.callback): Promise<any>;
        
        /**
         * Create a new gist.
         * @see https://developer.github.com/v3/gists/#create-a-gist
         * @param {Object} gist - the data for the new gist
         * @param {Requestable.callback} [cb] - will receive the new gist upon creation
         * @return {Promise} - the Promise for the http request
         */
        create(gist: Object, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Delete a gist.
         * @see https://developer.github.com/v3/gists/#delete-a-gist
         * @param {Requestable.callback} [cb] - will receive true if the request succeeds
         * @return {Promise} - the Promise for the http request
         */
        delete(cb?: Requestable.callback): Promise<any>;
        
        /**
         * Fork a gist.
         * @see https://developer.github.com/v3/gists/#fork-a-gist
         * @param {Requestable.callback} [cb] - the function that will receive the gist
         * @return {Promise} - the Promise for the http request
         */
        fork(cb?: Requestable.callback): Promise<any>;
        
        /**
         * Update a gist.
         * @see https://developer.github.com/v3/gists/#edit-a-gist
         * @param {Object} gist - the new data for the gist
         * @param {Requestable.callback} [cb] - the function that receives the API result
         * @return {Promise} - the Promise for the http request
         */
        update(gist: Object, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Star a gist.
         * @see https://developer.github.com/v3/gists/#star-a-gist
         * @param {Requestable.callback} [cb] - will receive true if the request is successful
         * @return {Promise} - the Promise for the http request
         */
        star(cb?: Requestable.callback): Promise<any>;
        
        /**
         * Unstar a gist.
         * @see https://developer.github.com/v3/gists/#unstar-a-gist
         * @param {Requestable.callback} [cb] - will receive true if the request is successful
         * @return {Promise} - the Promise for the http request
         */
        unstar(cb?: Requestable.callback): Promise<any>;
        
        /**
         * Check if a gist is starred by the user.
         * @see https://developer.github.com/v3/gists/#check-if-a-gist-is-starred
         * @param {Requestable.callback} [cb] - will receive true if the gist is starred and false if the gist is not starred
         * @return {Promise} - the Promise for the http request
         */
        isStarred(cb?: Requestable.callback): Promise<any>;
        
        /**
         * List the gist's comments
         * @see https://developer.github.com/v3/gists/comments/#list-comments-on-a-gist
         * @param {Requestable.callback} [cb] - will receive the array of comments
         * @return {Promise} - the promise for the http request
         */
        listComments(cb?: Requestable.callback): Promise<any>;
        
        /**
         * Fetch one of the gist's comments
         * @see https://developer.github.com/v3/gists/comments/#get-a-single-comment
         * @param {number} comment - the id of the comment
         * @param {Requestable.callback} [cb] - will receive the comment
         * @return {Promise} - the Promise for the http request
         */
        getComment(comment: number, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Comment on a gist
         * @see https://developer.github.com/v3/gists/comments/#create-a-comment
         * @param {string} comment - the comment to add
         * @param {Requestable.callback} [cb] - the function that receives the API result
         * @return {Promise} - the Promise for the http request
         */
        createComment(comment: string, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Edit a comment on the gist
         * @see https://developer.github.com/v3/gists/comments/#edit-a-comment
         * @param {number} comment - the id of the comment
         * @param {string} body - the new comment
         * @param {Requestable.callback} [cb] - will receive the modified comment
         * @return {Promise} - the promise for the http request
         */
        editComment(comment: number, body: string, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Delete a comment on the gist.
         * @see https://developer.github.com/v3/gists/comments/#delete-a-comment
         * @param {number} comment - the id of the comment
         * @param {Requestable.callback} [cb] - will receive true if the request succeeds
         * @return {Promise} - the Promise for the http request
         */
        deleteComment(comment: number, cb?: Requestable.callback): Promise<any>;
        
    }
    
    /**
     * GitHub encapsulates the functionality to create various API wrapper objects.
     */
    class GitHub {
        /**
         * GitHub encapsulates the functionality to create various API wrapper objects.
         */
        constructor(auth?: Requestable.auth, apiBase?: string);
        
        /**
         * Create a new Gist wrapper
         * @param {string} [id] - the id for the gist, leave undefined when creating a new gist
         * @return {Gist}
         */
        getGist(id?: string): Gist;
        
        /**
         * Create a new User wrapper
         * @param {string} [user] - the name of the user to get information about
         *                        leave undefined for the authenticated user
         * @return {User}
         */
        getUser(user?: string): User;
        
        /**
         * Create a new Organization wrapper
         * @param {string} organization - the name of the organization
         * @return {Organization}
         */
        getOrganization(organization: string): Organization;
        
        /**
         * create a new Team wrapper
         * @param {string} teamId - the name of the team
         * @return {Team}
         */
        getTeam(teamId: string): Team;
        
        /**
         * Create a new Repository wrapper
         * @param {string} user - the user who owns the respository
         * @param {string} repo - the name of the repository
         * @return {Repository}
         */
        getRepo(user: string, repo: string): Repository;
        
        /**
         * Create a new Issue wrapper
         * @param {string} user - the user who owns the respository
         * @param {string} repo - the name of the repository
         * @return {Issue}
         */
        getIssues(user: string, repo: string): Issue;
        
        /**
         * Create a new Search wrapper
         * @param {string} query - the query to search for
         * @return {Search}
         */
        search(query: string): Search;
        
        /**
         * Create a new RateLimit wrapper
         * @return {RateLimit}
         */
        getRateLimit(): RateLimit;
        
        /**
         * Create a new Markdown wrapper
         * @return {Markdown}
         */
        getMarkdown(): Markdown;
        
        /**
         * Computes the full repository name
         * @param {string} user - the username (or the full name)
         * @param {string} repo - the repository name, must not be passed if `user` is the full name
         * @return {string} the repository's full name
         */
        _getFullName(user: string, repo: string): string;
        
    }
    
    /**
     * Issue wraps the functionality to get issues for repositories
     */
    class Issue {
        /**
         * Issue wraps the functionality to get issues for repositories
         */
        constructor(repository: string, auth?: Requestable.auth, apiBase?: string);
        
        /**
         * Create a new issue
         * @see https://developer.github.com/v3/issues/#create-an-issue
         * @param {Object} issueData - the issue to create
         * @param {Requestable.callback} [cb] - will receive the created issue
         * @return {Promise} - the promise for the http request
         */
        createIssue(issueData: Object, cb?: Requestable.callback): Promise<any>;
        
        /**
         * List the issues for the repository
         * @see https://developer.github.com/v3/issues/#list-issues-for-a-repository
         * @param {Object} options - filtering options
         * @param {Requestable.callback} [cb] - will receive the array of issues
         * @return {Promise} - the promise for the http request
         */
        listIssues(options: Object, cb?: Requestable.callback): Promise<any>;
        
        /**
         * List the events for an issue
         * @see https://developer.github.com/v3/issues/events/#list-events-for-an-issue
         * @param {number} issue - the issue to get events for
         * @param {Requestable.callback} [cb] - will receive the list of events
         * @return {Promise} - the promise for the http request
         */
        listIssueEvents(issue: number, cb?: Requestable.callback): Promise<any>;
        
        /**
         * List comments on an issue
         * @see https://developer.github.com/v3/issues/comments/#list-comments-on-an-issue
         * @param {number} issue - the id of the issue to get comments from
         * @param {Requestable.callback} [cb] - will receive the comments
         * @return {Promise} - the promise for the http request
         */
        listIssueComments(issue: number, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Get a single comment on an issue
         * @see https://developer.github.com/v3/issues/comments/#get-a-single-comment
         * @param {number} id - the comment id to get
         * @param {Requestable.callback} [cb] - will receive the comment
         * @return {Promise} - the promise for the http request
         */
        getIssueComment(id: number, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Comment on an issue
         * @see https://developer.github.com/v3/issues/comments/#create-a-comment
         * @param {number} issue - the id of the issue to comment on
         * @param {string} comment - the comment to add
         * @param {Requestable.callback} [cb] - will receive the created comment
         * @return {Promise} - the promise for the http request
         */
        createIssueComment(issue: number, comment: string, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Edit a comment on an issue
         * @see https://developer.github.com/v3/issues/comments/#edit-a-comment
         * @param {number} id - the comment id to edit
         * @param {string} comment - the comment to edit
         * @param {Requestable.callback} [cb] - will receive the edited comment
         * @return {Promise} - the promise for the http request
         */
        editIssueComment(id: number, comment: string, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Delete a comment on an issue
         * @see https://developer.github.com/v3/issues/comments/#delete-a-comment
         * @param {number} id - the comment id to delete
         * @param {Requestable.callback} [cb] - will receive true if the request is successful
         * @return {Promise} - the promise for the http request
         */
        deleteIssueComment(id: number, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Edit an issue
         * @see https://developer.github.com/v3/issues/#edit-an-issue
         * @param {number} issue - the issue number to edit
         * @param {Object} issueData - the new issue data
         * @param {Requestable.callback} [cb] - will receive the modified issue
         * @return {Promise} - the promise for the http request
         */
        editIssue(issue: number, issueData: Object, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Get a particular issue
         * @see https://developer.github.com/v3/issues/#get-a-single-issue
         * @param {number} issue - the issue number to fetch
         * @param {Requestable.callback} [cb] - will receive the issue
         * @return {Promise} - the promise for the http request
         */
        getIssue(issue: number, cb?: Requestable.callback): Promise<any>;
        
        /**
         * List the milestones for the repository
         * @see https://developer.github.com/v3/issues/milestones/#list-milestones-for-a-repository
         * @param {Object} options - filtering options
         * @param {Requestable.callback} [cb] - will receive the array of milestones
         * @return {Promise} - the promise for the http request
         */
        listMilestones(options: Object, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Get a milestone
         * @see https://developer.github.com/v3/issues/milestones/#get-a-single-milestone
         * @param {string} milestone - the id of the milestone to fetch
         * @param {Requestable.callback} [cb] - will receive the array of milestones
         * @return {Promise} - the promise for the http request
         */
        getMilestone(milestone: string, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Create a new milestone
         * @see https://developer.github.com/v3/issues/milestones/#create-a-milestone
         * @param {Object} milestoneData - the milestone definition
         * @param {Requestable.callback} [cb] - will receive the array of milestones
         * @return {Promise} - the promise for the http request
         */
        createMilestone(milestoneData: Object, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Edit a milestone
         * @see https://developer.github.com/v3/issues/milestones/#update-a-milestone
         * @param {string} milestone - the id of the milestone to edit
         * @param {Object} milestoneData - the updates to make to the milestone
         * @param {Requestable.callback} [cb] - will receive the array of milestones
         * @return {Promise} - the promise for the http request
         */
        editMilestone(milestone: string, milestoneData: Object, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Delete a milestone (this is distinct from closing a milestone)
         * @see https://developer.github.com/v3/issues/milestones/#delete-a-milestone
         * @param {string} milestone - the id of the milestone to delete
         * @param {Requestable.callback} [cb] - will receive the array of milestones
         * @return {Promise} - the promise for the http request
         */
        deleteMilestone(milestone: string, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Create a new label
         * @see https://developer.github.com/v3/issues/labels/#create-a-label
         * @param {Object} labelData - the label definition
         * @param {Requestable.callback} [cb] - will receive the object representing the label
         * @return {Promise} - the promise for the http request
         */
        createLabel(labelData: Object, cb?: Requestable.callback): Promise<any>;
        
    }
    
    /**
     * RateLimit allows users to query their rate-limit status
     */
    class Markdown {
        /**
         * RateLimit allows users to query their rate-limit status
         */
        constructor(auth: Requestable.auth, apiBase?: string);
        
        /**
         * Render html from Markdown text.
         * @see https://developer.github.com/v3/markdown/#render-an-arbitrary-markdown-document
         * @param {Object} options - conversion options
         * @param {string} [options.text] - the markdown text to convert
         * @param {string} [options.mode=markdown] - can be either `markdown` or `gfm`
         * @param {string} [options.context] - repository name if mode is gfm
         * @param {Requestable.callback} [cb] - will receive the converted html
         * @return {Promise} - the promise for the http request
         */
        render(options: { text: string, mode: string, context: string }, cb?: Requestable.callback): Promise<any>;
        
    }
    
    /**
     * Organization encapsulates the functionality to create repositories in organizations
     */
    class Organization {
        /**
         * Organization encapsulates the functionality to create repositories in organizations
         */
        constructor(organization: string, auth?: Requestable.auth, apiBase?: string);
        
        /**
         * Create a repository in an organization
         * @see https://developer.github.com/v3/repos/#create
         * @param {Object} options - the repository definition
         * @param {Requestable.callback} [cb] - will receive the created repository
         * @return {Promise} - the promise for the http request
         */
        createRepo(options: Object, cb?: Requestable.callback): Promise<any>;
        
        /**
         * List the repositories in an organization
         * @see https://developer.github.com/v3/repos/#list-organization-repositories
         * @param {Requestable.callback} [cb] - will receive the list of repositories
         * @return {Promise} - the promise for the http request
         */
        getRepos(cb?: Requestable.callback): Promise<any>;
        
        /**
         * Query if the user is a member or not
         * @param {string} username - the user in question
         * @param {Requestable.callback} [cb] - will receive true if the user is a member
         * @return {Promise} - the promise for the http request
         */
        isMember(username: string, cb?: Requestable.callback): Promise<any>;
        
        /**
         * List the users who are members of the company
         * @see https://developer.github.com/v3/orgs/members/#members-list
         * @param {object} options - filtering options
         * @param {string} [options.filter=all] - can be either `2fa_disabled` or `all`
         * @param {string} [options.role=all] - can be one of: `all`, `admin`, or `member`
         * @param {Requestable.callback} [cb] - will receive the list of users
         * @return {Promise} - the promise for the http request
         */
        listMembers(options: { filter: string, role: string }, cb?: Requestable.callback): Promise<any>;
        
        /**
         * List the Teams in the Organization
         * @see https://developer.github.com/v3/orgs/teams/#list-teams
         * @param {Requestable.callback} [cb] - will receive the list of teams
         * @return {Promise} - the promise for the http request
         */
        getTeams(cb?: Requestable.callback): Promise<any>;
        
        /**
         * Create a team
         * @see https://developer.github.com/v3/orgs/teams/#create-team
         * @param {object} options - Team creation parameters
         * @param {string} options.name - The name of the team
         * @param {string} [options.description] - Team description
         * @param {string} [options.repo_names] - Repos to add the team to
         * @param {string} [options.privacy=secret] - The level of privacy the team should have. Can be either one
         * of: `secret`, or `closed`
         * @param {Requestable.callback} [cb] - will receive the created team
         * @return {Promise} - the promise for the http request
         */
        createTeam(options: { name: string, description: string, repo_names: string, privacy: string }, cb?: Requestable.callback): Promise<any>;
        
    }
    
    /**
     * RateLimit allows users to query their rate-limit status
     */
    class RateLimit {
        /**
         * RateLimit allows users to query their rate-limit status
         */
        constructor(auth: Requestable.auth, apiBase?: string);
        
        /**
         * Query the current rate limit
         * @see https://developer.github.com/v3/rate_limit/
         * @param {Requestable.callback} [cb] - will receive the rate-limit data
         * @return {Promise} - the promise for the http request
         */
        getRateLimit(cb?: Requestable.callback): Promise<any>;
        
    }
    
    /**
     * Respository encapsulates the functionality to create, query, and modify files.
     * @class Repository
     */
    class Repository {
        /**
         * Respository encapsulates the functionality to create, query, and modify files.
         * @class Repository
         */
        constructor();
        
        /**
         * Get a reference
         * @see https://developer.github.com/v3/git/refs/#get-a-reference
         * @param {string} ref - the reference to get
         * @param {Requestable.callback} [cb] - will receive the reference's refSpec or a list of refSpecs that match `ref`
         * @return {Promise} - the promise for the http request
         */
        getRef(ref: string, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Create a reference
         * @see https://developer.github.com/v3/git/refs/#create-a-reference
         * @param {Object} options - the object describing the ref
         * @param {Requestable.callback} [cb] - will receive the ref
         * @return {Promise} - the promise for the http request
         */
        createRef(options: Object, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Delete a reference
         * @see https://developer.github.com/v3/git/refs/#delete-a-reference
         * @param {string} ref - the name of the ref to delte
         * @param {Requestable.callback} [cb] - will receive true if the request is successful
         * @return {Promise} - the promise for the http request
         */
        deleteRef(ref: string, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Delete a repository
         * @see https://developer.github.com/v3/repos/#delete-a-repository
         * @param {Requestable.callback} [cb] - will receive true if the request is successful
         * @return {Promise} - the promise for the http request
         */
        deleteRepo(cb?: Requestable.callback): Promise<any>;
        
        /**
         * List the tags on a repository
         * @see https://developer.github.com/v3/repos/#list-tags
         * @param {Requestable.callback} [cb] - will receive the tag data
         * @return {Promise} - the promise for the http request
         */
        listTags(cb?: Requestable.callback): Promise<any>;
        
        /**
         * List the open pull requests on the repository
         * @see https://developer.github.com/v3/pulls/#list-pull-requests
         * @param {Object} options - options to filter the search
         * @param {Requestable.callback} [cb] - will receive the list of PRs
         * @return {Promise} - the promise for the http request
         */
        listPullRequests(options: Object, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Get information about a specific pull request
         * @see https://developer.github.com/v3/pulls/#get-a-single-pull-request
         * @param {number} number - the PR you wish to fetch
         * @param {Requestable.callback} [cb] - will receive the PR from the API
         * @return {Promise} - the promise for the http request
         */
        getPullRequest(number: number, cb?: Requestable.callback): Promise<any>;
        
        /**
         * List the files of a specific pull request
         * @see https://developer.github.com/v3/pulls/#list-pull-requests-files
         * @param {number|string} number - the PR you wish to fetch
         * @param {Requestable.callback} [cb] - will receive the list of files from the API
         * @return {Promise} - the promise for the http request
         */
        listPullRequestFiles(number: (number | string), cb?: Requestable.callback): Promise<any>;
        
        /**
         * Compare two branches/commits/repositories
         * @see https://developer.github.com/v3/repos/commits/#compare-two-commits
         * @param {string} base - the base commit
         * @param {string} head - the head commit
         * @param {Requestable.callback} cb - will receive the comparison
         * @return {Promise} - the promise for the http request
         */
        compareBranches(base: string, head: string, cb: Requestable.callback): Promise<any>;
        
        /**
         * List all the branches for the repository
         * @see https://developer.github.com/v3/repos/#list-branches
         * @param {Requestable.callback} cb - will receive the list of branches
         * @return {Promise} - the promise for the http request
         */
        listBranches(cb: Requestable.callback): Promise<any>;
        
        /**
         * Get a raw blob from the repository
         * @see https://developer.github.com/v3/git/blobs/#get-a-blob
         * @param {string} sha - the sha of the blob to fetch
         * @param {Requestable.callback} cb - will receive the blob from the API
         * @return {Promise} - the promise for the http request
         */
        getBlob(sha: string, cb: Requestable.callback): Promise<any>;
        
        /**
         * Get a single branch
         * @see https://developer.github.com/v3/repos/branches/#get-branch
         * @param {string} branch - the name of the branch to fetch
         * @param {Requestable.callback} cb - will receive the branch from the API
         * @returns {Promise} - the promise for the http request
         */
        getBranch(branch: string, cb: Requestable.callback): Promise<any>;
        
        /**
         * Get a commit from the repository
         * @see https://developer.github.com/v3/repos/commits/#get-a-single-commit
         * @param {string} sha - the sha for the commit to fetch
         * @param {Requestable.callback} cb - will receive the commit data
         * @return {Promise} - the promise for the http request
         */
        getCommit(sha: string, cb: Requestable.callback): Promise<any>;
        
        /**
         * List the commits on a repository, optionally filtering by path, author or time range
         * @see https://developer.github.com/v3/repos/commits/#list-commits-on-a-repository
         * @param {Object} [options] - the filtering options for commits
         * @param {string} [options.sha] - the SHA or branch to start from
         * @param {string} [options.path] - the path to search on
         * @param {string} [options.author] - the commit author
         * @param {(Date|string)} [options.since] - only commits after this date will be returned
         * @param {(Date|string)} [options.until] - only commits before this date will be returned
         * @param {Requestable.callback} cb - will receive the list of commits found matching the criteria
         * @return {Promise} - the promise for the http request
         */
        listCommits(options?: { sha: string, path: string, author: string, since: (Date | string), until: (Date | string) }, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Gets a single commit information for a repository
         * @see https://developer.github.com/v3/repos/commits/#get-a-single-commit
         * @param {string} ref - the reference for the commit-ish
         * @param {Requestable.callback} cb - will receive the commit information
         * @return {Promise} - the promise for the http request
         */
        getSingleCommit(ref: string, cb: Requestable.callback): Promise<any>;
        
        /**
         * Get tha sha for a particular object in the repository. This is a convenience function
         * @see https://developer.github.com/v3/repos/contents/#get-contents
         * @param {string} [branch] - the branch to look in, or the repository's default branch if omitted
         * @param {string} path - the path of the file or directory
         * @param {Requestable.callback} cb - will receive a description of the requested object, including a `SHA` property
         * @return {Promise} - the promise for the http request
         */
        getSha(branch?: string, path?: string, cb?: Requestable.callback): Promise<any>;
        
        /**
         * List the commit statuses for a particular sha, branch, or tag
         * @see https://developer.github.com/v3/repos/statuses/#list-statuses-for-a-specific-ref
         * @param {string} sha - the sha, branch, or tag to get statuses for
         * @param {Requestable.callback} cb - will receive the list of statuses
         * @return {Promise} - the promise for the http request
         */
        listStatuses(sha: string, cb: Requestable.callback): Promise<any>;
        
        /**
         * Get a description of a git tree
         * @see https://developer.github.com/v3/git/trees/#get-a-tree
         * @param {string} treeSHA - the SHA of the tree to fetch
         * @param {Requestable.callback} cb - will receive the callback data
         * @return {Promise} - the promise for the http request
         */
        getTree(treeSHA: string, cb: Requestable.callback): Promise<any>;
        
        /**
         * Create a blob
         * @see https://developer.github.com/v3/git/blobs/#create-a-blob
         * @param {string|Buffer|Blob} content - the content to add to the repository
         * @param {Requestable.callback} cb - will receive the details of the created blob
         * @return {Promise} - the promise for the http request
         */
        createBlob(content: (string | Buffer | Blob), cb: Requestable.callback): Promise<any>;
        
        /**
         * Get the object that represents the provided content
         * @param {string|Buffer|Blob} content - the content to send to the server
         * @return {Object} the representation of `content` for the GitHub API
         */
        _getContentObject(content: (string | Buffer | Blob)): Object;
        
        /**
         * Update a tree in Git
         * @see https://developer.github.com/v3/git/trees/#create-a-tree
         * @param {string} baseTreeSHA - the SHA of the tree to update
         * @param {string} path - the path for the new file
         * @param {string} blobSHA - the SHA for the blob to put at `path`
         * @param {Requestable.callback} cb - will receive the new tree that is created
         * @return {Promise} - the promise for the http request
         * @deprecated use {@link Repository#createTree} instead
         */
        updateTree(baseTreeSHA: string, path: string, blobSHA: string, cb: Requestable.callback): Promise<any>;
        
        /**
         * Create a new tree in git
         * @see https://developer.github.com/v3/git/trees/#create-a-tree
         * @param {Object} tree - the tree to create
         * @param {string} baseSHA - the root sha of the tree
         * @param {Requestable.callback} cb - will receive the new tree that is created
         * @return {Promise} - the promise for the http request
         */
        createTree(tree: Object, baseSHA: string, cb: Requestable.callback): Promise<any>;
        
        /**
         * Add a commit to the repository
         * @see https://developer.github.com/v3/git/commits/#create-a-commit
         * @param {string} parent - the SHA of the parent commit
         * @param {string} tree - the SHA of the tree for this commit
         * @param {string} message - the commit message
         * @param {Requestable.callback} cb - will receive the commit that is created
         * @return {Promise} - the promise for the http request
         */
        commit(parent: string, tree: string, message: string, cb: Requestable.callback): Promise<any>;
        
        /**
         * Update a ref
         * @see https://developer.github.com/v3/git/refs/#update-a-reference
         * @param {string} ref - the ref to update
         * @param {string} commitSHA - the SHA to point the reference to
         * @param {boolean} force - indicates whether to force or ensure a fast-forward update
         * @param {Requestable.callback} cb - will receive the updated ref back
         * @return {Promise} - the promise for the http request
         */
        updateHead(ref: string, commitSHA: string, force: boolean, cb: Requestable.callback): Promise<any>;
        
        /**
         * Get information about the repository
         * @see https://developer.github.com/v3/repos/#get
         * @param {Requestable.callback} cb - will receive the information about the repository
         * @return {Promise} - the promise for the http request
         */
        getDetails(cb: Requestable.callback): Promise<any>;
        
        /**
         * List the contributors to the repository
         * @see https://developer.github.com/v3/repos/#list-contributors
         * @param {Requestable.callback} cb - will receive the list of contributors
         * @return {Promise} - the promise for the http request
         */
        getContributors(cb: Requestable.callback): Promise<any>;
        
        /**
         * List the users who are collaborators on the repository. The currently authenticated user must have
         * push access to use this method
         * @see https://developer.github.com/v3/repos/collaborators/#list-collaborators
         * @param {Requestable.callback} cb - will receive the list of collaborators
         * @return {Promise} - the promise for the http request
         */
        getCollaborators(cb: Requestable.callback): Promise<any>;
        
        /**
         * Check if a user is a collaborator on the repository
         * @see https://developer.github.com/v3/repos/collaborators/#check-if-a-user-is-a-collaborator
         * @param {string} username - the user to check
         * @param {Requestable.callback} cb - will receive true if the user is a collaborator and false if they are not
         * @return {Promise} - the promise for the http request {Boolean} [description]
         */
        isCollaborator(username: string, cb: Requestable.callback): Promise<any>;
        
        /**
         * Get the contents of a repository
         * @see https://developer.github.com/v3/repos/contents/#get-contents
         * @param {string} ref - the ref to check
         * @param {string} path - the path containing the content to fetch
         * @param {boolean} [raw] - `true` if the results should be returned raw instead of GitHub's normalized format
         * @param {Requestable.callback} [cb] - will receive the fetched data
         * @return {Promise} - the promise for the http request
         */
        getContents(ref: string, path: string, raw?: boolean, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Get the README of a repository
         * @see https://developer.github.com/v3/repos/contents/#get-the-readme
         * @param {string} ref - the ref to check
         * @param {boolean} raw - `true` if the results should be returned raw instead of GitHub's normalized format
         * @param {Requestable.callback} cb - will receive the fetched data
         * @return {Promise} - the promise for the http request
         */
        getReadme(ref: string, raw: boolean, cb: Requestable.callback): Promise<any>;
        
        /**
         * Fork a repository
         * @see https://developer.github.com/v3/repos/forks/#create-a-fork
         * @param {Requestable.callback} cb - will receive the information about the newly created fork
         * @return {Promise} - the promise for the http request
         */
        fork(cb: Requestable.callback): Promise<any>;
        
        /**
         * List a repository's forks
         * @see https://developer.github.com/v3/repos/forks/#list-forks
         * @param {Requestable.callback} cb - will receive the list of repositories forked from this one
         * @return {Promise} - the promise for the http request
         */
        listForks(cb: Requestable.callback): Promise<any>;
        
        /**
         * Create a new branch from an existing branch.
         * @param {string} [oldBranch=master] - the name of the existing branch
         * @param {string} newBranch - the name of the new branch
         * @param {Requestable.callback} cb - will receive the commit data for the head of the new branch
         * @return {Promise} - the promise for the http request
         */
        createBranch(oldBranch?: string, newBranch?: string, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Create a new pull request
         * @see https://developer.github.com/v3/pulls/#create-a-pull-request
         * @param {Object} options - the pull request description
         * @param {Requestable.callback} cb - will receive the new pull request
         * @return {Promise} - the promise for the http request
         */
        createPullRequest(options: Object, cb: Requestable.callback): Promise<any>;
        
        /**
         * Update a pull request
         * @deprecated since version 2.4.0
         * @see https://developer.github.com/v3/pulls/#update-a-pull-request
         * @param {number|string} number - the number of the pull request to update
         * @param {Object} options - the pull request description
         * @param {Requestable.callback} [cb] - will receive the pull request information
         * @return {Promise} - the promise for the http request
         */
        updatePullRequst(number: (number | string), options: Object, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Update a pull request
         * @see https://developer.github.com/v3/pulls/#update-a-pull-request
         * @param {number|string} number - the number of the pull request to update
         * @param {Object} options - the pull request description
         * @param {Requestable.callback} [cb] - will receive the pull request information
         * @return {Promise} - the promise for the http request
         */
        updatePullRequest(number: (number | string), options: Object, cb?: Requestable.callback): Promise<any>;
        
        /**
         * List the hooks for the repository
         * @see https://developer.github.com/v3/repos/hooks/#list-hooks
         * @param {Requestable.callback} cb - will receive the list of hooks
         * @return {Promise} - the promise for the http request
         */
        listHooks(cb: Requestable.callback): Promise<any>;
        
        /**
         * Get a hook for the repository
         * @see https://developer.github.com/v3/repos/hooks/#get-single-hook
         * @param {number} id - the id of the webook
         * @param {Requestable.callback} cb - will receive the details of the webook
         * @return {Promise} - the promise for the http request
         */
        getHook(id: number, cb: Requestable.callback): Promise<any>;
        
        /**
         * Add a new hook to the repository
         * @see https://developer.github.com/v3/repos/hooks/#create-a-hook
         * @param {Object} options - the configuration describing the new hook
         * @param {Requestable.callback} cb - will receive the new webhook
         * @return {Promise} - the promise for the http request
         */
        createHook(options: Object, cb: Requestable.callback): Promise<any>;
        
        /**
         * Edit an existing webhook
         * @see https://developer.github.com/v3/repos/hooks/#edit-a-hook
         * @param {number} id - the id of the webhook
         * @param {Object} options - the new description of the webhook
         * @param {Requestable.callback} cb - will receive the updated webhook
         * @return {Promise} - the promise for the http request
         */
        updateHook(id: number, options: Object, cb: Requestable.callback): Promise<any>;
        
        /**
         * Delete a webhook
         * @see https://developer.github.com/v3/repos/hooks/#delete-a-hook
         * @param {number} id - the id of the webhook to be deleted
         * @param {Requestable.callback} cb - will receive true if the call is successful
         * @return {Promise} - the promise for the http request
         */
        deleteHook(id: number, cb: Requestable.callback): Promise<any>;
        
        /**
         * List the deploy keys for the repository
         * @see https://developer.github.com/v3/repos/keys/#list-deploy-keys
         * @param {Requestable.callback} cb - will receive the list of deploy keys
         * @return {Promise} - the promise for the http request
         */
        listKeys(cb: Requestable.callback): Promise<any>;
        
        /**
         * Get a deploy key for the repository
         * @see https://developer.github.com/v3/repos/keys/#get-a-deploy-key
         * @param {number} id - the id of the deploy key
         * @param {Requestable.callback} cb - will receive the details of the deploy key
         * @return {Promise} - the promise for the http request
         */
        getKey(id: number, cb: Requestable.callback): Promise<any>;
        
        /**
         * Add a new deploy key to the repository
         * @see https://developer.github.com/v3/repos/keys/#add-a-new-deploy-key
         * @param {Object} options - the configuration describing the new deploy key
         * @param {Requestable.callback} cb - will receive the new deploy key
         * @return {Promise} - the promise for the http request
         */
        createKey(options: Object, cb: Requestable.callback): Promise<any>;
        
        /**
         * Delete a deploy key
         * @see https://developer.github.com/v3/repos/keys/#remove-a-deploy-key
         * @param {number} id - the id of the deploy key to be deleted
         * @param {Requestable.callback} cb - will receive true if the call is successful
         * @return {Promise} - the promise for the http request
         */
        deleteKey(id: number, cb: Requestable.callback): Promise<any>;
        
        /**
         * Delete a file from a branch
         * @see https://developer.github.com/v3/repos/contents/#delete-a-file
         * @param {string} branch - the branch to delete from, or the default branch if not specified
         * @param {string} path - the path of the file to remove
         * @param {Requestable.callback} cb - will receive the commit in which the delete occurred
         * @return {Promise} - the promise for the http request
         */
        deleteFile(branch: string, path: string, cb: Requestable.callback): Promise<any>;
        
        /**
         * Change all references in a repo from oldPath to new_path
         * @param {string} branch - the branch to carry out the reference change, or the default branch if not specified
         * @param {string} oldPath - original path
         * @param {string} newPath - new reference path
         * @param {Requestable.callback} cb - will receive the commit in which the move occurred
         * @return {Promise} - the promise for the http request
         */
        move(branch: string, oldPath: string, newPath: string, cb: Requestable.callback): Promise<any>;
        
        /**
         * Write a file to the repository
         * @see https://developer.github.com/v3/repos/contents/#update-a-file
         * @param {string} branch - the name of the branch
         * @param {string} path - the path for the file
         * @param {string} content - the contents of the file
         * @param {string} message - the commit message
         * @param {Object} [options] - commit options
         * @param {Object} [options.author] - the author of the commit
         * @param {Object} [options.commiter] - the committer
         * @param {boolean} [options.encode] - true if the content should be base64 encoded
         * @param {Requestable.callback} cb - will receive the new commit
         * @return {Promise} - the promise for the http request
         */
        writeFile(branch: string, path: string, content: string, message: string, options?: { author: Object, commiter: Object, encode: boolean }, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Check if a repository is starred by you
         * @see https://developer.github.com/v3/activity/starring/#check-if-you-are-starring-a-repository
         * @param {Requestable.callback} cb - will receive true if the repository is starred and false if the repository
         *                                  is not starred
         * @return {Promise} - the promise for the http request {Boolean} [description]
         */
        isStarred(cb: Requestable.callback): Promise<any>;
        
        /**
         * Star a repository
         * @see https://developer.github.com/v3/activity/starring/#star-a-repository
         * @param {Requestable.callback} cb - will receive true if the repository is starred
         * @return {Promise} - the promise for the http request
         */
        star(cb: Requestable.callback): Promise<any>;
        
        /**
         * Unstar a repository
         * @see https://developer.github.com/v3/activity/starring/#unstar-a-repository
         * @param {Requestable.callback} cb - will receive true if the repository is unstarred
         * @return {Promise} - the promise for the http request
         */
        unstar(cb: Requestable.callback): Promise<any>;
        
        /**
         * Create a new release
         * @see https://developer.github.com/v3/repos/releases/#create-a-release
         * @param {Object} options - the description of the release
         * @param {Requestable.callback} cb - will receive the newly created release
         * @return {Promise} - the promise for the http request
         */
        createRelease(options: Object, cb: Requestable.callback): Promise<any>;
        
        /**
         * Edit a release
         * @see https://developer.github.com/v3/repos/releases/#edit-a-release
         * @param {string} id - the id of the release
         * @param {Object} options - the description of the release
         * @param {Requestable.callback} cb - will receive the modified release
         * @return {Promise} - the promise for the http request
         */
        updateRelease(id: string, options: Object, cb: Requestable.callback): Promise<any>;
        
        /**
         * Get information about all releases
         * @see https://developer.github.com/v3/repos/releases/#list-releases-for-a-repository
         * @param {Requestable.callback} cb - will receive the release information
         * @return {Promise} - the promise for the http request
         */
        listReleases(cb: Requestable.callback): Promise<any>;
        
        /**
         * Get information about a release
         * @see https://developer.github.com/v3/repos/releases/#get-a-single-release
         * @param {string} id - the id of the release
         * @param {Requestable.callback} cb - will receive the release information
         * @return {Promise} - the promise for the http request
         */
        getRelease(id: string, cb: Requestable.callback): Promise<any>;
        
        /**
         * Delete a release
         * @see https://developer.github.com/v3/repos/releases/#delete-a-release
         * @param {string} id - the release to be deleted
         * @param {Requestable.callback} cb - will receive true if the operation is successful
         * @return {Promise} - the promise for the http request
         */
        deleteRelease(id: string, cb: Requestable.callback): Promise<any>;
        
        /**
         * Merge a pull request
         * @see https://developer.github.com/v3/pulls/#merge-a-pull-request-merge-button
         * @param {number|string} number - the number of the pull request to merge
         * @param {Object} options - the merge options for the pull request
         * @param {Requestable.callback} [cb] - will receive the merge information if the operation is successful
         * @return {Promise} - the promise for the http request
         */
        mergePullRequest(number: (number | string), options: Object, cb?: Requestable.callback): Promise<any>;
        
    }
    
    /**
     * @todo Define a better type for Blob
     * @typedef Blob
     */
    type Blob = any;
    
    /**
     * The error structure returned when a network call fails
     */
    class ResponseError {
        /**
         * The error structure returned when a network call fails
         */
        constructor();
        
    }
    
    namespace Requestable {
        /**
         * A function that receives the result of the API request.
         * @callback Requestable.callback
         * @param {Requestable.Error} error - the error returned by the API or `null`
         * @param {any | boolean} result - the data returned by the API or `true` if the API returns `204 No Content`
         * @param {any} response - the raw {@linkcode https://github.com/mzabriskie/axios#response-schema Response}
         */
        type callback = (
            error: Requestable.Error,
            result: (any | boolean),
            response: any
        ) => void;
        /**
         * @typedef {ResponseError} Requestable.Error
         * @param {string} message - an message to return instead of the the default error message
         * @param {string} path - the requested path
         * @param {Object} response - the object returned by Axios
         */
        type Error = ResponseError;
        
        type auth = any;
    }
    
    /**
     * Requestable wraps the logic for making http requests to the API
     * @class Requestable
     */
    class Requestable {
        /**
         * Requestable wraps the logic for making http requests to the API
         * @class Requestable
         */
        constructor();
        
        /**
         * Compute the URL to use to make a request.
         * @private
         * @param {string} path - either a URL relative to the API base or an absolute URL
         * @return {string} - the URL to use
         */
        private __getURL(path: string): string;
        
        /**
         * Compute the headers required for an API request.
         * @private
         * @param {boolean} raw - if the request should be treated as JSON or as a raw request
         * @return {Object} - the headers to use in the request
         */
        private __getRequestHeaders(raw: boolean): Object;
        
        /**
         * Sets the default options for API requests
         * @protected
         * @param {Object} [requestOptions={}] - the current options for the request
         * @return {Object} - the options to pass to the request
         */
        protected _getOptionsWithDefaults(requestOptions?: Object): Object;
        
        /**
         * if a `Date` is passed to this function it will be converted to an ISO string
         * @param {Date} date - the object to attempt to cooerce into an ISO date string
         * @return {string} - the ISO representation of `date` or whatever was passed in if it was not a date
         */
        _dateToISO(date: Date): string;
        
        /**
         * Make a request.
         * @param {string} method - the method for the request (GET, PUT, POST, DELETE)
         * @param {string} path - the path for the request
         * @param {any} [data] - the data to send to the server. For HTTP methods that don't have a body the data
         *                   will be sent as query parameters
         * @param {Requestable.callback} [cb] - the callback for the request
         * @param {boolean} [raw=false] - if the request should be sent as raw. If this is a falsy value then the
         *                              request will be made as JSON
         * @return {Promise} - the Promise for the http request
         */
        _request(method: string, path: string, data?: any, cb?: Requestable.callback, raw?: boolean): Promise<any>;
        
        /**
         * Make a request to an endpoint the returns 204 when true and 404 when false
         * @param {string} path - the path to request
         * @param {Object} data - any query parameters for the request
         * @param {Requestable.callback} cb - the callback that will receive `true` or `false`
         * @param {method} [method=GET] - HTTP Method to use
         * @return {Promise} - the promise for the http request
         */
        _request204or404(path: string, data: Object, cb: Requestable.callback, method?: string): Promise<any>;
        
        /**
         * Make a request and fetch all the available data. Github will paginate responses so for queries
         * that might span multiple pages this method is preferred to {@link Requestable#request}
         * @param {string} path - the path to request
         * @param {Object} options - the query parameters to include
         * @param {Requestable.callback} [cb] - the function to receive the data. The returned data will always be an array.
         * @param [_results] - the partial results. This argument is intended for interal use only.
         * @return {Promise} - a promise which will resolve when all pages have been fetched
         * @deprecated This will be folded into {@link Requestable#_request} in the 2.0 release.
         */
        _requestAllPages(path: string, options: Object, cb?: Requestable.callback, results?: any): Promise<any>;
        
    }
    
    namespace Search {
        type Params = any;
    }
    
    /**
     * Wrap the Search API
     * @class Search
     * @extends Requestable
     */
    class Search extends Requestable {
        /**
         * Wrap the Search API
         * @class Search
         * @extends Requestable
         */
        constructor();
        
        /**
         * Available search options
         * @see https://developer.github.com/v3/search/#parameters
         * @member Search.Params
         * @property {string} q - the query to make
         * @property {string} sort - the sort field, one of `stars`, `forks`, or `updated`.
         *                      Default is [best match](https://developer.github.com/v3/search/#ranking-search-results)
         * @property {string} order - the ordering, either `asc` or `desc`
         */
        static Params: any;
        
        /**
         * Perform a search on the GitHub API
         * @private
         * @param {string} path - the scope of the search
         * @param {Search.Params} [withOptions] - additional parameters for the search
         * @param {Requestable.callback} [cb] - will receive the results of the search
         * @return {Promise} - the promise for the http request
         */
        private _search(path: string, withOptions?: Search.Params, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Search for repositories
         * @see https://developer.github.com/v3/search/#search-repositories
         * @param {Search.Params} [options] - additional parameters for the search
         * @param {Requestable.callback} [cb] - will receive the results of the search
         * @return {Promise} - the promise for the http request
         */
        forRepositories(options?: Search.Params, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Search for code
         * @see https://developer.github.com/v3/search/#search-code
         * @param {Search.Params} [options] - additional parameters for the search
         * @param {Requestable.callback} [cb] - will receive the results of the search
         * @return {Promise} - the promise for the http request
         */
        forCode(options?: Search.Params, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Search for issues
         * @see https://developer.github.com/v3/search/#search-issues
         * @param {Search.Params} [options] - additional parameters for the search
         * @param {Requestable.callback} [cb] - will receive the results of the search
         * @return {Promise} - the promise for the http request
         */
        forIssues(options?: Search.Params, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Search for users
         * @see https://developer.github.com/v3/search/#search-users
         * @param {Search.Params} [options] - additional parameters for the search
         * @param {Requestable.callback} [cb] - will receive the results of the search
         * @return {Promise} - the promise for the http request
         */
        forUsers(options?: Search.Params, cb?: Requestable.callback): Promise<any>;
        
    }
    
    /**
     * A Team allows scoping of API requests to a particular Github Organization Team.
     */
    class Team {
        /**
         * A Team allows scoping of API requests to a particular Github Organization Team.
         */
        constructor(teamId?: string, auth?: Requestable.auth, apiBase?: string);
        
        /**
         * Get Team information
         * @see https://developer.github.com/v3/orgs/teams/#get-team
         * @param {Requestable.callback} [cb] - will receive the team
         * @return {Promise} - the promise for the http request
         */
        getTeam(cb?: Requestable.callback): Promise<any>;
        
        /**
         * List the Team's repositories
         * @see https://developer.github.com/v3/orgs/teams/#list-team-repos
         * @param {Requestable.callback} [cb] - will receive the list of repositories
         * @return {Promise} - the promise for the http request
         */
        listRepos(cb?: Requestable.callback): Promise<any>;
        
        /**
         * Edit Team information
         * @see https://developer.github.com/v3/orgs/teams/#edit-team
         * @param {object} options - Parameters for team edit
         * @param {string} options.name - The name of the team
         * @param {string} [options.description] - Team description
         * @param {string} [options.repo_names] - Repos to add the team to
         * @param {string} [options.privacy=secret] - The level of privacy the team should have. Can be either one
         * of: `secret`, or `closed`
         * @param {Requestable.callback} [cb] - will receive the updated team
         * @return {Promise} - the promise for the http request
         */
        editTeam(options: { name: string, description: string, repo_names: string, privacy: string }, cb?: Requestable.callback): Promise<any>;
        
        /**
         * List the users who are members of the Team
         * @see https://developer.github.com/v3/orgs/teams/#list-team-members
         * @param {object} options - Parameters for listing team users
         * @param {string} [options.role=all] - can be one of: `all`, `maintainer`, or `member`
         * @param {Requestable.callback} [cb] - will receive the list of users
         * @return {Promise} - the promise for the http request
         */
        listMembers(options: { role: string }, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Get Team membership status for a user
         * @see https://developer.github.com/v3/orgs/teams/#get-team-membership
         * @param {string} username - can be one of: `all`, `maintainer`, or `member`
         * @param {Requestable.callback} [cb] - will receive the membership status of a user
         * @return {Promise} - the promise for the http request
         */
        getMembership(username: string, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Add a member to the Team
         * @see https://developer.github.com/v3/orgs/teams/#add-team-membership
         * @param {string} username - can be one of: `all`, `maintainer`, or `member`
         * @param {object} options - Parameters for adding a team member
         * @param {string} [options.role=member] - The role that this user should have in the team. Can be one
         * of: `member`, or `maintainer`
         * @param {Requestable.callback} [cb] - will receive the membership status of added user
         * @return {Promise} - the promise for the http request
         */
        addMembership(username: string, options: { role: string }, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Get repo management status for team
         * @see https://developer.github.com/v3/orgs/teams/#remove-team-membership
         * @param {string} owner - Organization name
         * @param {string} repo - Repo name
         * @param {Requestable.callback} [cb] - will receive the membership status of added user
         * @return {Promise} - the promise for the http request
         */
        isManagedRepo(owner: string, repo: string, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Add or Update repo management status for team
         * @see https://developer.github.com/v3/orgs/teams/#add-or-update-team-repository
         * @param {string} owner - Organization name
         * @param {string} repo - Repo name
         * @param {object} options - Parameters for adding or updating repo management for the team
         * @param {string} [options.permission] - The permission to grant the team on this repository. Can be one
         * of: `pull`, `push`, or `admin`
         * @param {Requestable.callback} [cb] - will receive the membership status of added user
         * @return {Promise} - the promise for the http request
         */
        manageRepo(owner: string, repo: string, options: { permission: string }, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Remove repo management status for team
         * @see https://developer.github.com/v3/orgs/teams/#remove-team-repository
         * @param {string} owner - Organization name
         * @param {string} repo - Repo name
         * @param {Requestable.callback} [cb] - will receive the membership status of added user
         * @return {Promise} - the promise for the http request
         */
        unmanageRepo(owner: string, repo: string, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Delete Team
         * @see https://developer.github.com/v3/orgs/teams/#delete-team
         * @param {Requestable.callback} [cb] - will receive the list of repositories
         * @return {Promise} - the promise for the http request
         */
        deleteTeam(cb?: Requestable.callback): Promise<any>;
        
    }
    
    /**
     * A User allows scoping of API requests to a particular Github user.
     */
    class User {
        /**
         * A User allows scoping of API requests to a particular Github user.
         */
        constructor(username?: string, auth?: Requestable.auth, apiBase?: string);
        
        /**
         * Get the url for the request. (dependent on if we're requesting for the authenticated user or not)
         * @private
         * @param {string} endpoint - the endpoint being requested
         * @return {string} - the resolved endpoint
         */
        private __getScopedUrl(endpoint: string): string;
        
        /**
         * List the user's repositories
         * @see https://developer.github.com/v3/repos/#list-user-repositories
         * @param {Object} [options={}] - any options to refine the search
         * @param {Requestable.callback} [cb] - will receive the list of repositories
         * @return {Promise} - the promise for the http request
         */
        listRepos(options?: Object, cb?: Requestable.callback): Promise<any>;
        
        /**
         * List the orgs that the user belongs to
         * @see https://developer.github.com/v3/orgs/#list-user-organizations
         * @param {Requestable.callback} [cb] - will receive the list of organizations
         * @return {Promise} - the promise for the http request
         */
        listOrgs(cb?: Requestable.callback): Promise<any>;
        
        /**
         * List the user's gists
         * @see https://developer.github.com/v3/gists/#list-a-users-gists
         * @param {Requestable.callback} [cb] - will receive the list of gists
         * @return {Promise} - the promise for the http request
         */
        listGists(cb?: Requestable.callback): Promise<any>;
        
        /**
         * List the user's notifications
         * @see https://developer.github.com/v3/activity/notifications/#list-your-notifications
         * @param {Object} [options={}] - any options to refine the search
         * @param {Requestable.callback} [cb] - will receive the list of repositories
         * @return {Promise} - the promise for the http request
         */
        listNotifications(options?: Object, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Show the user's profile
         * @see https://developer.github.com/v3/users/#get-a-single-user
         * @param {Requestable.callback} [cb] - will receive the user's information
         * @return {Promise} - the promise for the http request
         */
        getProfile(cb?: Requestable.callback): Promise<any>;
        
        /**
         * Gets the list of starred repositories for the user
         * @see https://developer.github.com/v3/activity/starring/#list-repositories-being-starred
         * @param {Requestable.callback} [cb] - will receive the list of starred repositories
         * @return {Promise} - the promise for the http request
         */
        listStarredRepos(cb?: Requestable.callback): Promise<any>;
        
        /**
         * Have the authenticated user follow this user
         * @see https://developer.github.com/v3/users/followers/#follow-a-user
         * @param {string} username - the user to follow
         * @param {Requestable.callback} [cb] - will receive true if the request succeeds
         * @return {Promise} - the promise for the http request
         */
        follow(username: string, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Have the currently authenticated user unfollow this user
         * @see https://developer.github.com/v3/users/followers/#follow-a-user
         * @param {string} username - the user to unfollow
         * @param {Requestable.callback} [cb] - receives true if the request succeeds
         * @return {Promise} - the promise for the http request
         */
        unfollow(username: string, cb?: Requestable.callback): Promise<any>;
        
        /**
         * Create a new repository for the currently authenticated user
         * @see https://developer.github.com/v3/repos/#create
         * @param {object} options - the repository definition
         * @param {Requestable.callback} [cb] - will receive the API response
         * @return {Promise} - the promise for the http request
         */
        createRepo(options: Object, cb?: Requestable.callback): Promise<any>;
        
    }
    namespace GitHub {}
    export = GitHub;
}
