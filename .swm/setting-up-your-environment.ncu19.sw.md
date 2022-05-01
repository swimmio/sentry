---
id: ncu19
name: Setting up your environment
file_version: 1.0.2
app_version: 0.8.2-0
file_blobs:
  package.json: b1f7cd3b70c6ee83f363e94c8f2d4d08ed190da6
  .envrc: ac988857690936f6eb4a35f528d492df9420b43f
  .github/workflows/development-environment.yml: d9a23d27d403872e1d34f86604ab6d1d35b402c6
  .github/actions/setup-sentry/action.yml: 0bc6ffb6e1fafaa1a73bc767f04f845f58423fee
  .github/workflows/migrations.yml: 51546bb2dc9be64fa3440826b44411693b7b065c
  scripts/bootstrap-py3-venv: 9b43b24ee90db5d70b11a1af5af3032aff3d1f5a
  tests/js/spec/components/commandLine.spec.tsx: e333e80be328938fd79bc52efd72a5516b59aedb
  src/sentry/conf/server.py: 0a614a0dd0643c1734a0d30dab2ec8f0fe5eacc9
  src/sentry/runner/commands/devserver.py: 1094c4c04850139f2ede96aaf86084c602aa9d56
---

This guide steps you through configuring a local development environment for the Sentry server on macOS and Linux. If you're using another operating system (Plan 9, BeOS, Windows, …) the instructions are still roughly the same, but we don't maintain any official documentation for anything else for now.

## Clone the Repository

<br/>

