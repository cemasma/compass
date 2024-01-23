#! /usr/bin/env bash

set -e

ARTIFACTS_DIR="packages/compass/dist"
echo "Verifying artifacts at $ARTIFACTS_DIR"
ls -l $ARTIFACTS_DIR

# Use tmp directory for all gpg operations
GPG_HOME=$(mktemp -d)
TMP_FILE=$(mktemp)

trap_handler() {
  local code=$?
  if [ $code -eq 0 ]; then
    echo "Verification successful"
  else
    echo "Verification failed with exit code $code"
    cat "$TMP_FILE"
  fi
  rm -f "$TMP_FILE"
  rm -rf "$GPG_HOME"
  exit $code
}

trap trap_handler ERR EXIT

verify_using_gpg() {
  echo "Verifying $1 using gpg"
  gpg --homedir $GPG_HOME --verify $ARTIFACTS_DIR/$1.sig $ARTIFACTS_DIR/$1 > "$TMP_FILE" 2>&1
}

verify_using_powershell() {
  echo "Verifying $1 using powershell"
  powershell Get-AuthenticodeSignature -FilePath $ARTIFACTS_DIR/$1 > "$TMP_FILE" 2>&1
}

verify_using_codesign() {
  echo "Verifying $1 using codesign"
  codesign -dv --verbose=4 $ARTIFACTS_DIR/$1 > "$TMP_FILE" 2>&1
}

setup_gpg() {
  echo "Importing Compass public key"
  curl https://pgp.mongodb.com/compass.asc | gpg --homedir $GPG_HOME --import > "$TMP_FILE" 2>&1
}

if [ "$IS_WINDOWS" = true ]; then
  verify_using_powershell $WINDOWS_EXE_NAME
  verify_using_powershell $WINDOWS_MSI_NAME
  echo "Skipping verification for Windows artifacts using gpg: $WINDOWS_ZIP_NAME, $WINDOWS_NUPKG_NAME"
elif [ "$IS_UBUNTU" = true ]; then
  setup_gpg
  verify_using_gpg $LINUX_DEB_NAME
  verify_using_gpg $LINUX_TAR_NAME
elif [ "$IS_RHEL" = true ]; then
  setup_gpg
  verify_using_gpg $RHEL_RPM_NAME
  verify_using_gpg $RHEL_TAR_NAME
elif [ "$IS_OSX" = true ]; then
  setup_gpg
  verify_using_gpg $OSX_ZIP_NAME
  verify_using_codesign $OSX_DMG_NAME
else
  echo "Unknown OS, failed to verify file signing"
  exit 1
fi