---
id: 07tsg
name: Python Tests
file_version: 1.0.2
app_version: 0.8.2-0
file_blobs:
  tests/sentry/snuba/test_discover.py: af54570fd06360ce8334abbb1acee86e166004de
  tests/sentry/data_export/endpoints/test_data_export.py: 59c6efec60f46c1776dc1ee9cec7c95306764781
  src/sentry/testutils/cases.py: dc7d7bebd39eb18b515b76514bc3ccff9088e298
  tests/relay_integration/lang/javascript/test_plugin.py: c35108872767a0cae0be683512e0af0dad423882
  tests/acceptance/test_performance_summary.py: b6464a3d4b2941323a2c2a5ee046b40b053d3f42
---

For python tests we use [pytest](https://docs.pytest.org/en/latest/) and testing tools provided by Django. On top of this foundation we've added a few base test cases (in `📄 src/sentry/testutils/cases.py` ).

Endpoint integration tests is where the bulk of our test suite is focused. These tests help us ensure that the APIs our customers, integrations and front-end application continue to work in expected ways. You should endeavour to include tests that cover the various user roles, and cross organization/team access scenarios, as well as invalid data scenarios as those are often overlooked when manually testing.

### Running pytest

You can use pytest to run a single directory, single file, or single test depending on the scope of your changes:

```
# Run tests for an entire directory
pytest tests/sentry/api/endpoints/

# Run tests for all files matching a pattern in a directory
pytest tests/sentry/api/endpoints/test_organization_*.py

# Run test from a single file
pytest tests/sentry/api/endpoints/test_organization_group_index.py

# Run a single test
pytest tests/snuba/api/endpoints/test_organization_events_distribution.py::OrganizationEventsDistributionEndpointTest::test_this_thing

# Run all tests in a file that match a substring
pytest tests/snuba/api/endpoints/test_organization_events_distribution.py -k method_name

# When running tests Django rebuilds the database on every run, which can make your test startup time slow. To avoid this you can use
# the `--reuse-db` flag, so that the database will persist between runs. This should significantly improve your test startup time after
# the first time you use it.
# Note: If the schema changes you may need to run with `--create-db` once so that you have the latest schema.
pytest --reuse-db tests/sentry/api/endpoints/
```

Some frequently used options for pytest are:

*   `-k` Filter test methods/classes by a substring.
    
*   `-s` Don't capture stdout when running tests.
    

Refer to the [pytest](http://doc.pytest.org/en/latest/usage.html) docs for more usage options.

### Creating data in tests

Sentry has also added a suite of factory helper methods that help you build data to write your tests against. The factory methods in `📄 src/sentry/testutils/factories.py` are available on all our test suite classes. Use these methods to build up the required organization, projects and other postgres based state.

<br/>

You should also use `store_event`[<sup id="1sdxx9">↓</sup>](#f-1sdxx9) to store events in a similar way that the application does in production.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 tests/sentry/snuba/test_discover.py
```python
⬜ 1334           data["transaction"] = "/latest_event"
🟩 1335           stored_event = self.store_event(data, project_id=project.id)
```

<br/>

Storing events requires your test to inherit from `SnubaTestCase`[<sup id="Z1zEJFv">↓</sup>](#f-Z1zEJFv) , as seen in the example below.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 tests/sentry/snuba/test_discover.py
```python
🟩 32     class QueryIntegrationTest(SnubaTestCase, TestCase):
⬜ 33         def setUp(self):
⬜ 34             super().setUp()
⬜ 35             self.environment = self.create_environment(self.project, name="prod")
```

<br/>

When using `store_event`[<sup id="2v1t7x">↓</sup>](#f-2v1t7x) , take care to set a `timestamp`[<sup id="Z1aLda9">↓</sup>](#f-Z1aLda9) _in the past_ on the event. When omitted, the `timestamp`[<sup id="Z1aLda9">↓</sup>](#f-Z1aLda9) uses 'now' which can result in events not being picked due to timestamp boundaries.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 tests/sentry/snuba/test_discover.py
```python
⬜ 32     class QueryIntegrationTest(SnubaTestCase, TestCase):
⬜ 33         def setUp(self):
⬜ 34             super().setUp()
⬜ 35             self.environment = self.create_environment(self.project, name="prod")
⬜ 36             self.release = self.create_release(self.project, version="first-release")
⬜ 37             self.now = before_now().replace(tzinfo=timezone.utc)
⬜ 38             self.one_min_ago = before_now(minutes=1).replace(tzinfo=timezone.utc)
⬜ 39             self.two_min_ago = before_now(minutes=2).replace(tzinfo=timezone.utc)
⬜ 40     
⬜ 41             self.event_time = self.one_min_ago
🟩 42             self.event = self.store_event(
🟩 43                 data={
🟩 44                     "message": "oh no",
🟩 45                     "release": "first-release",
🟩 46                     "environment": "prod",
🟩 47                     "platform": "python",
🟩 48                     "user": {"id": "99", "email": "bruce@example.com", "username": "brucew"},
🟩 49                     "timestamp": iso_format(self.event_time),
🟩 50                     "tags": [["key1", "value1"]],
🟩 51                 },
🟩 52                 project_id=self.project.id,
🟩 53             )
```

<br/>

### Setting options and feature flags

```
def test_success(self):
    with self.feature('organization:new-thing'):
        with self.options({'option': 'value'}):
            # Run test logic with features and options set.

    # Disable the new-thing feature.
    with self.feature({'organization:new-thing': False}):
        # Run you logic with a feature off.
```

<br/>

If your tests are for feature flagged endpoints, or require specific options to be set, tou can use helper methods to mutate the configuration data into the right state - using `self.feature`[<sup id="ZPbXI5">↓</sup>](#f-ZPbXI5) :
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 tests/sentry/data_export/endpoints/test_data_export.py
```python
🟩 43         def test_authorization(self):
🟩 44             payload = self.make_payload("issue")
🟩 45     
🟩 46             # Without the discover-query feature, the endpoint should 404
🟩 47             with self.feature({"organizations:discover-query": False}):
🟩 48                 self.get_valid_response(self.org.slug, status_code=404, **payload)
🟩 49     
🟩 50             # With the right permissions, the endpoint should 201
🟩 51             with self.feature("organizations:discover-query"):
🟩 52                 self.get_valid_response(self.org.slug, status_code=201, **payload)
⬜ 53     
⬜ 54             modified_payload = self.make_payload("issue", {"project": -5}, overwrite=True)
⬜ 55     
⬜ 56             # Without project permissions, the endpoint should 403
⬜ 57             with self.feature("organizations:discover-query"):
⬜ 58                 self.get_valid_response(self.org.slug, status_code=403, **modified_payload)
```

<br/>

### Notes on Database Tests

For the love of god please stop writing tests using the Django test case. However if for whatever reason you are extending on of them and you do not feel motivated enough to convert them into function style tests be extra careful about using it for non database related functionality.

<br/>

The django `TestCase` class incurs an incredibly high cost due to database management and we have some tests that do not require the database. To check if your new tests are unnecessarily using the database export the `SENTRY_DETECT_TESTCASE_MISUSE`[<sup id="cECDl">↓</sup>](#f-cECDl) environment variable and set it to `1`:

```
SENTRY_DETECT_TESTCASE_MISUSE=1 pytest my_new_test.py
```

If the test runner detects that you used the Django `TestCase` class but you did not end up needing it, it will yell at you. This is protects you against other developers yelling at you later for slowing down CI.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/testutils/cases.py
```python
⬜ 140    DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36"
⬜ 141    
⬜ 142    
🟩 143    DETECT_TESTCASE_MISUSE = os.environ.get("SENTRY_DETECT_TESTCASE_MISUSE") == "1"
⬜ 144    SILENCE_MIXED_TESTCASE_MISUSE = os.environ.get("SENTRY_SILENCE_MIXED_TESTCASE_MISUSE") == "1"
⬜ 145    
⬜ 146    
```

<br/>

### External Services

<br/>

Use the `responses`[<sup id="6XLQM">↓</sup>](#f-6XLQM) library to `add`[<sup id="Z24YdyK">↓</sup>](#f-Z24YdyK) stub responses for an outbound API requests your code is making. This will help you simulate success and failure scenarios with relative ease.

For example:
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 tests/relay_integration/lang/javascript/test_plugin.py
```python
⬜ 269        def test_sourcemap_source_expansion(self):
🟩 270            responses.add(
🟩 271                responses.GET,
🟩 272                "http://example.com/file.min.js",
🟩 273                body=load_fixture("file.min.js"),
🟩 274                content_type="application/javascript; charset=utf-8",
🟩 275            )
⬜ 276            responses.add(
⬜ 277                responses.GET,
⬜ 278                "http://example.com/file1.js",
```

<br/>

### Working with time reliably

When writing tests related to ingesting events we have to operate within the constraint of events cannot be older than 30 days. Because all events must be recent, we cannot use traditional time freezing strategies to get consistent data in tests. Instead of choosing arbitrary points in time we work backwards from the present, and have a few helper functions to do so, specifically `iso_format`[<sup id="1PSe6H">↓</sup>](#f-1PSe6H) and `before_now`[<sup id="rN8Hj">↓</sup>](#f-rN8Hj):
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 tests/acceptance/test_performance_summary.py
```python
⬜ 51             self.store_event(
⬜ 52                 data={
⬜ 53                     "transaction": "/country_by_code/",
⬜ 54                     "message": "This is bad",
⬜ 55                     "event_id": "b" * 32,
🟩 56                     "timestamp": iso_format(before_now(minutes=1)),
⬜ 57                 },
⬜ 58                 project_id=self.project.id,
⬜ 59             )
```

<br/>

These functions generate datetime objects, and ISO 8601 formatted datetime strings relative to the present enabling you to have events at known time offsets without violating the 30 day constraint that relay imposes.

<br/>

<!-- THIS IS AN AUTOGENERATED SECTION. DO NOT EDIT THIS SECTION DIRECTLY -->
### Swimm Note

<span id="f-Z24YdyK">add</span>[^](#Z24YdyK) - "tests/relay_integration/lang/javascript/test_plugin.py" L270
```python
        responses.add(
```

<span id="f-rN8Hj">before_now</span>[^](#rN8Hj) - "tests/acceptance/test_performance_summary.py" L56
```python
                "timestamp": iso_format(before_now(minutes=1)),
```

<span id="f-1PSe6H">iso_format</span>[^](#1PSe6H) - "tests/acceptance/test_performance_summary.py" L56
```python
                "timestamp": iso_format(before_now(minutes=1)),
```

<span id="f-6XLQM">responses</span>[^](#6XLQM) - "tests/relay_integration/lang/javascript/test_plugin.py" L270
```python
        responses.add(
```

<span id="f-ZPbXI5">self.feature</span>[^](#ZPbXI5) - "tests/sentry/data_export/endpoints/test_data_export.py" L51
```python
        with self.feature("organizations:discover-query"):
```

<span id="f-cECDl">SENTRY_DETECT_TESTCASE_MISUSE</span>[^](#cECDl) - "src/sentry/testutils/cases.py" L143
```python
DETECT_TESTCASE_MISUSE = os.environ.get("SENTRY_DETECT_TESTCASE_MISUSE") == "1"
```

<span id="f-Z1zEJFv">SnubaTestCase</span>[^](#Z1zEJFv) - "tests/sentry/snuba/test_discover.py" L32
```python
class QueryIntegrationTest(SnubaTestCase, TestCase):
```

<span id="f-1sdxx9">store_event</span>[^](#1sdxx9) - "tests/sentry/snuba/test_discover.py" L1335
```python
        stored_event = self.store_event(data, project_id=project.id)
```

<span id="f-2v1t7x">store_event</span>[^](#2v1t7x) - "tests/sentry/snuba/test_discover.py" L42
```python
        self.event = self.store_event(
```

<span id="f-Z1aLda9">timestamp</span>[^](#Z1aLda9) - "tests/sentry/snuba/test_discover.py" L49
```python
                "timestamp": iso_format(self.event_time),
```

<br/>

This file was generated by Swimm. [Click here to view it in the app](https://app.swimm.io/repos/Z2l0aHViJTNBJTNBc2VudHJ5JTNBJTNBc3dpbW1pbw==/docs/07tsg).