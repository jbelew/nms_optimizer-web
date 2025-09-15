import json
import os
import subprocess

def get_all_keys(data, prefix=''):
    keys = set()
    for key, value in data.items():
        full_key = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            keys.add(full_key)
            keys.update(get_all_keys(value, full_key))
        else:
            keys.add(full_key)
    return keys

def remove_unused_from_dict(data, unused_keys):
    for key_path in unused_keys:
        keys = key_path.split('.')
        current_level = data
        for i, key in enumerate(keys):
            if key in current_level:
                if i == len(keys) - 1:
                    is_parent = False
                    for k in unused_keys:
                        if k.startswith(key_path +'.'):
                            is_parent = True
                            break
                    if not is_parent:
                      del current_level[key]
                else:
                    current_level = current_level[key]
            else:
                break

    def clean_empty_dicts(d):
        if isinstance(d, dict):
            keys_to_remove = []
            for k, v in d.items():
                if isinstance(v, dict):
                    clean_empty_dicts(v)
                    if not v:
                        keys_to_remove.append(k)
            for k in keys_to_remove:
                del d[k]
        return d

    return clean_empty_dicts(data)

def find_and_remove_unused_keys():
    locales_dir = "public/assets/locales"
    master_lang = "en"
    src_dir = "src"

    master_filepath = os.path.join(locales_dir, master_lang, "translation.json")
    with open(master_filepath, 'r', encoding='utf-8') as f:
        master_data = json.load(f)

    all_keys = get_all_keys(master_data)
    unused_keys = set()

    excluded_prefixes = ("technologies.", "modules.", "platforms.", "techTree.categories.")

    for key in all_keys:
        if key.startswith(excluded_prefixes):
            continue

        try:
            subprocess.check_output(['grep', '-r', key, src_dir])
        except subprocess.CalledProcessError:
            unused_keys.add(key)

    print(f"Found {len(unused_keys)} very safe unused keys to remove.")

    cleaned_data = remove_unused_from_dict(master_data, unused_keys)

    with open(master_filepath, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, indent=4, ensure_ascii=False)

    print(f"Removed very safe unused keys from {master_filepath}")

if __name__ == "__main__":
    find_and_remove_unused_keys()
