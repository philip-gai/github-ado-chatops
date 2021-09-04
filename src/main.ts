import * as core from '@actions/core';
import { context } from '@actions/github/lib/utils';
import { ChatOpService } from './chatOpService';

async function run(): Promise<void> {
  core.info('Running GitHub <> ADO ChatOps...');
  try {
    core.info(`Event: ${context.eventName}`);

    if (context.eventName === 'issue_comment.created') {
      const chatOpService = await ChatOpService.build(context);
      chatOpService.tryCreateBranch(context);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
