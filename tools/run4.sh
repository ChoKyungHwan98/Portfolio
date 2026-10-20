#!/bin/bash
T=$1; B=http://localhost:8766/index.html; D=../shots
for v in "1440 900" "1920 1080" "1280 720" "390 844"; do set -- $v
 node shot.js "$B?still" x $1 $2 1500 "[{\"hover\":\".mi:nth-of-type(1)\"},{\"wait\":500,\"shot\":\"$D/${T}_home_${1}x${2}.png\"},{\"hover\":\".mi:nth-of-type(2)\"},{\"wait\":700,\"shot\":\"$D/${T}_sel2_${1}x${2}.png\"},{\"hover\":\".mi:nth-of-type(3)\"},{\"wait\":700,\"shot\":\"$D/${T}_sel3_${1}x${2}.png\"}]" &
done; wait
for t in 1.2 2.4 3.8 5.8; do node shot.js "$B?state=play&t=$t" $D/${T}_play_t${t}.png 1440 900 1300 & done
node shot.js "$B?state=play&t=5.8" $D/${T}_play_mobile_t5.8.png 390 844 1300 & wait
