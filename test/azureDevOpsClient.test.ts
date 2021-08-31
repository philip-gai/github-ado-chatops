import { AzureDevOpsClient } from "../src/azureDevOpsClient";
import { Config } from "../src/config";
import { TestUtils } from "./testUtils";

describe("Azure DevOps Client", () => {
  let probot: any;
  TestUtils.setupTestApp(probot, true);

  const config = new Config();
  const adoClient = new AzureDevOpsClient(probot, config.ado);

  test("creates a branch in ADO", async () => {
    const success = await adoClient.createBranch('users/philip-gai/1234-test-branch');
    expect(success).toBe(true);
  });

  test("test branch URL", () => {
    const url = adoClient.getBranchUrl('users/philip-gai/1234-test-branch');
    expect(url).toBe('https://dev.azure.com/philip-gai/github-ado-chatops/_git/github-ado-chatops?version=GBusers%2Fphilip-gai%2F1234-test-branch');
  });
});