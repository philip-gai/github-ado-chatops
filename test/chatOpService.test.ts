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
    const branchName = await chatOpService.createBranchName('jdoe', '1234','[ADO] This is an issue');
    expect(branchName).toBe('users/jdoe/1234--ADO-This-is-an-issue');
  });

  test("make sure branch name doesn't include :", async () => {
    const branchName = await chatOpService.createBranchName('jdoe','1234','ADO: This is an issue');
    expect(branchName).toBe('users/jdoe/1234-ADO-This-is-an-issue');
  });

  test("make sure branch name doesn't include ~", async () => {
    const branchName = await chatOpService.createBranchName('jdoe','1234','ADO~ This is an issue');
    expect(branchName).toBe('users/jdoe/1234-ADO-This-is-an-issue');
  });

  test("make sure branch name doesn't include ^", async () => {
    const branchName = await chatOpService.createBranchName('jdoe','1234','ADO^ This is an issue');
    expect(branchName).toBe('users/jdoe/1234-ADO-This-is-an-issue');
  });

  test("make sure branch name doesn't include ?", async () => {
    const branchName = await chatOpService.createBranchName('jdoe','1234','ADO? This is an issue');
    expect(branchName).toBe('users/jdoe/1234-ADO-This-is-an-issue');
  });

  test("make sure branch name doesn't include *", async () => {
    const branchName = await chatOpService.createBranchName('jdoe','1234','ADO* This is an issue');
    expect(branchName).toBe('users/jdoe/1234-ADO-This-is-an-issue');
  });

  test("make sure branch name doesn't include '\'", async () => {
    const branchName = await chatOpService.createBranchName('jdoe','1234','ADO\ This is an issue');
    expect(branchName).toBe('users/jdoe/1234-ADO-This-is-an-issue');
  });

  test("make sure branch name doesn't exceed 62 chars", async () => {
    const branchName = await chatOpService.createBranchName('jdoe','1234','ADO: This is an issue that has a very long description that will take up a lot of bytes');
    expect(branchName.length).toBe(chatOpService.maxNumOfChars);
  });

  test("testing username parsing with /create-branch-ado", async () => {
    const username = chatOpService.parseUsernameParameter('/create-branch-ado username jdoe');
    expect(username).toBe('jdoe');
  });

  test("testing username parsing with no username provided", async () => {
    const username = chatOpService.parseUsernameParameter('/create-branch-ado username');
    expect(username).toBe('');
  });

  test("testing username parsing with non gitsafe username", async () => {
    const branchName = await chatOpService.createBranchName('j?d*e','1234','ADO\ This is an issue');
    expect(branchName).toBe('users/j-d-e/1234-ADO-This-is-an-issue');
  });

});