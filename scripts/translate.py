import os
import json
import argparse
import time
from google import genai
from typing import Dict, Any, List

# Configure Gemini
client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))
MODEL_NAME = 'gemini-2.5-flash-lite'

LANGUAGES = {
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "pt": "Portuguese"
}

BASE_PATH = "public/assets/locales"
BATCH_SIZE = 100

def get_translation_prompt(target_lang_name: str, is_markdown: bool = False) -> str:
    """Returns the system prompt with NMS context."""
    context = "You are a professional translator for a No Man's Sky (NMS) Technology Layout Optimizer app. "
    context += "Maintain the technical terminology of No Man's Sky exactly as it appears in-game (e.g., 'Exosuit', 'Hyperdrive', 'Starship', 'Adjacency Bonus', 'Atlantid', 'Colossus'). "
    
    if is_markdown:
        prompt = f"{context}\nTranslate the following Markdown content into {target_lang_name}. "
        prompt += "Strictly preserve all Markdown formatting, links, and code blocks. "
        prompt += "Do not translate words inside backticks or code blocks unless they are descriptive comments."
    else:
        prompt = f"{context}\nTranslate the following JSON object values into {target_lang_name}. "
        prompt += "Strictly preserve all i18next tags like <0></0>, <1></1>, etc. and any placeholders like {{count}} or {{name}}. "
        prompt += "Return ONLY a valid JSON object with the translated values, maintaining the same keys."
    
    return prompt

def translate_batch(batch: Dict[str, str], target_lang_name: str) -> Dict[str, str]:
    """Translates a batch of strings in a single API call."""
    if not batch:
        return {}

    prompt = get_translation_prompt(target_lang_name)
    content = f"Translate this JSON:\n{json.dumps(batch, ensure_ascii=False)}"

    max_retries = 5
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=f"{prompt}\n\n{content}",
                config={
                    'response_mime_type': 'application/json',
                }
            )
            if not response.text:
                return {}
            
            translated_batch = json.loads(response.text)
            return translated_batch
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                wait_time = (attempt * 5) + 5
                print(f"Rate limit hit. Retrying in {wait_time}s...")
                time.sleep(wait_time)
                continue
            print(f"Error in batch translation: {e}")
            return {}
    return {}

def translate_markdown(text: str, target_lang_name: str) -> str:
    """Translates a single markdown file content."""
    prompt = get_translation_prompt(target_lang_name, is_markdown=True)
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=f"{prompt}\n\nSource Content:\n{text}"
            )
            return response.text.strip() if response.text else text
        except Exception as e:
            if "429" in str(e):
                time.sleep(10)
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
            new_key = f"{prefix}.{i}" if prefix else str(i)
            items.update(flatten_json(v, new_key))
    else:
        items[prefix] = str(data)
    return items

def unflatten_json(items: Dict[str, str]) -> Dict[str, Any]:
    """Converts a dot-notated dict back into a nested JSON structure."""
    result = {}
    for key, value in items.items():
        parts = key.split(".")
        d = result
        for part in parts[:-1]:
            if part not in d:
                if part.isdigit(): # Simple attempt to maintain arrays if possible
                     pass 
                d[part] = {}
            d = d[part]
        
        last_part = parts[-1]
        try:
            d[last_part] = value
        except:
            pass
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

    # Identify keys to translate
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
        time.sleep(2)

    updated_nested = unflatten_json(translated_items)
    
    os.makedirs(os.path.dirname(target_file), exist_ok=True)
    with open(target_file, 'w', encoding='utf-8') as f:
        json.dump(updated_nested, f, indent='\t', ensure_ascii=False)
    print(f"JSON translation for {target_lang} updated.")

def process_markdown(target_lang: str, force: bool = False):
    target_lang_name = LANGUAGES[target_lang]
    en_dir = os.path.join(BASE_PATH, "en")
    target_dir = os.path.join(BASE_PATH, target_lang)

    for filename in os.listdir(en_dir):
        if filename.endswith(".md"):
            if filename == "changelog.md":
                continue
            source_file = os.path.join(en_dir, filename)
            target_file = os.path.join(target_dir, filename)

            if not force and os.path.exists(target_file) and os.path.getmtime(target_file) > os.path.getmtime(source_file):
                continue

            print(f"Translating {filename} to {target_lang_name}...")
            with open(source_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            translated = translate_markdown(content, target_lang_name)
            
            os.makedirs(os.path.dirname(target_file), exist_ok=True)
            with open(target_file, 'w', encoding='utf-8') as f:
                f.write(translated)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--lang")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    if not os.environ.get("GOOGLE_API_KEY"):
        print("Error: GOOGLE_API_KEY not set.")
        return

    target_langs = [args.lang] if args.lang else list(LANGUAGES.keys())
    for lang in target_langs:
        print(f"\n--- {lang} ---")
        process_json(lang, args.force)
        process_markdown(lang, args.force)

if __name__ == "__main__":
    main()
