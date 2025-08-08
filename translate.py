import json
import os
from deep_translator import GoogleTranslator

def get_missing_keys(master_dict, target_dict, path=""):
    missing_keys = {}
    for key, value in master_dict.items():
        current_path = f"{path}.{key}" if path else key
        if key not in target_dict:
            missing_keys[current_path] = value
        elif isinstance(value, dict) and isinstance(target_dict.get(key), dict):
            nested_missing_keys = get_missing_keys(value, target_dict[key], current_path)
            missing_keys.update(nested_missing_keys)
    return missing_keys

def translate_and_update(missing_keys, target_data, lang):
    translator = GoogleTranslator(source='en', target=lang)
    for key_path, value in missing_keys.items():
        if isinstance(value, str):
            try:
                translated_text = translator.translate(value)
                keys = key_path.split('.')
                d = target_data
                for key in keys[:-1]:
                    d = d.setdefault(key, {})
                d[keys[-1]] = translated_text
                print(f"Translated '{value}' to '{translated_text}' for {lang}")
            except Exception as e:
                print(f"Error translating '{value}' for {lang}: {e}")

def main():
    locales_dir = "public/assets/locales"
    master_lang = "en"
    other_langs = ["de", "es", "fr"]

    master_filepath = os.path.join(locales_dir, master_lang, "translation.json")
    with open(master_filepath, 'r', encoding='utf-8') as f:
        master_data = json.load(f)

    for lang in other_langs:
        target_filepath = os.path.join(locales_dir, lang, "translation.json")
        with open(target_filepath, 'r', encoding='utf-8') as f:
            target_data = json.load(f)

        missing_keys = get_missing_keys(master_data, target_data)

        if missing_keys:
            print(f"Missing keys for {lang}:")
            translate_and_update(missing_keys, target_data, lang)

            with open(target_filepath, 'w', encoding='utf-8') as f:
                json.dump(target_data, f, indent=4, ensure_ascii=False)
            print(f"Updated {target_filepath}")
        else:
            print(f"No missing keys for {lang}.")

if __name__ == "__main__":
    main()
