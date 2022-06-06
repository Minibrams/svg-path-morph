# svg-path-morph


for command in commands
  for value in command
    aggregated = 0
    for path in paths
      aggregated += value * percentage
    
    combined += <command> <aggregated>

[  # commands
  [  # values
    [1, 0, 0],  # values for value 1 for each path
    [0, 1, 0],  # value 2
    [0, 0, 1]   # value 3
  ]
]