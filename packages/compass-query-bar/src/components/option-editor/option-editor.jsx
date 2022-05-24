import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { QueryAutoCompleter } from 'mongodb-ace-autocompleter';
import {
  Editor,
  EditorVariant,
  EditorTextCompleter,
  css,
  cx,
  focusRingStyles,
  focusRingVisibleStyles,
  uiColors,
  spacing
} from '@mongodb-js/compass-components';

import styles from './option-editor.module.less';

const editorStyles = cx(css({
  border: `1px solid transparent`,
  // boxShadow: 'inset 0px 0px 0px 1px transparent',
  borderRadius: '6px',
  '&:hover': {
    '&::after': {
      boxShadow: `0 0 0 3px ${uiColors.gray.light1}`,
      transitionTimingFunction: 'ease-out',
    }
  },
  '&:focus-within': focusRingVisibleStyles,
}), focusRingStyles);

const editorWithErrorStyles = css({
  borderColor: uiColors.red.base,
  // boxShadow: `inset 0px 0px 0px 1px ${uiColors.red.base}`,
  '&:hover, &:focus-within': {
    '&::after': {
      boxShadow: `0 0 0 3px ${uiColors.red.light2}`,
      transitionTimingFunction: 'ease-out',
    }
  },
});

class OptionEditor extends Component {
  static displayName = 'OptionEditor';

  static propTypes = {
    label: PropTypes.string.isRequired,
    serverVersion: PropTypes.string.isRequired,
    autoPopulated: PropTypes.bool.isRequired,
    hasError: PropTypes.bool.isRequired,
    refreshEditorAction: PropTypes.func.isRequired,
    id: PropTypes.string,
    value: PropTypes.any,
    onChange: PropTypes.func,
    onApply: PropTypes.func,
    placeholder: PropTypes.string,
    schemaFields: PropTypes.array,
  };

  static defaultProps = {
    label: '',
    value: '',
    serverVersion: '3.6.0',
    autoPopulated: false,
    schemaFields: [],
  };

  /**
   * Set up the autocompleters once on initialization.
   *
   * @param {Object} props - The properties.
   */
  constructor(props) {
    super(props);
    this.completer = new QueryAutoCompleter(
      props.serverVersion,
      EditorTextCompleter,
      props.schemaFields
    );
    this.boundOnFieldsChanged = this.onFieldsChanged.bind(this);
  }

  /**
   * Subscribe on mount.
   */
  componentDidMount() {
    this.unsub = this.props.refreshEditorAction.listen(() => {
      this.editor.setValue(this.props.value);
      this.editor.clearSelection();
    });
  }

  /**
   * @param {Object} nextProps - The next properties.
   *
   * @returns {Boolean} If the component should update.
   */
  shouldComponentUpdate(nextProps) {
    this.boundOnFieldsChanged(nextProps.schemaFields);
    return (
      nextProps.autoPopulated ||
      nextProps.serverVersion !== this.props.serverVersion,
      nextProps.hasError !== this.props.hasError
    );
  }

  /**
   * Unsubscribe listeners.
   */
  componentWillUnmount() {
    this.unsub();
  }

  onFieldsChanged(fields) {
    this.completer.update(fields);
  }

  /**
   * Handle the changing of the query text.
   *
   * @param {String} newCode - The new query.
   */
  onChangeQuery = (newCode) => {
    this.props.onChange({
      target: {
        value: newCode,
      },
    });
  };

  /**
   * Render the editor.
   *
   * @returns {Component} The component.
   */
  render() {
    console.log('label', this.props.label, 'has error', this.props.hasError);
    
    return (
      <Editor
        variant={EditorVariant.Shell}
        className={cx(editorStyles, this.props.hasError && editorWithErrorStyles)}//={styles['option-editor']}
        theme="mongodb-query"
        text={this.props.value}
        hasError={this.props.hasError}
        onChangeText={this.onChangeQuery}
        name={`query-bar-option-input-${this.props.label}`}
        options={{
          useSoftTabs: true,
          minLines: 1,
          maxLines: 10,
          fontSize: 13,
          highlightActiveLine: false,
          showPrintMargin: false,
          showGutter: false,
        }}
        id={this.props.id}
        completer={this.completer}
        placeholder={this.props.placeholder}
        scrollMargin={[14, 14, 0, 0]}
        onLoad={(editor) => {
          this.editor = editor;
          this.editor.setBehavioursEnabled(true);
          this.editor.commands.addCommand({
            name: 'executeQuery',
            bindKey: {
              win: 'Enter',
              mac: 'Enter',
            },
            exec: () => {
              this.props.onApply();
            },
          });
        }}
      />
    );
  }
}

export default OptionEditor;
