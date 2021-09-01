# github-ado-chatops

> A GitHub App built with [Probot](https://github.com/probot/probot) that Integrates GitHub with Azure DevOps via ChatOps

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Docker (Optional)

```sh
# 1. Build container
docker build -t github-ado-chatops .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> github-ado-chatops
```
## Usage

`/create-branch-ado` or `/cb-ado` without any argument will create a branch with the naming scheme `users/<github handle>/<issue number>-<issue title>` off of default branch `main`.

Additional parameters can be passed to customize the branch:

### Username

Appending `username <username>` after `/create-branch-ado` or `/cb-ado` will allow you to customize what you would like to have following `users/` in the branch name.

For example, the command:
```sh
/create-branch-ado username jdoe  
```
would create the the following branch name:

```sh
users/jdoe/<issue number>-<issue title>
```

## Contributing

If you have suggestions for how github-ado-chatops could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2021 Philip Gai <philip-gai@github.com>
