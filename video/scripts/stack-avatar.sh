#!/bin/bash
# Green-screen SadTalker output -> stacked alpha H.264 (colour on top, matte below) + RGBA poster + Hebrew VTT.
# Usage: scripts/stack-avatar.sh <sadtalker.mp4>   (run from video/)
set -e
FF="$HOME/AI-Studio/bin/ffmpeg"; FP="$HOME/AI-Studio/bin/ffprobe"
IN="$1"; OUT="../public/media"
KEY="chromakey=0x00ff00:0.16:0.06"
"$FF" -y -loglevel error -i "$IN" -filter_complex \
  "[0:v]scale=640:640:flags=lanczos,format=yuv444p,$KEY,format=yuva444p,split[k1][k2];[k1]format=gbrap,despill=type=green,format=yuv420p[c];[k2]alphaextract,format=gray,format=yuv420p[m];[c][m]vstack" \
  -c:v libx264 -crf 20 -preset slow -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 96k "$OUT/avatar-greet-stacked.mp4"
"$FF" -y -loglevel error -i "$IN" -vf "scale=640:640:flags=lanczos,format=yuv444p,$KEY,format=gbrap,despill=type=green,format=rgba" -frames:v 1 "$OUT/avatar-poster.png"
D=$("$FP" -v error -show_entries format=duration -of default=nw=1:nk=1 "$IN")
node -e '
const fs=require("fs");const d=parseFloat(process.argv[1]);
const row=fs.readFileSync("captions.tsv","utf8").trim().split("\n").map(l=>l.split("\t")).find(r=>r[0]==="greet");
const parts=row[1].split("|");const tot=parts.reduce((a,p)=>a+p.length,0);let c=0;
const ts=s=>{const h=new Date(s*1000).toISOString().substr(11,12);return h;};
let out="WEBVTT\n\n";parts.forEach((p,i)=>{const a=c/tot*d;c+=p.length;const b=c/tot*d;out+=`${i+1}\n${ts(a)} --> ${ts(b)}\n${p}\n\n`;});
fs.writeFileSync("../public/media/avatar-greet.he.vtt",out);console.log(out);' "$D"
ls -la "$OUT"/avatar-*
