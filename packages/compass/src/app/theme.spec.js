const { expect } = require('chai');
const sinon = require('sinon');

const { enableDarkTheme, disableDarkTheme, loadTheme } = require('./theme');

describe('theme', function () {
  let appRegistryEmitSpy;

  beforeEach(function () {
    appRegistryEmitSpy = sinon.fake();

    global.hadronApp = {
      appRegistry: {
        emit: appRegistryEmitSpy,
      },
    };
  });

  describe('#enableDarkTheme', function () {
    it('should set the dark theme on the global hadron app', function () {
      expect(global.hadronApp.theme).to.equal(undefined);

      enableDarkTheme();

      expect(global.hadronApp.theme).to.equal('Dark');
    });

    it('should emit the dark theme to the app registry', function () {
      expect(appRegistryEmitSpy.callCount).to.equal(0);

      enableDarkTheme();

      expect(appRegistryEmitSpy.callCount).to.equal(1);
      expect(appRegistryEmitSpy.firstCall.args[0]).to.equal('darkmode-enable');
      expect(global.hadronApp.theme).to.equal('Dark');
    });
  });

  describe('#disableDarkTheme', function () {
    it('should set the light theme on the global hadron app', function () {
      expect(global.hadronApp.theme).to.equal(undefined);

      disableDarkTheme();

      expect(global.hadronApp.theme).to.equal('Light');
    });

    it('should emit disable dark theme to the app registry', function () {
      expect(appRegistryEmitSpy.callCount).to.equal(0);

      disableDarkTheme();

      expect(appRegistryEmitSpy.callCount).to.equal(1);
      expect(appRegistryEmitSpy.firstCall.args[0]).to.equal('darkmode-disable');
      expect(global.hadronApp.theme).to.equal('Light');
    });
  });

  describe('#loadTheme', function () {
    it('should set the dark theme on the app registry', function () {
      expect(global.hadronApp.theme).to.equal(undefined);

      loadTheme('DARK');

      expect(global.hadronApp.theme).to.equal('Dark');
      expect(appRegistryEmitSpy.firstCall.args[0]).to.equal('darkmode-enable');
      expect(appRegistryEmitSpy.callCount).to.equal(1);
    });

    it('should set the light theme on the app registry', function () {
      expect(appRegistryEmitSpy.callCount).to.equal(0);

      loadTheme('LIGHT');

      expect(appRegistryEmitSpy.callCount).to.equal(1);
      expect(appRegistryEmitSpy.firstCall.args[0]).to.equal('darkmode-disable');
      expect(global.hadronApp.theme).to.equal('Light');
    });

    it('should set the theme on the app registry with os theme', function () {
      expect(appRegistryEmitSpy.callCount).to.equal(0);

      loadTheme('OS_THEME');

      expect(appRegistryEmitSpy.callCount).to.equal(1);
    });
  });
});
