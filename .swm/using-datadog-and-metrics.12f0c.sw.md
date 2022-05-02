---
id: 12f0c
name: Using Datadog and Metrics
file_version: 1.0.2
app_version: 0.8.2-0
file_blobs:
  src/sentry/conf/server.py: 0a614a0dd0643c1734a0d30dab2ec8f0fe5eacc9
  src/sentry/tasks/app_store_connect.py: e47ed72c81f1b80945e8effc4959aba77891f88c
  src/sentry/api/endpoints/auth_login.py: e9f16d394bc4ece2f419dbf4ea4723d4f0f9cad4
  src/sentry/event_manager.py: dc2b87bf55b8539d321bc1f95dc7a5e83d431718
  src/sentry/metrics/datadog.py: 34ecd20746b16275357efc248781b131987eb800
---

Sentry provides an abstraction called ‘metrics’ which is used for internal monitoring, generally timings and various counters.

The default backend simply discards them (though some values are still kept in the internal time series database).

# Working with Datadog

Datadog will require you to install the `datadog` package into your Sentry environment:

```
$ pip install datadog
```

There are two ways to work with Datadog for the metrics backend:

<br/>

You will need to set `SENTRY_METRICS_BACKEND`[<sup id="2aCyAz">↓</sup>](#f-2aCyAz) to be '`DatadogMetricsBackend`[<sup id="v5Jxp">↓</sup>](#f-v5Jxp) '.

In `SENTRY_METRICS_OPTIONS`[<sup id="Z11dWQj">↓</sup>](#f-Z11dWQj) you need to set the relevant keys:

```
{
    'api_key': '...',
    'app_key': '...',
    'tags': {},
}
```

Once installed, the Sentry metrics will be emitted to the [Datadog REST API](https://docs.datadoghq.com/api/?lang=python#post-time-series-points) over HTTPS.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/conf/server.py
```python
⬜ 1407   # Internal metrics
🟩 1408   SENTRY_METRICS_BACKEND = "sentry.metrics.dummy.DummyMetricsBackend"
🟩 1409   SENTRY_METRICS_OPTIONS = {}
⬜ 1410   SENTRY_METRICS_SAMPLE_RATE = 1.0
⬜ 1411   SENTRY_METRICS_PREFIX = "sentry."
⬜ 1412   SENTRY_METRICS_SKIP_INTERNAL_PREFIXES = []  # Order this by most frequent prefixes.
```

<br/>

## DogStatsD Backend

Using the DogStatsD backend requires a [Datadog Agent](https://docs.datadoghq.com/agent/) to be running with the DogStatsD backend (on by default at port 8125).

Once configured, the metrics backend will emit to the DogStatsD server and then flushed periodically to Datadog over HTTPS.

You will need to set SENTRY\_METRICS\_BACKEND to be ' DogStatsdMetricsBackend '.

And set SENTRY\_METRICS\_OPTIONS as follows:

```
SENTRY_METRICS_OPTIONS = {
    'statsd_host': 'localhost',
    'statsd_port': 8125,
    'tags': {},
}
```
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/conf/server.py
```python
⬜ 1405   )
⬜ 1406   
⬜ 1407   # Internal metrics
🟩 1408   SENTRY_METRICS_BACKEND = "sentry.metrics.dummy.DummyMetricsBackend"
🟩 1409   SENTRY_METRICS_OPTIONS = {}
⬜ 1410   SENTRY_METRICS_SAMPLE_RATE = 1.0
⬜ 1411   SENTRY_METRICS_PREFIX = "sentry."
⬜ 1412   SENTRY_METRICS_SKIP_INTERNAL_PREFIXES = []  # Order this by most frequent prefixes.
```

<br/>

# Using Metrics

<br/>

After setting up the metrics backend as explained above, you can import `metrics`[<sup id="tW73A">↓</sup>](#f-tW73A) from `sentry.utils`[<sup id="guhAn">↓</sup>](#f-guhAn)
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/tasks/app_store_connect.py
```python
⬜ 24     from sentry.tasks.base import instrumented_task
🟩 25     from sentry.utils import json, metrics, sdk
⬜ 26     from sentry.utils.appleconnect import appstore_connect as appstoreconnect_api
⬜ 27     
⬜ 28     logger = logging.getLogger(__name__)
```

<br/>

### `gauge`[<sup id="ZAxR2b">↓</sup>](#f-ZAxR2b)

The `gauge`[<sup id="ZAxR2b">↓</sup>](#f-ZAxR2b) metric submission type represents a snapshot of events in one time interval. This representative snapshot value is the last value submitted to the Agent during a time interval. A GAUGE can be used to take a measure of something reporting continuously.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/tasks/app_store_connect.py
```python
⬜ 231                            count += 1
⬜ 232                except Exception:
⬜ 233                    logger.exception("Failed to refresh AppStoreConnect builds")
🟩 234        metrics.gauge("tasks.app_store_connect.refreshed", count, sample_rate=1)
⬜ 235    
```

<br/>

### `incr`[<sup id="l1nzt">↓</sup>](#f-l1nzt)

For example, this can be used to track aggregate login attempts.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/api/endpoints/auth_login.py
```python
⬜ 42             if not login_form.is_valid():
🟩 43                 metrics.incr("login.attempt", instance="failure", skip_internal=True, sample_rate=1.0)
⬜ 44                 return self.respond_with_error(login_form.errors)
⬜ 45     
⬜ 46             user = login_form.get_user()
```

<br/>

### `timing`[<sup id="PQDqK">↓</sup>](#f-PQDqK)

Sends a `timing`[<sup id="PQDqK">↓</sup>](#f-PQDqK) (in ms) for the given stat to the statsd server. For example:
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/event_manager.py
```python
⬜ 555    
⬜ 556            metric_tags = {"from_relay": "_relay_processed" in job["data"]}
⬜ 557    
🟩 558            metrics.timing(
🟩 559                "events.latency",
🟩 560                job["received_timestamp"] - job["recorded_timestamp"],
🟩 561                tags=metric_tags,
🟩 562            )
🟩 563            metrics.timing("events.size.data.post_save", job["event"].size, tags=metric_tags)
⬜ 564            metrics.incr(
⬜ 565                "events.post_save.normalize.errors",
⬜ 566                amount=len(job["data"].get("errors") or ()),
```

<br/>

<!-- THIS IS AN AUTOGENERATED SECTION. DO NOT EDIT THIS SECTION DIRECTLY -->
### Swimm Note

<span id="f-v5Jxp">DatadogMetricsBackend</span>[^](#v5Jxp) - "src/sentry/metrics/datadog.py" L11
```python
class DatadogMetricsBackend(MetricsBackend):
```

<span id="f-ZAxR2b">gauge</span>[^](#ZAxR2b) - "src/sentry/tasks/app_store_connect.py" L234
```python
    metrics.gauge("tasks.app_store_connect.refreshed", count, sample_rate=1)
```

<span id="f-l1nzt">incr</span>[^](#l1nzt) - "src/sentry/api/endpoints/auth_login.py" L43
```python
            metrics.incr("login.attempt", instance="failure", skip_internal=True, sample_rate=1.0)
```

<span id="f-tW73A">metrics</span>[^](#tW73A) - "src/sentry/tasks/app_store_connect.py" L25
```python
from sentry.utils import json, metrics, sdk
```

<span id="f-guhAn">sentry.utils</span>[^](#guhAn) - "src/sentry/tasks/app_store_connect.py" L25
```python
from sentry.utils import json, metrics, sdk
```

<span id="f-2aCyAz">SENTRY_METRICS_BACKEND</span>[^](#2aCyAz) - "src/sentry/conf/server.py" L1408
```python
SENTRY_METRICS_BACKEND = "sentry.metrics.dummy.DummyMetricsBackend"
```

<span id="f-Z11dWQj">SENTRY_METRICS_OPTIONS</span>[^](#Z11dWQj) - "src/sentry/conf/server.py" L1409
```python
SENTRY_METRICS_OPTIONS = {}
```

<span id="f-PQDqK">timing</span>[^](#PQDqK) - "src/sentry/event_manager.py" L558
```python
        metrics.timing(
```

<br/>

This file was generated by Swimm. [Click here to view it in the app](https://app.swimm.io/repos/Z2l0aHViJTNBJTNBc2VudHJ5JTNBJTNBc3dpbW1pbw==/docs/12f0c).