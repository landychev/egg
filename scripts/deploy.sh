#!/usr/bin/env bash
# Debian / GNU coreutils. Invoke as root; Git runs as the checkout owner.
set -Eeuo pipefail
umask 022
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
REPO=${EGG_REPO:-$(dirname -- "$SCRIPT_DIR")}
ROOT=${EGG_ROOT:-/var/www/egg}
STATE=${EGG_STATE_ROOT:-/var/lib/egg-deploy}
BRANCH=${EGG_BRANCH:-main}
URL=${EGG_URL:-https://egg.landychev.se}
APACHE=${EGG_APACHE:-1}
ACTION=${1:-deploy}
HOST=${URL#*://}; HOST=${HOST%%/*}; HOST=${HOST%%:*}
fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
[[ $(uname -s) == Linux ]] || fail 'Deployment requires Linux (Debian).'
[[ $EUID -eq 0 ]] || fail 'Run this script as root.'
case "$ACTION" in prepare|deploy|rollback|status|prune) ;; *) fail 'Usage: deploy.sh [prepare|deploy|rollback [RELEASE]|status|prune]' ;; esac
[[ $# -le 1 || ( $ACTION == rollback && $# == 2 ) ]] || fail 'Unexpected arguments.'
for tool in flock realpath install stat mktemp chown; do
  command -v "$tool" >/dev/null || fail "Missing tool: $tool"
done
for path in "$ROOT" "$STATE"; do
  [[ $path == /* && $path != *$'\n'* && ! -L $path ]] || fail 'Use absolute, non-symlink application paths.'
  case "$(realpath -m -- "$path")" in /|/var|/var/www|/var/lib|/home|/tmp|/usr|/etc|/opt) fail 'Refusing a shared system directory.' ;; esac
done
ROOT=$(realpath -m -- "$ROOT")
STATE=$(realpath -m -- "$STATE")
[[ $STATE != "$ROOT" && $STATE != "$ROOT/"* && $ROOT != "$STATE/"* ]] || fail 'Public and private directories must be separate.'
id www-data >/dev/null || fail 'The www-data account is missing.'

ensure_dir() {
  local path=$1 owner=$2 mode=$3
  [[ ! -L $path && ( ! -e $path || -d $path ) ]] || fail "Unexpected filesystem entry: $path"
  install -d -o "$owner" -g "$owner" -m "$mode" -- "$path"
}
# Control files live outside the www-data-owned public directory.
[[ ! -e $STATE || $(stat -c %u "$STATE") == 0 ]] || fail 'The private state directory must be root-owned.'
ensure_dir "$STATE" root 700
[[ ! -L $STATE/deploy.lock ]] || fail 'Unexpected lock symlink.'
exec 9>"$STATE/deploy.lock"
flock -n 9 || fail 'Another deployment, preparation or rollback is running.'
for part in work logs retired; do ensure_dir "$STATE/$part" root 700; done
ensure_dir "$ROOT" www-data 755
ensure_dir "$ROOT/releases" www-data 755
LOG="$STATE/logs/$(date -u +%Y%m%dT%H%M%SZ)-$$.log"
exec > >(tee -a "$LOG" 9>&-) 2>&1
printf '%s action=%s script=%s\n' "$(date -u +%FT%TZ)" "$ACTION" "$(sha256sum "$0" | cut -d ' ' -f1)"
BUILD=''
STAGE=''

validate_release() {
  [[ -d $1 && ! -L $1 && $(dirname -- "$1") == "$ROOT/releases" ]] || return 1
  [[ $(basename -- "$1") =~ ^[A-Za-z0-9-]{1,128}$ && -s $1/index.html && -s $1/version.json ]] || return 1
  [[ ! -L $1/index.html && ! -L $1/version.json ]]
}
read_pointer() {
  local path="$ROOT/$1" target
  if [[ -L $path ]]; then
    target=$(readlink -- "$path")
    [[ $target == /* ]] || target="$ROOT/$target"
    [[ ! -L $target ]] || fail "Pointer must target a real directory: $path"
    target=$(realpath -e -- "$target") || fail "Broken pointer: $path"
    if [[ $target == "$ROOT/bootstrap" ]]; then
      [[ $1 == current && -f $target/index.html && ! -L $target/index.html ]] || fail 'Invalid bootstrap pointer.'
    else
      validate_release "$target" || fail "Invalid release pointer: $path"
    fi
    printf '%s\n' "$target"
  elif [[ -e $path ]]; then
    fail "$path must be a symlink; existing files or directories are not overwritten."
  fi
}
set_pointer() {
  local name=$1 target=$2 temporary
  [[ ! -e $ROOT/$name || -L $ROOT/$name ]] || { printf 'Unexpected pointer entry: %s\n' "$name" >&2; return 1; }
  if [[ -z $target ]]; then
    rm -f -- "$ROOT/$name"
    return
  fi
  temporary=$(mktemp -d "$ROOT/.switch.XXXXXXXX") || return 1
  if ln -s -- "$target" "$temporary/link" && chown -h www-data:www-data "$temporary/link" && mv -Tf -- "$temporary/link" "$ROOT/$name"; then
    rmdir -- "$temporary"
  else
    rm -f -- "$temporary/link"
    rmdir -- "$temporary"
    return 1
  fi
}
label() { [[ -z $1 ]] || basename -- "$1"; }
from_label() {
  [[ -n $1 ]] || return 0
  [[ $1 =~ ^[A-Za-z0-9-]{1,128}$ ]] || return 1
  if [[ $1 == bootstrap ]]; then
    [[ -d $ROOT/bootstrap && ! -L $ROOT/bootstrap ]] || return 1
    printf '%s\n' "$ROOT/bootstrap"
  else
    validate_release "$ROOT/releases/$1" || return 1
    printf '%s\n' "$ROOT/releases/$1"
  fi
}
configure_apache() {
  # Install the site file from the repo, enable modules/site, obtain the
  # Let's Encrypt certificate when EGG_URL is https, reload only on change.
  local src="$REPO/deploy/apache/$HOST.conf" dst="/etc/apache2/sites-available/$HOST.conf"
  local changed=0 saved='' module
  [[ $APACHE == 1 ]] || { printf 'Apache configuration skipped (EGG_APACHE=%s).\n' "$APACHE"; return 0; }
  for tool in apache2ctl a2enmod a2ensite systemctl cmp; do
    command -v "$tool" >/dev/null || fail "Missing tool: $tool (set EGG_APACHE=0 to skip Apache handling)"
  done
  [[ -f $src && ! -L $src ]] || fail "Apache template missing: $src"
  [[ ! -L $dst ]] || fail "Refusing to replace a symlink: $dst"
  ensure_dir "$STATE/apache-backups" root 700
  if ! cmp -s -- "$src" "$dst"; then
    [[ -e /root/apache-before-egg.tar.gz ]] || tar -czf /root/apache-before-egg.tar.gz -C / etc/apache2
    if [[ -f $dst ]]; then
      saved="$STATE/apache-backups/$HOST.conf.$(date -u +%Y%m%dT%H%M%SZ)"
      cp -a -- "$dst" "$saved"
    fi
    install -m 644 -- "$src" "$dst"
    printf 'Installed Apache site %s\n' "$dst"
    changed=1
  fi
  for module in headers ssl alias; do
    [[ -e /etc/apache2/mods-enabled/$module.load ]] || { a2enmod -q "$module"; changed=1; }
  done
  [[ -e /etc/apache2/sites-enabled/$HOST.conf ]] || { a2ensite -q "$HOST.conf"; changed=1; }
  if [[ $changed == 1 ]]; then
    if ! apache2ctl configtest; then
      if [[ -n $saved ]]; then cp -a -- "$saved" "$dst"; else a2dissite -q "$HOST.conf"; fi
      fail "Apache configtest failed; previous site configuration restored."
    fi
    systemctl reload apache2
  fi
  if [[ $URL == https://* ]]; then
    local cert="/etc/letsencrypt/live/$HOST/fullchain.pem"
    if [[ ! -e $cert ]]; then
      command -v certbot >/dev/null || fail 'certbot is missing; cannot obtain the HTTPS certificate.'
      printf 'Requesting Let'"'"'s Encrypt certificate for %s\n' "$HOST"
      certbot certonly --apache --non-interactive --agree-tos --cert-name "$HOST" -d "$HOST" \
        --keep-until-expiring --deploy-hook 'systemctl reload apache2' \
        ${EGG_CERTBOT_EMAIL:+-m "$EGG_CERTBOT_EMAIL"} 9>&-
      [[ -e $cert ]] || fail 'certbot finished without a certificate.'
      apache2ctl configtest
      systemctl reload apache2
    fi
    # The HTTPS vhost is inside <IfFile>; make sure Apache actually serves it.
    if ! apache2ctl -S 2>/dev/null | grep -Eq "(:443|port 443 namevhost)[[:space:]]+${HOST//./\\.}([[:space:]]|\$)"; then
      systemctl reload apache2
      apache2ctl -S 2>/dev/null | grep -Eq "(:443|port 443 namevhost)[[:space:]]+${HOST//./\\.}([[:space:]]|\$)" \
        || fail "Apache does not serve $HOST on port 443; check apache2ctl -S for a conflicting vhost."
    fi
  fi
  printf 'Apache ready for %s\n' "$URL"
}
recover_pending() {
  local entries old previous target
  [[ ! -L $STATE/pending ]] || return 1
  mapfile -t entries < "$STATE/pending"
  [[ ${#entries[@]} == 3 ]] || return 1
  old=$(from_label "${entries[0]}") || return 1
  previous=$(from_label "${entries[1]}") || return 1
  target=$(from_label "${entries[2]}") || return 1
  printf 'Restoring pointers from the interrupted activation.\n'
  set_pointer current "$old" || return 1
  set_pointer previous "$previous" || return 1
  if [[ -n $target && $target != "$old" && $target != "$previous" ]]; then
    touch -- "$STATE/retired/$(basename -- "$target")" || return 1
  fi
  rm -f -- "$STATE/pending"
}
cleanup() {
  local code=$?
  trap - EXIT INT TERM
  set +e
  if [[ -e $STATE/pending || -L $STATE/pending ]]; then
    recover_pending || printf 'ERROR: pointer recovery failed; pending journal retained.\n' >&2
    [[ $code != 0 ]] || code=1
  fi
  [[ -z $BUILD ]] || rm -rf --one-file-system -- "$BUILD"
  [[ -z $STAGE ]] || rm -rf --one-file-system -- "$STAGE"
  printf '%s result=%s log=%s\n' "$(date -u +%FT%TZ)" "$code" "$LOG"
  exit "$code"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
if [[ -e $STATE/pending || -L $STATE/pending ]]; then
  recover_pending || fail 'An earlier activation needs manual recovery; see the pending journal.'
fi
OLD=$(read_pointer current)
PREVIOUS=$(read_pointer previous)

if [[ $ACTION == prepare ]]; then
  if [[ -z $OLD ]]; then
    ensure_dir "$ROOT/bootstrap" www-data 755
    [[ ! -L $ROOT/bootstrap/index.html ]] || fail 'Unexpected bootstrap file symlink.'
    if [[ ! -e $ROOT/bootstrap/index.html ]]; then
      printf '%s\n' '<!doctype html><html lang="sv"><meta charset="utf-8"><title>Egg Catcher</title><h1>Egg Catcher förbereds</h1></html>' > "$ROOT/bootstrap/index.html"
    fi
    [[ -f $ROOT/bootstrap/index.html ]] || fail 'Bootstrap index must be a regular file.'
    chown www-data:www-data "$ROOT/bootstrap/index.html"
    chmod 644 "$ROOT/bootstrap/index.html"
    set_pointer current "$ROOT/bootstrap"
  fi
  configure_apache
  printf 'Prepared %s; existing active version preserved.\n' "$ROOT"
  exit 0
fi
if [[ $ACTION == status ]]; then
  printf 'Current: %s\nPrevious: %s\n' "${OLD:-none}" "${PREVIOUS:-none}"
  exit 0
fi
if [[ $ACTION == prune ]]; then
  now=$(date +%s)
  for stamp in "$STATE/retired/"*; do
    [[ -f $stamp && ! -L $stamp ]] || continue
    release=$(basename -- "$stamp")
    [[ $release =~ ^[A-Za-z0-9-]{1,128}$ ]] || continue
    candidate="$ROOT/releases/$release"
    [[ $candidate != "$OLD" && $candidate != "$PREVIOUS" ]] || continue
    if (( now - $(stat -c %Y "$stamp") >= 604800 )) && [[ -d $candidate && ! -L $candidate ]]; then
      printf 'Removing retired release %s\n' "$release"
      rm -rf --one-file-system -- "$candidate"
      rm -f -- "$stamp"
    fi
  done
  exit 0
fi
command -v node >/dev/null || fail 'Node.js is missing from root PATH.'
node_cmd() { node "$@" 9>&-; }
check_release() { node_cmd "$SCRIPT_DIR/check-release.mjs" "$1" "${2:-}" "$(basename -- "$1")"; }
verify_web() { node_cmd "$SCRIPT_DIR/verify-deployment.mjs" "$URL" "$1/version.json" "$2"; }

if [[ $ACTION == deploy ]]; then
  for tool in git npm; do command -v "$tool" >/dev/null || fail "Missing tool: $tool"; done
  configure_apache
  REPO=$(realpath -e -- "$REPO")
  [[ -e $REPO/.git ]] || fail 'EGG_REPO must be the Git checkout.'
  # Git runs as the invoking user (root), like the manual git pull. Set
  # EGG_GIT_USER to run it as another account via runuser instead.
  GIT_USER=${EGG_GIT_USER:-}
  if [[ -n $GIT_USER ]]; then
    id "$GIT_USER" >/dev/null || fail "Unknown EGG_GIT_USER: $GIT_USER"
    command -v runuser >/dev/null || fail 'Missing tool: runuser'
  fi
  git_cmd() {
    local -a prefix=()
    [[ -z $GIT_USER ]] || prefix=(runuser -u "$GIT_USER" --)
    "${prefix[@]}" env GIT_TERMINAL_PROMPT=0 GIT_SSH_COMMAND="${GIT_SSH_COMMAND:-ssh -o BatchMode=yes -o ConnectTimeout=15}" \
      git -c safe.directory="$REPO" -C "$REPO" "$@" 9>&-
  }
  [[ $(git_cmd config --get remote.origin.url) == 'git@github.com:landychev/egg.git' ]] || fail 'Unexpected GitHub origin.'
  git_cmd check-ref-format "refs/heads/$BRANCH" >/dev/null || fail 'Invalid branch.'
  git_cmd fetch --no-tags origin "refs/heads/$BRANCH"
  COMMIT=$(git_cmd rev-parse 'FETCH_HEAD^{commit}')
  [[ $COMMIT =~ ^[a-f0-9]{40}$ ]] || fail 'Invalid commit.'
  expected=$(git_cmd show "$COMMIT:.nvmrc" | tr -d '\r\n')
  [[ $(node_cmd -p 'process.versions.node') == "$expected" ]] || fail "Use Node.js $expected in root PATH."
  if [[ -n $OLD && $OLD != "$ROOT/bootstrap" ]]; then
    active_commit=$(check_release "$OLD")
    if [[ $active_commit == "$COMMIT" ]]; then
      verify_web "$OLD" active
      printf 'Already published: %s; no build or pointer changes.\n' "$COMMIT"
      exit 0
    fi
  fi
  RELEASE="$COMMIT"
  TARGET="$ROOT/releases/$RELEASE"
  if [[ -e $TARGET || -L $TARGET ]]; then
    validate_release "$TARGET" || fail 'Existing release is incomplete or is a symlink; it was not overwritten.'
    check_release "$TARGET" "$COMMIT" >/dev/null
    printf 'Reusing saved release %s.\n' "$RELEASE"
  else
    BUILD=$(mktemp -d "$STATE/work/build.XXXXXXXX")
    git_cmd archive "$COMMIT" | tar --no-same-owner -x -C "$BUILD"
    (
      cd "$BUILD"
      npm ci --include=dev --no-fund --no-audit
      npm run test --if-present
      VITE_BUILD_COMMIT="$COMMIT" npm run build -- --base="/releases/$RELEASE/"
    ) 9>&-
    node_cmd "$SCRIPT_DIR/release-manifest.mjs" "$BUILD/dist" "$COMMIT" "$RELEASE"
    # Validate and set ownership while the build is still in root's private directory.
    node_cmd "$SCRIPT_DIR/check-release.mjs" "$BUILD/dist" "$COMMIT" "$RELEASE" >/dev/null
    chown -R -h www-data:www-data "$BUILD/dist"
    chmod -R u=rwX,go=rX "$BUILD/dist"
    # Copy privately on the destination filesystem, then publish the complete directory.
    STAGE=$(mktemp -d "$ROOT/releases/.incoming.XXXXXXXX")
    cp -a -- "$BUILD/dist" "$STAGE/release"
    mv -T -- "$STAGE/release" "$TARGET"
    rmdir -- "$STAGE"
    STAGE=''
  fi
else
  if [[ -n ${2:-} ]]; then
    [[ $2 =~ ^[A-Za-z0-9-]{1,128}$ ]] || fail 'Invalid release identifier.'
    TARGET="$ROOT/releases/$2"
  else
    [[ -n $PREVIOUS ]] || fail 'No previous release to restore.'
    TARGET="$PREVIOUS"
  fi
  validate_release "$TARGET" || fail 'Unknown or incomplete rollback release.'
  check_release "$TARGET" >/dev/null
fi
if [[ $TARGET == "$OLD" ]]; then
  verify_web "$TARGET" active
  printf 'Requested release is already active; pointers unchanged.\n'
  exit 0
fi
verify_web "$TARGET" release
# A journal lets the next invocation recover an interrupted activation.
[[ ! -L $STATE/pending.new ]] || fail 'Unexpected transaction symlink.'
printf '%s\n%s\n%s\n' "$(label "$OLD")" "$(label "$PREVIOUS")" "$(label "$TARGET")" > "$STATE/pending.new"
mv -T -- "$STATE/pending.new" "$STATE/pending"
set_pointer current "$TARGET"
verify_web "$TARGET" active
if [[ -n $OLD && $OLD != "$ROOT/bootstrap" ]]; then
  # Rollback keeps its target in previous, making repeated rollback a no-op.
  if [[ $ACTION == deploy ]]; then set_pointer previous "$OLD"; fi
  touch -- "$STATE/retired/$(basename -- "$OLD")"
fi
rm -f -- "$STATE/retired/$(basename -- "$TARGET")"
rm -f -- "$STATE/pending"
printf 'Published: %s\n' "$TARGET"
