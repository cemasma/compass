import React, { useCallback, useMemo } from 'react';
import {
  Button,
  Icon,
  Label,
  MoreOptionsToggle,
  css,
  cx,
  focusRingStyles,
  focusRingVisibleStyles,
  spacing,
  uiColors,
} from '@mongodb-js/compass-components';

import type {
  QueryOption,
  QueryBarLayout,
} from '../../constants/query-option-definition';
import { OPTION_DEFINITION } from '../../constants/query-option-definition';
import { QueryOption as QueryOptionComponent } from '../query-option/query-option';

const queryBarFormStyles = css({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  border: `1px solid ${uiColors.gray.light2}`,
  borderRadius: '6px',
  padding: `0 ${spacing[1]}px`,

  // TODO: This margin and background will go away when the query bar is
  // wrapped in the Toolbar component in each of the plugins. COMPASS-5484
  margin: spacing[3],
  background: uiColors.white
});

const queryBarFirstRowStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: spacing[2],
  padding: `0 ${spacing[2]}px`,
});

const queryBarFirstRowOpenedStyles = css({
  paddingBottom: 0
});

const openQueryHistoryLabelStyles = css({
  display: 'inline-block',
  padding: 0,
});

const openQueryHistoryStyles = cx(
  css({
    border: 'none',
    backgroundColor: 'transparent',
    display: 'inline-flex',
    alignItems: 'center',
    padding: `${spacing[1]}px ${spacing[1]}px`,
    '&:hover': {
      cursor: 'pointer',
    },
    '&:focus': focusRingVisibleStyles,
  }),
  focusRingStyles
);

const rowStyles = css({
  alignItems: 'center',
  display: 'flex',
  flexGrow: 1,
  position: 'relative',
  margin: spacing[1],
  padding: `0 ${spacing[2]}px`,
  gap: spacing[3],
});

type QueryBarOptionProps = {
  filterPlaceholder: string; // The placeholder text for the filter input.
  filterValid:  boolean; // Whether the filter is valid.
  filterString: string; // The value of the `filter`.

  projectPlaceholder: string;
  projectValid: boolean;
  projectString: string;

  sortPlaceholder: string;
  sortValid: boolean;
  sortString: string;

  collationPlaceholder: string;
  collationValid: boolean;
  collationString: string;

  skipPlaceholder: string;
  skipValid: boolean;
  skipString: string;

  limitPlaceholder: string;
  limitValid: boolean;
  limitString: string;

  maxTimeMSPlaceholder: string;
  maxTimeMSValid: boolean;
  maxTimeMSString: string;
};

type QueryBarProps = {
  autoPopulated: boolean;
  buttonLabel?: string;
  expanded: boolean;
  // filterValid: boolean;
  layout?: QueryBarLayout;
  onApply: () => void;
  onChangeQueryOption: (queryOption: QueryOption, value: string) => void;
  onReset: () => void;
  queryState: 'apply' | 'reset';
  refreshEditorAction: () => void;
  schemaFields: string[];
  serverVersion: string;
  showQueryHistoryButton?: boolean;
  toggleExpandQueryOptions: () => void;
  toggleQueryHistory: () => void;
  valid: boolean;
} & QueryBarOptionProps;

