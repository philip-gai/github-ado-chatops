import { Context } from "probot"
import { env } from "process";

export class Config {
    static defaultAppConfig: IAppConfig = {
        ado_instance: 'dev.azure.com',
        ado_org: '',
        ado_pat: '',
        ado_pat_secret_name: 'ADO_PAT',
        ado_project: '',
        ado_repo: ''
    }
    appConfig: IAppConfig = Config.defaultAppConfig;

    private constructor(appConfig: IAppConfig) {
        this.appConfig = appConfig;
    }

    static async build(context: Context<any>) {
        const loadedConfig = await this.loadConfig(context);
        const config = Config.mergeDefaults(loadedConfig);
        const errorMessages = Config.validateConfig(config);
        if (errorMessages.length > 0) {
            const errorStr = errorMessages.join('\n');
            context.log.error(errorStr);
            throw new Error(errorStr);
        }
        if (config.ado_pat_secret_name) {
            config.ado_pat = await Config.getSecret(/*config.ado_pat_secret_name, config.ado_org, config.ado_repo, context*/);
            if (!config.ado_pat) {
                context.log.error(`No repo secret named ${config.ado_pat_secret_name} was found`);
                throw new Error(`No repo secret named ${config.ado_pat_secret_name} was found`);
            }
        }
        return new Config(config);
    }

    private static mergeDefaults(loadedConfig: IAppConfig): IAppConfig {
        return {
            ado_instance: loadedConfig.ado_instance || Config.defaultAppConfig.ado_instance,
            ado_org: loadedConfig.ado_org,
            ado_pat: loadedConfig.ado_pat,
            ado_pat_secret_name: loadedConfig.ado_pat_secret_name || Config.defaultAppConfig.ado_pat_secret_name,
            ado_project: loadedConfig.ado_project,
            ado_repo: loadedConfig.ado_repo
        };
    }

    private static validateConfig(config: IAppConfig | undefined): string[] {
        let errorMessages: string[] = [];
        if (!config) {
            errorMessages.push('No config was found. Please put a config in your repo under .github/github-ado-chatops.yml');
        } else {
            // There are better ways to do this but I'm being lazy
            if (!config.ado_instance) errorMessages.push('No ado_org was found. Please add it to the app config in .github/github-ado-chatops.yml');
            if (!config.ado_org) errorMessages.push('No ado_org was found. Please add it to the app config in .github/github-ado-chatops.yml');
            if (!config.ado_pat_secret_name) errorMessages.push('No ado_pat_secret_name was found. Please add it to the app config in .github/github-ado-chatops.yml');
            if (!config.ado_project) errorMessages.push('No ado_project was found. Please add it to the app config in .github/github-ado-chatops.yml');
            if (!config.ado_repo) errorMessages.push('No ado_repo was found. Please add it to the app config in .github/github-ado-chatops.yml');
        }
        return errorMessages;
    }

    private static loadConfig = async (context: Context<any>) => {
        try {
            let loadedConfig =
                await context.config<IAppConfig>('github-ado-chatops.yml') ||
                await context.config<IAppConfig>('github-ado-chatops.yaml');
            return loadedConfig || Config.defaultAppConfig;
        } catch (e: any) {
            context.log.error(`Exception while parsing app config yaml: ${e.message}`);
            throw new Error(`Exception while parsing app config yaml: ${e.message}`);
        }
    }

    // NOTE: This is misleading - this does not get the secret value at any point
    private static async getSecret(/*secretName: string, org: string, repo: string, context: Context<any>*/): Promise<string> {
        // const response = await context.octokit.rest.actions.getRepoSecret({
        //     owner: org,
        //     repo: repo,
        //     secret_name: secretName
        // });
        // return response.data.name;
        return env.ADO_PAT || '';
    }
}

export interface IAppConfig {
    ado_instance: string
    ado_org: string;
    ado_project: string;
    ado_repo: string;
    ado_pat_secret_name: string;
    ado_pat: string;
}