#!/usr/bin/env bash

# Name of the CSV file to append to
CSV_FILE="fakeLookup.csv"

# Append 10 new lines to the CSV file
cat <<EOF >> "$CSV_FILE"
10.0.0.21,server21,Detroit
10.0.0.22,server22,El Paso
10.0.0.23,server23,Nashville
10.0.0.24,server24,Portland
10.0.0.25,server25,Oklahoma City
10.0.0.26,server26,Las Vegas
10.0.0.27,server27,Memphis
10.0.0.28,server28,Louisville
10.0.0.29,server29,Baltimore
10.0.0.30,server30,Milwaukee
EOF

echo "10 lines have been appended to \`$CSV_FILE\`."

