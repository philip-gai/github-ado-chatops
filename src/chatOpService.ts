import * as core from '@actions/core';
import * as github from '@actions/github';
import { Context } from '@actions/github/lib/context';
import { Octokit } from '@octokit/rest';
import { AzureDevOpsClient } from './azureDevOpsClient';

export class ChatOpService {
    private static createBranchChatOpCommands = ['/create-branch-ado', '/cb-ado'];

    private _adoClient: AzureDevOpsClient;

    private static usernameParameter = 'username';

    private static branchParameter = 'branch';

    // Maximum number of bytes in a git branch is 250
    // Therefore, trim branch name to 62 characters (assuming 32-bit/4-byte Unicode) => 238 bytes
    // (https://stackoverflow.com/questions/60045157/what-is-the-maximum-length-of-a-github-branch-name)
    maxNumOfChars = 62;
    static sourceBranch: string;
    private _octokit: Octokit;

    private constructor(octokit: Octokit, adoClient: AzureDevOpsClient) {
        this._octokit = octokit;
        this._adoClient = adoClient;
    }

    static async build(context: Context): Promise<ChatOpService> {
        const adoClient = await AzureDevOpsClient.build(context);
        const githubToken = core.getInput('GITHUB_TOKEN');
        const octokit = github.getOctokit(githubToken)
        return new ChatOpService(octokit, adoClient);
    }

    private static containsChatOpCommand(comment: string, chatOps: string[]): boolean {
        return chatOps.includes(comment.trim());
    }

    async tryCreateBranch(context: Context): Promise<boolean> {
        const comment = context.payload.comment?.body;

        // Check if the comment contains any createBranchChatCommands
        core.debug(comment.trim());
        if (!ChatOpService.containsChatOpCommand(comment.split(' ')[0], ChatOpService.createBranchChatOpCommands)) {
            core.debug(`Comment ${context.payload.comment?.url} does not contain createBranchChatOps`);
            return false;
        }

        let username = context.payload.comment?.user.login;
        core.debug(`username: ${username}`);

        // Check for username parameter
        if (comment.includes(ChatOpService.usernameParameter)) {
            username = this.parseParameter(comment, ChatOpService.usernameParameter);
        }

        // Check for branch parameter
        let sourceBranch: string | undefined;
        if (comment.includes(ChatOpService.branchParameter)) {
            sourceBranch = this.parseParameter(comment, ChatOpService.branchParameter);
        }

        // Build the branch name from the issue title
        const branchName = this.createBranchName(username, context.payload.issue?.number, context.payload.issue?.title);
        core.info(`built branch name string: ${branchName}`);

        const issue = context.issue;

        // Create the branch in ADO
        try {
            this._adoClient.createBranch(branchName, sourceBranch);
        } catch (e: any) {
            // Create a comment that a failure occured
            const errorMessage = `Branch [${branchName}] was unable to be created in Azure DevOps" ${e}`;
            core.error(errorMessage);

            await this._octokit.({
                issue_number: issue.number as number,
                owner: issue.owner,
                repo: issue.repo,
                body: errorMessage
            });
            return false;
        }

        // Create a comment with a link to the newly created branch
        const result = `Branch [${branchName}](${this._adoClient.getBranchUrl(branchName)}) has been created in Azure DevOps`;

        await this._octokit.rest.issues.createComment({
            issue_number: issue.number as number,
            owner: issue.owner,
            repo: issue.repo,
            body: result
        });

        return true;
    }

    createBranchName(username: string, issueNum?: number, issueTitle: string): string {
        let branchString = `${issueNum}-${issueTitle}`;
        branchString = `users/${this.makeGitSafe(username)}/${this.makeGitSafe(branchString)}`;
        return branchString.substr(0, this.maxNumOfChars);
    }

    makeGitSafe(s: string): string {
        const replacementChar = '-';
        const regexp = /(?![-/])[\W]+/g;
        const result = s.replace(regexp, replacementChar).replace(/[/]+$/, '');

        return result;
    }

    parseParameter(comment: string, parameter: string): string {
        const commentArr = comment.trim().split(' ');
        const paramIdx = commentArr.findIndex(x => x == parameter);
        // Check we're still in bounds
        if (paramIdx + 1 < commentArr.length) {
            return commentArr[paramIdx + 1];
        }
        // TODO: throw error?
        return '';
    }
}
