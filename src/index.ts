import { Probot } from "probot";
import { AzureDevOpsClient } from "./azureDevOpsClient";
import { ChatOpService } from "./chatOpService";
import { Config } from "./config";
import { IssueCommentHandler } from "./issueCommentHandler";

export = (app: Probot) => {
  // For when config is needed
  const config = new Config();
  
  const adoClient = new AzureDevOpsClient(config.ado);
  const chatOpService = new ChatOpService(adoClient, app);
  
  // Create handlers and register event listeners
  new IssueCommentHandler(chatOpService).registerEventListeners(app);

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
