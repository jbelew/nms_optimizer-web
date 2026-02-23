
import json
import sys

def list_chunk_modules_paths(file_path, chunk_name):
    with open(file_path, 'r') as f:
        data = json.load(f)

    def find_modules(node, results, path=""):
        name = node.get('name', '')
        current_path = f"{path}/{name}" if path else name

        if node.get('uid'):
            results.append(current_path)

        for child in node.get('children', []):
            find_modules(child, results, current_path)

    for chunk in data.get('tree', {}).get('children', []):
        if chunk_name in chunk.get('name', ''):
            paths = []
            find_modules(chunk, paths)
            return paths
    return []

if __name__ == "__main__":
    file_path = sys.argv[1]
    chunk_filter = sys.argv[2]
    term_filter = sys.argv[3] if len(sys.argv) > 3 else None

    paths = list_chunk_modules_paths(file_path, chunk_filter)
    for p in sorted(paths):
        if not term_filter or term_filter in p:
            print(p)
