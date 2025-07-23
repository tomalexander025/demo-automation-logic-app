from ultralytics import YOLO

# Load your YOLO model
model = YOLO(r'd:\SELF_LEARNING\LOGIC\best.pt')  # Replace with your .pt file path

# Get the class names
class_names = model.names  # This is a dictionary {class_id: class_name}

# Print class names with their indices
for class_id, class_name in class_names.items():
    print(f"{class_id}: {class_name}")
