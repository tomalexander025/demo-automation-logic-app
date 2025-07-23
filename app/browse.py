import json
import os
import re
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Define the IMAGES directory path
IMAGES_DIR = r"D:\SELF_LEARNING\DEMO_AUTOMATION_LOGIC_APP\IMAGES"

def save_roi(image_path, np_array):
    # Sanitize file name to remove invalid characters and ensure valid path
    safe_file_name = re.sub(r'[^\w\.-]', '_', os.path.basename(image_path))
    file_path = os.path.join(IMAGES_DIR, f"{safe_file_name}_roi.txt")
    try:
        # Ensure the IMAGES directory exists
        os.makedirs(IMAGES_DIR, exist_ok=True)
        logger.debug(f"Saving ROI to {file_path} with data: {np_array}")
        with open(file_path, 'w') as f:
            json.dump(np_array, f, indent=2)
        logger.info(f"ROI saved successfully to {file_path}")
        return {"status": "success", "npArray": np_array}
    except Exception as e:
        logger.error(f"Failed to save ROI to {file_path}: {str(e)}")
        return {"status": "error", "message": str(e)}

def load_roi(image_path):
    # Sanitize file name to remove invalid characters
    safe_file_name = re.sub(r'[^\w\.-]', '_', os.path.basename(image_path))
    file_path = os.path.join(IMAGES_DIR, f"{safe_file_name}_roi.txt")
    try:
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                np_array = json.load(f)
            logger.debug(f"Loaded ROI from {file_path}: {np_array}")
            return {"status": "success", "npArray": np_array}
        else:
            logger.debug(f"No ROI file found at {file_path}")
            return {"status": "success", "npArray": []}
    except Exception as e:
        logger.error(f"Failed to load ROI from {file_path}: {str(e)}")
        return {"status": "error", "message": str(e)}

def delete_roi(image_path):
    # Sanitize file name to remove invalid characters
    safe_file_name = re.sub(r'[^\w\.-]', '_', os.path.basename(image_path))
    file_path = os.path.join(IMAGES_DIR, f"{safe_file_name}_roi.txt")
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"ROI deleted successfully from {file_path}")
            return {"status": "success", "message": "ROI deleted successfully"}
        else:
            logger.debug(f"No ROI file to delete at {file_path}")
            return {"status": "success", "message": "No ROI file found to delete"}
    except Exception as e:
        logger.error(f"Failed to delete ROI at {file_path}: {str(e)}")
        return {"status": "error", "message": str(e)}