---
id: 1mwb9
name: Acceptance Tests
file_version: 1.0.2
app_version: 0.8.2-0
file_blobs:
  static/app/views/settings/organizationTeams/organizationTeams.tsx: 258b09184285fcf1ea2cc66cfd863c771a33b9e0
  tests/acceptance/test_teams_list.py: b94f940b61149f9455a7ec39cfb964284a34a75f
  tests/acceptance/test_accept_organization_invite.py: 3ac70816cc8676f387105d6abc3a94a846f4dd8f
  .github/workflows/acceptance.yml: a44f32212e125603ca657c1b54a07c6bf7ed159a
  static/app/views/settings/projectSecurityHeaders/reportUri.tsx: 0b337fbf7e07aed47bc57aab4afba28a40dcb972
---

Our acceptance tests leverage selenium and chromedriver to simulate a user using the front-end application and the entire backend stack. We use acceptance tests for two purposes at Sentry:

1.  To cover workflows that are not possible to cover with just endpoint tests or with Jest alone.
    
2.  To prepare snapshots for visual regression tests via our visual regression GitHub Actions.
    

Acceptance tests can be found in `📄 tests/acceptance` and run locally with `pytest`.

### Running acceptance tests

When you run acceptance tests, webpack will be run automatically to build static assets. If you change Javascript files while creating or modifying acceptance tests, you'll need to `rm .webpack.meta` after each change to trigger a rebuild on static assets.

#### Run a single acceptance test

`pytest tests/acceptance/test_organization_group_index.py -k test_with_onboarding`

#### Run the browser with a head so you can watch it

`pytest tests/acceptance/test_organization_group_index.py --no-headless=true -k test_with_onboarding`

#### Open each snapshot image

```
SENTRY_SCREENSHOT=1 VISUAL_SNAPSHOT_ENABLE=1 \
pytest tests/acceptance/test_organization_group_index.py \
-k test_with_onboarding 
```

**Note**: If you're seeing:

`WARNING: Failed to gather log types: Message: unknown command: Cannot call non W3C standard command while in W3C mode` it means that `Webpack` hasn't compiled assets properly.

### Locating Elements

<br/>

Because we use emotion our classnames are generally not useful to browser automation. Instead we liberally use `data-test-id`[<sup id="Zkj6Ah">↓</sup>](#f-Zkj6Ah) attributes to define hook points for browser automation and Jest tests. For example:
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 static/app/views/settings/organizationTeams/organizationTeams.tsx
```tsx
⬜ 87     
⬜ 88       return (
🟩 89         <div data-test-id="team-list">
⬜ 90           <SentryDocumentTitle title={title} orgSlug={organization.slug} />
⬜ 91           <SettingsPageHeader title={title} action={action} />
```

<br/>

And then we can reference it in the test, like so:
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 tests/acceptance/test_teams_list.py
```python
⬜ 18         def test_simple(self):
⬜ 19             self.project.update(first_event=timezone.now())
⬜ 20             self.browser.get(self.path)
⬜ 21             self.browser.wait_until_not('[data-test-id="loading-indicator"]')
⬜ 22             self.browser.wait_until_test_id("team-list")
⬜ 23             self.browser.snapshot("organization teams list")
⬜ 24     
⬜ 25             # team details link
🟩 26             self.browser.click('[data-test-id="team-list"] a[href]:first-child')
⬜ 27             self.browser.wait_until_not('[data-test-id="loading-indicator"]')
⬜ 28             self.browser.snapshot("organization team - members list")
```

<br/>

### Dealing with Asynchronous actions

All of our data is loaded asynchronously into the front-end and acceptance tests need to account for various latencies and response times. We favour using selenium's `wait_until`[<sup id="Z1rVdC8">↓</sup>](#f-Z1rVdC8) features to poll the DOM until elements are present or visible, as seen in the snippet below. We do not use `sleep()`.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 tests/acceptance/test_accept_organization_invite.py
```python
⬜ 21         def test_invite_simple(self):
⬜ 22             self.login_as(self.user)
⬜ 23             self.browser.get(self.member.get_invite_link().split("/", 3)[-1])
🟩 24             self.browser.wait_until('[data-test-id="accept-invite"]')
⬜ 25             self.browser.snapshot(name="accept organization invite")
⬜ 26             assert self.browser.element_exists('[aria-label="join-organization"]')
```

<br/>

### Visual Regression

Pixels Matter and because of that we use visual regressions to help catch unintended changes to how Sentry is rendered. During acceptance tests we capture screenshots and compare the screenshots in your pull request to approved baselines.

<br/>

The visual regression tests are run as part of our Github Actions.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 .github/workflows/acceptance.yml
```yaml
⬜ 99               base-path: .artifacts/visual-snapshots/jest
⬜ 100              css-path: src/sentry/static/sentry/dist/entrypoints/sentry.css
⬜ 101    
🟩 102          - name: Save snapshots
🟩 103            uses: getsentry/action-visual-snapshot@v2
🟩 104            with:
🟩 105              save-only: true
🟩 106              snapshot-path: .artifacts/visual-snapshots
⬜ 107    
⬜ 108          - name: Handle artifacts
⬜ 109            uses: ./.github/actions/artifacts
```

<br/>

While we have fairly wide coverage with visual regressions there are a few important blind spots:

*   Hover cards and hover states
    
*   Modal windows
    
*   Charts and data visualizations
    

All of these components and interactions are generally not included in visual snapshots, and you should take care when working on any of them.

<br/>

#### Dealing with always changing data

Because visual regression compares image snapshots, and a significant portion of our data deals with timeseries data we often need to replace time based content with 'fixed' data. You can use the `getDynamicText`[<sup id="Z1hAPrL">↓</sup>](#f-Z1hAPrL) helper to provide fixed content for components/data that is dependent on the current time or varies too frequently to be included in a visual snapshot.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 static/app/views/settings/projectSecurityHeaders/reportUri.tsx
```tsx
⬜ 11     export function getSecurityDsn(keyList: ProjectKey[]) {
⬜ 12       const endpoint = keyList.length ? keyList[0].dsn.security : DEFAULT_ENDPOINT;
🟩 13       return getDynamicText({
🟩 14         value: endpoint,
🟩 15         fixed: DEFAULT_ENDPOINT,
🟩 16       });
⬜ 17     }
```

<br/>

<!-- THIS IS AN AUTOGENERATED SECTION. DO NOT EDIT THIS SECTION DIRECTLY -->
### Swimm Note

<span id="f-Zkj6Ah">data-test-id</span>[^](#Zkj6Ah) - "static/app/views/settings/organizationTeams/organizationTeams.tsx" L89
```tsx
    <div data-test-id="team-list">
```

<span id="f-Z1hAPrL">getDynamicText</span>[^](#Z1hAPrL) - "static/app/views/settings/projectSecurityHeaders/reportUri.tsx" L13
```tsx
  return getDynamicText({
```

<span id="f-Z1rVdC8">wait_until</span>[^](#Z1rVdC8) - "tests/acceptance/test_accept_organization_invite.py" L24
```python
        self.browser.wait_until('[data-test-id="accept-invite"]')
```

<br/>

This file was generated by Swimm. [Click here to view it in the app](https://app.swimm.io/repos/Z2l0aHViJTNBJTNBc2VudHJ5JTNBJTNBc3dpbW1pbw==/docs/1mwb9).