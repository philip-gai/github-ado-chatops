# Development

## Setup

1. Clone the repo
2. Install the recommended extensions
3. Open a terminal and run `npm i`
4. After you're done making changed run `npm run all` which will lint, run tests, and update the `dist` folder

## Testing

1. Once a PR is merged into the develop branch you can test the chat ops on any issue in this repo.
2. Common chat ops to test:
   1. `/cb-ado`
   2. `/cb-ado -type users`
   3. `/cb-ado -branch develop -type release`
   4. `/cb-ado -type users -username test-user`
   5. `/cb-ado -name other/philip-gai/branch-name`

## Fixing Dependabot Issues

1. Create a new branch from `develop`
2. Merge the dependabot branches into your branch
3. Run `npm i && npm run all`
4. Commit changes (if any)
5. Push commits
6. Create PR
