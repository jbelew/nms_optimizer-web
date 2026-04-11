import os
import json
import argparse
from google import genai
from typing import Dict, Any

# Configure Gemini
# The API key should be set in the environment variable GOOGLE_API_KEY
client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))
MODEL_NAME = 'gemini-2.0-flash'

LANGUAGES = {
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "pt": "Portuguese"
}

BASE_PATH = "public/assets/locales"

def translate_text(text: str, target_lang_name: str, is_markdown: bool = False) -> str:
    """Uses Gemini to translate text while preserving tags and context."""
    if not text or not text.strip():
        return text

    context = "You are a professional translator for a No Man's Sky (NMS) Technology Layout Optimizer app. "
    context += "Maintain the technical terminology of No Man's Sky exactly as it appears in-game (e.g., 'Exosuit', 'Hyperdrive', 'Starship', 'Adjacency Bonus', 'Atlantid', 'Colossus'). "
    
    if is_markdown:
        prompt = f"{context}\nTranslate the following Markdown content into {target_lang_name}. "
        prompt += "Strictly preserve all Markdown formatting, links, and code blocks. "
        prompt += "Do not translate words inside backticks or code blocks unless they are descriptive comments.\n\n"
    else:
        prompt = f"{context}\nTranslate the following string into {target_lang_name}. "
        prompt += "Strictly preserve all i18next tags like <0></0>, <1></1>, etc. and any placeholders like {{count}} or {{name}}.\n\n"
    
    prompt += f"Source (English): {text}\n\nTranslation:"

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )
        # Handle potential empty responses or safety filters
        if not response.text:
            return text
        return response.text.strip()
    except Exception as e:
        print(f"Error translating to {target_lang_name}: {e}")
        return text

def translate_json_recursive(source_data: Any, target_data: Any, target_lang_name: str) -> Any:
    """Recursively translates missing or empty keys in JSON."""
    if isinstance(source_data, dict):
        if not isinstance(target_data, dict):
            target_data = {}
        
        for key, value in source_data.items():
            target_data[key] = translate_json_recursive(value, target_data.get(key), target_lang_name)
        return target_data
    
    elif isinstance(source_data, list):
        if not isinstance(target_data, list) or len(target_data) != len(source_data):
            return [translate_json_recursive(item, None, target_lang_name) for item in source_data]
        else:
            return [translate_json_recursive(s, t, target_lang_name) for s, t in zip(source_data, target_data)]
    
    else:
        # It's a leaf node (string)
        # Only translate if target is missing or equal to source (untranslated)
        if target_data and target_data != source_data:
            return target_data
        
        print(f"Translating: {str(source_data)[:50]}...")
        return translate_text(str(source_data), target_lang_name)

def process_json(target_lang: str):
    target_lang_name = LANGUAGES[target_lang]
    source_file = os.path.join(BASE_PATH, "en", "translation.json")
    target_file = os.path.join(BASE_PATH, target_lang, "translation.json")

    if not os.path.exists(source_file):
        print(f"Source file {source_file} not found.")
        return

    with open(source_file, 'r', encoding='utf-8') as f:
        source_data = json.load(f)

    target_data = {}
    if os.path.exists(target_file):
        with open(target_file, 'r', encoding='utf-8') as f:
            try:
                target_data = json.load(f)
            except json.JSONDecodeError:
                target_data = {}

    updated_data = translate_json_recursive(source_data, target_data, target_lang_name)

    os.makedirs(os.path.dirname(target_file), exist_ok=True)
    with open(target_file, 'w', encoding='utf-8') as f:
        json.dump(updated_data, f, indent='\t', ensure_ascii=False)
    
    print(f"JSON translation for {target_lang} updated.")

def process_markdown(target_lang: str):
    target_lang_name = LANGUAGES[target_lang]
    en_dir = os.path.join(BASE_PATH, "en")
    target_dir = os.path.join(BASE_PATH, target_lang)

    if not os.path.exists(en_dir):
        return

    for filename in os.listdir(en_dir):
        if filename.endswith(".md"):
            source_file = os.path.join(en_dir, filename)
            target_file = os.path.join(target_dir, filename)

            # Skip if target is newer (already updated)
            if os.path.exists(target_file) and os.path.getmtime(target_file) > os.path.getmtime(source_file):
                continue

            print(f"Translating {filename} to {target_lang_name}...")
            with open(source_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            translated_content = translate_text(content, target_lang_name, is_markdown=True)

            os.makedirs(os.path.dirname(target_file), exist_ok=True)
            with open(target_file, 'w', encoding='utf-8') as f:
                f.write(translated_content)

def main():
    parser = argparse.ArgumentParser(description="Translate NMS Optimizer files using Gemini AI.")
    parser.add_argument("--lang", help="Specific language to translate (default: all)")
    args = parser.parse_args()

    if not os.environ.get("GOOGLE_API_KEY"):
        print("Error: GOOGLE_API_KEY environment variable not set.")
        return

    target_langs = [args.lang] if args.lang else list(LANGUAGES.keys())

    for lang in target_langs:
        print(f"\n--- Processing {lang} ({LANGUAGES[lang]}) ---")
        process_json(lang)
        process_markdown(lang)

if __name__ == "__main__":
    main()
