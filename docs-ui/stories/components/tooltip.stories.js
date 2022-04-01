import {Component, Fragment} from 'react';

import Button from 'sentry/components/button';
import Tooltip from 'sentry/components/tooltip';

import styled from '@emotion/styled';

export const TooltipIndicator = () => {
  return (
    <Container>
      <Tooltip title="Hello this is a tooltip">
        <Text>Sample text gg</Text>
      </Tooltip>
      <Tooltip title="Hello this is a tooltip">
        <TextDark>Sample text gg</TextDark>
      </Tooltip>
      <Tooltip title="Hello this is a tooltip">
        <TextDotted>Sample text gg</TextDotted>
      </Tooltip>
      <Tooltip title="Hello this is a tooltip">
        <TextDottedDark>Sample text gg</TextDottedDark>
      </Tooltip>
    </Container>
  );
};

const Container = styled('div')`
  display: flex;
  flex-direction: column;
`;

const Text = styled('p')`
  text-decoration-color: ${p => p.theme.border};
  text-decoration-style: dashed;
  text-decoration-line: underline;
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.12em;
  font-size: ${p => p.theme.fontSizeMedium};
`;

const TextDark = styled('p')`
  text-decoration-color: ${p => p.theme.subText};
  text-decoration-style: dashed;
  text-decoration-line: underline;
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.12em;
  font-size: ${p => p.theme.fontSizeMedium};
`;

const TextDotted = styled('p')`
  text-decoration-color: ${p => p.theme.border};
  text-decoration-style: dotted;
  text-decoration-line: underline;
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.12em;
  font-size: ${p => p.theme.fontSizeMedium};
`;

const TextDottedDark = styled('p')`
  text-decoration-color: ${p => p.theme.subText};
  text-decoration-style: dotted;
  text-decoration-line: underline;
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.12em;
  font-size: ${p => p.theme.fontSizeMedium};
`;

class CustomThing extends Component {
  render() {
    return <span>A class component with no ref</span>;
  }
}

class PassThroughComponent extends Component {
  render() {
    return this.props.children;
  }
}

export default {
  title: 'Components/Tooltips/Tooltip',
  component: Tooltip,
};

export const _Tooltip = ({...args}) => {
  return (
    <Fragment>
      <h3>With styled component trigger</h3>
      <p>
        <Tooltip {...args}>
          <Button>Styled button</Button>
        </Tooltip>
      </p>

      <h3>With class component trigger</h3>
      <p>
        <Tooltip {...args}>
          <CustomThing>Custom React Component</CustomThing>
        </Tooltip>
      </p>

      <h3>With an SVG element trigger</h3>
      <p>
        <svg
          viewBox="0 0 100 100"
          width="100"
          height="100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <Tooltip {...args}>
            <circle cx="50" cy="50" r="50" />
          </Tooltip>
        </svg>
      </p>

      <h3>With element title and native html element</h3>
      <p>
        <Tooltip
          title={
            <span>
              <em>so strong</em>
            </span>
          }
          {...args}
        >
          <button>Native button</button>
        </Tooltip>
      </p>

      <h3>With overflowing text</h3>
      <p>
        <Tooltip {...args}>
          <div
            style={{
              width: 'fit-content',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              resize: 'horizontal',
            }}
          >
            Activate showOnlyOnOverflow and drag the right side to make this text
            overflow. Tooltip will appear on hover when text overflows.
          </div>
        </Tooltip>
      </p>

      <h3>With custom component with text</h3>
      <p>
        <Tooltip {...args}>
          <PassThroughComponent>
            <div
              style={{
                width: 'fit-content',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                resize: 'horizontal',
              }}
            >
              This text is in a custom react component. Activate showOnlyOnOverflow and
              drag the right side to make this text overflow.
            </div>
          </PassThroughComponent>
        </Tooltip>
      </p>
    </Fragment>
  );
};
_Tooltip.args = {
  title: 'Basic tooltip content',
  disabled: false,
  /** Container display mode */
  displayMode: undefined,
  position: 'top',
  isHoverable: false,
  showOnlyOnOverflow: false,
};
_Tooltip.argTypes = {
  displayMode: {
    control: {
      type: 'select',
      options: ['block', 'inline-block', 'inline'],
    },
  },
  position: {
    control: {
      type: 'select',
      options: [
        'bottom',
        'top',
        'left',
        'right',
        'bottom-start',
        'bottom-end',
        'top-start',
        'top-end',
        'left-start',
        'left-end',
        'right-start',
        'right-end',
        'auto',
      ],
    },
  },
};
_Tooltip.parameters = {
  docs: {
    description: {
      story: 'Adds a tooltip to any component',
    },
  },
};
