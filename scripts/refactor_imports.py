import os
import re
import sys

def refactor_imports(target_dir):
    src_dir = os.path.abspath("src")
    target_dir = os.path.abspath(target_dir)

    for root, dirs, files in os.walk(target_dir):
        for file in files:
            if file.endswith((".ts", ".tsx", ".scss", ".mjs")):
                file_path = os.path.join(root, file)
                with open(file_path, "r") as f:
                    content = f.read()

                new_content = content
                
                if file.endswith((".ts", ".tsx", ".mjs")):
                    def replace_rel(match):
                        quote = match.group(1)
                        rel_path = match.group(2)
                        
                        if not rel_path.startswith("../"):
                            return match.group(0)
                        
                        abs_path = os.path.abspath(os.path.join(os.path.dirname(file_path), rel_path))
                        
                        if abs_path.startswith(src_dir):
                            new_path = os.path.relpath(abs_path, src_dir)
                            new_path = new_path.replace(os.sep, "/")
                            return f'{match.group(1)}@/{new_path}{match.group(3)}'
                        else:
                            return match.group(0)

                    new_content = re.sub(r'([\'"])(\.\.\/[^\'"]+)([\'"])', replace_rel, new_content)

                elif file.endswith(".scss"):
                    def replace_scss(match):
                        raw_path = match.group(2)
                        quote = raw_path[0]
                        rel_path = raw_path[1:-1]
                        
                        if not rel_path.startswith("../"):
                            return match.group(0)
                        
                        abs_path = os.path.abspath(os.path.join(os.path.dirname(file_path), rel_path))
                        if abs_path.startswith(src_dir):
                            new_path = os.path.relpath(abs_path, src_dir)
                            new_path = new_path.replace(os.sep, "/")
                            return f'{match.group(1)}{quote}@/{new_path}{quote}{match.group(3)}'
                        else:
                            return match.group(0)

                    new_content = re.sub(r'(@(?:use|import)\s+)([\'"][^\'"]+[\'"])(\s+as\s+[^\s;]+|;)', replace_scss, new_content)

                if new_content != content:
                    with open(file_path, "w") as f:
                        f.write(new_content)
                    print(f"Refactored: {file_path}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        refactor_imports(sys.argv[1])
    else:
        print("Usage: python scripts/refactor_imports.py <target_directory>")
