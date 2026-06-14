# CHANGE TO HOUR, DEBUGGING PURPOSES ONLY
every 1.minute do
    rake "review_summaries:enqueue"
end