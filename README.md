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

## Contributing

If you have suggestions for how github-ado-chatops could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2021 Philip Gai <philip-gai@github.com>
