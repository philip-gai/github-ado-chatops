import * as core from '@actions/core';
import { AppConfig } from './appConfig';

export class ConfigService {
  readonly appConfig: AppConfig;

  private constructor(appConfig: AppConfig) {
    this.appConfig = appConfig;
  }

  static async build(): Promise<ConfigService> {
    const config = this.loadConfig();
    const errorMessages = ConfigService.validateConfig(config);
    if (errorMessages.length > 0) {
      const errorStr = errorMessages.join('\n');
      core.error(errorStr);
      throw new Error(errorStr);
    }
    return new ConfigService(config);
  }

  private static loadConfig = (): AppConfig => {
    const ado_domain = core.getInput('ado_domain');
    const ado_org = core.getInput('ado_org');
    const ado_project = core.getInput('ado_project');
    const ado_repo = core.getInput('ado_repo');
    const ado_pat = core.getInput('ado_pat');
    const github_token = core.getInput('github_token');
    const default_source_branch = core.getInput('default_source_branch');
    const default_target_branch_type = core.getInput('default_target_branch_type');

    // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    core.info(`ado_domain: ${ado_domain}`);
    core.info(`ado_org: ${ado_org}`);
    core.info(`ado_project: ${ado_project}`);
    core.info(`ado_repo: ${ado_repo}`);
    core.info(`ado_pat: ${ado_pat != null ? '*******' : ''}`);
    core.info(`github_token: ${github_token != null ? '*******' : ''}`);
    core.info(`default_source_branch: ${default_source_branch}`);
    core.info(`github_token: ${default_target_branch_type}`);

    return {
      ado_domain,
      ado_org,
      ado_project,
      ado_repo,
      ado_pat,
      github_token,
      default_source_branch,
      default_target_branch_type
    };
  };

  private static validateConfig(config: AppConfig): string[] {
    const errorMessages: string[] = [];
    // There are better ways to do this but I'm being lazy
    if (!config.ado_domain) errorMessages.push('No ado_org was found. Check your inputs');
    if (!config.ado_org) errorMessages.push('No ado_org was found. Check your inputs');
    if (!config.ado_pat) errorMessages.push('No ado_pat was found. Check your inputs');
    if (!config.ado_project) errorMessages.push('No ado_project was found. Check your inputs');
    if (!config.ado_repo) errorMessages.push('No ado_repo was found. Check your inputs');
    if (!config.github_token) errorMessages.push('No github_token was found. Check your inputs');
    return errorMessages;
  }
}
