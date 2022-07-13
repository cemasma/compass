import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Icon,
  Label,
  MoreOptionsToggle,
  Popover,
  Portal,
  css,
  cx,
  focusRingStyles,
  focusRingVisibleStyles,
  spacing,
  uiColors,
} from '@mongodb-js/compass-components';
import type AppRegistry from 'hadron-app-registry';

const queryBarStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: spacing[2],
  padding: spacing[2],
  border: `1px solid ${uiColors.gray.light2}`,
  borderRadius: '6px',
  position: 'relative'
});

const queryAreaStyles = css({
  flexGrow: 1,
});

const openQueryHistoryLabelStyles = css({
  display: 'inline-block',
  padding: 0,
});

const queryHistoryContainerStyles = css({
  position: 'absolute',
  top: spacing[4],
  left: spacing[6],
  zIndex: 1000,
  height: '50vh'
});

const queryHistoryPortalStyles = css({
  position: 'relative',
  top: spacing[4],
  left: spacing[6],
  zIndex: 1000,
  height: '50vh'
})

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

type QueryBarProps = {
  buttonLabel?: string;
  expanded: boolean;
  isQueryOptionsExpanded?: boolean;
  valid: boolean;
  queryState: 'apply' | 'reset';
  showQueryHistoryButton?: boolean;
  toggleExpandQueryOptions: () => void;
  toggleQueryHistory: () => void;
  localAppRegistry: AppRegistry;
  appRegistry: AppRegistry;
};

