import * as azdev from "azure-devops-node-api";
import { IGitApi } from "azure-devops-node-api/GitApi";
import { GitRepository, GitRefUpdate } from "azure-devops-node-api/interfaces/GitInterfaces";
import { Probot } from "probot";
import { ADOConfig } from "./config";

export class AzureDevOpsClient {

    private _connection: azdev.WebApi;
    private _config: ADOConfig;
    private _app: Probot;

    constructor(app: Probot, config: ADOConfig) {
        this._config = config;
        this._app = app;

        const orgUrl = `https://${config.instance}/${config.organization}`;
        const authHandler = azdev.getPersonalAccessTokenHandler(config.pat); 
        this._connection = new azdev.WebApi(orgUrl, authHandler);
    }

    async createBranch(branchName: string, sourceBranch: string) {
        try{
            const gitClient = await this._connection.getGitApi();
            const repo = await this.getRepo(gitClient);
            const defaultBranch = this.getDefaultBranch(repo);
            const result = await this.createBranchInner(gitClient, repo, defaultBranch, branchName);
            return result;
        }
        catch (error)
        {
            this._app.log.error(`POST to create branch [${branchName}] has failed`);
            throw new Error(`POST to create branch [${branchName}] has failed`);
        }

        
    }

    async deleteBranch(refName?: string, refObjectId?: string) {
        const gitClient = await this._connection.getGitApi();

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
            this._config.repository,
            this._config.project
        );
        const refDeleteResult = updateResults[0];

        return refDeleteResult;    
    }

    getBranchUrl(branchName: string) {
        const uriEncodedBranchName = encodeURIComponent(branchName);
        return `https://${this._config.instance}/${this._config.organization}/${this._config.project}/_git/${this._config.repository}?version=GB${uriEncodedBranchName}`;
    }

    private async createBranchInner(gitClient: IGitApi, repo: GitRepository, defaultBranch: string, branchName: string) {
        const gitRefs = await gitClient.getRefs(repo.id as string, this._config.project, defaultBranch);
        const sourceRef = gitRefs[0];

        const gitRefUpdates: GitRefUpdate[] = [
            {
                oldObjectId: new Array(41).join('0'),
                newObjectId: sourceRef.objectId,
                name: `refs/heads/${branchName}`
            }
        ];

        // create a new branch from the source
        const updateResults = await gitClient.updateRefs(
            gitRefUpdates,
            this._config.repository,
            this._config.project
        );
        const refCreateResult = updateResults[0];

        this._app?.log.info(`project ${this._config.project}, repo ${repo.name}, source branch ${sourceRef.name}`);
        this._app?.log.info(`new branch ${refCreateResult.name} (success=${refCreateResult.success} status=${refCreateResult.updateStatus})`);

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
        const repo = await gitClient.getRepository(this._config.repository, this._config.project);
        if (!repo.id) {
            console.error(`Repo ${this._config.repository} does not exist in project ${this._config.project}`);
            throw new Error(`Repo ${this._config.repository} does not exist in project ${this._config.project}`);
        }
        return repo;
    }
}