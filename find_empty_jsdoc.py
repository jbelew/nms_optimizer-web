import re
import os

jsdoc_pattern = re.compile(r'/\*\*.*?\*/', re.DOTALL)

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    blocks = jsdoc_pattern.findall(content)
                    for block in blocks:
                        if len(block) < 30:
                            print(f"{path}: {block!r}")
            except Exception:
                pass
