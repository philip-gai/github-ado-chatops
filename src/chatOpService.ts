import { CommentExpandOptions } from "azure-devops-node-api/interfaces/CommentsInterfaces";
import { Probot, Context } from "probot";
import { TextEncoder } from "util";
import { AzureDevOpsClient } from "./azureDevOpsClient";

export class ChatOpService {
    private static createBranchChatOpCommands = ['/create-branch-ado', '/cb-ado']

    private _adoClient: AzureDevOpsClient;

    private _app: Probot;

    private static usernameParameter = 'username';

    private static branchParameter = 'branch';

    // Maximum number of bytes in a git branch is 250
    // Therefore, trim branch name to 62 characters (assuming 32-bit/4-byte Unicode) => 238 bytes
    // (https://stackoverflow.com/questions/60045157/what-is-the-maximum-length-of-a-github-branch-name)
    maxNumOfChars = 62;
    static sourceBranch: string;

    constructor(app: Probot, adoClient: AzureDevOpsClient) {
        this._adoClient = adoClient;
        this._app = app;
    }

    private static containsChatOpCommand(comment: string, chatOps: string[]) {
        return chatOps.includes(comment.trim());
    }

    async tryCreateBranch(comment: string, context: Context<any>): Promise<boolean> {
        // Check if the comment contains any createBranchChatCommands
        this._app.log.info(comment.trim());
        if(!ChatOpService.containsChatOpCommand(comment, ChatOpService.createBranchChatOpCommands)) {
            this._app.log.info(`Comment ${context.payload.comment.url} does not contain createBranchChatOps`)
            return false;
        }

        let username = context.payload.comment.username;
        let sourceBranch = 'master'; //TODO: make this configurable for a default other than master

        // Check for username parameter
        if (comment.includes(ChatOpService.usernameParameter))
        {
            username = this.parseParameter(comment, ChatOpService.usernameParameter);
        }

        // Check for branch parameter
        if (comment.includes(ChatOpService.branchParameter))
        {
            sourceBranch = this.parseParameter(comment, ChatOpService.branchParameter);
        }

        // Build the branch name from the issue title
        const branchName = this.createBranchName(username, context.payload.issue.number, context.payload.issue.title);
        
        // Create the branch in ADO
        // TODO: Implement branching from a different source branch other than master
        this._adoClient.createBranch(branchName, sourceBranch);

        // Create a comment with a link to the newly created branch
        const result = `[Branch ${branchName}](url) has been created in Azure DevOps`
        
        const issue = context.issue();
        await context.octokit.issues.createComment({
            issue_number: issue.issue_number as number,
            owner: issue.owner,
            repo: issue.repo,
            body: result
         });
        
        return true;
    }

    createBranchName(username: string, issueNum: string, issueTitle :string): string {
        let branchString = issueNum + '-' + issueTitle;

        branchString = `users/${this.makeGitSafe(username)}/${this.makeGitSafe(branchString)}`;
        
        return branchString.substr(0, this.maxNumOfChars);
    }

    makeGitSafe (s: string ) :string {
        const replacementChar = '-';
        const regexp = /(?![-/])[\W]+/g;
        const result = s.replace(regexp, replacementChar).replace(/[/]+$/, '');
   
        return result;
      }

    parseParameter(comment: string, parameter: string) : string {
        let commentArr = comment.trim().split(' ');
        let paramIdx = commentArr.findIndex(x => x == parameter);
        // Check we're still in bounds
        if ((paramIdx+1) < commentArr.length) 
        {
            return commentArr[paramIdx+1];
        }
        // TODO: throw error?
        return '';
        
    }
}