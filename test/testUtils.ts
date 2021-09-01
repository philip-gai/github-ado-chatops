import nock from "nock";
// Requiring our app implementation
import myProbotApp from "../src";
import { Probot, ProbotOctokit } from "probot";
// Requiring our fixtures
import fs from "fs";
import path from "path";

const privateKey = fs.readFileSync(
    path.join(__dirname, "fixtures/mock-cert.pem"),
    "utf-8"
);

export class TestUtils {
    static setupTestApp = (probot: any, enableNetConnect: boolean = false) => {
        beforeEach(() => {
            if(!enableNetConnect) {
                nock.disableNetConnect();
            }
            probot = new Probot({
                appId: 123,
                privateKey,
                // disable request throttling and retries for testing
                Octokit: ProbotOctokit.defaults({
                    retry: { enabled: false },
                    throttle: { enabled: false },
                }),
            });
            // Load our app into probot
            probot.load(myProbotApp);
        });
    }

    static cleanupMocks = () => {
        afterEach(() => {
          nock.cleanAll();
          nock.enableNetConnect();
        });
      }
}