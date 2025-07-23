import os

def print_tree(start_path, prefix=''):
    entries = os.listdir(start_path)
    entries.sort()

    for index, entry in enumerate(entries):
        path = os.path.join(start_path, entry)
        is_last = (index == len(entries) - 1)

        connector = '└── ' if is_last else '├── '
        print(prefix + connector + entry)

        if os.path.isdir(path):
            extension = '    ' if is_last else '│   '
            print_tree(path, prefix + extension)

if __name__ == '__main__':
    print("Your Flask Project Structure:\n")
    print_tree('.')
