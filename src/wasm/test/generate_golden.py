import json
import os
import random
import sys

# Add the project root to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from src.data_definitions.grids import grids
from src.data_loader import get_module_data
from src.grid_utils import Grid
from src.optimization.refinement import simulated_annealing

def main():
    """
    This script generates a 'golden' file for testing the WASM version of the
    simulated annealing algorithm. It runs the Python implementation with a
    fixed seed and saves the input and output to `wasm/test/golden.json`.
    """
    # Set a fixed seed for reproducibility
    random.seed(42)

    # --- Test Case Configuration ---
    ship_name = "sentinel"
    tech_name = "infra"
    # ---

    # Load the structured module data for the specific ship.
    ship_modules_data = get_module_data(ship_name)

    # Flatten all modules, adding the 'tech' key to each module from its parent.
    all_ship_modules = []
    if ship_modules_data:
        for tech_list in ship_modules_data.get("types", {}).values():
            for tech_data in tech_list:
                tech_key = tech_data.get("key")
                for module in tech_data.get("modules", []):
                    module['tech'] = tech_key
                    all_ship_modules.append(module)

    # Find the specific list of modules for the target technology.
    tech_modules = [m for m in all_ship_modules if m.get('tech') == tech_name]

    # Initialize the grid
    ship_info = grids.get(ship_name)
    if not ship_info:
        raise ValueError(f"Grid for ship '{ship_name}' not found.")

    grid_layout = ship_info['grid']
    grid_height = len(grid_layout)
    grid_width = len(grid_layout[0]) if grid_height > 0 else 0
    grid = Grid(grid_width, grid_height)
    for y, row in enumerate(grid_layout):
        for x, cell_info in enumerate(row):
            if cell_info:
                grid.set_active(x, y, True)
                grid.set_supercharged(x, y, cell_info.get('sc', False))

    params = {
        'initial_temperature': 1.0,
        'cooling_rate': 0.95,
        'stopping_temperature': 1e-3,
        'iterations_per_temp': 5,
        'initial_swap_probability': 0.6,
        'final_swap_probability': 0.1,
        'start_from_current_grid': False,
        'max_processing_time': 5,
        'max_steps_without_improvement': 50,
        'reheat_factor': 0.2
    }

    final_grid, final_score = simulated_annealing(
        grid, ship_name, ship_modules_data, tech_name, tech_modules, **params
    )

    def grid_to_dict(g):
        return {
            "width": g.width,
            "height": g.height,
            "cells": [
                [
                    {
                        "active": cell.get('active', False),
                        "supercharged": cell.get('supercharged', False),
                        "module_id": cell.get('module'),
                        "tech": cell.get('tech'),
                        "x": x,
                        "y": y,
                        "adjacency": cell.get('adjacency'),
                    }
                    for x, cell in enumerate(row)
                ]
                for y, row in enumerate(g.cells)
            ],
        }

    def modules_to_list(mods):
        return [
            {
                "id": m.get("id") or "",
                "label": m.get("label") or "",
                "tech": m.get("tech") or "",
                "type": m.get("type") or "",
                "bonus": m.get("bonus") or 0.0,
                "adjacency": m.get("adjacency") or "",
                "sc_eligible": m.get("sc_eligible") or False,
                "image": m.get("image") or ""
            } for m in mods
        ]

    golden_data = {
        "inputs": {
            "grid": grid_to_dict(grid),
            "ship": ship_name,
            "modules": modules_to_list(all_ship_modules),
            "tech": tech_name,
            "tech_modules": modules_to_list(tech_modules),
            "params": params
        },
        "output": {
            "grid": grid_to_dict(final_grid),
            "score": final_score,
        },
    }

    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, 'golden.json')
    with open(output_path, 'w') as f:
        json.dump(golden_data, f, indent=2)

    print(f"Golden file generated at: {output_path}")
    print(f"Test Score: {final_score}")


if __name__ == "__main__":
    main()