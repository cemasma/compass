import type AppRegistry from 'hadron-app-registry';

import ExportToLanguagePlugin from './plugin';
import configureStore from './stores';

/**
 * Export To Language Role (specifically created)
 **/
const ROLE = {
  name: 'Export To Language',
  component: ExportToLanguagePlugin,
  configureStore: configureStore,
  configureActions: () => { /* noop */},
  storeName: 'ExportToLanguage.Store'
};

/**
 * Activate all the components in the Export To Language package.
 * @param {Object} appRegistry - The Hadron appRegisrty to activate this plugin with.
 **/
function activate(appRegistry: AppRegistry) {
  appRegistry.registerRole('Collection.ScopedModal', ROLE);
}

/**
 * Deactivate all the components in the Export To Language package.
 * @param {Object} appRegistry - The Hadron appRegisrty to deactivate this plugin with.
 **/
function deactivate(appRegistry: AppRegistry) {
  appRegistry.deregisterRole('Collection.ScopedModal', ROLE);
}

export default ExportToLanguagePlugin;
export { activate, deactivate, configureStore };
export { default as metadata } from '../package.json';
