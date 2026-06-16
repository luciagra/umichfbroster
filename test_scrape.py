import requests
from bs4 import BeautifulSoup
import json
import re

url = "https://mgoblue.com/sports/football/roster"
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

r = requests.get(url, headers=headers)
soup = BeautifulSoup(r.text, 'html.parser')

# Find all script tags containing the Nuxt state
nuxt_data = None
for s in soup.find_all('script'):
    if s.string and 'ShallowReactive' in s.string:
        nuxt_data = s.string
        break

if nuxt_data:
    print(f"Found Nuxt script! Length: {len(nuxt_data)}")
    # Let's save the first 5000 characters to inspect
    print("Prefix:")
    print(nuxt_data[:1000])
    
    # Let's search if it contains any known player names or position terms
    # Let's search for "quarterback" or "QB" or typical player fields
    matches = re.findall(r'"[A-Za-z\s\-\']{3,25}":\d+', nuxt_data)
    print(f"Sample matches: {matches[:30]}")
    
    # Let's write the whole Nuxt script to a file to examine it in detail
    with open('/Users/luciagrasso/.gemini/antigravity/scratch/nuxt_script.js', 'w') as f:
        f.write(nuxt_data)
    print("Wrote nuxt_script.js")
else:
    print("Could not find Nuxt script containing ShallowReactive.")
