import * as core from '@actions/core';
import * as github from '@actions/github';
import { context } from '@actions/github/lib/utils';
import { ChatOpService } from './chatOpService';
import { IssueCommentEvent } from '@octokit/webhooks-definitions/schema';
import { ActionEvent } from './ActionEvent';
import { ChatOpCommand, ChatOpParam, ParamValueMap } from './ChatOps';
import { AzureDevOpsService } from './azureDevOpsService';
import { Octokit } from '@octokit/rest';
import { ConfigService } from './configService';

async function run(): Promise<void> {
  try {
    core.info('Running GitHub <> ADO ChatOps...');
    core.info(`Event: ${context.eventName}`);
    core.info(`Action: ${context.payload.action || 'Unknown'}`);

    core.info('Initializaing services...');
    const configService = await ConfigService.build();

    // This should be a token with access to your repository scoped in as a secret.
    // The YML workflow will need to set myToken with the GitHub Secret Token
    // github_token: ${{ secrets.GITHUB_TOKEN }}
    // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#about-the-github_token-secret
    const octokit = github.getOctokit(configService.appConfig.github_token) as Octokit;

    const chatOpService = ChatOpService.build();
    const azureDevOpsService = await AzureDevOpsService.build(configService);
    core.info('Done.');

    let resultMessage = '';

    if ((context.eventName as ActionEvent) === 'issue_comment') {
      const issueCommentPayload = context.payload as IssueCommentEvent;
      if (issueCommentPayload.action === 'created') {
        const comment = issueCommentPayload.comment.body;
        core.info(`Comment: ${comment}`);
        const chatOpCommand = getChatOpCommand(chatOpService, comment);
        const params = getParameters(chatOpService, chatOpCommand, comment);
        resultMessage = await azureDevOpsService.createBranch({
          issueNumber: issueCommentPayload.issue.number,
          issueTitle: issueCommentPayload.issue.title,
          username: params['-username'] || issueCommentPayload.sender.login,
          sourceBranch: params['-branch']
        });
        await octokit.rest.issues.createComment({
          owner: context.issue.owner,
          repo: context.issue.repo,
          issue_number: context.issue.number,
          body: resultMessage || 'There was nothing to do!'
        });
      }
    }
    core.info(resultMessage);
  } catch (error) {
    core.setFailed(error?.message || error || `An unknown error has occurred: ${error}`);
  }
}

function getChatOpCommand(chatOpService: ChatOpService, comment: string): ChatOpCommand {
  core.info('Checking for ChatOp command...');
  const chatOpCommand = chatOpService.getChatOpCommand(comment);
  if (chatOpCommand === 'None') {
    const error = 'No ChatOp was found';
    core.error(error);
    throw new Error(error);
  }
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

run();
