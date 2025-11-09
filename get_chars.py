import json
from pathlib import Path

def get_unique_characters():
    """
    Reads all .json and .md files in the specified directory,
    extracts all unique characters, and prints their Unicode code points.
    """
    unique_chars = set()
    locales_path = Path('public/assets/locales')

    # Process JSON files
    for json_file in locales_path.glob('**/*.json'):
        with open(json_file, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                # Recursively find all string values
                def extract_strings(obj):
                    if isinstance(obj, str):
                        for char in obj:
                            unique_chars.add(char)
                    elif isinstance(obj, dict):
                        for value in obj.values():
                            extract_strings(value)
                    elif isinstance(obj, list):
                        for item in obj:
                            extract_strings(item)
                extract_strings(data)
            except json.JSONDecodeError:
                print(f"Warning: Could not decode JSON from {json_file}")
                continue

    # Process Markdown files
    for md_file in locales_path.glob('**/*.md'):
        with open(md_file, 'r', encoding='utf-8') as f:
            for char in f.read():
                unique_chars.add(char)

    # Print all unique characters as a single, un-separated string
    for char in sorted(list(unique_chars)):
        print(f"U+{ord(char):04X}")

if __name__ == '__main__':
    get_unique_characters()