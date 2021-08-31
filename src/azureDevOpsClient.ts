import * as azdev from "azure-devops-node-api";
import { IGitApi } from "azure-devops-node-api/GitApi";
import { ADOConfig } from "./config";

export class AzureDevOpsClient {

    private _connection: azdev.WebApi;

    constructor(config: ADOConfig) {
        const orgUrl = `https://${config.instance}/${config.organization}`;
        const authHandler = azdev.getPersonalAccessTokenHandler(config.pat); 
        this._connection = new azdev.WebApi(orgUrl, authHandler);    
    }

    getGitApi = async (): Promise<IGitApi> => {
        return await this._connection.getGitApi();
    }

    createBranch(branchName: string) {
        throw new Error("Method not implemented.");
    }
}