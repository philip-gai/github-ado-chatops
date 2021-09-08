import * as core from '@actions/core';
import { ConfigService } from './configService';
import { AzureDevOpsClient } from './azureDevOpsClient';
import { AppConfig } from './appConfig';

export interface CreateBranchOptions {
  issueNumber: number;
  issueTitle: string;
  username: string;
  sourceBranch?: string;
}

export class AzureDevOpsService {
  private _adoClient: AzureDevOpsClient;
  private _appConfig: AppConfig;

  // Maximum number of bytes in a git branch is 250
  // Therefore, trim branch name to 62 characters (assuming 32-bit/4-byte Unicode) => 238 bytes
  // (https://stackoverflow.com/questions/60045157/what-is-the-maximum-length-of-a-github-branch-name)
  private readonly maxNumOfChars = 62;

  private constructor(appConfig: AppConfig, adoClient: AzureDevOpsClient) {
    this._appConfig = appConfig;
    this._adoClient = adoClient;
  }

  static async build(configService: ConfigService): Promise<AzureDevOpsService> {
    const appConfig = configService.appConfig;
    const adoClient = await AzureDevOpsClient.build(configService);
    return new AzureDevOpsService(appConfig, adoClient);
  }

  async createBranch(options: CreateBranchOptions): Promise<string> {
    try {
      // Build the branch name from the issue title
      core.info('Building branch name...');
      const branchName = this.buildBranchName(options);
      core.info(`Branch name: ${branchName}`);

      this._adoClient.createBranch(branchName, options);

      // Create a comment with a link to the newly created branch
      const successMessage = `Branch [${branchName}](${this.getBranchUrl(branchName)}) has been created in Azure DevOps`;
      return successMessage;
    } catch (e: unknown) {
      const errorMessage = `Failed creating the branch in ADO: ${e}`;
      core.error(errorMessage);
      return errorMessage;
    }
  }

  private getBranchUrl(branchName: string): string {
    const uriEncodedBranchName = encodeURIComponent(branchName);
    return `https://${this._appConfig.ado_domain}/${this._appConfig.ado_org}/${this._appConfig.ado_project}/_git/${this._appConfig.ado_repo}?version=GB${uriEncodedBranchName}`;
  }

  private buildBranchName(options: CreateBranchOptions): string {
    const issueInfo = `${options.issueNumber}-${options.issueTitle.toLowerCase()}`;
    const branchName = `users/${this.makeGitSafe(options.username)}/${this.makeGitSafe(issueInfo)}`;
    return branchName.substr(0, this.maxNumOfChars);
  }

  private makeGitSafe(s: string): string {
    const replacementChar = '-';
    const regexp = /(?![-/])[\W]+/g;
    const result = s.replace(regexp, replacementChar).replace(/[/]+$/, '');
    return result;
  }
}
