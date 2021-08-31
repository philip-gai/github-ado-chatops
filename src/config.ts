export type EnvironmentVar = 'ADO_PAT' | 'ADO_ORG' | 'ADO_PROJECT' | 'ADO_REPO' | 'ADO_INSTANCE';
export interface ADOConfig {
    instance: string;
    organization: string;
    project: string;
    repository: string;
    pat: string;
}

export class Config {
    readonly ado: ADOConfig = {
        instance:  Config.getEnv('ADO_INSTANCE'),
        organization: Config.getEnv('ADO_ORG'),
        project: Config.getEnv('ADO_PROJECT'),
        repository:  Config.getEnv('ADO_REPO'),
        pat: Config.getEnv('ADO_PAT'),
    }

    static getEnv = (name: EnvironmentVar): string => {
        let val = process.env[name];
        if (!val) {
            console.error(`${name} env var not set`);
            process.exit(1);
        }
        return val;
    }
}