from flask import Flask, render_template, request, jsonify
import os
import logging
import json
import glob
from ultralytics import YOLO
app = Flask(__name__)

# Configure loggingd
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Directory for ROI files
ROI_DIRECTORY = r"D:\SELF_LEARNING\DEMO_AUTOMATION_LOGIC_APP\IMAGES"

def save_roi(image_path, np_array):
    try:
        roi_file = os.path.splitext(image_path)[0] + "_roi.txt"
        roi_file_path = os.path.join(ROI_DIRECTORY, os.path.basename(roi_file))
        with open(roi_file_path, 'w') as f:
            json.dump(np_array, f)
        logger.info(f"ROI saved successfully to {roi_file_path}")
        return {"status": "success", "message": f"ROI saved to {roi_file_path}"}
    except Exception as e:
        logger.error(f"Error saving ROI for {image_path}: {str(e)}")
        return {"status": "error", "message": str(e)}

def load_roi(image_path):
    try:
        base_name = os.path.splitext(os.path.basename(image_path))[0]
        roi_files = glob.glob(os.path.join(ROI_DIRECTORY, f"{base_name}_roi*.txt"))
        rois = []
        for roi_file_path in roi_files:
            try:
                with open(roi_file_path, 'r') as f:
                    np_array = json.load(f)
                rois.append(np_array)
                logger.debug(f"Loaded ROI from {roi_file_path}: {np_array}")
            except Exception as e:
                logger.warning(f"Error reading {roi_file_path}: {str(e)}")
        if rois:
            return {"status": "success", "npArray": rois}
        else:
            logger.debug(f"No ROI files found for {image_path}")
            return {"status": "success", "npArray": []}
    except Exception as e:
        logger.error(f"Error loading ROI for {image_path}: {str(e)}")
        return {"status": "error", "message": str(e)}

def delete_roi(image_path):
    try:
        base_name = os.path.splitext(os.path.basename(image_path))[0]
        roi_file_path = os.path.join(ROI_DIRECTORY, f"{base_name}_roi.txt")
        if os.path.exists(roi_file_path):
            os.remove(roi_file_path)
            logger.info(f"ROI file deleted: {roi_file_path}")
            return {"status": "success", "message": f"ROI deleted for {image_path}"}
        else:
            logger.debug(f"No ROI file found to delete for {image_path}")
            return {"status": "success", "message": "No ROI file to delete"}
    except Exception as e:
        logger.error(f"Error deleting ROI for {image_path}: {str(e)}")
        return {"status": "error", "message": str(e)}

@app.route('/')
def index():
    return render_template('logic.html')  # Ensure 'templates/logic.html' exists

@app.route('/run_inference', methods=['POST'])
def run_inference():
    try:
        data = request.get_json()
        sequence = data.get('sequence', [])
        logger.debug("\n=== INFERENCE SEQUENCE ===")
        for item in sequence:
            logger.debug(f"{item['number']}. {item['text']}")
        logger.debug("=== END SEQUENCE ===\n")
        return jsonify({"status": "success", "message": "Sequence processed"})
    except Exception as e:
        logger.error(f"Error in run_inference: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/upload_pt', methods=['POST'])
def upload_pt():
    try:
        if 'file' not in request.files:
            logger.error("No file part in request")
            return jsonify({"status": "error", "message": "No file part"}), 400
        file = request.files['file']
        if file.filename == '':
            logger.error("No selected file")
            return jsonify({"status": "error", "message": "No selected file"}), 400
        temp_path = os.path.join(app.root_path, 'temp.pt')
        file.save(temp_path)
        logger.debug(f"File saved to {temp_path}")
        model = YOLO(temp_path)
        class_names = model.names
        classes = [class_name for class_id, class_name in class_names.items()]
        logger.debug(f"Extracted classes: {classes}")
        if os.path.exists(temp_path):
            os.remove(temp_path)
            logger.debug("Temporary file removed")
        return jsonify({"status": "success", "classes": classes})
    except Exception as e:
        logger.error(f"Error processing .pt file: {str(e)}")
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/save_roi', methods=['POST'])
def save_roi_route():
    try:
        data = request.get_json()
        image_path = data['imagePath']
        np_array = data['npArray']
        logger.debug(f"Received save_roi request for {image_path} with npArray: {np_array}")
        result = save_roi(image_path, np_array)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in save_roi_route: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/load_roi', methods=['POST'])
def load_roi_route():
    try:
        data = request.get_json()
        image_path = data['imagePath']
        logger.debug(f"Received load_roi request for {image_path}")
        result = load_roi(image_path)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in load_roi_route: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/delete_roi', methods=['POST'])
def delete_roi_route():
    try:
        data = request.get_json()
        image_path = data['imagePath']
        logger.debug(f"Received delete_roi request for {image_path}")
        result = delete_roi(image_path)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in delete_roi_route: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)