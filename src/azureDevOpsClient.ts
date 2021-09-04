import { Context } from '@actions/github/lib/context';
import * as core from '@actions/core';
import * as azdev from 'azure-devops-node-api';
import { IGitApi } from 'azure-devops-node-api/GitApi';
import { GitRepository, GitRefUpdate, GitRefUpdateResult } from 'azure-devops-node-api/interfaces/GitInterfaces';
import { Config, IAppConfig } from './config';

export class AzureDevOpsClient {
  private _appConfig: IAppConfig = Config.defaultAppConfig;
  private _context: Context;
  private _azDevClient: azdev.WebApi;

  private constructor(context: Context, appConfig: IAppConfig, azDevClient: azdev.WebApi) {
    this._context = context;
    this._appConfig = appConfig;
    this._azDevClient = azDevClient;
  }

  static async build(context: Context): Promise<AzureDevOpsClient> {
    const appConfig = (await Config.build()).appConfig;
    const orgUrl = `https://${appConfig.ado_domain}/${appConfig.ado_org}`;
    core.debug(`orgUrl: ${orgUrl}`);
    const authHandler = azdev.getPersonalAccessTokenHandler(appConfig.ado_pat);
    const azDevClient = new azdev.WebApi(orgUrl, authHandler);
    return new AzureDevOpsClient(context, appConfig, azDevClient);
  }

  async createBranch(branchName: string, sourceBranch?: string): Promise<GitRefUpdateResult> {
    try {
      core.debug('Getting the ADO git API...');
      const gitClient = await this._azDevClient.getGitApi();
      core.debug('Getting repo...');
      const repo = await this.getRepo(gitClient);
      core.debug('Got it.');

      let sourceBranchFinal = sourceBranch;
      if (!sourceBranchFinal) {
        core.debug('Getting the default branch in ADO...');
        sourceBranchFinal = this.getDefaultBranch(repo);
        core.debug('Got it...');
      }
      const result = await this.createBranchInner(gitClient, repo, sourceBranchFinal, branchName);
      return result;
    } catch (error: unknown) {
      core.error(`POST to create branch [${branchName}] has failed`);
      throw new Error(`POST to create branch [${branchName}] has failed`);
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

  getBranchUrl(branchName: string): string {
    const uriEncodedBranchName = encodeURIComponent(branchName);
    return `https://${this._appConfig.ado_domain}/${this._appConfig.ado_org}/${this._appConfig.ado_project}/_git/${this._appConfig.ado_repo}?version=GB${uriEncodedBranchName}`;
  }

  private async createBranchInner(gitClient: IGitApi, repo: GitRepository, sourceBranch: string, branchName: string): Promise<GitRefUpdateResult> {
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
    core.debug('Creating the branch...');
    const updateResults = await gitClient.updateRefs(gitRefUpdates, this._appConfig.ado_repo, this._appConfig.ado_project);
    const refCreateResult = updateResults[0];

    core.info(`project ${this._appConfig.ado_project}, repo ${repo.name}, source branch ${sourceRef.name}`);
    core.info(`new branch ${refCreateResult.name} (success=${refCreateResult.success} status=${refCreateResult.updateStatus})`);

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
