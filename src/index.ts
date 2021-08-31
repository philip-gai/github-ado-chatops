import { Probot } from "probot";
// import { Config } from "./config";
import { IssueCommentHandler } from "./issueCommentHandler";

export = (app: Probot) => {
  // For when config is needed
  // const config = new Config();
  
  // Create handlers and register event listeners
  new IssueCommentHandler().registerEventListeners(app);

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
