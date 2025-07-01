// assets/js/custom-builder.js
document.addEventListener('DOMContentLoaded', function() {
    // Store protocol structure
    let protocolData = {
        name: '',
        idPrefix: '',
        category: '',
        description: '',
        sections: []
    };
    
    // Initialize with Basic Information section
    protocolData.sections.push({
        id: 'basic-info',
        title: 'Basic Information',
        description: '',
        collapsible: false,
        fields: [
            {
                id: 'experiment-title',
                type: 'text',
                label: 'Experiment Title',
                description: '',
                required: true,
                properties: {
                    placeholder: '',
                    defaultValue: ''
                }
            },
            {
                id: 'researcher',
                type: 'text',
                label: 'Researcher',
                description: '',
                required: true,
                properties: {
                    placeholder: '',
                    defaultValue: ''
                }
            },
            {
                id: 'experiment-date',
                type: 'date',
                label: 'Experiment Date',
                description: '',
                required: true,
                properties: {}
            },
            {
                id: 'objective',
                type: 'textarea',
                label: 'Experiment Objective',
                description: '',
                required: false,
                properties: {
                    rows: 3,
                    placeholder: ''
                }
            }
        ]
    });
    
    // Keep track of selected elements
    let selectedElement = null;
    let selectedElementType = null;
    
    // Initialize sortable for the protocol design area
    const protocolDesignArea = document.getElementById('protocolDesignArea');
    Sortable.create(protocolDesignArea, {
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'bg-light'
    });
    
    // Initialize sortable for each field container
    function initializeFieldSortable(container) {
        Sortable.create(container, {
            animation: 150,
            handle: '.drag-handle',
            ghostClass: 'bg-light',
            group: 'fields'
        });
    }
    
    // Initialize field sortables for existing containers
    document.querySelectorAll('.field-container').forEach(container => {
        initializeFieldSortable(container);
    });
    
    // Add new section button
    document.getElementById('addSectionBtn').addEventListener('click', function() {
        const sectionId = 'section-' + Date.now();
        
        const sectionHtml = `
            <div class="section-card card mb-3" data-section-id="${sectionId}">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">
                        <i class="bi bi-grip-vertical me-2 drag-handle"></i>
                        New Section
                    </h5>
                    <div>
                        <button class="btn btn-sm btn-outline-secondary section-edit-btn">
                            <i class="bi bi-pencil"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="field-container"></div>
                </div>
            </div>
        `;
        
        protocolDesignArea.insertAdjacentHTML('beforeend', sectionHtml);
        
        // Initialize sortable for the new field container
        const newContainer = protocolDesignArea.lastElementChild.querySelector('.field-container');
        initializeFieldSortable(newContainer);
        
        // Add to protocol data
        protocolData.sections.push({
            id: sectionId,
            title: 'New Section',
            description: '',
            collapsible: false,
            fields: []
        });
        
        // Setup edit button
        setupSectionEditButton(protocolDesignArea.lastElementChild.querySelector('.section-edit-btn'));
    });
    
    // Clear all button
    document.getElementById('clearAllBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all sections and fields? This cannot be undone.')) {
            // Keep just the Basic Information section
            const basicInfoSection = protocolDesignArea.querySelector('[data-section-id="basic-info"]');
            protocolDesignArea.innerHTML = '';
            protocolDesignArea.appendChild(basicInfoSection);
            
            // Reset protocol data
            protocolData.sections = protocolData.sections.filter(section => section.id === 'basic-info');
        }
    });
    
    // Save template button
    document.getElementById('saveTemplateBtn').addEventListener('click', function() {
        // Get protocol information
        protocolData.name = document.getElementById('protocolName').value || 'Untitled Protocol';
        protocolData.idPrefix = document.getElementById('protocolId').value || 'CUST';
        protocolData.category = document.getElementById('protocolCategory').value;
        protocolData.description = document.getElementById('protocolDescription').value;
        
        // Update sections data from DOM
        updateProtocolDataFromDOM();
        
        // Save to localStorage
        const templates = JSON.parse(localStorage.getItem('customProtocolTemplates') || '[]');
        templates.push({
            id: 'template-' + Date.now(),
            ...protocolData
        });
        localStorage.setItem('customProtocolTemplates', JSON.stringify(templates));
        
        alert(`Protocol template "${protocolData.name}" saved successfully!`);
    });
    
    // Load template button
    document.getElementById('loadTemplateBtn').addEventListener('click', function() {
        const templates = JSON.parse(localStorage.getItem('customProtocolTemplates') || '[]');
        
        if (templates.length === 0) {
            alert('No saved templates found.');
            return;
        }
        
        // Create options for template selection
        let optionsHtml = '';
        templates.forEach(template => {
            optionsHtml += `<option value="${template.id}">${template.name}</option>`;
        });
        
        // Create a modal for template selection
        const modalHtml = `
            <div class="modal fade" id="loadTemplateModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Load Template</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="templateSelect" class="form-label">Select a Template</label>
                                <select class="form-select" id="templateSelect">
                                    ${optionsHtml}
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="confirmLoadTemplateBtn">Load</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const loadTemplateModal = new bootstrap.Modal(document.getElementById('loadTemplateModal'));
        loadTemplateModal.show();
        
        document.getElementById('confirmLoadTemplateBtn').addEventListener('click', function() {
            const selectedId = document.getElementById('templateSelect').value;
            const selectedTemplate = templates.find(t => t.id === selectedId);
            
            if (selectedTemplate) {
                // Confirm if there is existing content
                if (protocolData.sections.length > 1 || protocolData.sections[0].fields.length > 0) {
                    if (!confirm('Loading this template will replace your current design. Continue?')) {
                        loadTemplateModal.hide();
                        document.getElementById('loadTemplateModal').remove();
                        return;
                    }
                }
                
                // Load template data
                protocolData = { ...selectedTemplate };
                
                // Update UI with template data
                document.getElementById('protocolName').value = protocolData.name;
                document.getElementById('protocolId').value = protocolData.idPrefix;
                document.getElementById('protocolCategory').value = protocolData.category;
                document.getElementById('protocolDescription').value = protocolData.description;
                
                // Render template sections
                renderProtocolFromData();
                
                loadTemplateModal.hide();
                document.getElementById('loadTemplateModal').remove();
                
                alert(`Template "${protocolData.name}" loaded successfully!`);
            }
        });
    });
    
    // Preview button
    document.getElementById('previewBtn').addEventListener('click', function() {
        // Update protocol data from DOM
        updateProtocolDataFromDOM();
        
        // Create preview in a new window
        const previewWindow = window.open('', '_blank');
        
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${protocolData.name} - Protocol Preview</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body { padding: 20px; }
                    .section { margin-bottom: 30px; }
                    .required-indicator { color: red; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h1>${protocolData.name}</h1>
                        <button class="btn btn-primary" onclick="window.print()">Print</button>
                    </div>
                    
                    <p class="lead">${protocolData.description}</p>
                    
                    <form id="protocolForm">
        `);
        
        // Add each section
        protocolData.sections.forEach(section => {
            previewWindow.document.write(`
                <div class="section card mb-4">
                    <div class="card-header">
                        <h3>${section.title}</h3>
                        ${section.description ? `<p class="text-muted">${section.description}</p>` : ''}
                    </div>
                    <div class="card-body">
            `);
            
            // Add each field
            section.fields.forEach(field => {
                // assets/js/custom-builder.js (continued)
                const requiredMark = field.required ? '<span class="required-indicator">*</span>' : '';
                
                // Generate field HTML based on type
                switch (field.type) {
                    case 'text':
                        previewWindow.document.write(`
                            <div class="mb-3">
                                <label for="${field.id}" class="form-label">${field.label} ${requiredMark}</label>
                                <input type="text" class="form-control" id="${field.id}" 
                                    placeholder="${field.properties.placeholder || ''}" 
                                    value="${field.properties.defaultValue || ''}"
                                    ${field.required ? 'required' : ''}>
                                ${field.description ? `<div class="form-text">${field.description}</div>` : ''}
                            </div>
                        `);
                        break;
                    
                    case 'textarea':
                        previewWindow.document.write(`
                            <div class="mb-3">
                                <label for="${field.id}" class="form-label">${field.label} ${requiredMark}</label>
                                <textarea class="form-control" id="${field.id}" rows="${field.properties.rows || 3}" 
                                    placeholder="${field.properties.placeholder || ''}"
                                    ${field.required ? 'required' : ''}></textarea>
                                ${field.description ? `<div class="form-text">${field.description}</div>` : ''}
                            </div>
                        `);
                        break;
                    
                    case 'number':
                        previewWindow.document.write(`
                            <div class="mb-3">
                                <label for="${field.id}" class="form-label">${field.label} ${requiredMark}</label>
                                <div class="input-group">
                                    <input type="number" class="form-control" id="${field.id}" 
                                        ${field.properties.min ? `min="${field.properties.min}"` : ''} 
                                        ${field.properties.max ? `max="${field.properties.max}"` : ''} 
                                        ${field.properties.step ? `step="${field.properties.step}"` : ''} 
                                        ${field.required ? 'required' : ''}>
                                    ${field.properties.unit ? `<span class="input-group-text">${field.properties.unit}</span>` : ''}
                                </div>
                                ${field.description ? `<div class="form-text">${field.description}</div>` : ''}
                            </div>
                        `);
                        break;
                    
                    case 'date':
                        previewWindow.document.write(`
                            <div class="mb-3">
                                <label for="${field.id}" class="form-label">${field.label} ${requiredMark}</label>
                                <input type="date" class="form-control" id="${field.id}" 
                                    ${field.required ? 'required' : ''}>
                                ${field.description ? `<div class="form-text">${field.description}</div>` : ''}
                            </div>
                        `);
                        break;
                    
                    case 'select':
                        let options = '';
                        if (field.properties.options) {
                            field.properties.options.forEach(option => {
                                options += `<option value="${option}">${option}</option>`;
                            });
                        }
                        
                        previewWindow.document.write(`
                            <div class="mb-3">
                                <label for="${field.id}" class="form-label">${field.label} ${requiredMark}</label>
                                <select class="form-select" id="${field.id}" ${field.required ? 'required' : ''}>
                                    <option value="">Select an option</option>
                                    ${options}
                                </select>
                                ${field.description ? `<div class="form-text">${field.description}</div>` : ''}
                            </div>
                        `);
                        break;
                    
                    case 'checkbox':
                        previewWindow.document.write(`
                            <div class="mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="${field.id}" 
                                        ${field.required ? 'required' : ''}>
                                    <label class="form-check-label" for="${field.id}">
                                        ${field.label} ${requiredMark}
                                    </label>
                                </div>
                                ${field.description ? `<div class="form-text">${field.description}</div>` : ''}
                            </div>
                        `);
                        break;
                    
                    case 'radio':
                        let radioOptions = '';
                        if (field.properties.options) {
                            field.properties.options.forEach((option, index) => {
                                radioOptions += `
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="${field.id}" 
                                            id="${field.id}_${index}" value="${option}" 
                                            ${field.required ? 'required' : ''}>
                                        <label class="form-check-label" for="${field.id}_${index}">
                                            ${option}
                                        </label>
                                    </div>
                                `;
                            });
                        }
                        
                        previewWindow.document.write(`
                            <div class="mb-3">
                                <label class="form-label">${field.label} ${requiredMark}</label>
                                ${radioOptions}
                                ${field.description ? `<div class="form-text">${field.description}</div>` : ''}
                            </div>
                        `);
                        break;
                    
                    case 'file':
                        previewWindow.document.write(`
                            <div class="mb-3">
                                <label for="${field.id}" class="form-label">${field.label} ${requiredMark}</label>
                                <input class="form-control" type="file" id="${field.id}" 
                                    ${field.properties.accept ? `accept="${field.properties.accept}"` : ''} 
                                    ${field.properties.multiple ? 'multiple' : ''} 
                                    ${field.required ? 'required' : ''}>
                                ${field.description ? `<div class="form-text">${field.description}</div>` : ''}
                            </div>
                        `);
                        break;
                    
                    case 'table':
                        let tableHeaders = '';
                        if (field.properties.columns) {
                            field.properties.columns.forEach(column => {
                                tableHeaders += `<th scope="col">${column}</th>`;
                            });
                        }
                        
                        let tableRows = '';
                        const rowCount = field.properties.rows || 3;
                        const colCount = field.properties.columns ? field.properties.columns.length : 3;
                        
                        for (let i = 0; i < rowCount; i++) {
                            let cells = '';
                            for (let j = 0; j < colCount; j++) {
                                cells += `<td><input type="text" class="form-control form-control-sm"></td>`;
                            }
                            tableRows += `<tr>${cells}</tr>`;
                        }
                        
                        previewWindow.document.write(`
                            <div class="mb-3">
                                <label class="form-label">${field.label} ${requiredMark}</label>
                                <div class="table-responsive">
                                    <table class="table table-bordered" id="${field.id}">
                                        <thead>
                                            <tr>${tableHeaders}</tr>
                                        </thead>
                                        <tbody>
                                            ${tableRows}
                                        </tbody>
                                    </table>
                                </div>
                                ${field.properties.addRows ? 
                                    `<button type="button" class="btn btn-sm btn-outline-secondary">Add Row</button>` : ''}
                                ${field.description ? `<div class="form-text">${field.description}</div>` : ''}
                            </div>
                        `);
                        break;
                }
            });
            
            previewWindow.document.write(`
                    </div>
                </div>
            `);
        });
        
        previewWindow.document.write(`
                        <div class="d-flex justify-content-between mb-5">
                            <button type="button" class="btn btn-secondary">Save as Draft</button>
                            <button type="submit" class="btn btn-primary">Complete Experiment</button>
                        </div>
                    </form>
                </div>
                
                <script>
                    // Prevent form submission in the preview
                    document.getElementById('protocolForm').addEventListener('submit', function(e) {
                        e.preventDefault();
                        alert('This is just a preview. Form submission would be handled in the actual application.');
                    });
                </script>
            </body>
            </html>
        `);
        
        previewWindow.document.close();
    });
    
    // Setup field drag-and-drop from component panel
    const fieldComponents = document.querySelectorAll('.field-card');
    fieldComponents.forEach(component => {
        component.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('field-type', this.dataset.fieldType);
        });
    });
    
    // Handle dropping fields into sections
    document.addEventListener('dragover', function(e) {
        // Find the closest field container
        const container = e.target.closest('.field-container');
        if (container) {
            e.preventDefault(); // Allow drop
        }
    });
    
    document.addEventListener('drop', function(e) {
        const container = e.target.closest('.field-container');
        if (container) {
            e.preventDefault();
            
            const fieldType = e.dataTransfer.getData('field-type');
            if (fieldType) {
                // Add new field to the container
                addFieldToContainer(container, fieldType);
            }
        }
    });
    
    // Function to add a field to a container
    function addFieldToContainer(container, fieldType) {
        const sectionCard = container.closest('.section-card');
        const sectionId = sectionCard.dataset.sectionId;
        const fieldId = `field-${Date.now()}`;
        
        // Get field type label
        let fieldTypeLabel = '';
        switch (fieldType) {
            case 'text': fieldTypeLabel = 'Text Field'; break;
            case 'textarea': fieldTypeLabel = 'Text Area'; break;
            case 'number': fieldTypeLabel = 'Number Field'; break;
            case 'date': fieldTypeLabel = 'Date Field'; break;
            case 'select': fieldTypeLabel = 'Dropdown'; break;
            case 'checkbox': fieldTypeLabel = 'Checkbox'; break;
            case 'radio': fieldTypeLabel = 'Radio Buttons'; break;
            case 'file': fieldTypeLabel = 'File Upload'; break;
            case 'table': fieldTypeLabel = 'Data Table'; break;
            default: fieldTypeLabel = 'Unknown Field';
        }
        
        // Create field HTML
        const fieldHtml = `
            <div class="field-item card mb-2" data-field-id="${fieldId}" data-field-type="${fieldType}">
                <div class="card-body p-2">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <i class="bi bi-grip-vertical me-2 drag-handle"></i>
                            <strong>New ${fieldTypeLabel}</strong> (${fieldTypeLabel})
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline-secondary field-edit-btn me-1">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger field-delete-btn">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', fieldHtml);
        
        // Add to protocol data
        const sectionIndex = protocolData.sections.findIndex(section => section.id === sectionId);
        if (sectionIndex !== -1) {
            // Default properties based on field type
            let properties = {};
            switch (fieldType) {
                case 'text':
                    properties = { placeholder: '', defaultValue: '' };
                    break;
                case 'textarea':
                    properties = { rows: 3, placeholder: '' };
                    break;
                case 'number':
                    properties = { min: '', max: '', step: '1', unit: '' };
                    break;
                case 'select':
                case 'radio':
                    properties = { options: ['Option 1', 'Option 2', 'Option 3'] };
                    break;
                case 'file':
                    properties = { accept: '', multiple: false };
                    break;
                case 'table':
                    properties = { 
                        columns: ['Column 1', 'Column 2', 'Column 3'],
                        rows: 3,
                        addRows: true
                    };
                    break;
            }
            
            protocolData.sections[sectionIndex].fields.push({
                id: fieldId,
                type: fieldType,
                label: `New ${fieldTypeLabel}`,
                description: '',
                required: false,
                properties: properties
            });
        }
        
        // Setup edit and delete buttons
        setupFieldEditButton(container.lastElementChild.querySelector('.field-edit-btn'));
        setupFieldDeleteButton(container.lastElementChild.querySelector('.field-delete-btn'));
    }
    
    // Setup section edit buttons for existing sections
    document.querySelectorAll('.section-edit-btn').forEach(button => {
        setupSectionEditButton(button);
    });
    
    // Setup field edit buttons for existing fields
    document.querySelectorAll('.field-edit-btn').forEach(button => {
        setupFieldEditButton(button);
    });
    
    // Setup field delete buttons for existing fields
    document.querySelectorAll('.field-delete-btn').forEach(button => {
        setupFieldDeleteButton(button);
    });
    
    // Function to setup section edit button
    function setupSectionEditButton(button) {
        button.addEventListener('click', function() {
            const sectionCard = this.closest('.section-card');
            const sectionId = sectionCard.dataset.sectionId;
            
            // Find section data
            const section = protocolData.sections.find(s => s.id === sectionId);
            if (!section) return;
            
            // Fill modal with section data
            document.getElementById('editSectionId').value = sectionId;
            document.getElementById('sectionTitle').value = section.title;
            document.getElementById('sectionDescription').value = section.description || '';
            document.getElementById('sectionCollapsible').checked = section.collapsible || false;
            
            // Show modal
            const sectionEditModal = new bootstrap.Modal(document.getElementById('sectionEditModal'));
            sectionEditModal.show();
        });
    }
    
    // Function to setup field edit button
    function setupFieldEditButton(button) {
        button.addEventListener('click', function() {
            const fieldItem = this.closest('.field-item');
            const fieldId = fieldItem.dataset.fieldId;
            const fieldType = fieldItem.dataset.fieldType;
            const sectionId = fieldItem.closest('.section-card').dataset.sectionId;
            
            // Find section and field data
            const sectionIndex = protocolData.sections.findIndex(s => s.id === sectionId);
            if (sectionIndex === -1) return;
            
            const fieldIndex = protocolData.sections[sectionIndex].fields.findIndex(f => f.id === fieldId);
            if (fieldIndex === -1) return;
            
            const field = protocolData.sections[sectionIndex].fields[fieldIndex];
            
            // Fill modal with field data
            document.getElementById('editFieldId').value = fieldId;
            document.getElementById('editFieldType').value = fieldType;
            document.getElementById('fieldLabel').value = field.label;
            document.getElementById('fieldDescription').value = field.description || '';
            document.getElementById('fieldRequired').checked = field.required || false;
            
            // Hide all field-specific properties
            document.querySelectorAll('.field-properties').forEach(el => {
                el.classList.add('d-none');
            });
            
            // Show specific properties based on field type
            switch (fieldType) {
                case 'text':
                    document.getElementById('textFieldProperties').classList.remove('d-none');
                    document.getElementById('textFieldPlaceholder').value = field.properties.placeholder || '';
                    document.getElementById('textFieldDefaultValue').value = field.properties.defaultValue || '';
                    break;
                    
                case 'textarea':
                    document.getElementById('textareaFieldProperties').classList.remove('d-none');
                    document.getElementById('textareaRows').value = field.properties.rows || 3;
                    document.getElementById('textareaPlaceholder').value = field.properties.placeholder || '';
                    break;
                    
                case 'number':
                    document.getElementById('numberFieldProperties').classList.remove('d-none');
                    document.getElementById('numberMin').value = field.properties.min || '';
                    document.getElementById('numberMax').value = field.properties.max || '';
                    document.getElementById('numberStep').value = field.properties.step || '1';
                    document.getElementById('numberUnit').value = field.properties.unit || '';
                    break;
                    
                case 'select':
                    document.getElementById('selectFieldProperties').classList.remove('d-none');
                    if (field.properties.options && Array.isArray(field.properties.options)) {
                        document.getElementById('selectOptions').value = field.properties.options.join('\n');
                    }
                    break;
                    
                case 'radio':
                    document.getElementById('radioFieldProperties').classList.remove('d-none');
                    if (field.properties.options && Array.isArray(field.properties.options)) {
                        document.getElementById('radioOptions').value = field.properties.options.join('\n');
                    }
                    break;
                    
                case 'table':
                    document.getElementById('tableFieldProperties').classList.remove('d-none');
                    if (field.properties.columns && Array.isArray(field.properties.columns)) {
                        document.getElementById('tableColumns').value = field.properties.columns.join('\n');
                    }
                    document.getElementById('tableRows').value = field.properties.rows || 3;
                    document.getElementById('tableAddRows').checked = field.properties.addRows !== false;
                    break;
                    
                case 'file':
                    document.getElementById('fileFieldProperties').classList.remove('d-none');
                    document.getElementById('fileAccept').value = field.properties.accept || '';
                    document.getElementById('fileMultiple').checked = field.properties.multiple || false;
                    break;
            }
            
            // Show modal
            const fieldEditModal = new bootstrap.Modal(document.getElementById('fieldEditModal'));
            fieldEditModal.show();
        });
    }
    
    // Function to setup field delete button
    function setupFieldDeleteButton(button) {
        button.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this field?')) {
                const fieldItem = this.closest('.field-item');
                const fieldId = fieldItem.dataset.fieldId;
                const sectionId = fieldItem.closest('.section-card').dataset.sectionId;
                
                // Remove from protocol data
                const sectionIndex = protocolData.sections.findIndex(s => s.id === sectionId);
                if (sectionIndex !== -1) {
                    protocolData.sections[sectionIndex].fields = protocolData.sections[sectionIndex].fields.filter(f => f.id !== fieldId);
                }
                
                // Remove from DOM
                fieldItem.remove();
            }
        });
    }
    
    // Save section button
    document.getElementById('saveSectionBtn').addEventListener('click', function() {
        const sectionId = document.getElementById('editSectionId').value;
        const sectionTitle = document.getElementById('sectionTitle').value;
        const sectionDescription = document.getElementById('sectionDescription').value;
        const sectionCollapsible = document.getElementById('sectionCollapsible').checked;
        
        // Update section data
        const sectionIndex = protocolData.sections.findIndex(s => s.id === sectionId);
        if (sectionIndex !== -1) {
            protocolData.sections[sectionIndex].title = sectionTitle;
            protocolData.sections[sectionIndex].description = sectionDescription;
            protocolData.sections[sectionIndex].collapsible = sectionCollapsible;
            
            // Update UI
            const sectionCard = document.querySelector(`.section-card[data-section-id="${sectionId}"]`);
            if (sectionCard) {
                sectionCard.querySelector('.card-header h5').innerHTML = `
                    <i class="bi bi-grip-vertical me-2 drag-handle"></i>
                    ${sectionTitle}
                `;
            }
        }
        
        // Hide modal
        const sectionEditModal = bootstrap.Modal.getInstance(document.getElementById('sectionEditModal'));
        sectionEditModal.hide();
    });
    
    // Save field button
    document.getElementById('saveFieldBtn').addEventListener('click', function() {
        const fieldId = document.getElementById('editFieldId').value;
        const fieldType = document.getElementById('editFieldType').value;
        const fieldLabel = document.getElementById('fieldLabel').value;
        const fieldDescription = document.getElementById('fieldDescription').value;
        const fieldRequired = document.getElementById('fieldRequired').checked;
        
        // Find field in protocol data
        let field = null;
        let sectionIndex = -1;
        let fieldIndex = -1;
        
        for (let i = 0; i < protocolData.sections.length; i++) {
            const idx = protocolData.sections[i].fields.findIndex(f => f.id === fieldId);
            if (idx !== -1) {
                sectionIndex = i;
                fieldIndex = idx;
                field = protocolData.sections[i].fields[idx];
                break;
            }
        }
        
        if (!field) return;
        
        // Update base field properties
        field.label = fieldLabel;
        field.description = fieldDescription;
        field.required = fieldRequired;
        
        // Update field-specific properties
        switch (fieldType) {
            case 'text':
                field.properties.placeholder = document.getElementById('textFieldPlaceholder').value;
                field.properties.defaultValue = document.getElementById('textFieldDefaultValue').value;
                break;
                
            case 'textarea':
                field.properties.rows = parseInt(document.getElementById('textareaRows').value) || 3;
                field.properties.placeholder = document.getElementById('textareaPlaceholder').value;
                break;
                
            case 'number':
                field.properties.min = document.getElementById('numberMin').value;
                field.properties.max = document.getElementById('numberMax').value;
                field.properties.step = document.getElementById('numberStep').value;
                field.properties.unit = document.getElementById('numberUnit').value;
                break;
                
            case 'select':
                field.properties.options = document.getElementById('selectOptions').value.split('\n')
                    .map(opt => opt.trim())
                    .filter(opt => opt);
                break;
                
            case 'radio':
                field.properties.options = document.getElementById('radioOptions').value.split('\n')
                    .map(opt => opt.trim())
                    .filter(opt => opt);
                break;
                
            case 'table':
                field.properties.columns = document.getElementById('tableColumns').value.split('\n')
                    .map(col => col.trim())
                    .filter(col => col);
                field.properties.rows = parseInt(document.getElementById('tableRows').value) || 3;
                field.properties.addRows = document.getElementById('tableAddRows').checked;
                break;
                
            case 'file':
                field.properties.accept = document.getElementById('fileAccept').value;
                field.properties.multiple = document.getElementById('fileMultiple').checked;
                break;
        }
        
        // Update UI
        const fieldItem = document.querySelector(`.field-item[data-field-id="${fieldId}"]`);
        if (fieldItem) {
            fieldItem.querySelector('strong').textContent = fieldLabel;
        }
        
        // Hide modal
        const fieldEditModal = bootstrap.Modal.getInstance(document.getElementById('fieldEditModal'));
        fieldEditModal.hide();
    });
    
    // Function to update protocol data from DOM
    function updateProtocolDataFromDOM() {
        // Update sections from DOM
        const sectionCards = document.querySelectorAll('.section-card');
        
        // Create a new sections array
        const updatedSections = [];
        
        sectionCards.forEach(sectionCard => {
            const sectionId = sectionCard.dataset.sectionId;
            const sectionIndex = protocolData.sections.findIndex(s => s.id === sectionId);
            
            if (sectionIndex !== -1) {
                // Get existing section data
                const section = { ...protocolData.sections[sectionIndex] };
                
                // Update fields based on current DOM order
                const fieldItems = sectionCard.querySelectorAll('.field-item');
                const updatedFields = [];
                
                fieldItems.forEach(fieldItem => {
                    const fieldId = fieldItem.dataset.fieldId;
                    const fieldIndex = section.fields.findIndex(f => f.id === fieldId);
                    
                    if (fieldIndex !== -1) {
                        updatedFields.push(section.fields[fieldIndex]);
                    }
                });
                
                section.fields = updatedFields;
                updatedSections.push(section);
            }
        });
        
        // Update protocol data
        protocolData.sections = updatedSections;
    }
    
    // Function to render protocol from data
    function renderProtocolFromData() {
        // Clear the design area
        protocolDesignArea.innerHTML = '';
        
        // Render each section
        protocolData.sections.forEach(section => {
            const sectionHtml = `
                <div class="section-card card mb-3" data-section-id="${section.id}">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="bi bi-grip-vertical me-2 drag-handle"></i>
                            ${section.title}
                        </h5>
                        <div>
                            <button class="btn btn-sm btn-outline-secondary section-edit-btn">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="field-container"></div>
                    </div>
                </div>
            `;
            
            protocolDesignArea.insertAdjacentHTML('beforeend', sectionHtml);
            
            // Render fields
            const fieldContainer = protocolDesignArea.lastElementChild.querySelector('.field-container');
            
            section.fields.forEach(field => {
                // Get field type label
                let fieldTypeLabel = '';
                switch (field.type) {
                    case 'text': fieldTypeLabel = 'Text Field'; break;
                    case 'textarea': fieldTypeLabel = 'Text Area'; break;
                    case 'number': fieldTypeLabel = 'Number Field'; break;
                    case 'date': fieldTypeLabel = 'Date Field'; break;
                    case 'select': fieldTypeLabel = 'Dropdown'; break;
                    case 'checkbox': fieldTypeLabel = 'Checkbox'; break;
                    case 'radio': fieldTypeLabel = 'Radio Buttons'; break;
                    case 'file': fieldTypeLabel = 'File Upload'; break;
                    case 'table': fieldTypeLabel = 'Data Table'; break;
                    default: fieldTypeLabel = 'Unknown Field';
                }
                
                const fieldHtml = `
                    <div class="field-item card mb-2" data-field-id="${field.id}" data-field-type="${field.type}">
                        <div class="card-body p-2">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <i class="bi bi-grip-vertical me-2 drag-handle"></i>
                                    <strong>${field.label}</strong> (${fieldTypeLabel})
                                </div>
                                <div>
                                    <button class="btn btn-sm btn-outline-secondary field-edit-btn me-1">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger field-delete-btn">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                fieldContainer.insertAdjacentHTML('beforeend', fieldHtml);
            });
            
            // Initialize sortable for the field container
            initializeFieldSortable(fieldContainer);
        });
        
        // Setup section edit buttons
        document.querySelectorAll('.section-edit-btn').forEach(button => {
            setupSectionEditButton(button);
        });
        
        // Setup field edit buttons
        document.querySelectorAll('.field-edit-btn').forEach(button => {
            setupFieldEditButton(button);
        });
        
        // Setup field delete buttons
        document.querySelectorAll('.field-delete-btn').forEach(button => {
            setupFieldDeleteButton(button);
        });
    }
});