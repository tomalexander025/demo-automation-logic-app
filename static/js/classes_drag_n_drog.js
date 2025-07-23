class ClassesDraggable {
    constructor(element) {
        this.element = element;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.originalParent = element.parentElement;
        this.connections = [];

        element.addEventListener('mousedown', this.startDragging.bind(this));
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('mouseup', this.stopDragging.bind(this));
    }

    startDragging(e) {
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
        this.clone.style.height = '50px';
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
            this.clone.style.transition = 'transform 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease';

            this.clone.style.transform = 'scale(1.1)';
            this.clone.style.opacity = '0.7';
            setTimeout(() => {
                this.transformToLogicBlock(this.clone);
                this.clone.style.transform = 'scale(1)';
                this.clone.style.opacity = '1';
            }, 150);
            // Keep original element in place
            this.element.style.position = '';
            this.element.style.zIndex = '';
            this.element.style.transition = '';
        }
    }

    transformToLogicBlock(element) {
        const sequenceNumber = SequenceNumber.assignSequenceNumber(element);
        const originalText = element.textContent.replace(/^\d+\s*/, '').trim();
        element.textContent = originalText;

        element.style.background = 'linear-gradient(135deg, #fffef5ff, #ffe59dff)';
        element.style.color = '#000000';
        element.style.borderRadius = '15px';
        element.style.padding = '10px';
        element.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
        element.style.fontFamily = 'Inter, sans-serif';
        element.style.fontSize = '1.5rem';
        element.style.fontWeight = '600';
        element.style.textAlign = 'center';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.height = '50px';
        element.style.width = (originalText.length * 10 + 40) + 'px';
        element.style.position = 'absolute';
        element.style.cursor = 'move';

        SequenceNumber.addSequenceNumberCircle(element, sequenceNumber, this);

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
        closeBtn.innerHTML = '<span style="color: white; font-weight: bold; font-size: 1rem">X</span>';
        closeBtn.addEventListener('click', () => {
            this.removeElement(element);
        });
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.transform = 'scale(1.1)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.transform = 'scale(1)';
        });
        element.appendChild(closeBtn);

        ['top', 'bottom', 'right'].forEach(pos => {
            let point = document.createElement('div');
            point.style.position = 'absolute';
            point.style.width = '10px';
            point.style.height = '10px';
            point.style.background = 'linear-gradient(135deg, #ffffff, #cccccc)';
            point.style.border = '2px solid #000000';
            point.style.borderRadius = '50%';
            point.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
            if (pos === 'top') {
                point.style.top = '-5px';
                point.style.left = '50%';
                point.style.transform = 'translateX(-50%)';
            } else if (pos === 'bottom') {
                point.style.bottom = '-5px';
                point.style.left = '50%';
                point.style.transform = 'translateX(-50%)';
            } else if (pos === 'right') {
                point.style.right = '-5px';
                point.style.top = '50%';
                point.style.transform = 'translateY(-50%)';
            }
            point.classList.add('connection-point');
            point.addEventListener('mousedown', (e) => this.startConnection(e, point, element));
            element.appendChild(point);
        });

        element.classList.add('logic-block');
        this.makeElementDraggable(element);
    }

    handleNumberChange(element, currentNumber, newNumber, overlay) {
        if (currentNumber === newNumber) {
            document.body.removeChild(overlay);
            return;
        }

        const existingElement = SequenceNumber.findElementBySequenceNumber(newNumber);
        if (existingElement) {
            this.showConflictDialog(element, currentNumber, newNumber, existingElement, overlay);
        } else {
            SequenceNumber.updateSequenceNumber(element, currentNumber, newNumber);
            document.body.removeChild(overlay);
        }
    }

    showConflictDialog(element, currentNumber, newNumber, existingElement, overlay) {
        const conflictDialog = document.createElement('div');
        conflictDialog.style.position = 'absolute';
        conflictDialog.style.top = '50%';
        conflictDialog.style.left = '50%';
        conflictDialog.style.transform = 'translate(-50%, -50%)';
        conflictDialog.style.background = 'linear-gradient(135deg, #ff6b6b, #ff5252)';
        conflictDialog.style.padding = '15px';
        conflictDialog.style.borderRadius = '12px';
        conflictDialog.style.color = 'white';
        conflictDialog.style.textAlign = 'center';
        conflictDialog.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)';
        conflictDialog.style.zIndex = '10001';

        const warningText = document.createElement('p');
        warningText.innerHTML = `⚠️ Number ${newNumber} is already assigned.<br>Swap numbers?`;
        warningText.style.margin = '0 0 15px 0';
        warningText.style.fontSize = '14px';

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.justifyContent = 'center';

        const yesBtn = document.createElement('button');
        yesBtn.textContent = 'YES';
        yesBtn.style.background = 'linear-gradient(135deg, #4caf50, #388e3c)';
        yesBtn.style.color = 'white';
        yesBtn.style.border = 'none';
        yesBtn.style.padding = '8px 15px';
        yesBtn.style.borderRadius = '10px';
        yesBtn.style.cursor = 'pointer';
        yesBtn.style.fontSize = '14px';
        yesBtn.addEventListener('click', () => {
            SequenceNumber.swapSequenceNumbers(element, currentNumber, existingElement, newNumber);
            document.body.removeChild(overlay);
        });

        const noBtn = document.createElement('button');
        noBtn.textContent = 'NO';
        noBtn.style.background = 'linear-gradient(135deg, #ff4d4d, #cc0000)';
        noBtn.style.color = 'white';
        noBtn.style.border = 'none';
        noBtn.style.padding = '8px 15px';
        noBtn.style.borderRadius = '10px';
        noBtn.style.cursor = 'pointer';
        noBtn.style.fontSize = '14px';
        noBtn.addEventListener('click', () => {
            conflictDialog.remove();
        });

        buttonContainer.appendChild(yesBtn);
        buttonContainer.appendChild(noBtn);
        conflictDialog.appendChild(warningText);
        conflictDialog.appendChild(buttonContainer);
        overlay.appendChild(conflictDialog);
    }

    removeElement(element) {
        SequenceNumber.elementSequences.delete(element.id);
        this.removeConnections(element);
        element.remove();
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
                        const startX = startPoint.getBoundingClientRect().left + 5 - rect.left;
                        const startY = startPoint.getBoundingClientRect().top + 5 - rect.top;
                        const endX = endPoint.getBoundingClientRect().left + 5 - rect.left;
                        const endY = endPoint.getBoundingClientRect().top + 5 - rect.top;

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
        path.setAttribute('stroke-width', '2');
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
        const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode2.setAttribute('in', 'SourceGraphic');
        feMerge.appendChild(feMergeNode1);
        feMerge.appendChild(feMergeNode2);
        filter.appendChild(feGaussianBlur);
        filter.appendChild(feMerge);
        defs.appendChild(filter);
        svg.appendChild(defs);

        const rect = workspace.getBoundingClientRect();
        const startX = startPoint.getBoundingClientRect().left + 5 - rect.left;
        const startY = startPoint.getBoundingClientRect().top + 5 - rect.top;

        if (!parentElement.id) {
            parentElement.id = 'class_element_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
                const targetElement = target.closest('.logic-block');
                if (!targetElement.id) {
                    targetElement.id = 'class_element_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                }

                const endX = target.getBoundingClientRect().left + 5 - rect.left;
                const endY = target.getBoundingClientRect().top + 5 - rect.top;
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

    static initFileInput() {
        const browseButton = document.querySelector('.BROWSE_AI');
        const classesContainer = document.querySelector('.CLASSES_NAME');
        const searchBar = document.querySelector('.SEARCH_BAR');

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pt';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        searchBar.innerHTML = '<input type="text" class="search-input" placeholder="No AI model is selected">';
        const searchInput = searchBar.querySelector('.search-input');

        browseButton.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const classes = await this.extractClassesFromPtFile(file);

            if (classes.length > 0) {
                classesContainer.innerHTML = '';
                classesContainer.appendChild(searchBar);
                searchBar.querySelector('.search-input').placeholder = 'Search classes...';

                const classList = document.createElement('div');
                classList.classList.add('class-list');
                classesContainer.appendChild(classList);

                classesContainer.style.height = '35vh';
                classList.style.maxHeight = 'calc(35 - 3vh)';
                classList.style.overflowY = 'auto';

                classes.forEach((className, index) => {
                    const classItem = document.createElement('div');
                    classItem.classList.add('class-item');

                    const numberCircle = document.createElement('div');
                    numberCircle.classList.add('number-circle');
                    numberCircle.textContent = index + 1;

                    const classText = document.createElement('span');
                    classText.textContent = className;

                    classItem.appendChild(numberCircle);
                    classItem.appendChild(classText);
                    classList.appendChild(classItem);

                    new ClassesDraggable(classItem);
                });

                searchInput.addEventListener('input', () => {
                    const filter = searchInput.value.toLowerCase();
                    const classItems = classList.querySelectorAll('.class-item');
                    classItems.forEach(item => {
                        const text = item.querySelector('span').textContent.toLowerCase();
                        item.style.display = text.includes(filter) ? 'flex' : 'none';
                    });
                });
            } else {
                classesContainer.innerHTML = 'No classes found in the selected model.';
                classesContainer.appendChild(searchBar);
                searchBar.querySelector('.search-input').placeholder = 'No AI model is selected';
                classesContainer.style.height = '16vh';
            }
        });
    }

    static async extractClassesFromPtFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('/upload_pt', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.status === 'success') {
                return data.classes || [];
            } else {
                console.error('Error extracting classes:', data.message);
                return [];
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            return [];
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    ClassesDraggable.initFileInput();
});