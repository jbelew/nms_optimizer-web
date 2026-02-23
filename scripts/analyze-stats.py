
import json
import sys

def analyze_stats(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)

    node_parts = data.get('nodeParts', {})

    results = {
        'socket.io': 0,
        'sentry': 0,
        'events': 0,
        'total': 0
    }

    def process_node(node, category=None):
        name = node.get('name', '')
        uid = node.get('uid')

        # Determine new category based on current node name or parent category
        new_category = category
        if 'socket.io' in name or 'socket-io' in name:
            new_category = 'socket.io'
        elif 'sentry' in name:
            new_category = 'sentry'
        elif 'web-vitals' in name or 'react-ga4' in name:
            new_category = 'events'

        size = 0
        if uid and uid in node_parts:
            size = node_parts[uid].get('renderedLength', 0)

        if new_category:
            results[new_category] += size

        results['total'] += size

        for child in node.get('children', []):
            process_node(child, new_category)

    if 'tree' in data:
        process_node(data['tree'])

    # Convert to KB
    results['socket.io_kb'] = round(results['socket.io'] / 1024, 2)
    results['sentry_kb'] = round(results['sentry'] / 1024, 2)
    results['events_kb'] = round(results['events'] / 1024, 2)
    results['total_kb'] = round(results['total'] / 1024, 2)

    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    analyze_stats(sys.argv[1])
