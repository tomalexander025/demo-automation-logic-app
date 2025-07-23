class ROIDraggable {
    constructor(element, roiData) {
        this.element = element;
        this.roiData = roiData;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.originalParent = element.parentElement;
        this.roiNumber = roiData.number || SequenceNumber.assignSequenceNumber(element);
        this.connections = [];

        element.addEventListener('mousedown', this.startDragging.bind(this));
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('mouseup', this.stopDragging.bind(this));

        this.updateAppearance();
    }

    startDragging(e) {
        if (e.target.classList.contains('connection-point') || 
            e.target.closest('.connection-point') || 
            e.target.closest('div[style*="background: linear-gradient(135deg, #ff4d4d, #cc0000)"]') ||
            e.target.classList.contains('sequence-number')) {
            return;
        }

        e.preventDefault();
        this.isDragging = true;
        this.offsetX = e.clientX - this.element.getBoundingClientRect().left;
        this.offsetY = e.clientY - this.element.getBoundingClientRect().top;
        this.element.style.position = 'absolute';
        this.element.style.zIndex = '1000';
        this.element.style.transition = 'none';

        this.clone = this.element.cloneNode(true);
        this.clone.style.position = 'absolute';
        this.clone.style.zIndex = '1000';
        this.clone.style.opacity = '0.7';
        this.originalParent.appendChild(this.clone);
        this.clone.style.left = this.element.getBoundingClientRect().left + 'px';
        this.clone.style.top = this.element.getBoundingClientRect().top + 'px';
    }

    drag(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        const workspace = document.querySelector('.LOGIC_AREA_WORKSPACE');
        const rect = workspace.getBoundingClientRect();
        const maxX = workspace.offsetWidth - this.clone.offsetWidth;
        const maxY = workspace.offsetHeight - this.clone.offsetHeight;

        let newX = e.clientX - this.offsetX - rect.left;
        let newY = e.clientY - this.offsetY - rect.top;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        this.clone.style.left = newX + 'px';
        this.clone.style.top = newY + 'px';
        workspace.appendChild(this.clone);
    }

    stopDragging(e) {
        if (this.isDragging) {
            this.isDragging = false;
            const workspace = document.querySelector('.LOGIC_AREA_WORKSPACE');
            const rect = workspace.getBoundingClientRect();
            const dropX = e.clientX - rect.left - this.offsetX;
            const dropY = e.clientY - rect.top - this.offsetY;

            const maxX = workspace.offsetWidth - this.clone.offsetWidth;
            const maxY = workspace.offsetHeight - this.clone.offsetHeight;
            this.clone.style.left = Math.max(0, Math.min(dropX, maxX)) + 'px';
            this.clone.style.top = Math.max(0, Math.min(dropY, maxY)) + 'px';
            this.clone.style.zIndex = '1';
            this.clone.style.transition = 'transform 0.3s ease, opacity 0.3s ease';

            // Preserve the original element's ID to maintain sequence number
            this.clone.id = this.element.id;

            this.clone.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.transformToROIBlock(this.clone);
                this.clone.style.transform = 'scale(1)';
                this.clone.style.opacity = '1';
            }, 150);
            this.element.remove();
        }
    }

    updateAppearance() {
        this.element.style.background = 'rgba(255, 82, 82, 0.5)';
        this.element.style.border = '2px solid rgba(255, 0, 0, 0.8)';
        this.element.style.borderRadius = '10px';
        this.element.style.padding = '5px';
        this.element.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        this.element.style.color = '#ffffff';
        this.element.style.fontFamily = 'Arial, sans-serif';
        this.element.style.fontSize = '14px';
        this.element.style.textAlign = 'center';
        this.element.style.width = '150px';
        this.element.style.height = '100px';

        const numberDisplay = document.createElement('div');
        numberDisplay.textContent = `ROI ${this.roiNumber}`;
        numberDisplay.style.position = 'absolute';
        numberDisplay.style.top = '50%';
        numberDisplay.style.left = '50%';
        numberDisplay.style.transform = 'translate(-50%, -50%)';
        numberDisplay.style.fontWeight = 'bold';
        numberDisplay.style.textShadow = '0 0 5px rgba(255, 255, 255, 0.7), 0 0 10px rgba(255, 255, 255, 0.5)';
        this.element.appendChild(numberDisplay);

        SequenceNumber.addSequenceNumberCircle(this.element, this.roiNumber);

        let closeBtn = document.createElement('div');
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '-12px';
        closeBtn.style.right = '-12px';
        closeBtn.style.width = '24px';
        closeBtn.style.height = '24px';
        closeBtn.style.background = 'linear-gradient(135deg, #ff4d4d, #cc0000)';
        closeBtn.style.borderRadius = '50%';
        closeBtn.style.display = 'flex';
        closeBtn.style.alignItems = 'center';
        closeBtn.style.justifyContent = 'center';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        closeBtn.innerHTML = '<span style="color: white; font-weight: bold;">X</span>';
        closeBtn.addEventListener('click', () => {
            this.removeElement(this.element);
        });
        this.element.appendChild(closeBtn);

        ['top', 'bottom', 'right'].forEach(pos => {
            let point = document.createElement('div');
            point.style.position = 'absolute';
            point.style.width = '12px';
            point.style.height = '12px';
            point.style.background = 'linear-gradient(135deg, #ffffff, #cccccc)';
            point.style.border = '2px solid #000000';
            point.style.borderRadius = '50%';
            point.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
            if (pos === 'top') {
                point.style.top = '-6px';
                point.style.left = '50%';
                point.style.transform = 'translateX(-50%)';
            } else if (pos === 'bottom') {
                point.style.bottom = '-6px';
                point.style.left = '50%';
                point.style.transform = 'translateX(-50%)';
            } else if (pos === 'right') {
                point.style.right = '-6px';
                point.style.top = '50%';
                point.style.transform = 'translateY(-50%)';
            }
            point.classList.add('connection-point');
            point.addEventListener('mousedown', (e) => this.startConnection(e, point, this.element));
            this.element.appendChild(point);
        });
    }

    transformToROIBlock(element) {
        element.classList.add('roi-block');
        element.style.background = 'rgba(255, 82, 82, 0.5)';
        element.style.border = '2px solid rgba(255, 0, 0, 0.8)';
        element.style.borderRadius = '10px';
        element.style.padding = '5px';
        element.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        element.style.color = '#ffffff';
        element.style.fontFamily = 'Arial, sans-serif';
        element.style.fontSize = '14px';
        element.style.textAlign = 'center';
        element.style.position = 'absolute';
        element.style.cursor = 'move';
        element.style.width = '150px';
        element.style.height = '100px';

        // Use the existing sequence number from the map or the original roiNumber
        const sequenceNumber = SequenceNumber.elementSequences.get(element.id) || this.roiNumber;
        SequenceNumber.elementSequences.set(element.id, sequenceNumber);
        SequenceNumber.addSequenceNumberCircle(element, sequenceNumber);

        const numberDisplay = document.createElement('div');
        numberDisplay.textContent = `ROI ${sequenceNumber}`;
        numberDisplay.style.position = 'absolute';
        numberDisplay.style.top = '50%';
        numberDisplay.style.left = '50%';
        numberDisplay.style.transform = 'translate(-50%, -50%)';
        numberDisplay.style.fontWeight = 'bold';
        numberDisplay.style.textShadow = '0 0 5px rgba(255, 255, 255, 0.7), 0 0 10px rgba(255, 255, 255, 0.5)';
        element.appendChild(numberDisplay);

        let closeBtn = document.createElement('div');
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '-12px';
        closeBtn.style.right = '-12px';
        closeBtn.style.width = '24px';
        closeBtn.style.height = '24px';
        closeBtn.style.background = 'linear-gradient(135deg, #ff4d4d, #cc0000)';
        closeBtn.style.borderRadius = '50%';
        closeBtn.style.display = 'flex';
        closeBtn.style.alignItems = 'center';
        closeBtn.style.justifyContent = 'center';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        closeBtn.innerHTML = '<span style="color: white; font-weight: bold;">X</span>';
        closeBtn.addEventListener('click', () => {
            this.removeElement(element);
        });
        element.appendChild(closeBtn);

        ['top', 'bottom', 'right'].forEach(pos => {
            let point = document.createElement('div');
            point.style.position = 'absolute';
            point.style.width = '12px';
            point.style.height = '12px';
            point.style.background = 'linear-gradient(135deg, #ffffff, #cccccc)';
            point.style.border = '2px solid #000000';
            point.style.borderRadius = '50%';
            point.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
            if (pos === 'top') {
                point.style.top = '-6px';
                point.style.left = '50%';
                point.style.transform = 'translateX(-50%)';
            } else if (pos === 'bottom') {
                point.style.bottom = '-6px';
                point.style.left = '50%';
                point.style.transform = 'translateX(-50%)';
            } else if (pos === 'right') {
                point.style.right = '-6px';
                point.style.top = '50%';
                point.style.transform = 'translateY(-50%)';
            }
            point.classList.add('connection-point');
            point.addEventListener('mousedown', (e) => this.startConnection(e, point, element));
            element.appendChild(point);
        });

        this.makeElementDraggable(element);
    }

    makeElementDraggable(element) {
        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        element.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('connection-point') || 
                e.target.closest('.connection-point') || 
                e.target.closest('div[style*="background: linear-gradient(135deg, #ff4d4d, #cc0000)"]') ||
                e.target.classList.contains('sequence-number')) {
                return;
            }

            isDragging = true;
            dragOffsetX = e.clientX - element.getBoundingClientRect().left;
            dragOffsetY = e.clientY - element.getBoundingClientRect().top;
            element.style.zIndex = '1000';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const workspace = document.querySelector('.LOGIC_AREA_WORKSPACE');
            const rect = workspace.getBoundingClientRect();
            const maxX = workspace.offsetWidth - element.offsetWidth;
            const maxY = workspace.offsetHeight - element.offsetHeight;

            let newX = e.clientX - dragOffsetX - rect.left;
            let newY = e.clientY - dragOffsetY - rect.top;

            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));

            element.style.left = newX + 'px';
            element.style.top = newY + 'px';

            this.updateConnections(element);
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.zIndex = '1';
            }
        });
    }

    updateConnections(element) {
        const workspace = document.querySelector('.LOGIC_AREA_WORKSPACE');
        const svgs = workspace.querySelectorAll('svg');
        
        svgs.forEach(svg => {
            const paths = svg.querySelectorAll('path');
            paths.forEach(path => {
                if (path.dataset.startElement === element.id || path.dataset.endElement === element.id) {
                    const rect = workspace.getBoundingClientRect();
                    const startPoint = path.dataset.startElement === element.id ? 
                        element.querySelector('.connection-point') : 
                        document.getElementById(path.dataset.startElement)?.querySelector('.connection-point');
                    const endPoint = path.dataset.endElement === element.id ? 
                        element.querySelector('.connection-point') : 
                        document.getElementById(path.dataset.endElement)?.querySelector('.connection-point');
                    
                    if (startPoint && endPoint) {
                        const startX = startPoint.getBoundingClientRect().left + 6 - rect.left;
                        const startY = startPoint.getBoundingClientRect().top + 6 - rect.top;
                        const endX = endPoint.getBoundingClientRect().left + 6 - rect.left;
                        const endY = endPoint.getBoundingClientRect().top + 6 - rect.top;
                        
                        const cpX1 = startX + (endX - startX) * 0.3;
                        const cpY1 = startY;
                        const cpX2 = startX + (endX - startX) * 0.7;
                        const cpY2 = endY;
                        
                        path.setAttribute('d', `M${startX},${startY} C${cpX1},${cpY1} ${cpX2},${cpY2} ${endX},${endY}`);
                    }
                }
            });
        });
    }

    removeConnections(element) {
        const workspace = document.querySelector('.LOGIC_AREA_WORKSPACE');
        const svgs = workspace.querySelectorAll('svg');
        
        svgs.forEach(svg => {
            const paths = svg.querySelectorAll('path');
            paths.forEach(path => {
                if (path.dataset.startElement === element.id || path.dataset.endElement === element.id) {
                    svg.remove();
                }
            });
        });

        const allPoints = workspace.querySelectorAll('.connection-point');
        allPoints.forEach(point => {
            point.style.background = 'linear-gradient(135deg, #ffffff, #cccccc)';
            point.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
        });
    }

    removeElement(element) {
        SequenceNumber.elementSequences.delete(element.id);
        this.removeConnections(element);
        element.remove();
    }

    startConnection(e, startPoint, parentElement) {
        e.preventDefault();
        e.stopPropagation();
        
        startPoint.style.background = 'radial-gradient(circle, #ffff00, #ffeb3b)';
        startPoint.style.boxShadow = '0 0 10px #ffff00, 0 0 20px #ffeb3b';
        startPoint.style.transition = 'all 0.3s ease';

        const workspace = document.querySelector('.LOGIC_AREA_WORKSPACE');
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.pointerEvents = 'none';
        workspace.appendChild(svg);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'white');
        path.setAttribute('stroke-width', '3');
        path.setAttribute('filter', 'url(#glow)');
        svg.appendChild(path);

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', 'glow');
        filter.setAttribute('x', '-50%');
        filter.setAttribute('y', '-50%');
        filter.setAttribute('width', '200%');
        filter.setAttribute('height', '200%');
        const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur.setAttribute('stdDeviation', '2');
        feGaussianBlur.setAttribute('result', 'coloredBlur');
        const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'fe-merge-node');
        const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'fe-merge-node');
        feMergeNode2.setAttribute('in', 'SourceGraphic');
        feMerge.appendChild(feMergeNode1);
        feMerge.appendChild(feMergeNode2);
        filter.appendChild(feGaussianBlur);
        filter.appendChild(feMerge);
        defs.appendChild(filter);
        svg.appendChild(defs);

        const rect = workspace.getBoundingClientRect();
        const startX = startPoint.getBoundingClientRect().left + 6 - rect.left;
        const startY = startPoint.getBoundingClientRect().top + 6 - rect.top;

        if (!parentElement.id) {
            parentElement.id = 'element_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        function updatePath(e) {
            const endX = e.clientX - rect.left;
            const endY = e.clientY - rect.top;
            const cpX1 = startX + (endX - startX) * 0.3;
            const cpY1 = startY;
            const cpX2 = startX + (endX - startX) * 0.7;
            const cpY2 = endY;
            path.setAttribute('d', `M${startX},${startY} C${cpX1},${cpY1} ${cpX2},${cpY2} ${endX},${endY}`);
        }

        updatePath(e);
        document.addEventListener('mousemove', updatePath);

        function stopConnection(e) {
            document.removeEventListener('mousemove', updatePath);
            document.removeEventListener('mouseup', stopConnection);
            const target = e.target.closest('.connection-point');
            if (target && target !== startPoint) {
                const targetElement = target.closest('.logic-block, .roi-block');
                if (!targetElement.id) {
                    targetElement.id = 'element_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                }
                
                const endX = target.getBoundingClientRect().left + 6 - rect.left;
                const endY = target.getBoundingClientRect().top + 6 - rect.top;
                const cpX1 = startX + (endX - startX) * 0.3;
                const cpY1 = startY;
                const cpX2 = startX + (endX - startX) * 0.7;
                const cpY2 = endY;
                path.setAttribute('d', `M${startX},${startY} C${cpX1},${cpY1} ${cpX2},${cpY2} ${endX},${endY}`);
                
                path.dataset.startElement = parentElement.id;
                path.dataset.endElement = targetElement.id;
                
                target.style.background = 'radial-gradient(circle, #ffff00, #ffeb3b)';
                target.style.boxShadow = '0 0 10px #ffff00, 0 0 20px #ffeb3b';
            } else {
                svg.remove();
                startPoint.style.background = 'linear-gradient(135deg, #ffffff, #cccccc)';
                startPoint.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
            }
        }

        document.addEventListener('mouseup', stopConnection);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    function showROIPopup() {
        const lastImageData = sessionStorage.getItem('imageData');
        if (!lastImageData) {
            console.warn('No image data available in sessionStorage');
            return;
        }

        const { fileName } = JSON.parse(lastImageData);
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '10000';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';

        const popup = document.createElement('div');
        popup.style.background = '#e0e5ec';
        popup.style.padding = '20px';
        popup.style.borderRadius = '15px';
        popup.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
        popup.style.textAlign = 'center';
        popup.style.color = '#333333';
        popup.style.minWidth = '300px';
        popup.style.maxHeight = '70vh';
        popup.style.overflowY = 'auto';
        popup.style.fontFamily = 'Arial, sans-serif';

        const title = document.createElement('h3');
        title.textContent = 'Select ROI to Drag';
        title.style.margin = '0 0 15px 0';
        title.style.fontSize = '18px';
        title.style.color = '#2a4066';
        popup.appendChild(title);

        fetch('/load_roi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imagePath: fileName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' && data.npArray && data.npArray.length > 0) {
                const rois = data.npArray;
                for (let i = 0; i < rois.length; i++) {
                    const roiItem = document.createElement('div');
                    roiItem.textContent = `ROI ${i + 1}`;
                    roiItem.style.padding = '10px';
                    roiItem.style.margin = '5px 0';
                    roiItem.style.background = 'rgba(255, 82, 82, 0.5)';
                    roiItem.style.border = '2px solid rgba(255, 0, 0, 0.8)';
                    roiItem.style.borderRadius = '5px';
                    roiItem.style.cursor = 'pointer';
                    roiItem.style.transition = 'transform 0.2s ease';
                    roiItem.addEventListener('click', () => {
                        const roiElement = document.createElement('div');
                        roiElement.style.width = '150px';
                        roiElement.style.height = '100px';
                        const workspace = document.querySelector('.LOGIC_AREA_WORKSPACE');
                        workspace.appendChild(roiElement);
                        new ROIDraggable(roiElement, { number: i + 1, fileName });
                        roiElement.style.position = 'absolute';
                        roiElement.style.left = '50%';
                        roiElement.style.top = '50%';
                        roiElement.style.transform = 'translate(-50%, -50%)';
                        document.body.removeChild(overlay);
                    });
                    roiItem.addEventListener('mouseover', () => {
                        roiItem.style.transform = 'scale(1.05)';
                    });
                    roiItem.addEventListener('mouseout', () => {
                        roiItem.style.transform = 'scale(1)';
                    });
                    popup.appendChild(roiItem);
                }
            } else {
                const noROI = document.createElement('p');
                noROI.textContent = 'No ROIs have been created for this image. Please create the ROI on the image.';
                noROI.style.color = '#ff4d4d';
                noROI.style.fontWeight = 'bold';
                popup.appendChild(noROI);
            }

            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'Close';
            closeBtn.style.background = '#2a4066';
            closeBtn.style.color = '#ffffff';
            closeBtn.style.border = 'none';
            closeBtn.style.padding = '10px 20px';
            closeBtn.style.borderRadius = '10px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.marginTop = '15px';
            closeBtn.addEventListener('click', () => document.body.removeChild(overlay));
            popup.appendChild(closeBtn);
        })
        .catch(err => {
            console.error('Failed to load ROIs:', err);
            const errorMsg = document.createElement('p');
            errorMsg.textContent = 'Error loading ROIs. Please try again.';
            errorMsg.style.color = '#ff4d4d';
            popup.appendChild(errorMsg);
            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'Close';
            closeBtn.style.background = '#2a4066';
            closeBtn.style.color = '#ffffff';
            closeBtn.style.border = 'none';
            closeBtn.style.padding = '10px 20px';
            closeBtn.style.borderRadius = '10px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.marginTop = '15px';
            closeBtn.addEventListener('click', () => document.body.removeChild(overlay));
            popup.appendChild(closeBtn);
        });

        overlay.appendChild(popup);
        document.body.appendChild(overlay);
    }

    function initializeROISelection() {
        const createROIButtons = document.querySelectorAll('.create_roi');
        if (createROIButtons.length > 0) {
            createROIButtons.forEach(button => {
                button.addEventListener('click', showROIPopup);
            });
        } else {
            console.warn('Create ROI button (.create_roi) not found in the DOM');
        }
    }

    initializeROISelection();

    const imageFolder = document.querySelector('.IMAGE_FOLDER');
    const singleImage = document.querySelector('.SINGLE_IMAGE');
    if (imageFolder || singleImage) {
        const checkInterval = setInterval(() => {
            const lastImageData = sessionStorage.getItem('imageData');
            if (lastImageData && !document.querySelector('.create_roi')) {
                clearInterval(checkInterval);
                initializeROISelection();
            }
        }, 500);
    }
});