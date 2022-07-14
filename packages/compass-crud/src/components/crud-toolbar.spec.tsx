import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import AppRegistry from 'hadron-app-registry';
import {
  fireEvent,
  render,
  screen,
  cleanup,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CrudToolbar } from './crud-toolbar';

const noop = () => {
  /* noop */
};
const queryBarText = 'Query bar';
const mockQueryBarRole = {
  name: 'Query Bar',
  // eslint-disable-next-line react/display-name
  component: () => <div>{queryBarText}</div>,
  configureStore: () => ({}),
  configureActions: () => {},
  storeName: 'Query.Store',
  actionName: 'Query.Actions',
};

const mockQueryBarStore = {
  state: {
    filterString: '',
    projectString: '',
    sortString: '',
    collationString: '',
    skipString: '',
    limitString: '',
    maxTimeMSString: '',
  },
};

function renderCrudToolbar(
  props?: Partial<React.ComponentProps<typeof CrudToolbar>>
) {
  const appRegistry = new AppRegistry();
  appRegistry.registerRole('Query.QueryBar', mockQueryBarRole);
  appRegistry.registerStore(mockQueryBarRole.storeName, mockQueryBarStore);

  return render(
    <CrudToolbar
      activeDocumentView="List"
      count={55}
      end={20}
      getPage={noop}
      insertDataHandler={noop}
      isExportable
      loadingCount={false}
      localAppRegistry={appRegistry}
      onApplyClicked={noop}
      onResetClicked={noop}
      openExportFileDialog={noop}
      page={0}
      readonly={false}
      refreshDocuments={noop}
      resultId="123"
      start={0}
      viewSwitchHandler={noop}
      {...props}
    />
  );
}

const addDataText = 'Add Data';

describe('CrudToolbar Component', function () {
  afterEach(function () {
    cleanup();
  });

  it('renders the query bar role', function () {
    renderCrudToolbar();

    expect(screen.getByText(queryBarText)).to.be.visible;
  });

  it('should not render the query bar role when isExportable is false', function () {
    renderCrudToolbar({
      isExportable: false,
    });

    expect(screen.queryByText(queryBarText)).to.not.exist;
  });

  it('call to change the document view type on click', function () {
    const viewSwitchHandlerSpy = sinon.spy();
    renderCrudToolbar({
      viewSwitchHandler: viewSwitchHandlerSpy,
    });

    expect(viewSwitchHandlerSpy.called).to.be.false;
    const option = within(screen.getByTestId('toolbar-view-table')).getByRole(
      'tab'
    );
    userEvent.click(option);

    expect(viewSwitchHandlerSpy.calledOnce).to.be.true;
    expect(viewSwitchHandlerSpy.firstCall.args[0]).to.equal('Table');
  });

  it('should call to get the next page when the next button is hit', function () {
    const getPageSpy = sinon.spy();
    renderCrudToolbar({
      getPage: getPageSpy,
    });

    expect(getPageSpy.called).to.be.false;
    fireEvent.click(screen.getByTestId('docs-toolbar-next-page-btn'));

    expect(getPageSpy.calledOnce).to.be.true;
    expect(getPageSpy.firstCall.args[0]).to.equal(1);
  });

  it('should have the prev page button disabled', function () {
    const getPageSpy = sinon.spy();
    renderCrudToolbar({
      getPage: getPageSpy,
    });

    expect(getPageSpy.called).to.be.false;
    fireEvent.click(screen.getByTestId('docs-toolbar-prev-page-btn'));

    expect(screen.getByTestId('docs-toolbar-prev-page-btn')).to.have.attribute(
      'aria-disabled',
      'true'
    );

    expect(getPageSpy.calledOnce).to.be.false;
    expect(screen.getByTestId('docs-toolbar-prev-page-btn')).to.be.visible;
  });

  it('should call to get the next page when the prev button is hit on a non-first page', function () {
    const getPageSpy = sinon.spy();
    renderCrudToolbar({
      getPage: getPageSpy,
      page: 1,
      start: 20,
      end: 40,
    });
    expect(screen.getByTestId('docs-toolbar-prev-page-btn')).to.have.attribute(
      'aria-disabled',
      'false'
    );

    expect(getPageSpy.called).to.be.false;
    fireEvent.click(screen.getByTestId('docs-toolbar-prev-page-btn'));

    expect(getPageSpy.calledOnce).to.be.true;
    expect(getPageSpy.firstCall.args[0]).to.equal(0);
  });

  it('should have the next page button disabled when on the last page', function () {
    const getPageSpy = sinon.spy();
    renderCrudToolbar({
      getPage: getPageSpy,
      page: 1,
      start: 20,
      end: 39,
      count: 39,
    });

    expect(getPageSpy.called).to.be.false;
    fireEvent.click(screen.getByTestId('docs-toolbar-next-page-btn'));

    expect(screen.getByTestId('docs-toolbar-next-page-btn')).to.have.attribute(
      'aria-disabled',
      'true'
    );

    expect(getPageSpy.calledOnce).to.be.false;
  });

  it('should render the add data button when it is not readonly', function () {
    renderCrudToolbar({
      readonly: false,
    });

    expect(screen.queryByText(addDataText)).to.be.visible;
  });

  it('should render the start and end count', function () {
    renderCrudToolbar({
      start: 5,
      end: 25,
      count: 200,
    });

    expect(screen.getByTestId('crud-document-count-display')).to.have.text(
      '5 - 25 of 200'
    );
  });

  it('should not render the add data button when it is readonly', function () {
    renderCrudToolbar({
      readonly: true,
    });

    expect(screen.queryByText(addDataText)).to.not.exist;
  });

  it('should call to open the export dialog when export is clicked', function () {
    const exportSpy = sinon.spy();
    renderCrudToolbar({
      openExportFileDialog: exportSpy,
    });

    expect(exportSpy.called).to.be.false;
    fireEvent.click(screen.getByText('Export Collection'));

    expect(exportSpy.calledOnce).to.be.true;
  });
});
