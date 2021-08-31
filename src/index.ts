import { Probot } from "probot";
import { AzureDevOpsClient } from "./azureDevOpsClient";
import { ChatOpService } from "./chatOpService";
import { Config } from "./config";
import { IssueCommentHandler } from "./issueCommentHandler";

export = (app: Probot) => {
  // Initialize Services
  const config = new Config();
  const adoClient = new AzureDevOpsClient(app, config.ado);
  const chatOpService = new ChatOpService(app, adoClient);
  
  // Create handlers and register event listeners
  new IssueCommentHandler(chatOpService).registerEventListeners(app);
};
