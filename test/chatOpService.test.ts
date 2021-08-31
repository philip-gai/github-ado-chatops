import { ChatOpService } from "../src/chatOpService";
import { AzureDevOpsClient } from "../src/azureDevOpsClient";
import { Config } from "../src/config";
import { TestUtils } from "./testUtils";

describe("Chat Op Service", () => {
  let probot: any;
  TestUtils.setupTestApp(probot, true);

  const config = new Config();
  const adoClient = new AzureDevOpsClient(probot, config.ado);
  const chatOpService = new ChatOpService(probot, adoClient);

  test("make sure branch name doesn't include [ or ]", async () => {
    const branchName = await chatOpService.createBranchName('1234','[ADO] This is an issue');
    expect(branchName).toBe('users/mspletz/1234--ADO-This-is-an-issue');
  });

  test("make sure branch name doesn't include :", async () => {
    const branchName = await chatOpService.createBranchName('1234','ADO: This is an issue');
    expect(branchName).toBe('users/mspletz/1234-ADO-This-is-an-issue');
  });

  test("make sure branch name doesn't include ~", async () => {
    const branchName = await chatOpService.createBranchName('1234','ADO~ This is an issue');
    expect(branchName).toBe('users/mspletz/1234-ADO-This-is-an-issue');
  });

  test("make sure branch name doesn't include ^", async () => {
    const branchName = await chatOpService.createBranchName('1234','ADO^ This is an issue');
    expect(branchName).toBe('users/mspletz/1234-ADO-This-is-an-issue');
  });

  test("make sure branch name doesn't include ?", async () => {
    const branchName = await chatOpService.createBranchName('1234','ADO? This is an issue');
    expect(branchName).toBe('users/mspletz/1234-ADO-This-is-an-issue');
  });

  test("make sure branch name doesn't include *", async () => {
    const branchName = await chatOpService.createBranchName('1234','ADO* This is an issue');
    expect(branchName).toBe('users/mspletz/1234-ADO-This-is-an-issue');
  });

  test("make sure branch name doesn't include '\'", async () => {
    const branchName = await chatOpService.createBranchName('1234','ADO\ This is an issue');
    expect(branchName).toBe('users/mspletz/1234-ADO-This-is-an-issue');
  });

  test("make sure branch name doesn't exceed 62 chars", async () => {
    const branchName = await chatOpService.createBranchName('1234','ADO: This is an issue that has a very long description that will take up a lot of bytes');
    expect(branchName.length).toBe(chatOpService.maxNumOfChars);
  });

});