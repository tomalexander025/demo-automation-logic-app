document.addEventListener('DOMContentLoaded', () => {
    const imageFolder = document.querySelector('.IMAGE_FOLDER');
    const singleImage = document.querySelector('.SINGLE_IMAGE');
    const viewImage = document.querySelector('.VIEW_IMAGE');
    const browseBy = document.querySelector('.BROWSE_BY');
    let images = [];
    let currentImageIndex = 0;
    let currentImagePath = '';
    let currentFileName = '';
    let rois = {};
    let isDrawing = false;
    let points = [];
    let currentCanvas = null;
    let currentPopup = null;

    if (!imageFolder || !singleImage || !viewImage || !browseBy) {
        console.error('One or more elements not found');
        return;
    }

    // Initial state: Hide View Image until an image is selected
    viewImage.style.display = 'none';
    viewImage.style.opacity = '0';
    viewImage.style.visibility = 'hidden';

    // Restore image selection from sessionStorage if available
    const savedImageData = sessionStorage.getItem('imageData');
    if (savedImageData) {
        const { index, fileName } = JSON.parse(savedImageData);
        currentImageIndex = parseInt(index, 10);
        currentFileName = fileName;
        if (currentFileName) {
            loadROI(currentFileName);
            browseBy.classList.add('has-image');
            slideButtons();
        }
    }

    // Handle folder selection
    imageFolder.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';
        input.webkitdirectory = true;
        input.onchange = (e) => {
            images = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
            if (images.length > 0) {
                currentImageIndex = 0;
                currentFileName = images[0].name;
                currentImagePath = URL.createObjectURL(images[0]);
                saveImageData();
                handleImageSelection();
                slideButtons();
            }
        };
        input.click();
    });

    // Handle single image selection
    singleImage.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                images = [file];
                currentImageIndex = 0;
                currentFileName = file.name;
                currentImagePath = URL.createObjectURL(file);
                saveImageData();
                handleImageSelection();
                slideButtons();
            }
        };
        input.click();
    });

    // Handle view image button
    viewImage.addEventListener('click', () => {
        if (!currentFileName) return;
        showImagePopup();
    });

    function saveImageData() {
        sessionStorage.setItem('imageData', JSON.stringify({
            index: currentImageIndex,
            fileName: currentFileName
        }));
    }

    function slideButtons() {
        if (currentFileName) {
            browseBy.classList.add('has-image');
            
            // Show view image button
            viewImage.style.display = 'flex';
            
            // Use setTimeout to allow display change to take effect before applying opacity
            setTimeout(() => {
                viewImage.style.opacity = '1';
                viewImage.style.visibility = 'visible';
            }, 10);
        } else {
            browseBy.classList.remove('has-image');
            
            // Hide view image button
            viewImage.style.opacity = '0';
            viewImage.style.visibility = 'hidden';
            
            // Wait for transition to complete before hiding
            setTimeout(() => {
                viewImage.style.display = 'none';
            }, 300);
        }
    }

    function handleImageSelection() {
        browseBy.classList.add('has-image');
        loadROI(currentFileName);
    }

    function showImagePopup() {
        // Save current ROI before closing if popup exists
        if (currentPopup && currentCanvas && rois[currentFileName]) {
            savePolygon(rois[currentFileName], currentCanvas, currentPopup);
        }
        
        // Remove existing popup if any
        if (currentPopup) {
            currentPopup.remove();
        }

        // Create wrapper container for popup
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            z-index: 1000;
        `;

        // Create controls container positioned above the popup
        const controls = document.createElement('div');
        controls.style.cssText = `
            display: flex;
            gap: 5px;
            padding: 10px;
            justify-content: center;
            position: absolute;
            bottom: 41.5vh;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1001;
        `;
                
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✖';
        closeBtn.style.cssText = `
            background: rgba(255, 0, 0, 0.8); color: white; 
            border: none; padding: 8px 12px; cursor: pointer; 
            border-radius: 5px; font-size: 14px; font-weight: bold;
        `;
        closeBtn.onclick = () => {
            // Save ROI before closing
            if (rois[currentFileName]) {
                savePolygon(rois[currentFileName], currentCanvas, popup);
            }
            wrapper.remove();
            currentPopup = null;
            currentCanvas = null;
            document.removeEventListener('keydown', navigateImages);
        };

        const roiBtn = document.createElement('button');
        roiBtn.style.cssText = `
            background: rgba(241, 244, 255, 0.8); color: white; 
            border: none; padding: 8px 12px; cursor: pointer; 
            border-radius: 5px; display: flex; align-items: center; 
            justify-content: center;
        `;
        const roiIcon = document.createElement('img');
        roiIcon.src = '/static/res/ROI.png';
        roiIcon.style.cssText = 'width: 20px; height: 20px;';
        roiBtn.appendChild(roiIcon);
        roiBtn.onclick = () => startROIPolygon(currentCanvas, wrapper);

        const deleteBtn = document.createElement('button');
        deleteBtn.style.cssText = `
            background: rgba(241, 244, 255, 0.8); color: white; 
            border: none; padding: 8px 12px; cursor: pointer; 
            border-radius: 5px; display: flex; align-items: center; 
            justify-content: center;
        `;
        const deleteIcon = document.createElement('img');
        deleteIcon.src = '/static/res/delete.png';
        deleteIcon.style.cssText = 'width: 20px; height: 20px;';
        deleteBtn.appendChild(deleteIcon);
        deleteBtn.onclick = () => deleteROI(currentFileName, currentCanvas, wrapper);

        controls.appendChild(closeBtn);
        controls.appendChild(roiBtn);
        controls.appendChild(deleteBtn);

        const popup = document.createElement('div');
        popup.className = 'glass-popup';
        popup.style.cssText = `
            background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px);
            border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 6px; max-width: 85vw; max-height: 85vh;
            overflow: hidden; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
        `;

        currentPopup = wrapper;

        const img = new Image();
        img.onload = () => {
            // Calculate available space for image (popup minus padding)
            const maxWidth = window.innerWidth * 0.85 - 12; // 85vw - 6px padding each side
            const maxHeight = window.innerHeight * 0.85 - 12; // 85vh - 6px padding each side
            
            // Calculate scale factor to fit image within available space
            const scaleX = maxWidth / img.width;
            const scaleY = maxHeight / img.height;
            const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
            
            // Calculate display dimensions
            const displayWidth = img.width * scale;
            const displayHeight = img.height * scale;
            
            // Create canvas with original image dimensions
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Set canvas display size to scaled dimensions
            canvas.style.width = displayWidth + 'px';
            canvas.style.height = displayHeight + 'px';
            canvas.style.display = 'block';
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            currentCanvas = canvas;
            canvas.originalImage = img;
            canvas.displayScale = scale; // Store scale for coordinate conversion
            
            popup.appendChild(canvas);

            // Load and display existing ROI if available
            loadROI(currentFileName, (loadedRoi) => {
                if (loadedRoi && loadedRoi.length > 0) {
                    rois[currentFileName] = loadedRoi;
                    drawROI(ctx, loadedRoi);
                }
            });

            // Add controls above the popup
            wrapper.appendChild(controls);
            wrapper.appendChild(popup);
            document.body.appendChild(wrapper);

            document.addEventListener('keydown', navigateImages);
        };
        img.src = currentImagePath;
    }

    function startROIPolygon(canvas, popup) {
        const ctx = canvas.getContext('2d');
        isDrawing = true;
        points = [];

        // Clear any existing ROI for this image
        delete rois[currentFileName];

        canvas.addEventListener('click', handleCanvasClick);
        canvas.addEventListener('contextmenu', handleCanvasRightClick);

        function handleCanvasClick(e) {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            
            // Convert display coordinates to original image coordinates
            const displayX = e.clientX - rect.left;
            const displayY = e.clientY - rect.top;
            
            // Scale coordinates back to original image size
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            const x = displayX * scaleX;
            const y = displayY * scaleY;
            
            points.push([x, y]);

            redrawCanvas(ctx, canvas.originalImage, points);

            if (points.length > 2 && isCloseToStart(x, y, points[0])) {
                finishROI(canvas, popup);
            }
        }

        function handleCanvasRightClick(e) {
            e.preventDefault();
            if (points.length > 2) {
                finishROI(canvas, popup);
            }
        }

        function finishROI(canvas, popup) {
            isDrawing = false;
            canvas.removeEventListener('click', handleCanvasClick);
            canvas.removeEventListener('contextmenu', handleCanvasRightClick);
            savePolygon(points, canvas, popup);
        }
    }

    function redrawCanvas(ctx, originalImage, currentPoints) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(originalImage, 0, 0);
        if (currentPoints && currentPoints.length > 0) {
            drawROI(ctx, currentPoints);
        }
    }

    function drawROI(ctx, points) {
        if (!points || points.length === 0) return;
        
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0], points[i][1]);
        }
        
        if (!isDrawing && points.length > 2) {
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 0, 0, 0.21)';
            ctx.fill();
        }
        
        ctx.strokeStyle = isDrawing ? 'rgba(255, 0, 0, 0.7)' : 'rgba(255, 0, 0, 1)';
        ctx.lineWidth = 7;
        ctx.setLineDash(isDrawing ? [7, 7] : []);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw points
        points.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fill();
        });
    }

    function isCloseToStart(x, y, startPoint, threshold = 10) {
        return Math.hypot(x - startPoint[0], y - startPoint[1]) < threshold;
    }

    function savePolygon(points, canvas, popup) {
        if (!points || points.length === 0) return;
        
        const npArray = points;
        rois[currentFileName] = npArray;
        
        fetch('/save_roi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imagePath: currentFileName, npArray })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                console.log('ROI saved successfully for', currentFileName);
                rois[currentFileName] = data.npArray;
            } else {
                console.error('Save ROI failed:', data.message);
            }
        })
        .catch(err => console.error('Save ROI failed:', err));
    }

    function loadROI(imagePath, callback) {
        fetch('/load_roi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imagePath })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                if (data.npArray && data.npArray.length > 0) {
                    rois[imagePath] = data.npArray;
                    console.log('ROI loaded successfully for', imagePath);
                } else {
                    delete rois[imagePath];
                    console.log('No ROI found for', imagePath);
                }
                if (callback) callback(data.npArray);
            } else {
                console.error('Load ROI failed:', data.message);
                if (callback) callback(null);
            }
        })
        .catch(err => {
            console.error('Load ROI failed:', err);
            if (callback) callback(null);
        });
    }

    function deleteROI(imagePath, canvas, popup) {
        fetch('/delete_roi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imagePath })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                console.log('ROI deleted successfully for', imagePath);
                delete rois[imagePath];
                
                // Redraw canvas without ROI
                const ctx = canvas.getContext('2d');
                redrawCanvas(ctx, canvas.originalImage, []);
            } else {
                console.error('Delete ROI failed:', data.message);
            }
        })
        .catch(err => console.error('Delete ROI failed:', err));
    }

    function navigateImages(e) {
        if (!images.length) return;
        const key = e.key.toLowerCase();
        
        if ((key === 'arrowleft' || key === 'a') && currentImageIndex > 0) {
            // Save current ROI before navigating
            if (currentCanvas && rois[currentFileName]) {
                savePolygon(rois[currentFileName], currentCanvas, currentPopup);
            }
            
            currentImageIndex--;
            currentFileName = images[currentImageIndex].name;
            currentImagePath = URL.createObjectURL(images[currentImageIndex]);
            saveImageData();
            showImagePopup();
            
        } else if ((key === 'arrowright' || key === 'd') && currentImageIndex < images.length - 1) {
            // Save current ROI before navigating
            if (currentCanvas && rois[currentFileName]) {
                savePolygon(rois[currentFileName], currentCanvas, currentPopup);
            }
            
            currentImageIndex++;
            currentFileName = images[currentImageIndex].name;
            currentImagePath = URL.createObjectURL(images[currentImageIndex]);
            saveImageData();
            showImagePopup();
        }
    }
});