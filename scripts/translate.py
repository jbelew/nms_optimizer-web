import os
import json
import argparse
import time
from google import genai
from google.genai import types
from typing import Dict, Any, List

# Configure Gemini
client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))
MODEL_NAME = 'gemini-2.5-flash'

LANGUAGES = {
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "pt": "Portuguese",
    "it": "Italian"
}

BASE_PATH = "public/assets/locales"
BATCH_SIZE = 100

def get_system_instruction(target_lang_name: str, is_markdown: bool = False) -> str:
    """Returns the system instruction for the model."""
    instr = f"You are a professional translator for a No Man's Sky (NMS) Technology Layout Optimizer app. "
    instr += f"Translate all content provided from English into {target_lang_name}. "
    instr += "Maintain technical NMS terminology exactly as it appears in-game (e.g., 'Exosuit', 'Hyperdrive', 'Adjacency Bonus'). "
    instr += "Always use Title Case for proper object names like specific technologies and modules. "
    
    if is_markdown:
        instr += "STRICTLY preserve all Markdown formatting, links, and code blocks. Do not translate words inside backticks. "
    else:
        instr += "The input will be a JSON object. Translate the values but keep the keys identical. "
        instr += "STRICTLY preserve all i18next tags like <0></0> and placeholders like {{count}}. "
    
    instr += f"Return ONLY the translated { 'Markdown' if is_markdown else 'JSON' }. DO NOT return English. DO NOT provide any preamble or conversation."
    return instr

def get_config(target_lang_name: str, is_markdown: bool = False) -> types.GenerateContentConfig:
    """Returns the model configuration including system instructions and safety settings."""
    return types.GenerateContentConfig(
        system_instruction=get_system_instruction(target_lang_name, is_markdown),
        temperature=0.1, # Low temperature for high precision
        response_mime_type='application/json' if not is_markdown else 'text/plain',
        safety_settings=[
            types.SafetySetting(category='HARM_CATEGORY_HARASSMENT', threshold='BLOCK_NONE'),
            types.SafetySetting(category='HARM_CATEGORY_HATE_SPEECH', threshold='BLOCK_NONE'),
            types.SafetySetting(category='HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold='BLOCK_NONE'),
            types.SafetySetting(category='HARM_CATEGORY_DANGEROUS_CONTENT', threshold='BLOCK_NONE'),
        ]
    )

def translate_batch(batch: Dict[str, str], target_lang_name: str) -> Dict[str, str]:
    """Translates a batch of strings in a single API call using system instructions."""
    if not batch:
        return {}

    max_retries = 5
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=json.dumps(batch, ensure_ascii=False),
                config=get_config(target_lang_name, is_markdown=False)
            )
            
            if not response.text:
                print(f"Warning: Empty response for batch. Safety ratings: {response.candidates[0].safety_ratings if response.candidates else 'N/A'}")
                return {}
            
            return json.loads(response.text)
        except Exception as e:
            error_str = str(e)
            # Handle rate limits (429) and high demand (503)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "503" in error_str or "UNAVAILABLE" in error_str:
                wait_time = (attempt * 20) + 30 # Increased wait for 503s
                print(f"API busy or rate limited ({ '503' if '503' in error_str else '429' }). Retrying in {wait_time}s... (Attempt {attempt+1}/{max_retries})")
                time.sleep(wait_time)
                continue
            print(f"Error in batch translation: {e}")
            return {}
    return {}

def translate_markdown(text: str, target_lang_name: str) -> str:
    """Translates a single markdown file content using system instructions."""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=text,
                config=get_config(target_lang_name, is_markdown=True)
            )
            if not response.text:
                return text
            return response.text.strip()
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "503" in error_str or "UNAVAILABLE" in error_str:
                wait_time = (attempt * 20) + 30
                print(f"Markdown API busy ({ '503' if '503' in error_str else '429' }). Retrying in {wait_time}s...")
                time.sleep(wait_time)
                continue
            print(f"Markdown error: {e}")
            return text
    return text

def flatten_json(data: Any, prefix: str = "") -> Dict[str, str]:
    """Flattens a nested JSON into a single level of dot-notated keys."""
    items = {}
    if isinstance(data, dict):
        for k, v in data.items():
            new_key = f"{prefix}.{k}" if prefix else k
            items.update(flatten_json(v, new_key))
    elif isinstance(data, list):
        for i, v in enumerate(data):
            # Special marker for array indices to distinguish them from numeric keys in objects
            new_key = f"{prefix}.[{i}]" if prefix else f"[{i}]"
            items.update(flatten_json(v, new_key))
    else:
        items[prefix] = str(data)
    return items

