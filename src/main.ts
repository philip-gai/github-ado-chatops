import * as core from '@actions/core';
import * as github from '@actions/github';
import { ChatOpService } from './chatOpService';

async function run(): Promise<void> {
  try {
    const context = github.context;

    const ado_domain = core.getInput('ado_domain');
    const ado_org = core.getInput('ado_org');
    const ado_project = core.getInput('ado_project');
    const ado_repo = core.getInput('ado_repo');
    const ado_pat = core.getInput('ado_pat');

    // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    core.debug(`ado_domain: ${ado_domain}!`);
    core.debug(`ado_org: ${ado_org}!`);
    core.debug(`ado_project: ${ado_project}!`);
    core.debug(`ado_repo: ${ado_repo}!`);
    core.debug(`ado_pat: ${ado_pat}!`);

    if (context.eventName === 'issue_comment.created') {
      const chatOpService = await ChatOpService.build(context);
      chatOpService.tryCreateBranch(context);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
