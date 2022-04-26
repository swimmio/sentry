---
id: ncu19
name: Setting up your environment
file_version: 1.0.2
app_version: 0.8.2-0
---

This guide steps you through configuring a local development environment for the Sentry server on macOS and Linux. If you're using another operating system (Plan 9, BeOS, Windows, …) the instructions are still roughly the same, but we don't maintain any official documentation for anything else for now.

## Clone the Repository

To get started, clone the repo at [https://github.com/getsentry/sentry](https://github.com/getsentry/sentry) or your fork.

```
git clone https://github.com/getsentry/sentry.git
cd sentry
```

You're going to be working out of this repository for the remainder of the setup.

## System Dependencies

### Xcode CLI tools (Mac specific)

You'll need to first install Xcode CLI tools. Run this command and follow the instructions:

```
xcode-select --install
```

### Brew

Install [Homebrew](http://brew.sh), and then the following command to install the various system packages as listed in Sentry's `Brewfile`.

```
brew bundle --verbose
```

### Docker (Mac specific)

Note: It's recommended to increase the Docker memory limit to something higher than the default (2048MB).

On Docker Desktop, you can adjust the memory limits by going to: `Preferences > Resources > Memory`

Or through CLI:

```
# quit Docker if its running
osascript -e 'quit app "Docker"'

# check what the default is configured currently
cat /Users/`id -un`/Library/Group\ Containers/group.com.docker/settings.json | grep "memoryMiB"

# increase configured memory to something reasonable
sed -i .bak 's/"memoryMiB":.*/"memoryMiB": 7168,/g' /Users/`id -un`/Library/Group\ Containers/group.com.docker/settings.json

# check configuration 
cat /Users/`id -un`/Library/Group\ Containers/group.com.docker/settings.json | grep "memoryMiB"

# start up docker with next steps
```

On Mac, `docker` (which brew has already installed for you under `/Applications/Docker.app`) needs some manual intervention. You can run this command to set it up automatically for you:

```
open -g -a Docker.app
```

You should soon see the Docker icon in your macOS menubar. Docker will automatically run on system restarts, so this should be the only time you do this.

You can verify that Docker is running by running `docker ps` in your terminal.

## Build Toolchain

Sentry depends on [Python Wheels](https://pythonwheels.com/) (packages containing binary extension modules), which, we distribute for the following platforms:

*   Linux compatible with [PEP-513](https://www.python.org/dev/peps/pep-0513/) (`manylinux1`)
    
*   macOS 10.15 or newer
    

If your development machine does not run one of the above systems, you need to install the Rust toolchain. Follow the instructions at [https://www.rust-lang.org/tools/install](https://www.rust-lang.org/tools/install) to install the compiler and related tools. Once installed, the Sentry setup will automatically use Rust to build all binary modules without additional configuration.

We generally track the latest stable Rust version, which updates every six weeks. Therefore, ensure to keep your Rust toolchain up to date by occasionally running:

```
rustup update stable
```

## Python

We utilize [pyenv](https://github.com/pyenv/pyenv) to install and manage Python versions. It got installed when you ran `brew bundle`.

To install the required version of Python you'll need to run the following command. This will take a while, since your computer is actually compiling Python!

```
make setup-pyenv
```

fish users will need to manually set some of the environment variables. This only needs to be done once.

```
set -Ux PYENV_ROOT $HOME/.pyenv
# fish >=3.2.0
fish_add_path $PYENV_ROOT/bin
# fish <3.2.0
set -U fish_user_paths $PYENV_ROOT/bin $fish_user_paths
```

Once that's done, your shell needs to be reloaded. You can either reload it in-place, or close your terminal and start it again and cd into sentry. To reload it, run:

```
exec "$SHELL"
```

After this, if you type `which python`, you should see something like `$HOME/.pyenv/shims/python` rather than `/usr/bin/python`. This is because the following has been added to your startup script:

```
Given that the bash instructions vary greatly based on the user's
configuration, it is recommended to visit

https://github.com/pyenv/pyenv#installation

for instructions on how to set up Bash.
```

```

# It is assumed that pyenv is installed via Brew, so this is all we need to do.
eval "$(pyenv init --path)"
```

```
# pyenv init
status is-login; and pyenv init --path | source
```

### Virtual Environment

You're now ready to create a Python virtual environment. Run:

```
python -m venv .venv
```

And activate the virtual environment:

```
source .venv/bin/activate
```

```
source .venv/bin/activate
```

```
source .venv/bin/activate.fish
```

If everything worked, running `which python` should now result in something like `/Users/you/sentry/.venv/bin/python`.

## JavaScript

We use [volta](https://github.com/volta-cli/volta) to install and manage the version of Node.js that Sentry requires. To install Volta run:

```
curl https://get.volta.sh | bash
```

The volta installer will tell you to "open a new terminal to start using Volta", but you don't have to! You can just reload your shell:

```
exec "$SHELL"
```

This works because the volta installer conveniently made changes to your shell installation files for your shell's startup script:

```
export VOLTA_HOME="$HOME/.volta"
grep --silent "$VOLTA_HOME/bin" <<< $PATH || export PATH="$VOLTA_HOME/bin:$PATH"
```

```
export VOLTA_HOME="$HOME/.volta"
grep --silent "$VOLTA_HOME/bin" <<< $PATH || export PATH="$VOLTA_HOME/bin:$PATH"
```

```
set -gx VOLTA_HOME "$HOME/.volta"
set -gx PATH "$VOLTA_HOME/bin" $PATH
```

Now, if you try and run `volta`, you should see some help text, meaning volta is installed correctly. To install node, simply run:

```
node -v
```

Volta intercepts this and automatically downloads and installs the node and yarn versions in sentry's `package.json`.

## Bootstrap Services

Source your virtual environment again (`source .venv/bin/activate`), then run `make bootstrap`. This will take a long time, as it bootstraps Sentry, its dependencies, starts up related services and runs database migrations.

The `bootstrap` command does a few things you'll want to know about:

*   `sentry init` creates the baseline Sentry configuration in `~/.sentry/`.
    
*   `sentry devservices up` spins up required Docker services (such as Postgres and Clickhouse)
    
*   `sentry upgrade` runs Postgres migrations, and will also prompt you to create a user. You will want to ensure your first user is designated as **superuser**.
    

Once this command has finished you'll have Sentry installed in development mode with all its required dependencies.

**Note**: This command is meant to be run only once. To bring your dependencies up-to-date use `make develop`.

## direnv

[direnv](https://github.com/direnv/direnv) _automatically activates your virtual environment_, sets some helpful environment variables for you, and performs some simple checks to make sure your environment is as expected (and tries its best to guide you if it isn't). This happens every time you change directories into sentry.

First, you should be done bootstrapping. Then, run `brew install direnv` and add the following snippet to the end of your startup script:

```
eval "$(direnv hook bash)"
```

```
eval "$(direnv hook zsh)"
```

```
direnv hook fish | source
```

And after doing that, reload your shell:

```
exec "$SHELL"
```

Any time the `.envrc` configuration changes (including the first load) you will be prompted to run `direnv allow` before any of the configurations will run. This is for security purposes and you are encouraged to inspect the changes before running this command.

### Customize your development environment variables

If you want to personalize your environment variables, you can do so by creating a `.env` file. This file is ignored by `git`, thus, you will not be able to leak it into one of your PRs.

Running `make direnv-help` will list all of the latest supported environment variables. Using `SENTRY_DEVENV_NO_REPORT` as an example, to enable that setting you would insert `SENTRY_DEVENV_NO_REPORT=1` into your `.env` file.

## Running the Development Server

Once you’ve successfully stood up your datastore, you can now run the development server:

```
sentry devserver --workers
```

If you are developing for aesthetics only and do not rely on the async workers, you can omit the `--workers` flag in order to use fewer system resources.

If you would like to be able to run `devserver` outside of your root checkout, you can install `webpack` globally with `npm install -g webpack`.

Note: When asked for the root address of the server, make sure that you use http://localhost:8000 as both protocol _and_ port are required in order for DNS and some pages' URLs to be displayed correctly.

### Ingestion Pipeline (Relay)

Some services are not run in all situations, among those are Relay and the ingest workers. If you need a more production-like environment in development, you can set `SENTRY_USE_RELAY=True` in `~/.sentry/sentry.conf.py`. This will launch Relay as part of the `devserver` workflow.

Additionally you can explicitly control this during `devserver` usage with the `--ingest` and `--no-ingest` flags. The `sentry devservices` command will not update Relay automatically in that case, to do this manually run:

```
sentry devservices up --skip-only-if relay
sentry devserver --workers --ingest
```

<br/>

This file was generated by Swimm. [Click here to view it in the app](https://app.swimm.io/repos/Z2l0aHViJTNBJTNBc2VudHJ5JTNBJTNBc3dpbW1pbw==/docs/ncu19).