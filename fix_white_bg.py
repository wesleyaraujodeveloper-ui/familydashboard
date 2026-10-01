import os, glob

target_dir = 'app/(main)'
files = glob.glob(target_dir + '/**/*.tsx', recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "backgroundColor: 'white'" in content or "backgroundColor: \"white\"" in content:
        content = content.replace("backgroundColor: 'white'", "backgroundColor: theme.colors.surface")
        content = content.replace("backgroundColor: \"white\"", "backgroundColor: theme.colors.surface")
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {file}')
