import { Probot, Context } from "probot";
import { ChatOpService } from "./chatOpService";
import { EventPayloads } from "@octokit/webhooks"

export class IssueCommentHandler {
    private _chatOpService: ChatOpService;
    
    constructor() {
        this._chatOpService = new ChatOpService();
    }

    registerEventListeners = (app: Probot) => {
        app.on("issue_comment.created", this.onCreated);
    }

    private onCreated = async (context: Context<EventPayloads.WebhookPayloadIssueComment>) => {
        const issueComment = context.payload.comment.body;
        this._chatOpService.tryCreateBranch(issueComment, context);
    }
}