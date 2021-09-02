import * as azdev from "azure-devops-node-api";
import { IGitApi } from "azure-devops-node-api/GitApi";
import { GitRepository, GitRefUpdate, GitRefUpdateResult } from "azure-devops-node-api/interfaces/GitInterfaces";
import { Context } from "probot";
import { Config, IAppConfig } from "./config";

export class AzureDevOpsClient {

    private _appConfig: IAppConfig = Config.defaultAppConfig;
    private _context: Context<any>;
    private _azDevClient: azdev.WebApi;

    private constructor(context: Context<any>, appConfig: IAppConfig, azDevClient: azdev.WebApi) {
        this._context = context;
        this._appConfig = appConfig;
        this._azDevClient = azDevClient;
    }

    static async build(context: Context<any>): Promise<AzureDevOpsClient> {
        const appConfig = (await new Config().build(context)).appConfig;
        const orgUrl = `https://${appConfig.ado_instance}/${appConfig.ado_org}`;
        const authHandler = azdev.getPersonalAccessTokenHandler(appConfig.ado_pat);
        const azDevClient = new azdev.WebApi(orgUrl, authHandler);
        return new AzureDevOpsClient(context, appConfig, azDevClient);
    }

    async createBranch(branchName: string, sourceBranch?: string): Promise<GitRefUpdateResult> {
        try {
            this._context.log.debug('Getting the ADO git API...');
            const gitClient = await this._azDevClient.getGitApi();
            this._context.log.debug('Getting repo...');
            const repo = await this.getRepo(gitClient);
            this._context.log.debug('Got it.');

            let sourceBranchFinal = sourceBranch;
            if (!sourceBranchFinal) {
                this._context.log.debug('Getting the default branch in ADO...');
                sourceBranchFinal = this.getDefaultBranch(repo);
                this._context.log.debug('Got it...');
            }
            const result = await this.createBranchInner(gitClient, repo, sourceBranchFinal, branchName);
            return result;
        }
        catch (error: any) {
            this._context.log.error(`POST to create branch [${branchName}] has failed`);
            throw new Error(`POST to create branch [${branchName}] has failed`);
        }
    }

    async deleteBranch(refName?: string, refObjectId?: string) {
        const gitClient = await this._azDevClient.getGitApi();

        const gitRefUpdates: GitRefUpdate[] = [
            {
                oldObjectId: refObjectId,
                newObjectId: new Array(41).join('0'),
                name: refName
            }
        ];

        // create a new branch from the source
        const updateResults = await gitClient.updateRefs(
            gitRefUpdates,
            this._appConfig.ado_repo,
            this._appConfig.ado_project
        );
        const refDeleteResult = updateResults[0];

        return refDeleteResult;
    }

    getBranchUrl(branchName: string) {
        const uriEncodedBranchName = encodeURIComponent(branchName);
        return `https://${this._appConfig.ado_instance}/${this._appConfig.ado_org}/${this._appConfig.ado_project}/_git/${this._appConfig.ado_repo}?version=GB${uriEncodedBranchName}`;
    }

    private async createBranchInner(gitClient: IGitApi, repo: GitRepository, sourceBranch: string, branchName: string) {
        this._context.log.debug(`Creating branch from ${sourceBranch}.`);

        this._context.log.debug(`Getting ${sourceBranch} refs...`);
        const gitRefs = await gitClient.getRefs(repo.id as string, this._appConfig.ado_project, sourceBranch);
        const sourceRef = gitRefs[0];
        this._context.log.debug("Got 'em.");

        const gitRefUpdates: GitRefUpdate[] = [
            {
                oldObjectId: new Array(41).join('0'),
                newObjectId: sourceRef.objectId,
                name: `refs/heads/${branchName}`
            }
        ];

        // create a new branch from the source
        this._context.log.debug("Creating the branch...");
        const updateResults = await gitClient.updateRefs(
            gitRefUpdates,
            this._appConfig.ado_repo,
            this._appConfig.ado_project
        );
        const refCreateResult = updateResults[0];

        this._context.log.info(`project ${this._appConfig.ado_project}, repo ${repo.name}, source branch ${sourceRef.name}`);
        this._context.log.info(`new branch ${refCreateResult.name} (success=${refCreateResult.success} status=${refCreateResult.updateStatus})`);

        return refCreateResult;
    }

    private getDefaultBranch(repo: GitRepository) {
        const defaultBranch = repo.defaultBranch?.replace('refs/', '');
        if (!defaultBranch) {
            console.error(`${defaultBranch} does not exist`);
            throw new Error(`${defaultBranch} does not exist`);
        }
        return defaultBranch;
    }

    private async getRepo(gitClient: IGitApi) {
        const repo = await gitClient.getRepository(this._appConfig.ado_repo, this._appConfig.ado_project);
        if (!repo.id) {
            console.error(`Repo ${this._appConfig.ado_repo} does not exist in project ${this._appConfig.ado_project}`);
            throw new Error(`Repo ${this._appConfig.ado_repo} does not exist in project ${this._appConfig.ado_project}`);
        }
        return repo;
    }
}