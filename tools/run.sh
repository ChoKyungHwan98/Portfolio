#!/bin/bash
# usage: run.sh tag
T=$1; B=http://localhost:8765/index.html; D=../shots
node shot.js "$B?still" $D/${T}_desktop.png 1440 900 1200 &
node shot.js "$B?still" $D/${T}_mobile.png 390 844 1200 &
node shot.js "$B?state=play" $D/${T}_play_desktop.png 1440 900 1200 &
node shot.js "$B?state=play" $D/${T}_play_mobile.png 390 844 1200 &
node shot.js "$B" x 1440 900 50 "[{\"eval\":\"__app.entrance()\"},{\"wait\":200,\"shot\":\"$D/${T}_entrance_mid.png\"},{\"wait\":1000},{\"click\":\"#play\"},{\"wait\":330,\"shot\":\"$D/${T}_transition_mid.png\"},{\"wait\":1200,\"shot\":\"$D/${T}_play_live.png\"},{\"hover\":\"#dialSvg\"},{\"key\":\"Escape\"},{\"wait\":280,\"shot\":\"$D/${T}_return_mid.png\"},{\"wait\":800},{\"hover\":\".item:nth-of-type(3)\"},{\"wait\":500,\"shot\":\"$D/${T}_hover3.png\"}]" &
wait
