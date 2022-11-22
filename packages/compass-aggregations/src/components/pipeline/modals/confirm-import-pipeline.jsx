import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ConfirmationModal } from '@mongodb-js/compass-components';

/**
 * Question text.
 */
const QUESTION = 'Are you sure you want to create a new pipeline?';

/**
 * Confirm import pipeline modal.
 */
class ConfirmImportPipeline extends PureComponent {
  static displayName = 'ConfirmImportPipelineComponent';

  static propTypes = {
    isConfirmationNeeded: PropTypes.bool.isRequired,
    isAutoPreviewing: PropTypes.bool.isRequired,
    closeImport: PropTypes.func.isRequired,
    confirmNew: PropTypes.func.isRequired,
  }

  onConfirm = () => {
    this.props.confirmNew();
  }

  /**
   * Render the component.
   *
   * @returns {React.Component} The component.
   */
  render() {
    return (
      <ConfirmationModal
        title={QUESTION}
        open={this.props.isConfirmationNeeded}
        onConfirm={this.onConfirm}
        onCancel={this.props.closeImport}
        buttonText="Confirm"
        trackingId="confirm_import_pipeline_modal"
        data-testid="confirm-import-pipeline-modal"
      >
        Creating this pipeline will abandon unsaved changes to the current pipeline.
      </ConfirmationModal>
    );
  }
}

export default ConfirmImportPipeline;
