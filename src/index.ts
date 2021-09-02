import { Probot } from "probot";
import { IssueCommentHandler } from "./issueCommentHandler";

export = (app: Probot) => {
  app.on("issue_comment.created", IssueCommentHandler.onCreated);
};
