require 'rubygems'
require 'faster_csv'

count = 0
groups = {}

rows = FasterCSV.read("data/customresult") 

# remove headers
rows.slice!(0) 

# CSV assumes columns [category, hour, count]
# example input: "Recycling",23,12
rows.each{|row|
  unless groups[row[0]]
    groups[row[0]] = [].fill(0, 0, 24)  # make sure arrays are 0 filled
  end
  groups[row[0]][row[1].to_i] = row[2].to_i
}

# example output: 1: [0,6,0,0,0,0,2,4,8,10,44,16,26,22,32,10,14,0,2,2,0,2,0,2],
outputFile = File.new("data/output", "w")
groups.each{|group_name, group|
  count += 1
  output = count.to_s + ": ["
  output += group.join(",")
  output += "],"
  outputFile.puts(output)
}

# copy this from stdout to get the datalabels variable for the graph
count = 0
groups.each{|group_name, x|
  count += 1
  puts count.to_s + ": \"" + group_name + "\", "
}