import { BranchType } from './branchType';

export interface AppConfig {
  ado_domain: string;
  ado_org: string;
  ado_project: string;
  ado_repo: string;
  ado_pat: string;
  github_token: string;
  default_source_branch: string;
  default_target_branch_type: BranchType;
}
