import { Probot, Context } from "probot";
import { ChatOpService } from "./chatOpService";
import { EventPayloads } from "@octokit/webhooks"
import { AzureDevOpsClient } from "./azureDevOpsClient";

export class IssueCommentHandler {
    static onCreated = async (context: Context<EventPayloads.WebhookPayloadIssueComment>) => {
        const chatOpService = await ChatOpService.build(context);
        chatOpService.tryCreateBranch(context);
    }
}