import * as core from '@actions/core';
import * as github from '@actions/github';
import { ChatOpService } from './chatOpService';

async function run(): Promise<void> {
  try {
    const context = github.context;

    if (context.eventName === 'issue_comment.created') {
      const chatOpService = await ChatOpService.build(context);
      chatOpService.tryCreateBranch(context);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
