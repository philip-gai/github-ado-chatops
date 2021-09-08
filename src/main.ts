import * as core from '@actions/core';
import * as github from '@actions/github';
import { ActionEvent } from './actionEvent';
import { AzureDevOpsService } from './azureDevOpsService';
import { ChatOpService } from './chatOpService';
import { ConfigService } from './configService';
import { Octokit } from '@octokit/rest';
import { context } from '@actions/github/lib/utils';
import { issueCommentHandler } from './handlers';

async function run(): Promise<void> {
  try {
    core.info('Running GitHub <> ADO ChatOps...');
    core.info(`Event: ${context.eventName}`);
    core.info(`Action: ${context.payload.action || 'Unknown'}`);

    core.info('Initializaing services...');
    const configService = await ConfigService.build();

    const octokit = github.getOctokit(configService.appConfig.github_token) as Octokit;

    const chatOpService = ChatOpService.build();
    const azureDevOpsService = await AzureDevOpsService.build(configService);
    core.info('Done.');

    let resultMessage = '';
    if ((context.eventName as ActionEvent) === 'issue_comment') {
      resultMessage = await issueCommentHandler(octokit, chatOpService, azureDevOpsService);
    }
    core.info(resultMessage);
  } catch (error: unknown) {
    let errorMessage = 'An unknown error has occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    core.setFailed(errorMessage);
  }
}

run();
