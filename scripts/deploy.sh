#!/usr/bin/env bash
# Debian / GNU coreutils. Run as the repository owner (landy on the server), never root.
set -Eeuo pipefail
umask 022

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
REPO=${EGG_REPO:-$(dirname -- "$SCRIPT_DIR")}
ROOT=${EGG_ROOT:-/var/www/egg}
BRANCH=${EGG_BRANCH:-main}
URL=${EGG_URL:-https://egg.landychev.se}
ACTION=${1:-deploy}

fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
[[ $(uname -s) == Linux ]] || fail 'Deployment requires Linux (Debian).'
[[ $EUID -ne 0 ]] || fail 'Run as landy, not root. Switch user with: su - landy'
[[ $ROOT == /* && $ROOT != / ]] || fail 'EGG_ROOT must be an absolute application directory.'
[[ -d $ROOT && -w $ROOT ]] || fail "Create and grant ownership of $ROOT first."
ROOT=$(realpath -- "$ROOT")
[[ $ROOT != / ]] || fail "The application directory must not resolve to /."
for tool in git node npm flock mktemp sha256sum realpath; do
  command -v "$tool" >/dev/null || fail "Missing tool: $tool"
done
case "$ACTION" in deploy|rollback|status|prune) ;; *) fail 'Usage: deploy.sh [deploy|rollback [RELEASE]|status|prune]' ;; esac
mkdir -p "$ROOT/releases" "$ROOT/work" "$ROOT/logs" "$ROOT/state/retired"
chmod 700 "$ROOT/work" "$ROOT/logs" "$ROOT/state"
exec 9>"$ROOT/deploy.lock"
flock -n 9 || fail 'Another deployment or rollback is running.'
LOG="$ROOT/logs/$(date -u +%Y%m%dT%H%M%SZ)-$$.log"
exec > >(tee -a "$LOG") 2>&1
printf '%s action=%s script=%s\n' "$(date -u +%FT%TZ)" "$ACTION" "$(sha256sum "$0" | cut -d ' ' -f1)"

# Only complete, direct children of releases may become the active site.
validate_release() {
  local path
  path=$(realpath -e -- "$1") || return 1
  [[ $(dirname -- "$path") == "$ROOT/releases" && -s $path/version.json && -s $path/index.html ]] || return 1
  [[ $(basename -- "$path") =~ ^[A-Za-z0-9-]+$ ]] || return 1
  printf '%s\n' "$path"
}
link_to() {
  local target=$1 name=$2
  rm -f -- "$ROOT/.$name-$$"
  ln -s -- "$target" "$ROOT/.$name-$$"
  mv -Tf -- "$ROOT/.$name-$$" "$ROOT/$name"
}
OLD=''
if [[ -L $ROOT/current ]]; then
  OLD=$(realpath -e -- "$ROOT/current") || fail 'Broken current symlink.'
  [[ $OLD == "$ROOT/bootstrap" ]] || validate_release "$OLD" >/dev/null || fail 'Invalid active release.'
elif [[ -e $ROOT/current ]]; then
  fail 'current must be a symlink, not a directory.'
fi
if [[ -e $ROOT/previous || -L $ROOT/previous ]]; then
  [[ -L $ROOT/previous ]] || fail 'previous must be a symlink.'
  validate_release "$ROOT/previous" >/dev/null || fail 'Invalid previous release.'
fi
BUILD=''
SWITCHED=0
SUCCESS=0
cleanup() {
  local code=$?
  trap - EXIT
  if [[ $SWITCHED == 1 && $SUCCESS == 0 ]]; then
    printf 'Activation failed; restoring the previous site.\n' >&2
    if [[ -n $OLD ]]; then
      link_to "$OLD" current || { printf 'CRITICAL: automatic restoration failed.\n' >&2; code=1; }
    else
      rm -f -- "$ROOT/current"
    fi
    # Recheck the restored release when one exists; bootstrap has no manifest.
    if [[ -n $OLD && -f $OLD/version.json ]]; then
      node "$SCRIPT_DIR/verify-deployment.mjs" "$URL" "$OLD/version.json" active || {
        printf 'WARNING: previous pointer restored but HTTP verification still fails.\n' >&2
        code=1
      }
    fi
  fi
  [[ -z $BUILD ]] || rm -rf -- "$BUILD"
  rm -f -- "$ROOT/.current-$$" "$ROOT/.previous-$$"
  printf '%s result=%s log=%s\n' "$(date -u +%FT%TZ)" "$code" "$LOG"
  exit "$code"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

if [[ $ACTION == status ]]; then
  [[ -z $OLD ]] || printf 'Current: %s\n' "$OLD"
  [[ ! -L $ROOT/previous ]] || printf 'Previous: %s\n' "$(readlink "$ROOT/previous")"
  [[ -z $OLD || ! -f $OLD/version.json ]] || cat "$OLD/version.json"
  exit 0
fi

if [[ $ACTION == prune ]]; then
  # Seven complete days after last retirement, not after the build date.
  now=$(date +%s)
  previous=$(readlink -f "$ROOT/previous" || true)
  for stamp in "$ROOT/state/retired/"*; do
    [[ -f $stamp ]] || continue
    release=$(basename -- "$stamp")
    [[ $release =~ ^[A-Za-z0-9-]+$ ]] || continue
    candidate="$ROOT/releases/$release"
    [[ $candidate != "$OLD" && $candidate != "$previous" ]] || continue
    age=$((now - $(stat -c %Y "$stamp")))
    if (( age >= 604800 )) && [[ -d $candidate && ! -L $candidate ]]; then
      printf 'Removing retired release %s\n' "$release"
      rm -rf -- "$candidate"
      rm -f -- "$stamp"
    fi
  done
  exit 0
fi

if [[ $ACTION == deploy ]]; then
  [[ $(git -C "$REPO" remote get-url origin) == 'git@github.com:landychev/egg.git' ]] || fail 'Unexpected GitHub origin.'
  git check-ref-format "refs/heads/$BRANCH" >/dev/null || fail 'Invalid branch.'
  git -C "$REPO" fetch --no-tags origin "refs/heads/$BRANCH"
  COMMIT=$(git -C "$REPO" rev-parse 'FETCH_HEAD^{commit}')
  BUILD=$(mktemp -d "$ROOT/work/build.XXXXXXXX")
  git -C "$REPO" archive "$COMMIT" | tar -x -C "$BUILD"
  expected=$(tr -d '\r\n' < "$BUILD/.nvmrc")
  [[ $(node -p 'process.versions.node') == "$expected" ]] || fail "Use Node.js $expected from .nvmrc."
  suffix=${BUILD##*.}
  RELEASE="$(date -u +%Y%m%dT%H%M%SZ)-${COMMIT:0:12}-$suffix"
  TARGET="$ROOT/releases/$RELEASE"
  printf 'Building commit=%s release=%s\n' "$COMMIT" "$RELEASE"
  (
    cd "$BUILD"
    npm ci --include=dev --no-fund --no-audit
    npm run test --if-present
    VITE_BUILD_COMMIT="$COMMIT" npm run build -- --base="/releases/$RELEASE/"
  )
  node "$SCRIPT_DIR/release-manifest.mjs" "$BUILD/dist" "$COMMIT" "$RELEASE"
  [[ ! -e $TARGET ]] || fail 'Release already exists.'
  mv -- "$BUILD/dist" "$TARGET"
  chmod -R u=rwX,go=rX "$TARGET"
else
  if [[ -n ${2:-} ]]; then
    [[ $2 =~ ^[A-Za-z0-9-]+$ ]] || fail 'Invalid release identifier.'
    TARGET=$(validate_release "$ROOT/releases/$2") || fail 'Unknown or incomplete release.'
  else
    [[ -L $ROOT/previous ]] || fail 'No previous release to restore.'
    TARGET=$(validate_release "$ROOT/previous") || fail 'Previous release is invalid.'
  fi
fi

# Verify the new URLs before switching the root page.
node "$SCRIPT_DIR/verify-deployment.mjs" "$URL" "$TARGET/version.json" release
SWITCHED=1
link_to "$TARGET" current
node "$SCRIPT_DIR/verify-deployment.mjs" "$URL" "$TARGET/version.json" active
if [[ -n $OLD && $OLD != "$TARGET" && -f $OLD/version.json ]]; then
  link_to "$OLD" previous
  touch "$ROOT/state/retired/$(basename -- "$OLD")"
fi
rm -f -- "$ROOT/state/retired/$(basename -- "$TARGET")"
SUCCESS=1
printf 'Published: %s\n' "$TARGET"
