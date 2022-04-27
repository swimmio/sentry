---
id: z7kvp
name: Server's Configuration
file_version: 1.0.2
app_version: 0.8.2-0
file_blobs:
  src/sentry/conf/server.py: 0a614a0dd0643c1734a0d30dab2ec8f0fe5eacc9
  src/sentry/options/defaults.py: 3bd08f955f4ef8b1098fd5fc771653dbbe225890
  src/sentry/runner/decorators.py: 3fabf25d95ac3e732b57be98de8085896c8498b5
  docker/config.yml: f1b05a7aa8de07f3a0f7674eb29f457e28e81b56
  docker/sentry.conf.py: 5d2d918114ef4bf8260c24f98e903f67f99dbbec
---

This document describes the configuration available to the Sentry server itself.

## First Install

During a new install, Sentry prompts first for a walkthrough of the Installation Wizard. This wizard will help you get a few essential configuration options taken care of before beginning. Once done, you will be left with two files:

*   docker/config.yml : The YAML configuration was introduced in Sentry 8 and will allow you to configure various core attributes. Over time this will be expanded.
    
*   docker/sentry.conf.py : The Python file will be loaded once all other configuration is referenced, and allows you to configure various server settings as well as more complex tuning.
    

Many settings available in docker/config.yml will also be able to be configured in the Sentry UI. Declaring them in the file will generally override the dynamically configured value and prevent it from being changed in the UI. These same settings can also be configured via the `sentry config` CLI helper.

## General

<br/>

### `SENTRY_ENVIRONMENT`[<sup id="Z1M34kN">↓</sup>](#f-Z1M34kN)

