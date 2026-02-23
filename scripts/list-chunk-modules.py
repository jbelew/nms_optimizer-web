
import json
import sys

def list_chunk_modules(file_path, chunk_name):
    with open(file_path, 'r') as f:
        data = json.load(f)

    # We need to find the chunk in the tree and list all its children (modules)
    def find_modules(node, results):
        name = node.get('name', '')
        if node.get('uid'):
            results.append(name)

        for child in node.get('children', []):
            find_modules(child, results)

    # In rollup-plugin-visualizer stats, the top level children are chunks
    for chunk in data.get('tree', {}).get('children', []):
        if chunk_name in chunk.get('name', ''):
            modules = []
            find_modules(chunk, modules)
            return modules
    return []

if __name__ == "__main__":
    chunk_name = sys.argv[2] if len(sys.argv) > 2 else 'telemetry'
    modules = list_chunk_modules(sys.argv[1], chunk_name)
    for m in sorted(modules):
        print(m)