export const QueryBar: React.FunctionComponent<QueryBarProps> = ({
  buttonLabel = 'Apply',
  expanded: isQueryOptionsExpanded = false,
  valid: isQueryValid,
  localAppRegistry,
  appRegistry,
  queryState,
  showQueryHistoryButton = true,
  toggleExpandQueryOptions,
  toggleQueryHistory,
  store
}) => {
  // const QueryHistoryComponent = u

  // const QueryHistoryComponent = localAppRegistry;
  console.log('localAppRegistrylocalAppRegistry', store.localAppRegistry, store.globalAppRegistry);//, store);
  // console.log('appRegistry', store.localAppRegistry, store.appRegistry);//, store);
  // console.log('localAppRegistrylocalAppRegistry', store.localAppRegistry, store.appRegistry);//, store);
  console.log('store.globalAppRegistry', store.globalAppRegistry);

  // console.log()
  // const queryHistoryComponent = store.globalAppRegistry.getRole('Query.History')
  // console.log('queryHistoryComponent', queryHistoryComponent);
  console.log('query history store', store.localAppRegistry.getStore('Query.History'));
  // const queryHistoryStore = store.localAppRegistry.getStore('Query.History');
  // const queryHistoryActions = store.localAppRegistry.getAction('Query.History');

  // console.log('queryHistoryActions', queryHistoryActions);
  // const QueryHistoryComponent = store.globalAppRegistry.getRole('Query.QueryHistory')[0].component;

  // const QueryHistoryRole = store.localAppRegistry.getRole('Query.QueryHistory')[0];

  const queryHistoryStore = store.localAppRegistry.getStore('Query.History');
  const queryHistoryActions = store.localAppRegistry.getAction('Query.History.Actions');
  const QueryHistoryComponent = store.globalAppRegistry.getRole('Query.QueryHistory')[0].component;

  // const queryHistoryStore = store.localAppRegistry.getStore('Query.History');
  // const queryHistoryActions = store.localAppRegistry.getAction('Query.History');
  // const QueryHistoryComponent = store.globalAppRegistry.getRole('Query.QueryHistory')[0].component;
  console.log('QueryHistoryComponent', QueryHistoryComponent);
  console.log('queryHistoryActions', queryHistoryActions);
  console.log('queryHistoryStore', queryHistoryStore);

  const queryHistoryButtonRef = useRef<HTMLButtonElement>(null);

  // {scopedModals.map((modal: any) => (
  //   <modal.component
  //     store={modal.store}
  //     actions={modal.actions}
  //     key={modal.key}
  //   />
  // ))}

  const queryHistoryPosition = useRef({
    x: 0,
    y: 0,
  });
  const [ queryHistoryPositioned, setQueryHistoryPositioned ] = useState(false);

  const [ showQueryHistory, setShowQueryHistory ] = useState(false); 

  useEffect(() => {
    if (showQueryHistory) {
      const boundingBox = queryHistoryButtonRef.current!.getBoundingClientRect();
      console.log('position:', boundingBox);
      queryHistoryPosition.current = {
        x: boundingBox.left,
        y: boundingBox.top + boundingBox.height
      };
      setQueryHistoryPositioned(true);
    } else if (queryHistoryPositioned) {
      setQueryHistoryPositioned(false)
    }
  }, [ showQueryHistory, queryHistoryPositioned ]);

  return (
    <div className={queryBarStyles}>
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
            // onClick={toggleQueryHistory}
            onClick={() => setShowQueryHistory(!showQueryHistory)}
            className={openQueryHistoryStyles}
            id="open-query-history"
            aria-label="Open query history"
            ref={queryHistoryButtonRef}
          >
            <Icon glyph="Clock" />
            <Icon glyph="CaretDown" />
            {/* {showQueryHistory && queryHistoryPositioned && (
              <Portal
                // className={queryHistoryPortalStyles}
                className={css({
                  position: 'absolute',
                  top: queryHistoryPosition.current.y + spacing[2],
                  left: queryHistoryPosition.current.x
                })}
              >
                <QueryHistoryComponent
                  onClickClose={() => setShowQueryHistory(false)}
                  store={queryHistoryStore}
                  actions={queryHistoryActions}
                />
              </Portal>
            )} */}
            {/* <Popover
              align="bottom"
              justify="start"
              active={showQueryHistory}
              usePortal
              adjustOnMutation
              // spacing={10}
              spacing={spacing[2]}
            >
              <QueryHistoryComponent
                onClickClose={() => setShowQueryHistory(false)}
                store={queryHistoryStore}
                actions={queryHistoryActions}
              />
            </Popover> */}
          </button>
          <Popover
            align="bottom"
            justify="start"
            active={showQueryHistory}
            usePortal
            adjustOnMutation
            // spacing={10}
            spacing={-spacing[2]}
            // spacing={0}
            popoverZIndex={99999}
            className={css({
              marginLeft: spacing[6]
            })}
            onClick={() => {
              console.log('on click!!!');
            }}
          >
            <QueryHistoryComponent
              onClickClose={() => setShowQueryHistory(false)}
              store={queryHistoryStore}
              actions={queryHistoryActions}
            />
          </Popover>
          {/* {showQueryHistory && (
            // localAppRegistry
            <>
            
              <div className={queryHistoryContainerStyles}>
                <QueryHistoryComponent
                  collapsed={false}
                  store={queryHistoryStore}
                  actions={queryHistoryActions}
                />
              </div>
            </>
          )} */}
        </>
      )}
      <div className={queryAreaStyles}>Query Area</div>
      {isQueryOptionsExpanded && <div id="aria-controls">Query Options</div>}
      <Button
        data-test-id="query-bar-apply-filter-button"
        onClick={() => alert('coming soon')}
        disabled={!isQueryValid}
        variant="primary"
        size="small"
      >
        {buttonLabel}
      </Button>
      <Button
        aria-label="Reset query"
        data-test-id="query-bar-reset-filter-button"
        onClick={() => alert('coming soon')}
        disabled={queryState !== 'apply'}
        size="small"
      >
        Reset
      </Button>
      <MoreOptionsToggle
        aria-controls="query-options-container"
        data-testid="query-bar-options-toggle"
        isExpanded={isQueryOptionsExpanded}
        onToggleOptions={toggleExpandQueryOptions}
      />
    </div>
  );
};
