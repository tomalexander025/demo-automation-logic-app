class Draggable {
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
        this.clone.style.width = '100px';
        this.clone.style.height = '80px';
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
        }
    }

    transformToLogicBlock(element) {
        const sequenceNumber = SequenceNumber.assignSequenceNumber(element);

        element.style.background = 'linear-gradient(135deg, #ffffffff, #f7f9ffff)';
        element.style.color = '#ffffff';
        element.style.borderRadius = '15px';
        element.style.padding = '10px';
        element.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
        element.style.fontFamily = 'Arial, sans-serif';
        element.style.fontSize = '16px';
        element.style.textAlign = 'center';
        element.style.width = '100px';
        element.style.height = '80px';
        element.style.position = 'absolute';
        element.style.cursor = 'move';

        SequenceNumber.addSequenceNumberCircle(element, sequenceNumber);

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
        conflictDialog.style.padding = '20px';
        conflictDialog.style.borderRadius = '15px';
        conflictDialog.style.color = 'white';
        conflictDialog.style.textAlign = 'center';
        conflictDialog.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.4)';
        conflictDialog.style.zIndex = '10001';

        const warningText = document.createElement('p');
        warningText.innerHTML = `⚠️ Number ${newNumber} is already assigned to another element.<br><br>Do you want to swap the numbers?`;
        warningText.style.margin = '0 0 20px 0';
        warningText.style.fontSize = '16px';

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '15px';
        buttonContainer.style.justifyContent = 'center';

        const yesBtn = document.createElement('button');
        yesBtn.textContent = 'YES';
        yesBtn.style.background = 'linear-gradient(135deg, #4caf50, #388e3c)';
        yesBtn.style.color = 'white';
        yesBtn.style.border = 'none';
        yesBtn.style.padding = '10px 20px';
        yesBtn.style.borderRadius = '10px';
        yesBtn.style.cursor = 'pointer';
        yesBtn.style.fontSize = '16px';
        yesBtn.addEventListener('click', () => {
            SequenceNumber.swapSequenceNumbers(element, currentNumber, existingElement, newNumber);
            document.body.removeChild(overlay);
        });

        const noBtn = document.createElement('button');
        noBtn.textContent = 'NO';
        noBtn.style.background = 'linear-gradient(135deg, #ff4d4d, #cc0000)';
        noBtn.style.color = 'white';
        noBtn.style.border = 'none';
        noBtn.style.padding = '10px 20px';
        noBtn.style.borderRadius = '10px';
        noBtn.style.cursor = 'pointer';
        noBtn.style.fontSize = '16px';
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
                const targetElement = target.closest('.logic-block');
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

    static runInference() {
        const workspace = document.querySelector('.LOGIC_AREA_WORKSPACE');
        const logicBlocks = Array.from(workspace.querySelectorAll('.logic-block, .roi-block'));
        console.debug(`Running inference with ${logicBlocks.length} blocks`);
        
        if (logicBlocks.length === 0) {
            console.log('No logic blocks found in workspace');
            return;
        }

        const elementsWithSequenceNumber = [];
        logicBlocks.forEach(block => {
            const sequenceNumber = SequenceNumber.elementSequences.get(block.id);
            if (sequenceNumber !== undefined) {
                let elementText = block.textContent
                    .replace(/\s*X\s*$/, '')
                    .replace(/^\d+\s*/, '')
                    .trim();
                
                const classes = ['AND', 'OR', 'NOT', 'INSIDE_ROI', 'OUTSIDE_ROI', 'TOUCHING_ROI', 'IF', 'ELSE', 'OK', 'NOK', 'WAS'];
                const blockClass = classes.find(cls => block.classList.contains(cls));
                if (blockClass) {
                    elementText = blockClass;
                }

                elementsWithSequenceNumber.push({
                    number: sequenceNumber,
                    text: elementText,
                    element: block
                });
            }
        });

        elementsWithSequenceNumber.sort((a, b) => a.number - b.number);

        let output = '=== INFERENCE SEQUENCE ===\n';
        elementsWithSequenceNumber.forEach((item, index) => {
            output += `DEBUG:__main__:${item.number}. ${item.text || 'Unnamed'}\n`;
            if (index < elementsWithSequenceNumber.length - 1) {
                output += '  ↓\n';
            }
        });
        output += '=== END SEQUENCE ===';

        console.log(output);
        
        this.sendSequenceToServer(elementsWithSequenceNumber);
    }

    static sendSequenceToServer(sequence) {
        const sequenceData = sequence.map(item => ({
            number: item.number,
            text: item.text,
            elementId: item.element.id
        }));

        fetch('/run_inference', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sequence: sequenceData })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Server response:', data);
        })
        .catch(error => {
            console.error('Error sending sequence to server:', error);
        });
    }

    static clearAllLogic() {
        const workspace = document.querySelector('.LOGIC_AREA_WORKSPACE');
        const blocks = document.querySelectorAll('.logic-block, .roi-block');
        
        blocks.forEach(block => {
            const draggable = new Draggable(block);
            draggable.removeConnections(block);
            block.remove();
            console.debug(`Removed block ID: ${block.id}`);
        });

        SequenceNumber.resetSequence();
        console.debug('All logic and ROI blocks cleared');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.CONDITION_AREA .AND, .CONDITION_AREA .OR, .CONDITION_AREA .NOT, .CONDITION_AREA .INSIDE_ROI, .CONDITION_AREA .OUTSIDE_ROI, .CONDITION_AREA .TOUCHING_ROI, .CONDITION_AREA .IF, .CONDITION_AREA .ELSE, .CONDITION_AREA .OK, .CONDITION_AREA .NOK, .CONDITION_AREA .WAS').forEach(element => {
        new Draggable(element);
    });

    const runInferenceButton = document.querySelector('.RUN_INFERENCE');
    if (runInferenceButton) {
        runInferenceButton.addEventListener('click', () => {
            Draggable.runInference();
        });
    }

    const clearLogicButton = document.querySelector('.CLEAR_LOGIC');
    if (clearLogicButton) {
        clearLogicButton.addEventListener('click', () => {
            Draggable.clearAllLogic();
        });
    }
});