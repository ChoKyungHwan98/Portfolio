#!/bin/bash
T=$1; B=http://localhost:8766/index.html; D=../shots
node shot.js "$B?still" $D/${T}_home_1440.png 1440 900 1500 &
node shot.js "$B?still" $D/${T}_home_1920.png 1920 1080 1500 &
node shot.js "$B?still" $D/${T}_home_mobile.png 390 844 1500 &
for t in 1.0 1.8 2.6 3.9 6; do node shot.js "$B?state=play&t=$t" $D/${T}_play_t${t}.png 1440 900 1500 & done
node shot.js "$B?state=play&t=6" $D/${T}_play_mobile_t6.png 390 844 1500 &
node shot.js "$B?state=play&t=3.9" $D/${T}_play_mobile_t3.9.png 390 844 1500 &
wait
node shot.js "$B" x 1440 900 1500 "[{\"hover\":\".pill:nth-of-type(2)\"},{\"wait\":600,\"shot\":\"$D/${T}_hover_resume.png\"},{\"click\":\".pill:nth-of-type(1)\"},{\"wait\":250,\"shot\":\"$D/${T}_page_mid.png\"},{\"wait\":800,\"shot\":\"$D/${T}_page_open.png\"},{\"key\":\"Escape\"},{\"wait\":900},{\"hover\":\".play\"},{\"wait\":400,\"shot\":\"$D/${T}_play_hover.png\"}]"
