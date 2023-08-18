import React from 'react';
import type { ComponentProps } from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import type { SinonSpy } from 'sinon';
import { Provider } from 'react-redux';

import { QueryAI } from './query-ai';
import { configureStore } from '../stores/query-bar-store';
import {
  AIQueryActionTypes,
  changeAIPromptText,
} from '../stores/ai-query-reducer';
import { DEFAULT_FIELD_VALUES } from '../constants/query-bar-store';
import { mapQueryToFormFields } from '../utils/query';
import preferencesAccess from 'compass-preferences-model';

const noop = () => {
  /* no op */
};

const renderQueryAI = ({
  ...props
}: Partial<ComponentProps<typeof QueryAI>> = {}) => {
  const store = configureStore();

  render(
    <Provider store={store}>
      <QueryAI onClose={noop} show {...props} />
    </Provider>
  );
  return store;
};

const feedbackPopoverTextAreaId = 'feedback-popover-textarea';

describe('QueryAI Component', function () {
  let store: ReturnType<typeof configureStore>;
  afterEach(cleanup);

  describe('when rendered', function () {
    let onCloseSpy: SinonSpy;
    beforeEach(function () {
      onCloseSpy = sinon.spy();
      store = renderQueryAI({
        onClose: onCloseSpy,
      });
    });

    it('calls to close robot button is clicked', function () {
      expect(onCloseSpy.called).to.be.false;
      const closeButton = screen.getByTestId('close-ai-query-button');
      expect(closeButton).to.be.visible;
      closeButton.click();
      expect(onCloseSpy.calledOnce).to.be.true;
    });
  });

  describe('when rendered with text', function () {
    beforeEach(function () {
      store = renderQueryAI();
      store.dispatch(changeAIPromptText('test'));
    });

    it('calls to clear the text when the X is clicked', function () {
      expect(store.getState().aiQuery.aiPromptText).to.equal('test');

      const clearTextButton = screen.getByTestId('ai-text-clear-prompt');
      expect(clearTextButton).to.be.visible;
      clearTextButton.click();

      expect(store.getState().aiQuery.aiPromptText).to.equal('');
    });
  });

  describe('Query AI Feedback', function () {
    let trackUsageStatistics: boolean | undefined;

    beforeEach(async function () {
      store = renderQueryAI();
      trackUsageStatistics =
        preferencesAccess.getPreferences().trackUsageStatistics;
      // 'compass:track' will only emit if tracking is enabled
      await preferencesAccess.savePreferences({ trackUsageStatistics: true });
    });

    afterEach(async function () {
      await preferencesAccess.savePreferences({ trackUsageStatistics });
    });

    it('should log a telemetry event with the entered text on submit', async function () {
      // Note: This is coupling this test with internals of the logger and telemetry.
      // We're doing this as this is a unique case where we're using telemetry
      // for feedback. Avoid repeating this elsewhere.
      const trackingLogs: any[] = [];
      process.on('compass:track', (event) => trackingLogs.push(event));

      // No feedback popover is shown yet.
      expect(screen.queryByTestId(feedbackPopoverTextAreaId)).to.not.exist;
      expect(screen.queryByTestId('ai-query-feedback-thumbs-up')).to.not.exist;

      store.dispatch({
        type: AIQueryActionTypes.AIQuerySucceeded,
        fields: mapQueryToFormFields(DEFAULT_FIELD_VALUES),
      });

      expect(screen.queryByTestId(feedbackPopoverTextAreaId)).to.not.exist;
      const thumbsUpButton = screen.getByTestId('ai-query-feedback-thumbs-up');
      expect(thumbsUpButton).to.be.visible;
      thumbsUpButton.click();

      const textArea = screen.getByTestId(feedbackPopoverTextAreaId);
      expect(textArea).to.be.visible;
      fireEvent.change(textArea, {
        target: { value: 'this is the query I was looking for' },
      });

      screen.getByText('Submit').click();

      await waitFor(
        () => {
          // No feedback popover is shown.
          expect(screen.queryByTestId(feedbackPopoverTextAreaId)).to.not.exist;
          expect(trackingLogs).to.deep.equal([
            {
              event: 'AI Query Feedback',
              properties: {
                feedback: 'positive',
                text: 'this is the query I was looking for',
              },
            },
          ]);
        },
        { interval: 10 }
      );
    });
  });
});
