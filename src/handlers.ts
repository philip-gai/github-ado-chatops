import * as core from '@actions/core';
import { Octokit } from '@octokit/rest';
import { IssueCommentEvent } from '@octokit/webhooks-definitions/schema';
import { AzureDevOpsService } from './azureDevOpsService';
import { context } from '@actions/github/lib/utils';
import { ChatOpService } from './chatOpService';
import { ChatOpCommand, ChatOpParam, ParamValueMap } from './chatOps';

export const issueCommentHandler = async (octokit: Octokit, chatOpService: ChatOpService, azureDevOpsService: AzureDevOpsService): Promise<string> => {
  let resultMessage = '';
  const issueCommentPayload = context.payload as IssueCommentEvent;
  if (issueCommentPayload.action === 'created') {
    const comment = issueCommentPayload.comment.body;
    let updatedComment = comment;
    core.debug(`Comment: ${comment}`);
    const chatOpCommand = getChatOpCommand(chatOpService, comment);

    if (chatOpCommand === 'None') {
      core.info('Done.');
      process.exit(core.ExitCode.Success);
    }

    updatedComment += '\n1. Creating the branch in ADO...';

    await octokit.rest.issues.updateComment({
      ...context.issue,
      comment_id: issueCommentPayload.comment.id,
      body: updatedComment
    });

    const params = getParameters(chatOpService, chatOpCommand, comment);

    resultMessage = await azureDevOpsService.createBranch({
      issueNumber: issueCommentPayload.issue.number,
      issueTitle: issueCommentPayload.issue.title,
      username: params['-username'] || issueCommentPayload.sender.login,
      sourceBranch: params['-branch'],
      branchType: params['-type']
    });

    updatedComment += `\n1. ${resultMessage}`;

    await octokit.rest.issues.updateComment({
      ...context.issue,
      comment_id: issueCommentPayload.comment.id,
      body: updatedComment
    });
  }
  return resultMessage;
};

function getChatOpCommand(chatOpService: ChatOpService, comment: string): ChatOpCommand {
  core.info('Checking for ChatOp command...');
  const chatOpCommand = chatOpService.getChatOpCommand(comment);
  core.info(`Found ChatOp: ${chatOpCommand}`);
  return chatOpCommand;
}

function getParameters(chatOpService: ChatOpService, chatOpCommand: ChatOpCommand, comment: string): ParamValueMap {
  core.info('Getting parameters...');
  const paramValues = chatOpService.getParameterValues(chatOpCommand, comment);
  for (const key of Object.keys(paramValues)) {
    const value = paramValues[key as ChatOpParam];
    core.info(`Found ${key} ${value}`);
  }
  return paramValues;
}
