import os

def write_files_to_txt(folders):
    output_filename = 'output.txt'
    with open(output_filename, 'a') as output_file:  # We're appending in case the file already exists
        for folder in folders:
            for root, dirs, files in os.walk(folder):
                for file in files:
                    if file == output_filename:
                        continue  # We don't want to include our output file in the output file
                    file_path = os.path.join(root, file)
                    output_file.write(file + '\n')
                    with open(file_path, 'r') as input_file:
                        output_file.write(input_file.read() + '\n')


# Here you can define your folders.
folders_to_scan = ["components", "utils"]
write_files_to_txt(folders_to_scan)
