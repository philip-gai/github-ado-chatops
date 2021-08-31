import { Probot, Context } from "probot";
import { AzureDevOpsClient } from "./azureDevOpsClient";

export class ChatOpService {
    private static createBranchChatOpCommands = ['/create-branch-ado', '/cb-ado']

    private static containsChatOpCommand(comment: string, chatOps: string[]) {
        return chatOps.includes(comment.trim());
    }

    private _adoClient: AzureDevOpsClient;

    private _app: Probot;

    constructor(adoClient: AzureDevOpsClient, app: Probot) {
        this._adoClient = adoClient;
        this._app = app;
    }

    async tryCreateBranch(comment: string, context: Context<any>): Promise<boolean> {
        // Check if the comment contains any createBranchChatCommands
        this._app.log.info(comment.trim());
        if(!ChatOpService.containsChatOpCommand(comment, ChatOpService.createBranchChatOpCommands)) {
            this._app.log.info(`Comment ${context.payload.comment.url} does not contain createBranchChatOps`)
            return false;
        }
        // 2. If so, build the branch name from the issue title

        this._app.log.info(` number: ${context.payload.issue.number}, title: ${context.payload.issue.title} `);
        const branchName = this.createBranchName(context.payload.issue.number, context.payload.issue.title);
        this._app.log.info(` branch: ${branchName}`);
        // Convention: {issue#}-words-in-issue-title-separated-by-hyphen
        // Limit branch name length to 32 chars to be EXTRA safe (https://stackoverflow.com/questions/60045157/what-is-the-maximum-length-of-a-github-branch-name)
        
        // 3. Create the branch in ADO
        this._adoClient.createBranch(branchName);

        // 4. Create a comment with a link to the newly created branch
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

    createBranchName(issueNum: string, issueTitle :string): string {

        let returnString = 'users/mspletz/' + issueNum + '-' + issueTitle;
        const gitSafeString = this.makeGitSafe(returnString);
        return gitSafeString;
    }

    makeGitSafe (s: string ) :string{
        const replacementChar = '-';
        const regexp = /(?![-/])[\W]+/g;
        const result = s.replace(regexp, replacementChar).replace(/[/]+$/, '');
        return result;
        
        //return trim(result, replacementChar)
      }
}