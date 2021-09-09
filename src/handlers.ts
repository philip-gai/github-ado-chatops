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
      core.info('No ChatOp found');
      process.exit(core.ExitCode.Success);
    } else {
      core.info(`Found ChatOp: ${chatOpCommand}`);
    }

    updatedComment += '\n1. Creating the branch in ADO...';

    await octokit.rest.issues.updateComment({
      ...context.issue,
      comment_id: issueCommentPayload.comment.id,
      body: updatedComment
    });

    const params = getParameters(chatOpService, chatOpCommand, comment);

    try {
      resultMessage = await azureDevOpsService.createBranch({
        issueNumber: issueCommentPayload.issue.number,
        issueTitle: issueCommentPayload.issue.title,
        username: params['-username'] || issueCommentPayload.sender.login,
        sourceBranch: params['-branch'],
        branchType: params['-type']
      });
    } catch (error: unknown) {
      let errorMessage = 'Failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      resultMessage = errorMessage;
      core.setFailed(errorMessage);
    }

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
  core.debug('Checking for ChatOp command...');
  const chatOpCommand = chatOpService.getChatOpCommand(comment);
  return chatOpCommand;
}

function getParameters(chatOpService: ChatOpService, chatOpCommand: ChatOpCommand, comment: string): ParamValueMap {
  core.debug('Getting parameters...');
  const paramValues = chatOpService.getParameterValues(chatOpCommand, comment);
  for (const key of Object.keys(paramValues)) {
    const value = paramValues[key as ChatOpParam];
    core.debug(`Found ${key} ${value}`);
  }
  return paramValues;
}