export const QueryBar: React.FunctionComponent<QueryBarProps> = ({
  autoPopulated,
  buttonLabel = 'Apply',
  expanded: isQueryOptionsExpanded = false,
  // filterValid: isFilterValid,
  // layout = [
  //   'filter',
  //   'project',
  //   ['sort', 'maxTimeMS'],
  //   ['collation', 'skip', 'limit'],
  // ],
  layout = [
    'filter',
    ['project', 'sort'],
    ['collation', 'skip', 'limit', 'maxTimeMS'],
  ],
  onApply: _onApply,
  onChangeQueryOption,
  onReset: _onReset,
  queryState,
  refreshEditorAction,
  schemaFields,
  serverVersion,
  showQueryHistoryButton = true,
  toggleExpandQueryOptions,
  toggleQueryHistory: _toggleQueryHistory,
  valid: isQueryValid,

  // filterPlaceholder, // The placeholder text for the filter input.
  // filterValid, // Whether the filter is valid.
  // filterString, // The value of the `filter`.

  // projectPlaceholder,
  // projectValid,
  // projectString,

  // sortPlaceholder,
  // sortValid,
  // sortString,

  // collationPlaceholder,
  // collationValid,
  // collationString,

  // skipPlaceholder,
  // skipValid,
  // skipString,

  // limitPlaceholder,
  // limitValid,
  // limitString,

  // maxTimeMSPlaceholder,
  // maxTimeMSValid,
  // maxTimeMSString,
  ...propsOfQuerys
}) => {
  // const propsOfQuerys = {
  //   filterPlaceholder,
  //   filterValid,
  //   filterString,

  //   projectPlaceholder,
  //   projectValid,
  //   projectString,

  //   sortPlaceholder,
  //   sortValid,
  //   sortString,

  //   collationPlaceholder,
  //   collationValid,
  //   collationString,

  //   skipPlaceholder,
  //   skipValid,
  //   skipString,

  //   limitPlaceholder,
  //   limitValid,
  //   limitString,

  //   maxTimeMSPlaceholder,
  //   maxTimeMSValid,
  //   maxTimeMSString,
  // };
  // console.log('propsOfQuerys', propsOfQuerys);

  const onReset = useCallback(
    (evt: React.MouseEvent) => {
      // Prevent form submission.
      evt.preventDefault();

      _onReset();
    },
    [_onReset]
  );

  const toggleQueryHistory = useCallback(
    (evt: React.MouseEvent) => {
      // Prevent form submission.
      evt.preventDefault();

      _toggleQueryHistory();
    },
    [_toggleQueryHistory]
  );

  const onApply = useCallback(() => {
    if (isQueryValid) {
      _onApply();
    }
  }, [_onApply, isQueryValid]);

  const renderQueryOption = useCallback(
    (queryOption: QueryOption) => {
      // const hasError = !propsOfQuerys[`${queryOption}Valid`]
        // queryOption === 'filter'
        //   // ? !isFilterValid
          // : !propsOfQuerys[`${queryOption}Valid`];
      const hasError = 
        queryOption === 'filter'
          // ? !isQueryValid
          ? !propsOfQuerys[`${queryOption}Valid`]
          : !propsOfQuerys[`${queryOption}Valid`];

      const placeholder =
        propsOfQuerys[`${queryOption}Placeholder`] ||
        OPTION_DEFINITION[queryOption].placeholder;

      // console.log('render render', queryOption, propsOfQuerys[`${queryOption}Valid`], hasError);

      return (
        <QueryOptionComponent
          autoPopulated={autoPopulated}
          hasError={hasError}
          key={`query-option-${queryOption}`}
          queryOption={queryOption}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
            onChangeQueryOption(queryOption, evt.target.value)
          }
          onApply={onApply}
          placeholder={placeholder}
          refreshEditorAction={refreshEditorAction}
          schemaFields={schemaFields}
          serverVersion={serverVersion}
          value={propsOfQuerys[`${queryOption}String`]}
        />
      );
    },
    [
      autoPopulated,
      // isFilterValid,
      onApply,
      onChangeQueryOption,
      // props,
      refreshEditorAction,
      schemaFields,
      serverVersion,

      // ...propsOfQuerys,
      // propsOfQuerys,

      propsOfQuerys.filterPlaceholder,
      propsOfQuerys.filterValid,
      propsOfQuerys.filterString,

      propsOfQuerys.projectPlaceholder,
      propsOfQuerys.projectValid,
      propsOfQuerys.projectString,

      propsOfQuerys.sortPlaceholder,
      propsOfQuerys.sortValid,
      propsOfQuerys.sortString,

      propsOfQuerys.collationPlaceholder,
      propsOfQuerys.collationValid,
      propsOfQuerys.collationString,

      propsOfQuerys.skipPlaceholder,
      propsOfQuerys.skipValid,
      propsOfQuerys.skipString,

      propsOfQuerys.limitPlaceholder,
      propsOfQuerys.limitValid,
      propsOfQuerys.limitString,

      propsOfQuerys.maxTimeMSPlaceholder,
      propsOfQuerys.maxTimeMSValid,
      propsOfQuerys.maxTimeMSString,
    ]
  );

  const renderQueryOptionRow = useCallback(
    (queryOption: string | string[], key: number) => (
      <div className={rowStyles} key={key}>
        {typeof queryOption === 'string'
          ? renderQueryOption(queryOption as QueryOption)
          : queryOption.map((optionName: string) =>
              renderQueryOption(optionName as QueryOption)
            )}
      </div>
    ),
    [renderQueryOption]
  );

  const firstRowQueryOptions = useCallback(
    () =>
      layout.map((queryOption: string | string[], index: number) =>
        index === 0 ? renderQueryOptionRow(queryOption, index) : null
      ),
    [layout, renderQueryOptionRow]
  );

  const additionalQueryOptions = useCallback(
    () =>
      layout.map((queryOption: string | string[], index: number) =>
        isQueryOptionsExpanded && index > 0
          ? renderQueryOptionRow(queryOption, index)
          : null
      ),
    [isQueryOptionsExpanded, layout, renderQueryOptionRow]
  );

  const onFormSubmit = useCallback(
    (evt: React.FormEvent) => {
      evt.preventDefault();

      onApply();
    },
    [onApply]
  );

  return (
    <form className={queryBarFormStyles} onSubmit={onFormSubmit}>
      <div className={cx(queryBarFirstRowStyles, isQueryOptionsExpanded && queryBarFirstRowOpenedStyles)}>
        {showQueryHistoryButton && (
          <>
            <Label
              className={openQueryHistoryLabelStyles}
              htmlFor="open-query-history"
            >
              Query
            </Label>
            <button
              data-test-id="query-history-button"
              onClick={toggleQueryHistory}
              className={openQueryHistoryStyles}
              id="open-query-history"
              aria-label="Open query history"
            >
              <Icon glyph="Clock" />
              <Icon glyph="CaretDown" />
            </button>
          </>
        )}
        {firstRowQueryOptions()}
        <Button
          data-test-id="query-bar-apply-filter-button"
          disabled={!isQueryValid}
          variant="primary"
          size="small"
          type="submit"
        >
          {buttonLabel}
        </Button>
        <Button
          aria-label="Reset query"
          data-test-id="query-bar-reset-filter-button"
          onClick={onReset}
          disabled={queryState !== 'apply'}
          size="small"
        >
          Reset
        </Button>
        <MoreOptionsToggle
          aria-controls="additional-query-options-container"
          data-testid="query-bar-options-toggle"
          isExpanded={isQueryOptionsExpanded}
          onToggleOptions={toggleExpandQueryOptions}
        />
      </div>
      <div
        id="additional-query-options-container"
      >
        {additionalQueryOptions()}
      </div>
    </form>
  );
};
