#!/usr/bin/env bash

set -Eeuo pipefail

readonly PAWS_PACKAGE="@wangjs-jacky/paws@latest"
readonly MIN_NODE_MAJOR=20

dry_run=false
pair_after_install=true
install_prefix=""

usage() {
  cat <<'EOF'
Paws CLI installer (POC)

Usage:
  curl -fsSL https://raw.githubusercontent.com/wangjs-jacky/paws-landing/install-script-poc/web/install.sh | bash
  curl -fsSL https://raw.githubusercontent.com/wangjs-jacky/paws-landing/install-script-poc/web/install.sh | bash -s -- [options]

Options:
  --dry-run     Detect the environment without installing anything
  --no-pair     Install Paws without starting the pairing flow
  -h, --help    Show this help
EOF
}

info() {
  printf '  %s\n' "$*"
}

success() {
  printf '✓ %s\n' "$*"
}

fail() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

path_is_writable() {
  local path="$1"

  while [[ ! -e "$path" ]]; do
    path="$(dirname "$path")"
  done

  [[ -w "$path" ]]
}

persist_user_bin_path() {
  local path_line='export PATH="$HOME/.local/bin:$PATH"'
  local profile=""

  case "${SHELL:-}" in
    */zsh) profile="$HOME/.zprofile" ;;
    */bash)
      if [[ "$(uname -s)" == "Darwin" ]]; then
        profile="$HOME/.bash_profile"
      else
        profile="$HOME/.bashrc"
      fi
      ;;
  esac

  export PATH="$HOME/.local/bin:$PATH"

  if [[ -z "$profile" ]]; then
    info "Add $HOME/.local/bin to PATH before opening a new terminal."
    return
  fi

  if [[ ! -f "$profile" ]] || ! grep -Fqx "$path_line" "$profile"; then
    {
      printf '\n# Paws CLI\n'
      printf '%s\n' "$path_line"
    } >> "$profile"
    info "Added $HOME/.local/bin to PATH in $profile"
  fi
}

for argument in "$@"; do
  case "$argument" in
    --dry-run) dry_run=true ;;
    --no-pair) pair_after_install=false ;;
    -h|--help)
      usage
      exit 0
      ;;
    *) fail "Unknown option: $argument" ;;
  esac
done

printf '\nPaws CLI installer\n\n'

os="$(uname -s)"
arch="$(uname -m)"

case "$os" in
  Darwin|Linux) ;;
  *) fail "Unsupported operating system: $os. This POC supports macOS and Linux." ;;
esac

case "$arch" in
  x86_64|amd64|arm64|aarch64) ;;
  *) fail "Unsupported CPU architecture: $arch." ;;
esac

success "Detected $os ($arch)"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  fail "Node.js ${MIN_NODE_MAJOR}+ and npm are required. Install Node.js from https://nodejs.org, then run this installer again."
fi

node_major="$(node -p 'Number(process.versions.node.split(".")[0])')"
if [[ ! "$node_major" =~ ^[0-9]+$ ]] || (( node_major < MIN_NODE_MAJOR )); then
  fail "Node.js ${MIN_NODE_MAJOR}+ is required; found $(node --version). Upgrade Node.js, then run this installer again."
fi

success "Found Node.js $(node --version) and npm $(npm --version)"

global_prefix="$(npm prefix --global)"
if path_is_writable "$global_prefix"; then
  install_prefix="$global_prefix"
else
  install_prefix="$HOME/.local"
  info "The npm global directory is not writable; Paws will be installed in $install_prefix."
fi

if $dry_run; then
  info "Would install $PAWS_PACKAGE into $install_prefix"
  if $pair_after_install; then
    info "Would start the safe pairing command: paws auth login"
  fi
  success "Dry run complete; no changes were made."
  exit 0
fi

info "Installing $PAWS_PACKAGE..."
if [[ "$install_prefix" == "$global_prefix" ]]; then
  npm install --global --no-audit --no-fund "$PAWS_PACKAGE"
else
  npm install --global --prefix "$install_prefix" --no-audit --no-fund "$PAWS_PACKAGE"
  persist_user_bin_path
fi

paws_bin="$install_prefix/bin/paws"
if [[ ! -x "$paws_bin" ]]; then
  paws_bin="$(command -v paws || true)"
fi
[[ -n "$paws_bin" && -x "$paws_bin" ]] || fail "Paws was installed, but the paws executable could not be found."

package_json="$install_prefix/lib/node_modules/@wangjs-jacky/paws/package.json"
installed_version=""
if [[ -f "$package_json" ]]; then
  installed_version="$(node -e 'process.stdout.write(require(process.argv[1]).version)' "$package_json")"
fi
success "Installed Paws CLI${installed_version:+ $installed_version}"

if $pair_after_install; then
  printf '\nPair this computer with the Paws app\n\n'
  info "Scan the QR code shown below. Existing pairings are preserved."
  "$paws_bin" auth login
fi

printf '\n'
success "Paws is ready. Start a Codex session with: paws codex"
