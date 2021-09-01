import { AzureDevOpsClient } from "../src/azureDevOpsClient";
import { Config } from "../src/config";
import { TestUtils } from "./testUtils";

describe("Azure DevOps Client Integration Tests", () => {
  let probot: any;
  TestUtils.setupTestApp(probot, true);

  const config = new Config();
  const adoClient = new AzureDevOpsClient(probot, config.ado);

  test("creates and deletes a branch", async () => {
    const createResult = await adoClient.createBranch('users/github-ado-chatops-tests/create-branch-in-ado-test');
    expect(createResult.success).toBe(true);

    const deleteResult = await adoClient.deleteBranch(createResult.name, createResult.newObjectId);
    expect(deleteResult.success).toBe(true);
  });

  test("gets the link to the branch", () => {
    const url = adoClient.getBranchUrl('users/philip-gai/1234-test-branch');
    expect(url).toBe('https://dev.azure.com/philip-gai/github-ado-chatops/_git/github-ado-chatops?version=GBusers%2Fphilip-gai%2F1234-test-branch');
  });
});