import re

with open('/Users/luciagrasso/.gemini/antigravity/scratch/nuxt_script.js', 'r') as f:
    content = f.read()

# Let's search for "Edwards" or "Johnson" or "Graham" in the text
names_to_check = ["Edwards", "Johnson", "Graham", "Orji", "Warren"]
for name in names_to_check:
    matches = [m.start() for m in re.finditer(name, content, re.IGNORECASE)]
    print(f"Name '{name}' found {len(matches)} times. First occurrences: {matches[:5]}")
    if matches:
        # Print a window around the first occurrence
        start = max(0, matches[0] - 100)
        end = min(len(content), matches[0] + 300)
        print(f"Snippet around '{name}':")
        print(content[start:end])
        print("-" * 50)
