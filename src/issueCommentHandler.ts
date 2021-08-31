import { Probot, Context } from "probot";
import { ChatOpService } from "./chatOpService";
import { EventPayloads } from "@octokit/webhooks"

export class IssueCommentHandler {
    private _chatOpService: ChatOpService;
    
    constructor(chatOpService: ChatOpService) {
        this._chatOpService = chatOpService;
    }

    registerEventListeners = (app: Probot) => {
        app.onAny(async (context) => {
            app.log.info({ event: context.name, action: context.payload.action });
          });
        
        //app.on("issues.opened", this.onCreated);
    }

    private onCreated = async (context: Context<EventPayloads.WebhookPayloadIssues >) => {
        const issueComment = context.payload.issue.body;
        this._chatOpService.tryCreateBranch(issueComment, context);
    }
}