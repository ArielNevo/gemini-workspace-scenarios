#!/bin/bash
# Re-creates public/clips/*.mp4 from Google Workspace's official YouTube channel (credited on screen and on the site).
# The clips are not committed; only the finished film (public/media/film.mp4 in the site) is.
set -e
Y="${YTDLP:-/Users/ariel.nevo/קלוד קוד פרויקטים/עיצובים - טיוטה/tools/voice/env/bin/yt-dlp}"
FF="$HOME/AI-Studio/bin/ffmpeg"
cd "$(dirname "$0")/../public/clips"; mkdir -p raw
get() { [ -f "raw/$1.mp4" ] || "$Y" -q -f "b[height<=720][ext=mp4]/bv*[height<=720][ext=mp4]" -o "raw/$1.%(ext)s" "https://www.youtube.com/watch?v=$1"; }
cut() { get "$1"; "$FF" -y -loglevel error -ss "$2" -to "$3" -i "raw/$1.mp4" -an -vf "scale=1280:720,fps=30" -c:v libx264 -crf 21 -pix_fmt yuv420p "$4.mp4"; }
cut erjpCvMEw_I 4.3 12.6 notebook       # "How an Iron Foundry Preserves Legacy Knowledge with Gemini Notebook"
cut 950kb-9Qzfg 9.5 14.5 docs-summary   # "Summarize, rephrase, and rewrite documents with Gemini in Google Docs"
cut 950kb-9Qzfg 52.5 58.5 docs-plain
cut LTo6rlIhaUw 2.5 9.5 gmail           # "Go from endless inbox searches to a structured brief fast with Gemini in Gmail"
cut P78gDd-9TnE 53 57.8 sheets          # "Boost productivity through Gemini in Sheets"
