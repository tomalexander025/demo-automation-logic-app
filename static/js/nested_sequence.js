class NestedSequence {
    constructor(element) {
        this.element = element;
        this.isDrawing = false;
        this.startPoint = null;
        this.endPoint = null;
        this.svg = null;
        this.rect = null;
        this.points = [];
        this.clickCount = 0;
        this.activePoints = new Map();

        if (element.classList.contains('nested')) {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                if (!this.isDrawing) {
                    this.isDrawing = true;
                    this.setupDrawing();
                }
            });
        }
    }

    setupDrawing() {
        const workspace = document.querySelector('.LOGIC_AREA_WORKSPACE');
        if (!workspace) {
            console.error('Workspace not found');
            this.isDrawing = false;
            return;
        }

        workspace.addEventListener('click', this.handleWorkspaceClick.bind(this), { once: true });
    }

    handleWorkspaceClick(e) {
        if (!this.isDrawing) return;
        e.preventDefault();
        e.stopPropagation();
        const workspace = document.querySelector('.LOGIC_AREA_WORKSPACE');
        const rect = workspace.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.clickCount === 0) {
            this.clickCount = 1;
            this.points.push({ x, y });
            this.startPoint = this.createPoint(x, y, 'start');
            workspace.appendChild(this.startPoint);

            this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svg.style.position = 'absolute';
            this.svg.style.width = '100%';
            this.svg.style.height = '100%';
            this.svg.style.top = '0';
            this.svg.style.left = '0';
            this.svg.style.pointerEvents = 'none';
            workspace.appendChild(this.svg);

            workspace.addEventListener('click', this.handleWorkspaceClick.bind(this), { once: true });
        } else if (this.clickCount === 1) {
            this.clickCount = 2;
            this.points.push({ x, y });
            this.endPoint = this.createPoint(x, y, 'end');
            workspace.appendChild(this.endPoint);

            this.drawRectangle();
            this.makePointsDraggable();
            this.addDeleteButton();
        }
    }

    createPoint(x, y, type) {
        const point = document.createElement('div');
        point.style.position = 'absolute';
        point.style.width = '10px';
        point.style.height = '10px';
        point.style.background = 'radial-gradient(circle, #471effff, #a487faff)';
        point.style.border = '2px solid #ffffff';
        point.style.borderRadius = '50%';
        point.style.boxShadow = '0 0 10px rgba(30, 144, 255, 0.7)';
        point.style.left = (x - 5) + 'px';
        point.style.top = (y - 5) + 'px';
        point.style.zIndex = '1000';
        point.dataset.type = type;
        this.activePoints.set(type, point);
        return point;
    }

    drawRectangle() {
        const [start, end] = this.points;
        const minX = Math.min(start.x, end.x);
        const maxX = Math.max(start.x, end.x);
        const minY = Math.min(start.y, end.y);
        const maxY = Math.max(start.y, end.y);

        this.rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.rect.setAttribute('x', minX);
        this.rect.setAttribute('y', minY);
        this.rect.setAttribute('width', maxX - minX);
        this.rect.setAttribute('height', maxY - minY);
        this.rect.setAttribute('fill', 'rgba(30, 144, 255, 0.2)');
        this.rect.setAttribute('stroke', '#1e90ff');
        this.rect.setAttribute('stroke-width', '2');
        this.rect.setAttribute('stroke-dasharray', '5,5');
        this.svg.appendChild(this.rect);
    }

    makePointsDraggable() {
        ['start', 'end'].forEach(type => {
            const point = this.activePoints.get(type);
            let isDragging = false;
            let offsetX = 0;
            let offsetY = 0;

            point.addEventListener('mousedown', (e) => {
                if (e.target.style.background.includes('ff4d4d')) return;
                isDragging = true;
                offsetX = e.clientX - point.getBoundingClientRect().left;
                offsetY = e.clientY - point.getBoundingClientRect().top;
                point.style.zIndex = '1001';
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const workspace = document.querySelector('.LOGIC_AREA_WORKSPACE');
                const rect = workspace.getBoundingClientRect();
                let newX = e.clientX - offsetX - rect.left;
                let newY = e.clientY - offsetY - rect.top;

                newX = Math.max(0, Math.min(newX + 5, workspace.offsetWidth - 10));
                newY = Math.max(0, Math.min(newY + 5, workspace.offsetHeight - 10));

                point.style.left = (newX - 5) + 'px';
                point.style.top = (newY - 5) + 'px';
                this.updateRectangle();
            });

            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    point.style.zIndex = '1000';
                    this.updateRectangle();
                }
            });
        });
    }

    addDeleteButton() {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '-20px';
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        container.style.zIndex = '1002';

        const deleteBtn = document.createElement('div');
        deleteBtn.style.width = '15px';
        deleteBtn.style.height = '15px';
        deleteBtn.style.background = 'linear-gradient(135deg, #ff4d4d, #cc0000)';
        deleteBtn.style.borderRadius = '50%';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.display = 'flex';
        deleteBtn.style.alignItems = 'center';
        deleteBtn.style.justifyContent = 'center';
        deleteBtn.innerHTML = '<span style="color: white; font-size: 10px;">X</span>';
        deleteBtn.addEventListener('click', () => {
            this.activePoints.forEach(point => point.remove());
            this.activePoints.clear();
            this.cleanup();
        });

        container.appendChild(deleteBtn);
        this.startPoint.appendChild(container);
    }

    updateRectangle() {
        const start = this.activePoints.get('start').getBoundingClientRect();
        const end = this.activePoints.get('end').getBoundingClientRect();
        const workspace = document.querySelector('.LOGIC_AREA_WORKSPACE');
        const rect = workspace.getBoundingClientRect();
        const startX = start.left - rect.left;
        const startY = start.top - rect.top;
        const endX = end.left - rect.left + 10;
        const endY = end.top - rect.top + 10;

        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX);
        const minY = Math.min(startY, endY);
        const maxY = Math.max(startY, endY);

        this.rect.setAttribute('x', minX);
        this.rect.setAttribute('y', minY);
        this.rect.setAttribute('width', maxX - minX);
        this.rect.setAttribute('height', maxY - minY);
    }

    createNestedBlock() {
        const workspace = document.querySelector('.LOGIC_AREA_WORKSPACE');
        const [start, end] = this.points;
        const minX = Math.min(start.x, end.x);
        const maxX = Math.max(start.x, end.x);
        const minY = Math.min(start.y, end.y);
        const maxY = Math.max(start.y, end.y);

        const nestedBlock = document.createElement('div');
        nestedBlock.id = 'nested_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        nestedBlock.classList.add('logic-block', 'NESTED');
        nestedBlock.style.position = 'absolute';
        nestedBlock.style.left = minX + 'px';
        nestedBlock.style.top = minY + 'px';
        nestedBlock.style.width = (maxX - minX) + 'px';
        nestedBlock.style.height = (maxY - minY) + 'px';
        nestedBlock.style.background = 'rgba(30, 144, 255, 0.2)';
        nestedBlock.style.border = '2px dashed #1e90ff';
        nestedBlock.style.borderRadius = '10px';
        nestedBlock.style.zIndex = '1';
        nestedBlock.style.cursor = 'move';

        const sequenceNumber = SequenceNumber.assignSequenceNumber(nestedBlock);
        const numberCircle = SequenceNumber.addSequenceNumberCircle(nestedBlock, sequenceNumber, this);
        numberCircle.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            SequenceNumber.showNumberChangeDialog(nestedBlock, sequenceNumber, this);
        });

        const closeBtn = document.createElement('div');
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
            this.removeNestedBlock(nestedBlock);
        });
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.transform = 'scale(1.1)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.transform = 'scale(1)';
        });
        nestedBlock.appendChild(closeBtn);

        ['top', 'bottom', 'right'].forEach(pos => {
            const point = document.createElement('div');
            point.style.position = 'absolute';
            point.style.width = '12px';
            point.style.height = '12px';
            point.style.background = 'linear-gradient(135deg, #ffffff, #d8e3ffff)';
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
            point.addEventListener('mousedown', (e) => this.startConnection(e, point, nestedBlock));
            nestedBlock.appendChild(point);
        });

        workspace.appendChild(nestedBlock);
        this.makeElementDraggable(nestedBlock);

        this.groupElements(nestedBlock);
    }

    groupElements(nestedBlock) {
        const workspace = document.querySelector('.LOGIC_AREA_WORKSPACE');
        const logicBlocks = workspace.querySelectorAll('.logic-block:not(.NESTED)');
        const nestedRect = nestedBlock.getBoundingClientRect();

        logicBlocks.forEach(block => {
            const blockRect = block.getBoundingClientRect();
            if (blockRect.left >= nestedRect.left &&
                blockRect.right <= nestedRect.right &&
                blockRect.top >= nestedRect.top &&
                blockRect.bottom <= nestedRect.bottom) {
                block.dataset.grouped = nestedBlock.id;
            }
        });
    }

    removeNestedBlock(nestedBlock) {
        const workspace = document.querySelector('.LOGIC_AREA_WORKSPACE');
        const logicBlocks = workspace.querySelectorAll('.logic-block:not(.NESTED)');
        logicBlocks.forEach(block => {
            if (block.dataset.grouped === nestedBlock.id) {
                delete block.dataset.grouped;
            }
        });
        SequenceNumber.elementSequences.delete(nestedBlock.id);
        this.removeConnections(nestedBlock);
        nestedBlock.remove();
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

            this.updateGroupedElements(element);
            this.updateConnections(element);
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.zIndex = '1';
            }
        });
    }

    updateGroupedElements(nestedBlock) {
        const workspace = document.querySelector('.LOGIC_AREA_WORKSPACE');
        const logicBlocks = workspace.querySelectorAll('.logic-block:not(.NESTED)');
        const nestedRect = nestedBlock.getBoundingClientRect();

        logicBlocks.forEach(block => {
            const blockRect = block.getBoundingClientRect();
            if (blockRect.left >= nestedRect.left &&
                blockRect.right <= nestedRect.right &&
                blockRect.top >= nestedRect.top &&
                blockRect.bottom <= nestedRect.bottom) {
                block.dataset.grouped = nestedBlock.id;
            } else if (block.dataset.grouped === nestedBlock.id) {
                delete block.dataset.grouped;
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
            point.style.background = 'linear-gradient(135deg, #ffffff, #ccccccff)';
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
            parentElement.id = 'nested_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        const updatePath = (e) => {
            const endX = e.clientX - rect.left;
            const endY = e.clientY - rect.top;
            const cpX1 = startX + (endX - startX) * 0.3;
            const cpY1 = startY;
            const cpX2 = startX + (endX - startX) * 0.7;
            const cpY2 = endY;
            path.setAttribute('d', `M${startX},${startY} C${cpX1},${cpY1} ${cpX2},${cpY2} ${endX},${endY}`);
        };

        updatePath(e);
        document.addEventListener('mousemove', updatePath);

        const stopConnection = (e) => {
            document.removeEventListener('mousemove', updatePath);
            document.removeEventListener('mouseup', stopConnection);
            const target = e.target.closest('.connection-point');
            if (target && target !== startPoint) {
                const targetElement = target.closest('.logic-block');
                if (!targetElement.id) {
                    targetElement.id = 'nested_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
        };

        document.addEventListener('mouseup', stopConnection);
    }

    cleanup() {
        this.isDrawing = false;
        this.clickCount = 0;
        this.points = [];
        if (this.svg) this.svg.remove();
        if (this.startPoint) this.startPoint.remove();
        if (this.endPoint) this.endPoint.remove();
        if (this.rect) this.rect.remove();
        this.activePoints.clear();

        const nestedElements = document.querySelectorAll('.nested');
        nestedElements.forEach(element => {
            element.style.pointerEvents = 'auto';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const nestedElements = document.querySelectorAll('.nested');
    nestedElements.forEach(element => {
        new NestedSequence(element);
    });
});