def unflatten_json(items: Dict[str, str]) -> Any:
    """Converts a dot-notated dict back into a nested JSON structure, preserving arrays."""
    result = None
    
    for key, value in items.items():
        parts = key.split(".")
        
        # Initialize result based on the first key type
        if result is None:
            result = [] if parts[0].startswith("[") and parts[0].endswith("]") else {}

        current = result
        for i, part in enumerate(parts):
            is_array_part = part.startswith("[") and part.endswith("]")
            clean_part = part[1:-1] if is_array_part else part
            
            # If we're at the last part, set the value
            if i == len(parts) - 1:
                if is_array_part:
                    idx = int(clean_part)
                    while len(current) <= idx:
                        current.append(None)
                    current[idx] = value
                else:
                    current[clean_part] = value
            else:
                # Need to look ahead to know what container to create
                next_part = parts[i+1]
                is_next_array = next_part.startswith("[") and next_part.endswith("]")
                
                if is_array_part:
                    idx = int(clean_part)
                    while len(current) <= idx:
                        current.append(None)
                    if current[idx] is None:
                        current[idx] = [] if is_next_array else {}
                    current = current[idx]
                else:
                    if clean_part not in current:
                        current[clean_part] = [] if is_next_array else {}
                    current = current[clean_part]
                    
    return result

def process_json(target_lang: str, force: bool = False):
    target_lang_name = LANGUAGES[target_lang]
    source_file = os.path.join(BASE_PATH, "en", "translation.json")
    target_file = os.path.join(BASE_PATH, target_lang, "translation.json")

    with open(source_file, 'r', encoding='utf-8') as f:
        source_data = json.load(f)

    target_data = {}
    if os.path.exists(target_file):
        with open(target_file, 'r', encoding='utf-8') as f:
            try:
                target_data = json.load(f)
            except:
                target_data = {}

    flat_source = flatten_json(source_data)
    flat_target = flatten_json(target_data)

    to_translate = {}
    for k, v in flat_source.items():
        if force or k not in flat_target or flat_target[k] == v:
            to_translate[k] = v

    if not to_translate:
        print(f"No keys to translate for {target_lang}.")
        return

    print(f"Translating {len(to_translate)} keys for {target_lang} in batches...")
    translated_items = flat_target.copy()
    keys = list(to_translate.keys())
    
    for i in range(0, len(keys), BATCH_SIZE):
        batch_keys = keys[i:i + BATCH_SIZE]
        batch = {k: to_translate[k] for k in batch_keys}
        print(f"  Batch {i//BATCH_SIZE + 1}/{(len(keys)-1)//BATCH_SIZE + 1}...")
        translated_batch = translate_batch(batch, target_lang_name)
        translated_items.update(translated_batch)
        time.sleep(15) # Safety buffer

    updated_nested = unflatten_json(translated_items)
    os.makedirs(os.path.dirname(target_file), exist_ok=True)
    with open(target_file, 'w', encoding='utf-8') as f:
        json.dump(updated_nested, f, indent='\t', ensure_ascii=False)
    print(f"JSON translation for {target_lang} updated.")

def process_markdown(target_lang: str, filename: str, force: bool = False):
    target_lang_name = LANGUAGES[target_lang]
    source_file = os.path.join(BASE_PATH, "en", filename)
    target_file = os.path.join(BASE_PATH, target_lang, filename)

    if not os.path.exists(source_file): return

    if not force and os.path.exists(target_file) and os.path.getmtime(target_file) > os.path.getmtime(source_file):
        print(f"Skipping {filename} for {target_lang} (Target is up to date).")
        return

    print(f"Translating {filename} to {target_lang_name}...")
    with open(source_file, 'r', encoding='utf-8') as f:
        content = f.read()
    translated = translate_markdown(content, target_lang_name)
    os.makedirs(os.path.dirname(target_file), exist_ok=True)
    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(translated)

def main():
    parser = argparse.ArgumentParser(description="Translate NMS Optimizer files using Gemini AI.")
    parser.add_argument("--lang", help="Specific language code (e.g. es). Default: all supported.")
    parser.add_argument("--files", nargs="+", help="One or more filenames to translate (e.g. about.md translation.json).")
    parser.add_argument("--force", action="store_true", help="Force refresh even if already translated.")
    args = parser.parse_args()

    if not os.environ.get("GOOGLE_API_KEY"):
        print("Error: GOOGLE_API_KEY environment variable not set.")
        return

    target_langs = [args.lang] if args.lang else list(LANGUAGES.keys())
    
    for lang in target_langs:
        print(f"\n--- Processing {lang} ({LANGUAGES[lang]}) ---")
        
        # If specific files are requested, process only those
        if args.files:
            for filename in args.files:
                # Handle potential path prefixes if passed from git diff
                clean_name = os.path.basename(filename)
                if clean_name.endswith(".json"):
                    process_json(lang, args.force)
                elif clean_name.endswith(".md"):
                    if clean_name == "changelog.md":
                        print("Skipping changelog.md (always English).")
                        continue
                    process_markdown(lang, clean_name, args.force)
        else:
            # Default: Process everything (respecting work preservation logic)
            process_json(lang, args.force)
            en_dir = os.path.join(BASE_PATH, "en")
            for filename in os.listdir(en_dir):
                if filename.endswith(".md") and filename != "changelog.md":
                    process_markdown(lang, filename, args.force)

if __name__ == "__main__":
    main()
