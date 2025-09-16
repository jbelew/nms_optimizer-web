import os
import re
from deep_translator import GoogleTranslator

def translate_markdown_file(input_file, output_file, target_lang):
    """
    Translates a markdown file to a specified language, preserving code blocks and frontmatter.

    Args:
        input_file (str): The path to the input markdown file.
        output_file (str): The path to the output markdown file.
        target_lang (str): The target language for translation (e.g., 'es', 'fr').
    """
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Separate frontmatter, code blocks, and text
    frontmatter = ""
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) > 2:
            frontmatter = f"---{parts[1]}---"
            content = parts[2]

    code_blocks = re.findall(r'(```.*?```)', content, re.DOTALL)
    placeholders = [f"CODEBLOCK_PLACEHOLDER_{i}" for i in range(len(code_blocks))]

    # Replace code blocks with placeholders
    for i, block in enumerate(code_blocks):
        content = content.replace(block, placeholders[i], 1)

    # Translate the remaining text
    translator = GoogleTranslator(source="en", target=target_lang)

    # Split content into smaller chunks to avoid hitting translator limits
    chunks = re.split(r'(\n{2,})', content) # Split by paragraphs
    translated_chunks = []
    for chunk in chunks:
        if chunk.strip():
            try:
                translated_chunks.append(translator.translate(chunk))
            except Exception as e:
                print(f"Error translating chunk: {chunk}")
                print(f"Error: {e}")
                translated_chunks.append(chunk) # Append original chunk if translation fails
        else:
            translated_chunks.append(chunk)

    translated_content = "".join(translated_chunks)

    # Restore code blocks
    for i, block in enumerate(code_blocks):
        translated_content = translated_content.replace(placeholders[i], block, 1)

    # Combine frontmatter and translated content
    final_content = f"{frontmatter}\n{translated_content}".strip()

    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(final_content)

    print(f"Successfully translated {input_file} to {target_lang} and saved to {output_file}")


if __name__ == '__main__':
    # Example usage:
    # translate_markdown_file('path/to/your/file.md', 'path/to/your/translated_file.md', 'es')
    pass
