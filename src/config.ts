import * as core from '@actions/core';

export class Config {
  static defaultAppConfig: IAppConfig = {
    ado_domain: 'dev.azure.com',
    ado_org: '',
    ado_pat: '',
    ado_project: '',
    ado_repo: ''
  };
  appConfig: IAppConfig = Config.defaultAppConfig;

  private constructor(appConfig: IAppConfig) {
    this.appConfig = appConfig;
  }

  static async build(): Promise<Config> {
    const loadedConfig = this.loadConfig();
    const config = Config.mergeDefaults(loadedConfig);
    const errorMessages = Config.validateConfig(config);
    if (errorMessages.length > 0) {
      const errorStr = errorMessages.join('\n');
      core.error(errorStr);
      throw new Error(errorStr);
    }
    return new Config(config);
  }

  private static mergeDefaults(loadedConfig: IAppConfig): IAppConfig {
    return {
      ado_domain: loadedConfig.ado_domain || Config.defaultAppConfig.ado_domain,
      ado_org: loadedConfig.ado_org,
      ado_pat: loadedConfig.ado_pat,
      ado_project: loadedConfig.ado_project,
      ado_repo: loadedConfig.ado_repo
    };
  }

  private static validateConfig(config: IAppConfig): string[] {
    const errorMessages: string[] = [];
    // There are better ways to do this but I'm being lazy
    if (!config.ado_domain) errorMessages.push('No ado_org was found. Check your inputs');
    if (!config.ado_org) errorMessages.push('No ado_org was found. Check your inputs');
    if (!config.ado_pat) errorMessages.push('No ado_pat was found. Check your inputs');
    if (!config.ado_project) errorMessages.push('No ado_project was found. Check your inputs');
    if (!config.ado_repo) errorMessages.push('No ado_repo was found. Check your inputs');
    return errorMessages;
  }

  private static loadConfig = (): IAppConfig => {
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

    return {
      ado_domain,
      ado_org,
      ado_project,
      ado_repo,
      ado_pat
    };
  };
}

export interface IAppConfig {
  ado_domain: string;
  ado_org: string;
  ado_project: string;
  ado_repo: string;
  ado_pat: string;
}
