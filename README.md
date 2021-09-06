# Azure DevOps ChatOps - GitHub Action

Integrate GitHub with Azure DevOps via ChatOps. 🚀

https://user-images.githubusercontent.com/17363579/132158303-25ba1283-7ffa-49b5-a7ab-f93643f45a9d.mov

## ChatOp Commands

| Command | Aliases | Description | Options | Context |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| `/cb-ado`  | `/create-branch-ado` | Creates a branch in Azure DevOps using information from the issue.<br/>Default: `users/{githubUsername}/{issueNumber}-{issueName}-{issueTitle}`. | <ul><li>`-username`: The username to use in your branch name.<br/>Default: GitHub username</li><li>`-branch`: The branch to branch from.<br/>Default: The default branch set in ADO</li></ul> | Issues |

## Getting Started

### Prerequisites
1. An Azure DevOps account and repository ([Start one for free](https://azure.microsoft.com/en-us/services/devops/))

### Usage
1. Create a personal access token (PAT) for your ADO repository ([Use personal access tokens](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?toc=%2Fazure%2Fdevops%2Forganizations%2Ftoc.json&bc=%2Fazure%2Fdevops%2Forganizations%2Fbreadcrumb%2Ftoc.json&view=azure-devops&tabs=preview-page))
2. Create an encrypted secret named `ADO_PAT` in your GitHub repository with the ADO PAT token value ([Creating encrypted secrets for a repository](https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository)).
3. Create a workflow file in your GitHub repo with the path `.github/workflows/github-ado-chatops.yml` with the following:
```
name: "Run Azure DevOps ChatOps"

on:
  issue_comment:
    types: [created]

permissions:
  issues: write

jobs:
  run-github-ado-chatops:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: philip-gai/github-ado-chatops
        with:
          ado_org: philip-gai
          ado_project: github-ado-chatops
          ado_repo: github-ado-chatops
          ado_pat: ${{ secrets.ADO_PAT }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
```
4. You can now use ADO ChatOps in your GitHub repo! 🎉🎉🎉

## Feature Requests and Feedback
