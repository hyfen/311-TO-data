require 'rubygems'
require 'faster_csv'

count = 0
groups = {}

rows = FasterCSV.read("data/customresult.csv") 

# remove headers
rows.slice!(0) 

rows.each{|row|
  unless groups[row[0]]
    groups[row[0]] = [].fill(0, 0, 23)  # make sure arrays are 0 filled
  end
  groups[row[0]][row[1].to_i] = row[2].to_i
}

outputFile = File.new("data/output", "w")
groups.each{|group_name, group|
  count += 1
  output = count.to_s + ": ["
  output += group.join(",")
  output += "],"
  outputFile.puts(output)
}

# copy from stdout for the datalabels variable
count = 0
groups.each{|group_name, x|
  count += 1
  puts count.to_s + ": \"" + group_name + "\", "
}