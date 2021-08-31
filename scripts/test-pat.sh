# https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=preview-page#use-a-pat
ADO_PAT=PAT_HERE
ADO_ORG=philip-gai
ADO_PROJECT=github-ado-chatops
ADO_REPO=github-ado-chatops
B64_PAT=$(printf "%s"":$ADO_PAT" | base64)
git -c http.extraHeader="Authorization: Basic ${B64_PAT}" clone "https://dev.azure.com/${ADO_ORG}/${ADO_PROJECT}/_git/${ADO_REPO}"
