# Development

## Testing

Here are some common chat ops to run:

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
