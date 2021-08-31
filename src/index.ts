import { Probot } from "probot";
import { Config } from "./config";
import { IssueCommentHandler } from "./issueCommentHandler";

export = (app: Probot) => {
  const config = new Config();
  
  // Create handlers and register event listeners
  new IssueCommentHandler(config).registerEventListeners(app);

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