The environment name for this installation. This will also control defaults for things like `DEBUG`[<sup id="ZFXqlP">↓</sup>](#f-ZFXqlP) .
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/conf/server.py
```python
🟩 66     ENVIRONMENT = os.environ.get("SENTRY_ENVIRONMENT", "production")
⬜ 67     
⬜ 68     IS_DEV = ENVIRONMENT == "development"
⬜ 69     
⬜ 70     DEBUG = IS_DEV
```

<br/>

### `system.admin-email`[<sup id="Z1BxeP0">↓</sup>](#f-Z1BxeP0)

The technical contact address for this installation. This will be reported to upstream to the Sentry team (as part of the Beacon), and will be the point of contact for critical updates and security notifications.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/options/defaults.py
```python
⬜ 16     # System
🟩 17     register("system.admin-email", flags=FLAG_REQUIRED)
⬜ 18     register("system.support-email", flags=FLAG_ALLOW_EMPTY | FLAG_PRIORITIZE_DISK)
⬜ 19     register("system.security-email", flags=FLAG_ALLOW_EMPTY | FLAG_PRIORITIZE_DISK)
⬜ 20     register("system.databases", type=Dict, flags=FLAG_NOSTORE)
```

<br/>

### `system.url-prefix`[<sup id="Z17AL4b">↓</sup>](#f-Z17AL4b)

The URL prefix in which Sentry is accessible. This will be used both for referencing URLs in the UI, as well as in outbound notifications. This only works for scheme, hostname and port.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/options/defaults.py
```python
⬜ 25     # Absolute URL to the sentry root directory. Should not include a trailing slash.
🟩 26     register("system.url-prefix", ttl=60, grace=3600, flags=FLAG_REQUIRED | FLAG_PRIORITIZE_DISK)
⬜ 27     register("system.internal-url-prefix", flags=FLAG_ALLOW_EMPTY | FLAG_PRIORITIZE_DISK)
⬜ 28     register("system.root-api-key", flags=FLAG_PRIORITIZE_DISK)
⬜ 29     register("system.logging-format", default=LoggingFormat.HUMAN, flags=FLAG_NOSTORE)
```

<br/>

### system.secret-key

A secret key used for session signing. If this becomes compromised it’s important to regenerate it as otherwise its much easier to hijack user sessions.

To generate a new value, we’ve provided a helper:

```
sentry config generate-secret-key
```
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/options/defaults.py
```python
⬜ 21     # register('system.debug', default=False, flags=FLAG_NOSTORE)
⬜ 22     register("system.rate-limit", default=0, flags=FLAG_ALLOW_EMPTY | FLAG_PRIORITIZE_DISK)
⬜ 23     register("system.event-retention-days", default=0, flags=FLAG_ALLOW_EMPTY | FLAG_PRIORITIZE_DISK)
🟩 24     register("system.secret-key", flags=FLAG_NOSTORE)
⬜ 25     # Absolute URL to the sentry root directory. Should not include a trailing slash.
⬜ 26     register("system.url-prefix", ttl=60, grace=3600, flags=FLAG_REQUIRED | FLAG_PRIORITIZE_DISK)
⬜ 27     register("system.internal-url-prefix", flags=FLAG_ALLOW_EMPTY | FLAG_PRIORITIZE_DISK)
```

<br/>

## Logging

Sentry logs to two major places — `stdout`, and its internal project. To disable logging to the internal project, add a logger whose only handler is `'console'` and disable propagating upwards.

<br/>

### \--loglevel (`-l`)

Sentry can override logger levels by providing the CLI with the --loglevel flag.

The value of this can be one of the [standard Python logging level strings](https://docs.python.org/2/library/logging.html#levels).

```
sentry --loglevel=WARNING
```
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/runner/decorators.py
```python
⬜ 49             @click.option(
🟩 50                 "--loglevel",
🟩 51                 "-l",
⬜ 52                 default=default,
⬜ 53                 help="Global logging level. Use wisely.",
⬜ 54                 envvar="SENTRY_LOG_LEVEL",
⬜ 55                 type=CaseInsensitiveChoice(LOG_LEVELS),
⬜ 56             )
```

<br/>

### SENTRY\_LOG\_LEVEL

Sentry can override logger levels with the SENTRY\_LOG\_LEVEL environment variable.

The value of this can be one of the [standard Python logging level strings](https://docs.python.org/2/library/logging.html#levels).

```
SENTRY_LOG_LEVEL=WARNING sentry ...
```
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/runner/decorators.py
```python
⬜ 49             @click.option(
⬜ 50                 "--loglevel",
⬜ 51                 "-l",
⬜ 52                 default=default,
⬜ 53                 help="Global logging level. Use wisely.",
🟩 54                 envvar="SENTRY_LOG_LEVEL",
⬜ 55                 type=CaseInsensitiveChoice(LOG_LEVELS),
⬜ 56             )
```

<br/>

### `LOGGING`[<sup id="2kRwjM">↓</sup>](#f-2kRwjM)

You can modify or override the full logging configuration with this setting. Be careful not to remove or override important defaults. You can check [the default configuration](https://git.io/fjjna) for reference.

```
LOGGING['default_level'] = 'WARNING'
```

If logging in a particular module is not showing up when you expect it to, you should check the log level for that module in `📄 src/sentry/conf/server.py` in the `LOGGING`[<sup id="2kRwjM">↓</sup>](#f-2kRwjM) variable.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/conf/server.py
```python
⬜ 815    # The loggers that it overrides are root and any in LOGGING.overridable.
⬜ 816    # Be very careful with this in a production system, because the celery
⬜ 817    # logger can be extremely verbose when given INFO or DEBUG.
🟩 818    LOGGING = {
⬜ 819        "default_level": "INFO",
⬜ 820        "version": 1,
⬜ 821        "disable_existing_loggers": True,
```

<br/>

## Redis

<br/>

### `redis.clusters`[<sup id="lxQdl">↓</sup>](#f-lxQdl)

Describes the Redis clusters available to the Sentry server. These clusters may then be referenced by name by other internal services such as the cache, digests, and TSDB backends, among others.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 docker/config.yml
```yaml
⬜ 58     # The ``redis.clusters`` setting is used, unsurprisingly, to configure Redis
⬜ 59     # clusters. These clusters can be then referred to by name when configuring
⬜ 60     # backends such as the cache, digests, or TSDB backend.
🟩 61     # redis.clusters:
🟩 62     #   default:
🟩 63     #     hosts:
🟩 64     #       0:
🟩 65     #         host: 127.0.0.1
🟩 66     #         port: 6379
⬜ 67     
```

<br/>

## Authentication

The following keys control the authentication support.

```
auth.allow-registration: true
```

<br/>

### `auth.allow-registration`[<sup id="1Lwq3Y">↓</sup>](#f-1Lwq3Y)

Should Sentry allow users to create new accounts?

Defaults to `False`[<sup id="Z29iM8N">↓</sup>](#f-Z29iM8N) .

This setting only controls public registration. Users can still register new accounts via Single Sign-On and membership invites.

Note: This setting is often configured via the UI.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/options/defaults.py
```python
⬜ 86     
⬜ 87     register("auth.ip-rate-limit", default=0, flags=FLAG_ALLOW_EMPTY | FLAG_PRIORITIZE_DISK)
⬜ 88     register("auth.user-rate-limit", default=0, flags=FLAG_ALLOW_EMPTY | FLAG_PRIORITIZE_DISK)
🟩 89     register(
🟩 90         "auth.allow-registration",
🟩 91         default=False,
🟩 92         flags=FLAG_ALLOW_EMPTY | FLAG_PRIORITIZE_DISK | FLAG_REQUIRED,
🟩 93     )
⬜ 94     
⬜ 95     register("api.rate-limit.org-create", default=5, flags=FLAG_ALLOW_EMPTY | FLAG_PRIORITIZE_DISK)
⬜ 96     
```

<br/>

### `SENTRY_PUBLIC`[<sup id="Z2aurGa">↓</sup>](#f-Z2aurGa)

Should Sentry make all data publicly accessible? This should **only** be used if you’re installing Sentry behind your company’s firewall.

Users will still need to have an account to view any data.

Defaults to `False`[<sup id="Z1z9zAn">↓</sup>](#f-Z1z9zAn) .
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/conf/server.py
```python
⬜ 1160   # Should we send the beacon to the upstream server?
⬜ 1161   SENTRY_BEACON = True
⬜ 1162   
🟩 1163   # Allow access to Sentry without authentication.
🟩 1164   SENTRY_PUBLIC = False
```

<br/>

### `SENTRY_ALLOW_ORIGIN`[<sup id="Z2tzkQG">↓</sup>](#f-Z2tzkQG)

**Note:** This setting has changed, and no longer applies to `/api/store/` requests.

If provided, Sentry will set the Access-Control-Allow-Origin header on all web API responses.

You can read more about these headers in the [Mozilla developer docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

Defaults to `*` (allow API access from any domain)
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/conf/server.py
```python
⬜ 1304   # Will an invite be sent when a member is added to an organization?
⬜ 1305   SENTRY_ENABLE_INVITES = True
⬜ 1306   
🟩 1307   # Origins allowed for session-based API access (via the Access-Control-Allow-Origin header)
🟩 1308   SENTRY_ALLOW_ORIGIN = None
⬜ 1309   
⬜ 1310   # Buffer backend
⬜ 1311   SENTRY_BUFFER = "sentry.buffer.Buffer"
```

<br/>

## Web Server

The following settings are available for the built-in webserver:

<br/>

### `SENTRY_WEB_HOST`[<sup id="Z1u82ad">↓</sup>](#f-Z1u82ad)

The hostname which the webserver should bind to.

### `SENTRY_WEB_PORT`[<sup id="Z1gxLq1">↓</sup>](#f-Z1gxLq1)

The port which the webserver should listen on.

### `SENTRY_WEB_OPTIONS`[<sup id="ZtRii9">↓</sup>](#f-ZtRii9)

A dictionary of additional configuration options to pass to uwsgi.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 docker/sentry.conf.py
```python
⬜ 205    # SESSION_COOKIE_SECURE = True
⬜ 206    # CSRF_COOKIE_SECURE = True
⬜ 207    
🟩 208    SENTRY_WEB_HOST = "0.0.0.0"
🟩 209    SENTRY_WEB_PORT = 9000
🟩 210    SENTRY_WEB_OPTIONS = {
⬜ 211        # 'workers': 1,  # the number of web workers
⬜ 212    }
⬜ 213    
```

<br/>

Additionally, if you’re using SSL, you’ll want to configure the following settings:
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 docker/sentry.conf.py
```python
⬜ 202    # If you're using a reverse SSL proxy, you should enable the X-Forwarded-Proto
⬜ 203    # header and uncomment the following settings:
🟩 204    # SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
🟩 205    # SESSION_COOKIE_SECURE = True
🟩 206    # CSRF_COOKIE_SECURE = True
⬜ 207    
⬜ 208    SENTRY_WEB_HOST = "0.0.0.0"
⬜ 209    SENTRY_WEB_PORT = 9000
```

<br/>

<!-- THIS IS AN AUTOGENERATED SECTION. DO NOT EDIT THIS SECTION DIRECTLY -->
### Swimm Note

<span id="f-1Lwq3Y">auth.allow-registration</span>[^](#1Lwq3Y) - "src/sentry/options/defaults.py" L90
```python
    "auth.allow-registration",
```

<span id="f-ZFXqlP">DEBUG</span>[^](#ZFXqlP) - "src/sentry/conf/server.py" L70
```python
DEBUG = IS_DEV
```

<span id="f-Z1z9zAn">False</span>[^](#Z1z9zAn) - "src/sentry/conf/server.py" L1164
```python
SENTRY_PUBLIC = False
```

<span id="f-Z29iM8N">False</span>[^](#Z29iM8N) - "src/sentry/options/defaults.py" L91
```python
    default=False,
```

<span id="f-2kRwjM">LOGGING</span>[^](#2kRwjM) - "src/sentry/conf/server.py" L818
```python
LOGGING = {
```

<span id="f-lxQdl">redis.clusters</span>[^](#lxQdl) - "docker/config.yml" L58
```yaml
# The ``redis.clusters`` setting is used, unsurprisingly, to configure Redis
```

<span id="f-Z2tzkQG">SENTRY_ALLOW_ORIGIN</span>[^](#Z2tzkQG) - "src/sentry/conf/server.py" L1308
```python
SENTRY_ALLOW_ORIGIN = None
```

<span id="f-Z1M34kN">SENTRY_ENVIRONMENT</span>[^](#Z1M34kN) - "src/sentry/conf/server.py" L66
```python
ENVIRONMENT = os.environ.get("SENTRY_ENVIRONMENT", "production")
```

<span id="f-Z2aurGa">SENTRY_PUBLIC</span>[^](#Z2aurGa) - "src/sentry/conf/server.py" L1164
```python
SENTRY_PUBLIC = False
```

<span id="f-Z1u82ad">SENTRY_WEB_HOST</span>[^](#Z1u82ad) - "docker/sentry.conf.py" L208
```python
SENTRY_WEB_HOST = "0.0.0.0"
```

<span id="f-ZtRii9">SENTRY_WEB_OPTIONS</span>[^](#ZtRii9) - "docker/sentry.conf.py" L210
```python
SENTRY_WEB_OPTIONS = {
```

<span id="f-Z1gxLq1">SENTRY_WEB_PORT</span>[^](#Z1gxLq1) - "docker/sentry.conf.py" L209
```python
SENTRY_WEB_PORT = 9000
```

<span id="f-Z1BxeP0">system.admin-email</span>[^](#Z1BxeP0) - "src/sentry/options/defaults.py" L17
```python
register("system.admin-email", flags=FLAG_REQUIRED)
```

<span id="f-Z17AL4b">system.url-prefix</span>[^](#Z17AL4b) - "src/sentry/options/defaults.py" L26
```python
register("system.url-prefix", ttl=60, grace=3600, flags=FLAG_REQUIRED | FLAG_PRIORITIZE_DISK)
```

<br/>

This file was generated by Swimm. [Click here to view it in the app](https://app.swimm.io/repos/Z2l0aHViJTNBJTNBc2VudHJ5JTNBJTNBc3dpbW1pbw==/docs/z7kvp).