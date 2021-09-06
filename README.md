# Azure DevOps ChatOps - GitHub Action

Integrate GitHub with Azure DevOps via ChatOps.


## ChatOp Commands

| Command | Aliases | Description | Options | Context |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| `/cb-ado`  | `/create-branch-ado` | Creates a branch in Azure DevOps using information from the issue.<br/>Default: `users/{githubUsername}/{issueNumber}-{issueName}-{issueTitle}`. | <ul><li>`-username`: The username to use in your branch name.<br/>Default: GitHub username</li><li>`-branch`: The branch to branch from.<br/>Default: The default branch set in ADO</li></ul> | Issues |
