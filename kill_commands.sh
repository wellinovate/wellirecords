pids=$(lsof -t -i:5175)
if [ -n "$pids" ]; then
  kill -9 $pids
  echo "Killed active server on 5175"
fi
