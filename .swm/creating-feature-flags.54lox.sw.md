---
id: 54lox
name: Creating Feature Flags
file_version: 1.0.2
app_version: 0.8.2-0
file_blobs:
  src/sentry/features/__init__.py: 452694288e171760d79cf85636216f2a6b2a95df
  src/sentry/conf/server.py: 0a614a0dd0643c1734a0d30dab2ec8f0fe5eacc9
  src/sentry/api/serializers/models/organization.py: 7315597c400e2ed8800b18c8e35fba67c466b47f
---

Feature flags are declared in Sentry's codebase. For self-hosted users, those flags are then configured via `📄 docker/sentry.conf.py` . For Sentry's SaaS deployment, Flagr is used to configure flags in production.

You can find a list of features available by looking at `📄 src/sentry/features/__init__.py` .

They are declared using `add`[<sup id="hylf3">↓</sup>](#f-hylf3) on the `FeatureManager`[<sup id="KmnaP">↓</sup>](#f-KmnaP) object.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/features/__init__.py
```python
⬜ 44     #   NOTE: Features that require Snuba to function, add to the
⬜ 45     #         `requires_snuba` tuple.
⬜ 46     
🟩 47     default_manager = FeatureManager()  # NOQA
🟩 48     
🟩 49     # Unscoped features
🟩 50     default_manager.add("auth:register")
🟩 51     default_manager.add("organizations:create")
🟩 52     
🟩 53     # Organization scoped features that are in development or in customer trials.
🟩 54     default_manager.add("organizations:alert-filters", OrganizationFeature)
🟩 55     default_manager.add("organizations:alert-crash-free-metrics", OrganizationFeature, True)
🟩 56     default_manager.add("organizations:alert-wizard-v3", OrganizationFeature, True)
⬜ 57     default_manager.add("organizations:api-keys", OrganizationFeature)
⬜ 58     default_manager.add("organizations:breadcrumb-linked-event", OrganizationFeature, True)
⬜ 59     default_manager.add("organizations:crash-rate-alerts", OrganizationFeature, True)
```

<br/>

To enable a feature, we need to update `📄 docker/sentry.conf.py` , for example, to enable `organizations:breadcrumb-linked-event`[<sup id="Zc1Nnq">↓</sup>](#f-Zc1Nnq) , we should add this:

```
SENTRY_FEATURES["organizations:breadcrumb-linked-event"] = True
```

Generally you want your feature names to be unique to help in their removal. For example a feature flag like `trends` may prove difficult to find because `trends` may appear throughout the codebase. But a name like `performance-trends-view` is more likely to be unique and easier to remove later.

<br/>

## Creating a new Feature Flag

### Determine what scope the feature should have

Features can be scoped by organization, and projects. If you're not confident you want a project feature, create an organization level one. In this example we'll follow the feature called `breadcrumb-linked-event`[<sup id="1JBuEK">↓</sup>](#f-1JBuEK)  scoped at the `organizations`[<sup id="Z2n9fPJ">↓</sup>](#f-Z2n9fPJ) level.

### Add your feature to `📄 src/sentry/conf/server.py`

`📄 src/sentry/conf/server.py` contains many of the default settings in the application. Here you will add your feature, and decide what default value it should hold unless specified by the user.

The `SENTRY_FEATURES`[<sup id="Z3CxwT">↓</sup>](#f-Z3CxwT)  dictionary contains all the features in the application with their corresponding scope. Your feature should start off disabled by default (`False`[<sup id="Z24Iltd">↓</sup>](#f-Z24Iltd) :
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/conf/server.py
```python
⬜ 925    SENTRY_FEATURES = {
⬜ 926        # Enables user registration.
⬜ 927        "auth:register": True,
⬜ 928        # Enable advanced search features, like negation and wildcard matching.
⬜ 929        "organizations:advanced-search": True,
⬜ 930        # Use metrics as the dataset for crash free metric alerts
⬜ 931        "organizations:alert-crash-free-metrics": False,
⬜ 932        # Alert wizard redesign version 3
⬜ 933        "organizations:alert-wizard-v3": False,
⬜ 934        "organizations:api-keys": False,
⬜ 935        # Enable multiple Apple app-store-connect sources per project.
⬜ 936        "organizations:app-store-connect-multiple": False,
🟩 937        # Enable the linked event feature in the issue details breadcrumb.
🟩 938        "organizations:breadcrumb-linked-event": False,
⬜ 939        # Enable change alerts for an org
⬜ 940        "organizations:change-alerts": True,
⬜ 941        # Enable alerting based on crash free sessions/users
```

<br/>

### Add your feature to the `FeatureManager`[<sup id="KmnaP">↓</sup>](#f-KmnaP)

The `FeatureManager`[<sup id="KmnaP">↓</sup>](#f-KmnaP) handles the application features. We add all the features to the `FeatureManager`[<sup id="KmnaP">↓</sup>](#f-KmnaP) , including the type of feature we want to add to the file `📄 src/sentry/features/__init__.py` .

If you plan to use [flagr in production](#enabling-your-feature-in-production) add a third optional boolean parameter when adding the feature, for example, `organizations:breadcrumb-linked-event`[<sup id="Zc1Nnq">↓</sup>](#f-Zc1Nnq) below has this set to `True`[<sup id="Z2hB0ax">↓</sup>](#f-Z2hB0ax) .

If you don't plan to use flagr don't pass this third parameter, for example, `organizations:api-keys`[<sup id="w6LTT">↓</sup>](#f-w6LTT) below.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/features/__init__.py
```python
⬜ 54     default_manager.add("organizations:alert-filters", OrganizationFeature)
⬜ 55     default_manager.add("organizations:alert-crash-free-metrics", OrganizationFeature, True)
⬜ 56     default_manager.add("organizations:alert-wizard-v3", OrganizationFeature, True)
🟩 57     default_manager.add("organizations:api-keys", OrganizationFeature)
🟩 58     default_manager.add("organizations:breadcrumb-linked-event", OrganizationFeature, True)
⬜ 59     default_manager.add("organizations:crash-rate-alerts", OrganizationFeature, True)
⬜ 60     default_manager.add("organizations:custom-event-title", OrganizationFeature)
⬜ 61     default_manager.add("organizations:dashboard-grid-layout", OrganizationFeature, True)
```

<br/>

### Add it to the Organization Model Serializer

The Organization model serializer builds a set called `feature_list`[<sup id="1HbxpY">↓</sup>](#f-1HbxpY)  that is given to the front-end to use. By default the all features are checked and those that are present are added into the list. If your feature requires additional custom logic you will have to update the organization serializer
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/api/serializers/models/organization.py
<!-- collapsed -->

```python
⬜ 156                for feature in features.all(feature_type=OrganizationFeature).keys()
⬜ 157                if feature.startswith(_ORGANIZATION_SCOPE_PREFIX)
⬜ 158            ]
🟩 159            feature_list = set()
⬜ 160    
⬜ 161            # Check features in batch using the entity handler
⬜ 162            batch_features = features.batch_has(org_features, actor=user, organization=obj)
```

<br/>

### Using Model Flags (Less common)

Sometimes a flag on the model is used to indicate a feature flag as shown below. This is not recommended unless there is a specific reason to make changes to the model.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/api/serializers/models/organization.py
```python
🟩 196            if getattr(obj.flags, "allow_joinleave"):
🟩 197                feature_list.add("open-membership")
⬜ 198            if not getattr(obj.flags, "disable_shared_issues"):
⬜ 199                feature_list.add("shared-issues")
```

<br/>

<!-- THIS IS AN AUTOGENERATED SECTION. DO NOT EDIT THIS SECTION DIRECTLY -->
### Swimm Note

<span id="f-hylf3">add</span>[^](#hylf3) - "src/sentry/features/__init__.py" L50
```python
default_manager.add("auth:register")
```

<span id="f-1JBuEK">breadcrumb-linked-event</span>[^](#1JBuEK) - "src/sentry/features/__init__.py" L58
```python
default_manager.add("organizations:breadcrumb-linked-event", OrganizationFeature, True)
```

<span id="f-Z24Iltd">False</span>[^](#Z24Iltd) - "src/sentry/conf/server.py" L938
```python
    "organizations:breadcrumb-linked-event": False,
```

<span id="f-1HbxpY">feature_list</span>[^](#1HbxpY) - "src/sentry/api/serializers/models/organization.py" L159
```python
        feature_list = set()
```

<span id="f-KmnaP">FeatureManager</span>[^](#KmnaP) - "src/sentry/features/__init__.py" L47
```python
default_manager = FeatureManager()  # NOQA
```

<span id="f-Z2n9fPJ">organizations</span>[^](#Z2n9fPJ) - "src/sentry/features/__init__.py" L58
```python
default_manager.add("organizations:breadcrumb-linked-event", OrganizationFeature, True)
```

<span id="f-w6LTT">organizations:api-keys</span>[^](#w6LTT) - "src/sentry/features/__init__.py" L57
```python
default_manager.add("organizations:api-keys", OrganizationFeature)
```

<span id="f-Zc1Nnq">organizations:breadcrumb-linked-event</span>[^](#Zc1Nnq) - "src/sentry/features/__init__.py" L58
```python
default_manager.add("organizations:breadcrumb-linked-event", OrganizationFeature, True)
```

<span id="f-Z3CxwT">SENTRY_FEATURES</span>[^](#Z3CxwT) - "src/sentry/conf/server.py" L925
```python
SENTRY_FEATURES = {
```

<span id="f-Z2hB0ax">True</span>[^](#Z2hB0ax) - "src/sentry/features/__init__.py" L58
```python
default_manager.add("organizations:breadcrumb-linked-event", OrganizationFeature, True)
```

<br/>

This file was generated by Swimm. [Click here to view it in the app](https://app.swimm.io/repos/Z2l0aHViJTNBJTNBc2VudHJ5JTNBJTNBc3dpbW1pbw==/docs/54lox).