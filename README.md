# Azure DevOps ChatOps - GitHub Action

Integrate GitHub with Azure DevOps via ChatOps! 🚀

![image](https://user-images.githubusercontent.com/17363579/132613753-038124dc-fd52-4f61-a7eb-27a0cd8c960c.png)

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
5. On any Issue, try the `/cb-ado` command and enjoy 😍

### Debugging
1. Set a secret in your repo named `ACTIONS_RUNNER_DEBUG` to `true` to get debug logging ([Reference](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/enabling-debug-logging))

## Feature Requests and Feedback
I would love to hear your feedback. Let me know if you've run into any bugs, or have any feature requests.

### Feature Requests
1. [View enhancements and feature requests already in the backlog](https://github.com/philip-gai/github-ado-chatops/issues?q=is%3Aopen+is%3Aissue+label%3A%22feature+request%22%2Cenhancement)
2. [Create a feature request](https://github.com/philip-gai/github-ado-chatops/issues/new?assignees=&labels=feature+request&template=feature_request.md&title=)

### Bugs
1. [View known issues](https://github.com/philip-gai/github-ado-chatops/issues?q=is%3Aopen+is%3Aissue+label%3Abug)
2. [Report a bug](https://github.com/philip-gai/github-ado-chatops/issues/new?assignees=&labels=bug&template=bug_report.md&title=)

### Questions / Conversations
Do you have any questions? Want to just talk and ask me stuff?

1. [View Discussions](https://github.com/philip-gai/github-ado-chatops/discussions)
2. [Start a new discussion!](https://github.com/philip-gai/github-ado-chatops/discussions/new)
