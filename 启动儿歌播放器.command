#!/bin/zsh
set -e
cd "$(dirname "$0")"

if [[ -f .port ]]; then
  PORT=$(<.port)
else
  PORT=8765
fi

URL="http://127.0.0.1:${PORT}/?v=87"
is_app() {
  /usr/bin/curl -s --max-time 1 "$URL" 2>/dev/null | /usr/bin/grep -q '87 首英文启蒙儿歌'
}

if is_app; then
  open "$URL"
  exit 0
fi

for candidate in {8765..8784}; do
  if ! /usr/bin/curl -s --max-time 1 "http://127.0.0.1:${candidate}/" >/dev/null 2>&1; then
    PORT=$candidate
    break
  fi
done

echo "$PORT" > .port
nohup /usr/bin/python3 -m http.server "$PORT" --bind 127.0.0.1 > .server.log 2>&1 &
for i in {1..25}; do
  if is_app; then
    open "$URL"
    exit 0
  fi
  sleep 0.2
done

/usr/bin/osascript -e 'display dialog "儿歌播放器启动失败，请查看文件夹内的 .server.log。" buttons {"好"} default button "好" with icon stop'
exit 1
