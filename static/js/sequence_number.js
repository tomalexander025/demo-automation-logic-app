class SequenceNumber {
    static sequenceCounter = 0;
    static elementSequences = new Map();

    static assignSequenceNumber(element) {
        const elementType = element.classList.contains('roi-block') ? 'roi_element_' : 'logic_element_';
        const elementId = element.id || `${elementType}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        if (!this.elementSequences.has(elementId)) {
            this.sequenceCounter++;
            element.id = elementId;
            this.elementSequences.set(elementId, this.sequenceCounter);
            console.debug(`Assigned sequence number ${this.sequenceCounter} to element ID: ${elementId}, Type: ${elementType.replace('_element_', '')}`);
        } else {
            console.debug(`Element ID: ${elementId} already has sequence number ${this.elementSequences.get(elementId)}`);
        }

        const currentSequence = this.elementSequences.get(elementId);
        const duplicates = Array.from(this.elementSequences.values()).filter(num => num === currentSequence).length;
        if (duplicates > 1) {
            console.warn(`Duplicate sequence number ${currentSequence} detected for ${elementId}. Reassigning...`);
            this.sequenceCounter++;
            this.elementSequences.set(elementId, this.sequenceCounter);
            console.debug(`Reassigned sequence number ${this.sequenceCounter} to element ID: ${elementId}`);
        }

        return this.elementSequences.get(elementId);
    }

    static addSequenceNumberCircle(element, sequenceNumber) {
        const numberCircle = document.createElement('div');
        numberCircle.classList.add('sequence-number');
        numberCircle.style.position = 'absolute';
        numberCircle.style.left = '-20px';
        numberCircle.style.top = '50%';
        numberCircle.style.transform = 'translateY(-50%)';
        numberCircle.style.width = '30px';
        numberCircle.style.height = '30px';
        numberCircle.style.borderRadius = '50%';
        numberCircle.style.background = 'linear-gradient(135deg, #e0e0e0, #ffffff)';
        numberCircle.style.display = 'flex';
        numberCircle.style.alignItems = 'center';
        numberCircle.style.justifyContent = 'center';
        numberCircle.style.fontSize = '14px';
        numberCircle.style.fontWeight = 'bold';
        numberCircle.style.color = '#333333';
        numberCircle.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        numberCircle.style.cursor = 'pointer';
        numberCircle.textContent = sequenceNumber;

        numberCircle.addEventListener('dblclick', (e) => {
            e.preventDefault();
            this.showNumberChangeDialog(element, sequenceNumber);
        });

        const existingCircle = element.querySelector('.sequence-number');
        if (existingCircle) existingCircle.remove();
        element.appendChild(numberCircle);
        console.debug(`Added sequence number circle ${sequenceNumber} to element ID: ${element.id}`);
    }

    static showNumberChangeDialog(element, currentNumber) {
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

        const dialog = document.createElement('div');
        dialog.style.background = '#e0e5ec';
        dialog.style.padding = '25px';
        dialog.style.borderRadius = '15px';
        dialog.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
        dialog.style.textAlign = 'center';
        dialog.style.color = '#333333';
        dialog.style.minWidth = '300px';
        dialog.style.fontFamily = 'Arial, sans-serif';

        const title = document.createElement('h3');
        const elementText = element.textContent.replace(/\s*X\s*$/, '').replace(/^\d+\s*/, '').replace(/^ROI\s*\d+\s*/, '').trim() || 'Unnamed';
        title.textContent = `Change Sequence Number for ${elementText} (Current: ${currentNumber})`;
        title.style.margin = '0 0 20px 0';
        title.style.fontSize = '18px';
        title.style.color = '#2a4066';

        const workspace = document.querySelector('.LOGIC_AREA_WORKSPACE');
        const logicBlocks = Array.from(workspace.querySelectorAll('.logic-block, .roi-block'));
        const availableNumbers = new Map();
        logicBlocks.forEach(block => {
            const num = this.elementSequences.get(block.id);
            const text = block.textContent.replace(/\s*X\s*$/, '').replace(/^\d+\s*/, '').replace(/^ROI\s*\d+\s*/, '').trim();
            if (num) availableNumbers.set(num, text || `Unnamed ${num}`);
        });

        const numbers = Array.from(availableNumbers.keys()).sort((a, b) => a - b);
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.marginBottom = '20px';

        let selectedNumber = currentNumber;
        numbers.forEach(num => {
            const numberBtn = document.createElement('button');
            numberBtn.textContent = num;
            numberBtn.style.background = num === currentNumber ? '#2a4066' : '#f5f7fa';
            numberBtn.style.color = num === currentNumber ? '#ffffff' : '#333333';
            numberBtn.style.border = 'none';
            numberBtn.style.padding = '10px 15px';
            numberBtn.style.borderRadius = '8px';
            numberBtn.style.cursor = 'pointer';
            numberBtn.style.fontSize = '16px';
            numberBtn.style.transition = 'all 0.3s ease';
            numberBtn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';

            numberBtn.addEventListener('click', () => {
                selectedNumber = num;
                const buttons = buttonContainer.querySelectorAll('button');
                buttons.forEach(btn => {
                    btn.style.background = btn.textContent == selectedNumber ? '#2a4066' : '#f5f7fa';
                    btn.style.color = btn.textContent == selectedNumber ? '#ffffff' : '#333333';
                });
            });

            buttonContainer.appendChild(numberBtn);
        });

        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = 'Confirm';
        confirmBtn.style.background = '#2a4066';
        confirmBtn.style.color = '#ffffff';
        confirmBtn.style.border = 'none';
        confirmBtn.style.padding = '10px 25px';
        confirmBtn.style.borderRadius = '10px';
        confirmBtn.style.cursor = 'pointer';
        confirmBtn.style.fontSize = '14px';
        confirmBtn.style.marginRight = '10px';
        confirmBtn.addEventListener('click', () => {
            if (selectedNumber !== currentNumber) {
                const existingElement = this.findElementBySequenceNumber(selectedNumber);
                if (existingElement) {
                    this.swapSequenceNumbers(element, currentNumber, existingElement, selectedNumber);
                } else {
                    this.updateSequenceNumber(element, currentNumber, selectedNumber);
                }
                const numberCircle = element.querySelector('.sequence-number');
                if (numberCircle) numberCircle.textContent = selectedNumber;
            }
            document.body.removeChild(overlay);
        });

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.background = '#f5f7fa';
        cancelBtn.style.color = '#333333';
        cancelBtn.style.border = 'none';
        cancelBtn.style.padding = '10px 25px';
        cancelBtn.style.borderRadius = '10px';
        cancelBtn.style.cursor = 'pointer';
        cancelBtn.style.fontSize = '14px';
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        const buttonRow = document.createElement('div');
        buttonRow.style.display = 'flex';
        buttonRow.style.justifyContent = 'center';
        buttonRow.style.gap = '10px';
        buttonRow.appendChild(confirmBtn);
        buttonRow.appendChild(cancelBtn);

        dialog.appendChild(title);
        dialog.appendChild(buttonContainer);
        dialog.appendChild(buttonRow);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
    }

    static findElementBySequenceNumber(sequenceNumber) {
        for (const [elementId, number] of this.elementSequences.entries()) {
            if (number === sequenceNumber) {
                const element = document.getElementById(elementId);
                if (element) return element;
                console.debug(`Element ID ${elementId} with sequence ${sequenceNumber} not found in DOM`);
            }
        }
        return null;
    }

    static swapSequenceNumbers(element1, number1, element2, number2) {
        this.elementSequences.set(element1.id, number2);
        this.elementSequences.set(element2.id, number1);

        const numberCircle1 = element1.querySelector('.sequence-number');
        const numberCircle2 = element2.querySelector('.sequence-number');

        if (numberCircle1) numberCircle1.textContent = number2;
        if (numberCircle2) numberCircle2.textContent = number1;
        console.debug(`Swapped sequence numbers: ${element1.id} to ${number2}, ${element2.id} to ${number1}`);
    }

    static updateSequenceNumber(element, oldNumber, newNumber) {
        this.elementSequences.set(element.id, newNumber);
        const numberCircle = element.querySelector('.sequence-number');
        if (numberCircle) {
            numberCircle.textContent = newNumber;
        }
        console.debug(`Updated sequence number for ${element.id} from ${oldNumber} to ${newNumber}`);
    }

    static resetSequence() {
        this.sequenceCounter = 0;
        this.elementSequences.clear();
        console.debug('Sequence reset: counter set to 0, elementSequences cleared');
    }

    static getAllSequences() {
        const workspace = document.querySelector('.LOGIC_AREA_WORKSPACE');
        if (!workspace) {
            console.debug('No LOGIC_AREA_WORKSPACE found');
            return '=== INFERENCE SEQUENCE ===\nNo workspace found\n=== END SEQUENCE ===';
        }

        const elements = Array.from(workspace.querySelectorAll('.logic-block, .roi-block'));
        console.debug(`Found ${elements.length} elements (.logic-block, .roi-block) in workspace`);

        console.debug('Current elementSequences:', [...this.elementSequences]);

        const elementsWithSequenceNumber = [];
        elements.forEach(element => {
            const sequenceNumber = this.elementSequences.get(element.id);
            console.debug(`Element ID: ${element.id}, Sequence Number: ${sequenceNumber}, Classes: ${element.classList}, Text: ${element.textContent}`);
            if (sequenceNumber !== undefined && document.getElementById(element.id)) {
                let elementText = element.textContent
                    .replace(/\s*X\s*$/, '')
                    .replace(/^\d+\s*/, '')
                    .replace(/^ROI\s*\d+\s*/, '')
                    .trim();
                
                const classes = ['AND', 'OR', 'NOT', 'INSIDE_ROI', 'OUTSIDE_ROI', 'TOUCHING_ROI', 'IF', 'ELSE', 'OK', 'NOK', 'ROI', 'WAS'];
                const blockClass = classes.find(cls => element.classList.contains(cls));
                
                if (element.classList.contains('roi-block')) {
                    elementText = `ROI ${sequenceNumber}`;
                } else if (blockClass) {
                    elementText = blockClass;
                } else {
                    elementText = elementText || `Unnamed ${sequenceNumber}`;
                }

                elementsWithSequenceNumber.push({
                    number: sequenceNumber,
                    text: elementText,
                    element: element,
                    isROI: element.classList.contains('roi-block')
                });
                console.debug(`Added to sequence: Number: ${sequenceNumber}, Text: ${elementText}, IsROI: ${element.classList.contains('roi-block')}`);
            } else {
                console.debug(`Element ID: ${element.id} has no sequence number or is not in DOM`);
            }
        });

        for (const [elementId, sequenceNumber] of this.elementSequences.entries()) {
            if (!document.getElementById(elementId)) {
                console.debug(`Element ID ${elementId} with sequence ${sequenceNumber} is in elementSequences but not in DOM`);
                this.elementSequences.delete(elementId);
            }
        }

        elementsWithSequenceNumber.sort((a, b) => a.number - b.number);

        let output = '=== INFERENCE SEQUENCE ===\n';
        if (elementsWithSequenceNumber.length === 0) {
            console.debug('No elements with sequence numbers found');
            output += 'No elements in sequence\n';
        } else {
            elementsWithSequenceNumber.forEach((item, index) => {
                output += `DEBUG:__main__:${item.number}. ${item.text}\n`;
                if (index < elementsWithSequenceNumber.length - 1) {
                    output += '  ↓\n';
                }
            });
        }
        output += '=== END SEQUENCE ===';
        console.debug(`Final sequence output:\n${output}`);
        return output;
    }
}