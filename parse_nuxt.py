import json

with open('/Users/luciagrasso/.gemini/antigravity/scratch/nuxt_script.js', 'r') as f:
    data = json.load(f)

# The list of player indices is at index 5813
player_indices = data[5813]

def resolve(val, memo=None):
    if memo is None:
        memo = {}
    if isinstance(val, int):
        if 0 <= val < len(data):
            if val in memo:
                return memo[val]
            memo[val] = f"<REF {val}>"
            res = resolve_val(data[val], memo)
            memo[val] = res
            return res
        return val
    elif isinstance(val, list):
        return [resolve(item, memo) for item in val]
    elif isinstance(val, dict):
        return {k: resolve(v, memo) for k, v in val.items()}
    else:
        return val

def resolve_val(val, memo):
    if isinstance(val, list):
        return [resolve(item, memo) for item in val]
    elif isinstance(val, dict):
        return {k: resolve(v, memo) for k, v in val.items()}
    else:
        return val

all_players = []
for p_idx in player_indices:
    raw_player = resolve(p_idx)
    
    # Extract only the needed fields to keep the dataset small and clean
    first_name = raw_player.get("firstName", "")
    last_name = raw_player.get("lastName", "")
    full_name = f"{first_name} {last_name}".strip()
    jersey = raw_player.get("jerseyNumber", "")
    position = raw_player.get("positionShort", "")
    
    # Handle image URL
    img_data = raw_player.get("image")
    img_url = None
    if isinstance(img_data, dict):
        img_url = img_data.get("absoluteUrl") or img_data.get("url")
        if img_url and img_url.startswith("/"):
            img_url = "https://mgoblue.com" + img_url
            
    all_players.append({
        "id": raw_player.get("playerId") or raw_player.get("rosterPlayerId") or len(all_players),
        "fullName": full_name,
        "jersey": jersey,
        "position": position,
        "imageUrl": img_url
    })

print(f"Total players processed: {len(all_players)}")
# Stats
positions = set(p["position"] for p in all_players)
print("Positions found:", sorted(list(positions)))
players_with_img = sum(1 for p in all_players if p["imageUrl"])
print(f"Players with image: {players_with_img}")
players_without_img = sum(1 for p in all_players if not p["imageUrl"])
print(f"Players without image: {players_without_img}")

# Save to scratch/roster_players.json
with open('/Users/luciagrasso/.gemini/antigravity/scratch/roster_players.json', 'w') as f:
    json.dump(all_players, f, indent=2)

print("Saved clean roster to roster_players.json")
