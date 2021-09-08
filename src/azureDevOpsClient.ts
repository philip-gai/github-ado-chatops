import * as azdev from 'azure-devops-node-api';
import * as core from '@actions/core';
import { ConfigService } from './configService';
import { GitRefUpdate, GitRefUpdateResult, GitRepository } from 'azure-devops-node-api/interfaces/GitInterfaces';
import { CreateBranchOptions } from './azureDevOpsService';
import { IGitApi } from 'azure-devops-node-api/GitApi';
import { AppConfig } from './appConfig';

export class AzureDevOpsClient {
  private _appConfig: AppConfig = ConfigService.defaultAppConfig;
  private _azDevClient: azdev.WebApi;

  private constructor(appConfig: AppConfig, azDevClient: azdev.WebApi) {
    this._appConfig = appConfig;
    this._azDevClient = azDevClient;
  }

  static async build(configService: ConfigService): Promise<AzureDevOpsClient> {
    const appConfig = configService.appConfig;
    const orgUrl = `https://${appConfig.ado_domain}/${appConfig.ado_org}`;
    const authHandler = azdev.getPersonalAccessTokenHandler(appConfig.ado_pat);
    const azDevClient = new azdev.WebApi(orgUrl, authHandler);
    return new AzureDevOpsClient(appConfig, azDevClient);
  }

  async createBranch(branchName: string, options: CreateBranchOptions): Promise<GitRefUpdateResult> {
    try {
      core.info('Getting the ADO git API...');
      const gitClient = await this._azDevClient.getGitApi();
      core.info('Got it.');
      core.info('Getting the repo...');
      const repo = await this.getRepo(gitClient);
      core.info('Got it.');

      let sourceBranch = options.sourceBranch || this._appConfig.default_source_branch;
      if (!sourceBranch) {
        core.info('Getting the default branch in ADO...');
        sourceBranch = this.getDefaultBranch(repo);
        core.info('Got it.');
      }
      const result = await this.createBranchInner(branchName, sourceBranch, gitClient, repo);
      return result;
    } catch (error: unknown) {
      core.error(`Failed to create branch: ${branchName}`);
      throw new Error(`Failed to create branch: ${branchName}`);
    }
  }

  async deleteBranch(refName?: string, refObjectId?: string): Promise<GitRefUpdateResult> {
    const gitClient = await this._azDevClient.getGitApi();

    const gitRefUpdates: GitRefUpdate[] = [
      {
        oldObjectId: refObjectId,
        newObjectId: new Array(41).join('0'),
        name: refName
      }
    ];

    // create a new branch from the source
    const updateResults = await gitClient.updateRefs(gitRefUpdates, this._appConfig.ado_repo, this._appConfig.ado_project);
    const refDeleteResult = updateResults[0];

    return refDeleteResult;
  }

  private async createBranchInner(branchName: string, sourceBranch: string, gitClient: IGitApi, repo: GitRepository): Promise<GitRefUpdateResult> {
    core.debug(`Creating branch from ${sourceBranch}.`);

    core.debug(`Getting ${sourceBranch} refs...`);
    const gitRefs = await gitClient.getRefs(repo.id as string, this._appConfig.ado_project, sourceBranch);
    const sourceRef = gitRefs[0];
    core.debug("Got 'em.");

    const gitRefUpdates: GitRefUpdate[] = [
      {
        oldObjectId: new Array(41).join('0'),
        newObjectId: sourceRef.objectId,
        name: `refs/heads/${branchName}`
      }
    ];

    // create a new branch from the source
    core.debug('Creating the new branch...');
    const updateResults = await gitClient.updateRefs(gitRefUpdates, this._appConfig.ado_repo, this._appConfig.ado_project);
    const refCreateResult = updateResults[0];

    return refCreateResult;
  }

  private getDefaultBranch(repo: GitRepository): string {
    const defaultBranch = repo.defaultBranch?.replace('refs/', '');
    if (!defaultBranch) {
      core.error(`${defaultBranch} does not exist`);
      throw new Error(`${defaultBranch} does not exist`);
    }
    return defaultBranch;
  }

  private async getRepo(gitClient: IGitApi): Promise<GitRepository> {
    const repo = await gitClient.getRepository(this._appConfig.ado_repo, this._appConfig.ado_project);
    if (!repo.id) {
      core.error(`Repo ${this._appConfig.ado_repo} does not exist in project ${this._appConfig.ado_project}`);
      throw new Error(`Repo ${this._appConfig.ado_repo} does not exist in project ${this._appConfig.ado_project}`);
    }
    return repo;
  }
}
