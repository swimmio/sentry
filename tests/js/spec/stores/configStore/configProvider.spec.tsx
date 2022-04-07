import {Fragment} from 'react';

import {act, render, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import LegacyConfigStore from 'sentry/stores/configStore';
import {ConfigProvider, useConfigStore} from 'sentry/stores/configStore/configProvider';
import {useLegacyStore} from 'sentry/stores/useLegacyStore';

const ReactContextSourceComponent = ({children}: {children?: React.ReactNode}) => {
  const config = useConfigStore();

  return (
    <Fragment>
      React: {config.state.dsn}
      <div>{children ?? null}</div>
    </Fragment>
  );
};

const LegacyStoreSourceComponent = ({children}: {children?: React.ReactNode}) => {
  const config = useLegacyStore(LegacyConfigStore);
  return (
    <Fragment>
      Reflux: {config.dsn}
      <div>{children ?? null}</div>
    </Fragment>
  );
};

describe('configProvider', () => {
  beforeEach(() => {
    LegacyConfigStore.init();
  });
  afterEach(() => {
    LegacyConfigStore.teardown();
  });
  it('initializes with initial value', () => {
    render(
      <ConfigProvider initialValue={TestStubs.Config({dsn: 'custom dsn'})}>
        <ReactContextSourceComponent />
      </ConfigProvider>
    );

    expect(screen.getByText(/custom dsn/)).toBeInTheDocument();
  });
  it('requires a stable bridgeReflux prop', () => {
    const {rerender} = render(
      <ConfigProvider initialValue={TestStubs.Config({dsn: 'custom dsn'})} bridgeReflux>
        <ReactContextSourceComponent />
      </ConfigProvider>
    );

    expect(() => {
      rerender(
        <ConfigProvider
          initialValue={TestStubs.Config({dsn: 'custom dsn'})}
          bridgeReflux={false}
        >
          <ReactContextSourceComponent />
        </ConfigProvider>
      );
    }).toThrow(
      'bridgeReflux must not change between rerenders. This may result in undefined and out of sync behavior between the two stores. bridgeReflux changed from true -> false'
    );
  });
  it('updates React component when reflux action fires', async () => {
    // We are rendering a component that gets its data from the react context, firing
    // an action on ouron the store and asserting that it gets updated in our component
    render(
      <ConfigProvider initialValue={TestStubs.Config({dsn: 'custom dsn'})} bridgeReflux>
        <ReactContextSourceComponent />
      </ConfigProvider>
    );

    act(() => LegacyConfigStore.set('dsn', 'new custom dsn'));
    expect(await screen.findByText(/new custom dsn/)).toBeInTheDocument();
  });

  it('updates Legacy component when reducer action is dispatched', async () => {
    // We are rendering a component that gets its data from the react context, firing
    // an action via reducer dispatch and asserting that it gets updated in a component
    // that uses the legacy store
    function Trigger() {
      const [_, dispatch] = useConfigStore();

      return (
        <button
          onClick={() => {
            dispatch({
              type: 'set config value',
              payload: {key: 'dsn', value: 'new custom dsn'},
            });
          }}
        >
          Trigger
        </button>
      );
    }

    const config = TestStubs.Config({dsn: 'custom dsn'});
    render(
      <ConfigProvider initialValue={config} bridgeReflux>
        <LegacyStoreSourceComponent>
          <Trigger />
        </LegacyStoreSourceComponent>
      </ConfigProvider>
    );

    userEvent.click(screen.getByText(/Trigger/));
    expect(await screen.findByText(/Reflux: new custom dsn/)).toBeInTheDocument();
  });
});