To get started, clone the repo at `github.com/getsentry/sentry.git`[<sup id="SOlXl">↓</sup>](#f-SOlXl) or your fork.

You're going to be working out of this repository for the remainder of the setup.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 package.json
```json
⬜ 5        "repository": {
⬜ 6          "type": "git",
🟩 7          "url": "git://github.com/getsentry/sentry.git"
⬜ 8        },
```

<br/>

## System Dependencies

<br/>

### Xcode CLI tools (Mac specific)

You'll need to first install Xcode CLI tools. Run this command and follow the instructions:
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 .envrc
```envrc
🟩 14         xcode-select --install
```

<br/>

### Brew

Install [Homebrew](http://brew.sh), and then the following command to install the various system packages as listed in Sentry's Brewfile .

```
brew bundle --verbose
```

<br/>

### Docker (Mac specific)

Note: It's recommended to increase the Docker memory limit to something higher than the default (2048MB).

On Docker Desktop, you can adjust the memory limits by going to: `Preferences > Resources > Memory`

Or through CLI:

### Quit Docker if it is running

```
osascript -e 'quit app "Docker"'
```

### Check what the default is configured currently

```
cat /Users/`id -un`/Library/Group\ Containers/group.com.docker/settings.json | grep "memoryMiB"
```

### Increase configured memory to something reasonable

```
sed -i .bak 's/"memoryMiB":.*/"memoryMiB": 7168,/g' /Users/`id -un`/Library/Group\ Containers/group.com.docker/settings.json
```

### Validate the configuration

```
cat /Users/`id -un`/Library/Group\ Containers/group.com.docker/settings.json | grep "memoryMiB"
```

### Start up Docker

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

<br/>

## Python

We utilize [pyenv](https://github.com/pyenv/pyenv) to install and manage Python versions. It got installed when you ran `brew bundle`.

To install the required version of Python you'll need to run the following command. This will take a while, since your computer is actually compiling Python!

`make`[<sup id="17Twvl">↓</sup>](#f-17Twvl) `setup-pyenv`[<sup id="1T8dEY">↓</sup>](#f-1T8dEY)
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 .github/workflows/development-environment.yml
```yaml
⬜ 98           - name: Set up pyenv
⬜ 99             run: |
🟩 100              make setup-pyenv
```

<br/>

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

<br/>

### Virtual Environment

You're now ready to create a Python virtual environment and activate it using the following commands:
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 .github/workflows/development-environment.yml
```yaml
🟩 105              python -m venv .venv
🟩 106              source .venv/bin/activate
```

<br/>

If everything worked, running `which python` should now result in something like `/Users/you/sentry/.venv/bin/python`.

<br/>

## JavaScript

We use [volta](https://github.com/volta-cli/volta) to install and manage the version of Node.js that Sentry requires. To install `volta`[<sup id="7qcUU">↓</sup>](#f-7qcUU) run the following command:
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 .github/workflows/development-environment.yml
```yaml
⬜ 52           - name: Install volta
⬜ 53             run: |
🟩 54               curl https://get.volta.sh | bash
```

<br/>

The volta installer will tell you to "open a new terminal to start using Volta", but you don't have to! You can just reload your shell:

```
exec "$SHELL"
```

<br/>

This works because the volta installer conveniently made changes to your shell installation files for your shell's startup script:
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 .github/workflows/development-environment.yml
```yaml
⬜ 72           - name: make bootstrap
⬜ 73             run: |
🟩 74               export VOLTA_HOME="$HOME/.volta"
🟩 75               export PATH="$HOME/.volta/bin:$PATH"
```

<br/>

Now, if you try and run `volta`, you should see some help text, meaning volta is installed correctly. To install node, simply run:

```
node -v
```

Volta intercepts this and automatically downloads and installs the node and yarn versions in sentry's `📄 package.json` .

<br/>

## Bootstrap Services

Source your virtual environment again and run the following commands. This will take a long time, as it bootstraps Sentry, its dependencies, starts up related services and runs database migrations.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 .github/workflows/development-environment.yml
```yaml
⬜ 72           - name: make bootstrap
⬜ 73             run: |
⬜ 74               export VOLTA_HOME="$HOME/.volta"
⬜ 75               export PATH="$HOME/.volta/bin:$PATH"
⬜ 76               python -m venv .venv
🟩 77               source .venv/bin/activate
🟩 78               make bootstrap
```

<br/>

The `bootstrap`[<sup id="Z2uVu1n">↓</sup>](#f-Z2uVu1n) command does a few things you'll want to know about:

*   `sentry`[<sup id="27qGRh">↓</sup>](#f-27qGRh) `init`[<sup id="Z2nvgS6">↓</sup>](#f-Z2nvgS6) creates the baseline Sentry configuration in `~/.sentry/`.
    
*   `sentry`[<sup id="2dUcOT">↓</sup>](#f-2dUcOT) `devservices`[<sup id="Z1VNq9m">↓</sup>](#f-Z1VNq9m) `up`[<sup id="Z23KAaf">↓</sup>](#f-Z23KAaf) spins up required Docker services (such as `postgres`[<sup id="1vgDTg">↓</sup>](#f-1vgDTg) or `redis`[<sup id="a05Cj">↓</sup>](#f-a05Cj) ).
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 .github/actions/setup-sentry/action.yml
```yaml
⬜ 175          run: |
🟩 176            sentry init
🟩 177    
🟩 178            # redis, postgres are needed for almost every code path.
🟩 179            sentry devservices up redis postgres
⬜ 180    
⬜ 181            if [ "$BIGTABLE_EMULATOR_HOST" ]; then
⬜ 182              sentry devservices up --skip-only-if bigtable
```

<br/>

*   `sentry`[<sup id="21Wz5e">↓</sup>](#f-21Wz5e) `upgrade`[<sup id="ZyoRCn">↓</sup>](#f-ZyoRCn) runs `postgres`[<sup id="1vgDTg">↓</sup>](#f-1vgDTg) migrations, and will also prompt you to create a user. You will want to ensure your first user is designated as **superuser**.
    
*   Once this command has finished you'll have Sentry installed in development mode with all its required dependencies.
    
    **Note**: This command is meant to be run only once. To bring your dependencies up-to-date use `make develop`.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 .github/workflows/migrations.yml
```yaml
⬜ 64           - name: Apply migrations
⬜ 65             run: |
🟩 66               sentry upgrade --noinput
```

<br/>

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

<br/>

Any time the `📄 .envrc` configuration changes (including the first load) you will be prompted to run `direnv`[<sup id="15mfGw">↓</sup>](#f-15mfGw) `allow`[<sup id="ZfVI9h">↓</sup>](#f-ZfVI9h) before any of the configurations will run. This is for security purposes and you are encouraged to inspect the changes before running this command.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 scripts/bootstrap-py3-venv
```
🟩 81     direnv allow || {
⬜ 82         echo "bootstrap failed!"
⬜ 83         return 1
⬜ 84     }
```

<br/>

### Customize your development environment variables

If you want to personalize your environment variables, you can do so by creating a `.env` file. This file is ignored by `git`, thus, you will not be able to leak it into one of your PRs.

Running `make direnv-help` will list all of the latest supported environment variables. Using `SENTRY_DEVENV_NO_REPORT` as an example, to enable that setting you would insert `SENTRY_DEVENV_NO_REPORT=1` into your `.env` file.

<br/>

## Running the Development Server

Once you’ve successfully stood up your datastore, you can now run the development server by running `sentry`[<sup id="1KrqtB">↓</sup>](#f-1KrqtB) `devserver`[<sup id="Z2sHOkq">↓</sup>](#f-Z2sHOkq) `--workers`[<sup id="1Fcoe">↓</sup>](#f-1Fcoe) .

If you are developing for aesthetics only and do not rely on the async workers, you can omit the `--workers`[<sup id="1Fcoe">↓</sup>](#f-1Fcoe) flag in order to use fewer system resources.

If you would like to be able to run `devserver`[<sup id="Z2sHOkq">↓</sup>](#f-Z2sHOkq) outside of your root checkout, you can install `webpack` globally with `npm install -g webpack`.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 tests/js/spec/components/commandLine.spec.tsx
<!-- collapsed -->

```tsx
⬜ 5      describe('CommandLine', () => {
⬜ 6        it('renders', () => {
🟩 7          const children = 'sentry devserver --workers';
⬜ 8          render(<CommandLine>{children}</CommandLine>);
⬜ 9          expect(screen.getByText(children)).toBeInTheDocument();
⬜ 10       });
```

<br/>

Note: When asked for the root address of the server, make sure that you use [http://localhost:8000](http://localhost:8000) as both protocol _and_ port are required in order for DNS and some pages' URLs to be displayed correctly.

<br/>

### Ingestion Pipeline (Relay)

Some services are not run in all situations, among those are Relay and the ingest workers. If you need a more production-like environment in development, you can set `SENTRY_USE_RELAY`[<sup id="1FAzQX">↓</sup>](#f-1FAzQX) to `True` in `📄 src/sentry/conf/server.py` . This will launch Relay as part of the `devserver`[<sup id="Z1HyaWl">↓</sup>](#f-Z1HyaWl) workflow.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/conf/server.py
```python
⬜ 1756   # Controls whether devserver spins up Relay, Kafka, and several ingest worker jobs to direct store traffic
⬜ 1757   # through the Relay ingestion pipeline. Without, ingestion is completely disabled. Use `bin/load-mocks` to
⬜ 1758   # generate fake data for local testing. You can also manually enable relay with the `--ingest` flag to `devserver`.
⬜ 1759   # XXX: This is disabled by default as typical development workflows do not require end-to-end services running
⬜ 1760   # and disabling optional services reduces resource consumption and complexity
🟩 1761   SENTRY_USE_RELAY = False
⬜ 1762   SENTRY_RELAY_PORT = 7899
```

<br/>

Additionally you can explicitly control this during devserver usage with the --ingest flag. The devservices command will not update Relay automatically in that case, to do this manually run:

```
sentry devservices up --skip-only-if relay
sentry devserver --workers --ingest
```
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/runner/commands/devserver.py
```python
⬜ 60     @click.option("--workers/--no-workers", default=False, help="Run asynchronous workers.")
🟩 61     @click.option("--ingest/--no-ingest", default=None, help="Run ingest services (including Relay).")
⬜ 62     @click.option(
⬜ 63         "--prefix/--no-prefix", default=True, help="Show the service name prefix and timestamp"
⬜ 64     )
```

<br/>

<!-- THIS IS AN AUTOGENERATED SECTION. DO NOT EDIT THIS SECTION DIRECTLY -->
### Swimm Note

<span id="f-1Fcoe">--workers</span>[^](#1Fcoe) - "tests/js/spec/components/commandLine.spec.tsx" L7
```tsx
    const children = 'sentry devserver --workers';
```

<span id="f-ZfVI9h">allow</span>[^](#ZfVI9h) - "scripts/bootstrap-py3-venv" L81
```
direnv allow || {
```

<span id="f-Z2uVu1n">bootstrap</span>[^](#Z2uVu1n) - ".github/workflows/development-environment.yml" L72
```yaml
      - name: make bootstrap
```

<span id="f-Z1HyaWl">devserver</span>[^](#Z1HyaWl) - "src/sentry/conf/server.py" L1758
```python
# generate fake data for local testing. You can also manually enable relay with the `--ingest` flag to `devserver`.
```

<span id="f-Z2sHOkq">devserver</span>[^](#Z2sHOkq) - "tests/js/spec/components/commandLine.spec.tsx" L7
```tsx
    const children = 'sentry devserver --workers';
```

<span id="f-Z1VNq9m">devservices</span>[^](#Z1VNq9m) - ".github/actions/setup-sentry/action.yml" L179
```yaml
        sentry devservices up redis postgres
```

<span id="f-15mfGw">direnv</span>[^](#15mfGw) - "scripts/bootstrap-py3-venv" L81
```
direnv allow || {
```

<span id="f-SOlXl">github.com/getsentry/sentry.git</span>[^](#SOlXl) - "package.json" L7
```json
    "url": "git://github.com/getsentry/sentry.git"
```

<span id="f-Z2nvgS6">init</span>[^](#Z2nvgS6) - ".github/actions/setup-sentry/action.yml" L176
```yaml
        sentry init
```

<span id="f-17Twvl">make</span>[^](#17Twvl) - ".github/workflows/development-environment.yml" L100
```yaml
          make setup-pyenv
```

<span id="f-1vgDTg">postgres</span>[^](#1vgDTg) - ".github/actions/setup-sentry/action.yml" L179
```yaml
        sentry devservices up redis postgres
```

<span id="f-a05Cj">redis</span>[^](#a05Cj) - ".github/actions/setup-sentry/action.yml" L179
```yaml
        sentry devservices up redis postgres
```

<span id="f-1KrqtB">sentry</span>[^](#1KrqtB) - "tests/js/spec/components/commandLine.spec.tsx" L7
```tsx
    const children = 'sentry devserver --workers';
```

<span id="f-21Wz5e">sentry</span>[^](#21Wz5e) - ".github/workflows/migrations.yml" L66
```yaml
          sentry upgrade --noinput
```

<span id="f-2dUcOT">sentry</span>[^](#2dUcOT) - ".github/actions/setup-sentry/action.yml" L179
```yaml
        sentry devservices up redis postgres
```

<span id="f-27qGRh">sentry</span>[^](#27qGRh) - ".github/actions/setup-sentry/action.yml" L176
```yaml
        sentry init
```

<span id="f-1FAzQX">SENTRY_USE_RELAY</span>[^](#1FAzQX) - "src/sentry/conf/server.py" L1761
```python
SENTRY_USE_RELAY = False
```

<span id="f-1T8dEY">setup-pyenv</span>[^](#1T8dEY) - ".github/workflows/development-environment.yml" L100
```yaml
          make setup-pyenv
```

<span id="f-Z23KAaf">up</span>[^](#Z23KAaf) - ".github/actions/setup-sentry/action.yml" L179
```yaml
        sentry devservices up redis postgres
```

<span id="f-ZyoRCn">upgrade</span>[^](#ZyoRCn) - ".github/workflows/migrations.yml" L66
```yaml
          sentry upgrade --noinput
```

<span id="f-7qcUU">volta</span>[^](#7qcUU) - ".github/workflows/development-environment.yml" L52
```yaml
      - name: Install volta
```

<br/>

This file was generated by Swimm. [Click here to view it in the app](https://app.swimm.io/repos/Z2l0aHViJTNBJTNBc2VudHJ5JTNBJTNBc3dpbW1pbw==/docs/ncu19).