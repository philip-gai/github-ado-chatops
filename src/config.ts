import { env } from "process";

export class Config {
    readonly ado = {
        pat: env.ADO_PAT,
        organization: env.ADO_ORG,
        project: env.ADO_PROJECT,
        repository:  env.ADO_REPO
    }
}