#!/usr/bin/env bash
# Start/stop/restart the Solai Matrimony API server.
# Usage: ./dev-server.sh [start|stop|restart|status]

cd "$(dirname "$0")"
PIDFILE=/tmp/solai-server.pid
LOG=/tmp/solai-server.log
CMD="node server.js"

start() {
  if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
    echo "Server already running (pid $(cat "$PIDFILE"))"
    exit 0
  fi
  setsid bash -c "exec $CMD >> '$LOG' 2>&1" < /dev/null &
  echo $! > "$PIDFILE"
  sleep 1
  echo "Server started (pid $(cat "$PIDFILE"))"
  status
}

stop() {
  if [ -f "$PIDFILE" ]; then
    kill "$(cat "$PIDFILE")" 2>/dev/null
    rm -f "$PIDFILE"
    echo "Server stopped"
  else
    pkill -f "node server.js" 2>/dev/null && echo "Server stopped" || echo "No server running"
  fi
}

status() {
  if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
    echo "Status: running (pid $(cat "$PIDFILE"))"
  else
    echo "Status: not running"
  fi
}

case "${1:-start}" in
  start) start ;;
  stop) stop ;;
  restart) stop; sleep 1; start ;;
  status) status ;;
  *) echo "Usage: $0 [start|stop|restart|status]"; exit 1 ;;
esac