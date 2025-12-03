import {Component, OnInit, AfterViewInit, OnDestroy, ViewChild} from '@angular/core';
import {CommonModule, KeyValuePipe} from '@angular/common';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {jqxTabsModule, jqxTabsComponent} from 'jqwidgets-ng/jqxtabs';
import {jqxGridModule, jqxGridComponent} from 'jqwidgets-ng/jqxgrid';
import {ApiService, Dataset} from '../../services/api.service';

declare var jqx: any;
declare var jqwidgets: any;

@Component({
    selector: 'app-datasets',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, jqxTabsModule, jqxGridModule],
    templateUrl: './datasets.component.html',
    styleUrls: ['./datasets.component.css']
})
export class DatasetsComponent implements OnInit, AfterViewInit {
    @ViewChild('datasetsGrid') datasetsGrid?: jqxGridComponent;
    
    datasets: Dataset[] = [];
    isLoading = false;
    errorMessage = '';
    total = 0;
    page = 1;
    perPage = 20;
    pages = 0;
    
    // CRUD Modal states
    showCreateModal = false;
    showEditModal = false;
    showDeleteModal = false;
    selectedDataset: Dataset | null = null;
    datasetForm: FormGroup;
    formError = '';
    formLoading = false;
    
    // Available options for dropdowns
    datasetTypes = ['delta', 'adls', 'parquet', 'csv', 'json'];
    layers = ['bronze', 'silver', 'gold'];
    statuses = ['active', 'inactive', 'pending'];

    gridColumns: any[] = [];

    dataFields: any[] = [
        {name: 'dataset_id', type: 'string'},
        {name: 'dataset_name', type: 'string'},
        {name: 'dataset_type', type: 'string'},
        {name: 'layer', type: 'string'},
        {name: 'dependencies', type: 'array'},
        {name: 'status', type: 'string'},
        {name: 'updated_ts', type: 'string'},
        // {name: 'created_ts', type: 'string'},
        // {name: 'actions', type: 'string'}
    ];

    datasetsSource: any = {
        localdata: [],
        datatype: 'array',
        datafields: this.dataFields
    };

    datasetsDataAdapter: any;

    constructor(
        private apiService: ApiService,
        private formBuilder: FormBuilder
    ) {
        this.datasetForm = this.formBuilder.group({
            dataset_id: ['', [Validators.required, Validators.minLength(3)]],
            dataset_name: ['', [Validators.required, Validators.minLength(3)]],
            dataset_type: ['', [Validators.required]],
            layer: ['', [Validators.required]],
            upstream_dependencies: [[]],
            status: ['active', [Validators.required]]
        });
    }

    ngOnInit() {
        // Initialize grid columns after actionsRenderer is available
        this.initializeGridColumns();
        this.loadDatasets();
    }

    initializeGridColumns(): void {
        try {
            this.gridColumns = [
                {text: 'ID', datafield: 'dataset_id', width: 300},
                {text: 'Name', datafield: 'dataset_name', width: 200},
                {text: 'Type', datafield: 'dataset_type', width: 100},
                {text: 'Layer', datafield: 'layer', width: 100},
                {text: 'Dependencies', datafield: 'dependencies', width: 300},
                {text: 'Status', datafield: 'status', width: 120},
                // {text: 'Created On', datafield: 'created_ts', width: 120, cellsformat: 'd'},
                // {text: 'Updated On', datafield: 'updated_ts', width: 120, cellsformat: 'd'},
                {text: 'Actions', datafield: 'actions', width: 100, cellsrenderer: this.actionsRenderer.bind(this), sortable: false, filterable: false}
            ];
        } catch (error) {
            console.error('Error initializing grid columns:', error);
            // Fallback to columns without actions if there's an error
            this.gridColumns = [
                {text: 'ID', datafield: 'dataset_id', width: 300},
                {text: 'Name', datafield: 'dataset_name', width: 200},
                {text: 'Type', datafield: 'dataset_type', width: 100},
                {text: 'Layer', datafield: 'layer', width: 100},
                {text: 'Dependencies', datafield: 'dependencies', width: 300},
                {text: 'Status', datafield: 'status', width: 130},
                // {text: 'Created On', datafield: 'created_ts', width: 120, cellsformat: 'd'},
                // {text: 'Updated On', datafield: 'updated_ts', width: 120, cellsformat: 'd'}
            ];
        }
    }

    ngAfterViewInit() {
        // Initialize data adapter after view is initialized and jqx is available
        // try {
        //     if (typeof jqx !== 'undefined' && jqx.dataAdapter) {
        //         this.datasetsDataAdapter = new jqx.dataAdapter(this.datasetsSource);
        //     }
        //
        //     // Set up event handlers for grid actions after view init
        //     setTimeout(() => {
        //         this.setupGridEventHandlers();
        //     }, 100);
        // } catch (error) {
        //     console.error('Error initializing grid:', error);
        //     this.isLoading = false;
        //     this.errorMessage = 'Error initializing grid. Please refresh the page.';
        // }
    }


    // setupGridEventHandlers(): void {
    //     // Handle delete icon clicks in the grid using event delegation
    //     const gridContainer = document.querySelector('.grid-wrapper');
    //     if (gridContainer) {
    //         gridContainer.addEventListener('click', (event: any) => {
    //             // Check if clicked element is the delete icon or its parent
    //             const deleteIcon = event.target.closest('.btn-delete-grid');
    //             if (deleteIcon) {
    //                 const datasetId = deleteIcon.getAttribute('data-dataset-id');
    //                 if (datasetId) {
    //                     event.preventDefault();
    //                     event.stopPropagation();
    //                     this.onGridDeleteClick(datasetId);
    //                 }
    //             }
    //         });
    //     }
    // }

    loadDatasets() {
        this.isLoading = true;
        this.errorMessage = '';

        this.apiService.getDatasets({
            page: this.page,
            per_page: this.perPage
        }).subscribe({
            next: (response) => {
                // Store original datasets
                this.datasets = response.datasets;
                this.total = response.total;
                this.page = response.page;
                this.perPage = response.per_page;
                this.pages = response.pages;
                this.isLoading = false;

                this.refreshGrid();
            },
            error: (error) => {
                this.isLoading = false;
                if (error.error && error.error.error) {
                    this.errorMessage = error.error.error;
                } else {
                    this.errorMessage = 'Failed to load datasets. Please try again later.';
                }
                console.error('Error loading datasets:', error);
            }
        });
    }

    // getWidth(): any {
    //     if (document.body.offsetWidth < 600) {
    //         return '90%';
    //     }
    //     return '100%';
    // }

    getHeight(): any {
        // Use available height minus header and padding
        return 'calc(100vh - 150px)';
    }

    getMinHeight(): any {
        // Set minimum height for the grid
        return '700px';
    }

    refreshGrid() {
        // Transform datasets for grid display
        const gridData = this.datasets.map(ds => ({
            dataset_id: ds.dataset_id,
            dataset_name: ds.dataset_name,
            dataset_type: ds.dataset_type,
            layer: ds.layer,
            dependencies: ds.upstream_dependencies || [],
            // dependencies: (ds.upstream_dependencies || []).length,
            status: ds.status,
            created_ts: ds.created_ts,
            updated_ts: ds.updated_ts,
            actions: ds.dataset_id // Store dataset_id for action buttons
        }));

        this.datasetsSource = {
            localdata: gridData,
            datatype: 'array',
            datafields: this.dataFields
        };
        this.datasetsDataAdapter = new jqx.dataAdapter(this.datasetsSource);
        
        // // Recreate data adapter with new data
        // if (typeof jqx !== 'undefined' && jqx.dataAdapter) {
        //     this.datasetsDataAdapter = new jqx.dataAdapter(this.datasetsSource);
        // }
        //
        // // Re-setup event handlers after grid refresh
        // setTimeout(() => {
        //     this.setupGridEventHandlers();
        // }, 100);
    }

    // Render actions column with delete button
    actionsRenderer = (row: number, column: any, value: any, rowData: any): string => {
        // Get the record ID from multiple possible sources
        let recordId = null;
        
        // Try different ways to get the record ID
        if (rowData && rowData.dataset_id) {
            recordId = rowData.dataset_id;
        } else if (this.datasetsDataAdapter && this.datasetsDataAdapter.records && this.datasetsDataAdapter.records[row] && this.datasetsDataAdapter.records[row].dataset_id) {
            recordId = this.datasetsDataAdapter.records[row].dataset_id;
        } else if (this.datasets && this.datasets[row] && this.datasets[row].dataset_id) {
            recordId = this.datasets[row].dataset_id;
        } else if (value) {
            recordId = value; // Fallback to value if it's the dataset_id
        }
        
        // Use a unique identifier for the onclick handler
        const handlerId = `delete_${recordId}_${row}`;
        
        return `<div style="display: flex; justify-content: center; align-items: center; height: 100%;">
            <i class="bi bi-trash text-danger btn-delete-grid" style="cursor: pointer; font-size: 16px;" data-dataset-id="${recordId || ''}" data-handler-id="${handlerId}" title="Delete Record"></i>
        </div>`;
    }

    // Handle grid row double-click for editing
    onGridRowDoubleClick(event: any): void {
        try {
            console.log('Double-click event:', event);
            
            // jqxGrid event structure can vary, try different approaches
            let rowIndex = -1;
            let rowData: any = null;
            
            if (event && event.args) {
                rowIndex = event.args.rowindex;
            } else if (event && event.detail && event.detail.args) {
                rowIndex = event.detail.args.rowindex;
            } else if (event && typeof event === 'object' && 'rowindex' in event) {
                rowIndex = event.rowindex;
            }
            
            // Get row data from the adapter
            if (rowIndex >= 0 && this.datasetsDataAdapter && this.datasetsDataAdapter.getRows) {
                const rows = this.datasetsDataAdapter.getRows();
                if (rows && rows[rowIndex]) {
                    rowData = rows[rowIndex];
                }
            }
            
            // Alternative: get data directly from datasets array using dataset_id
            if (rowData && rowData.dataset_id) {
                const dataset = this.getDatasetById(rowData.dataset_id);
                if (dataset) {
                    this.openEditModal(dataset);
                    return;
                }
            }
            
            // Fallback: try to get dataset from row index directly
            if (rowIndex >= 0 && this.datasets && this.datasets[rowIndex]) {
                this.openEditModal(this.datasets[rowIndex]);
                return;
            }
            
            console.warn('Could not find dataset for row:', rowIndex);
        } catch (error) {
            console.error('Error in onGridRowDoubleClick:', error);
        }
    }

    // Handle delete button click in grid
    onGridDeleteClick(datasetId: string): void {
        const dataset = this.getDatasetById(datasetId);
        if (dataset) {
            this.openDeleteModal(dataset);
        }
    }

    // Statistics calculations
    getActiveDatasetsCount(): number {
        return this.datasets.filter(ds => ds.status === 'active').length;
    }

    getDatasetsByType(): { [key: string]: number } {
        const typeCount: { [key: string]: number } = {};
        this.datasets.forEach(ds => {
            const type = ds.dataset_type || 'unknown';
            typeCount[type] = (typeCount[type] || 0) + 1;
        });
        return typeCount;
    }

    getDatasetsByLayer(): { [key: string]: number } {
        const layerCount: { [key: string]: number } = {};
        this.datasets.forEach(ds => {
            const layer = ds.layer || 'unknown';
            layerCount[layer] = (layerCount[layer] || 0) + 1;
        });
        return layerCount;
    }

    getTotalDependencies(): number {
        return this.datasets.reduce((sum, ds) => {
            return sum + ((ds.upstream_dependencies || []).length);
        }, 0);
    }

    getInactiveDatasetsCount(): number {
        return this.datasets.filter(ds => ds.status !== 'active').length;
    }

    getDatasetsWithDependencies(): number {
        return this.datasets.filter(ds => ds.upstream_dependencies && ds.upstream_dependencies.length > 0).length;
    }

    // CRUD Operations
    openCreateModal() {
        // Generate a new UUID for the dataset ID
        const newUuid = this.generateUUID();
        this.datasetForm.reset({
            dataset_id: newUuid,
            dataset_name: '',
            dataset_type: '',
            layer: '',
            upstream_dependencies: [],
            status: 'active'
        });
        this.showCreateModal = true;
        this.formError = '';
    }

    // Generate UUID v4
    generateUUID(): string {
        // Use crypto.randomUUID() if available (modern browsers)
        if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
            return window.crypto.randomUUID();
        }
        // Fallback UUID generation (RFC 4122 compliant)
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Regenerate UUID for create form
    regenerateUUID() {
        const newUuid = this.generateUUID();
        this.datasetForm.patchValue({ dataset_id: newUuid });
    }

    openEditModal(dataset: Dataset) {
        this.selectedDataset = dataset;
        this.datasetForm.patchValue({
            dataset_id: dataset.dataset_id,
            dataset_name: dataset.dataset_name,
            dataset_type: dataset.dataset_type,
            layer: dataset.layer,
            upstream_dependencies: dataset.upstream_dependencies || [],
            status: dataset.status
        });
        // Disable dataset_id field in edit mode
        this.datasetForm.get('dataset_id')?.disable();
        this.showEditModal = true;
        this.formError = '';
    }

    openDeleteModal(dataset: Dataset) {
        this.selectedDataset = dataset;
        this.showDeleteModal = true;
    }

    closeModals() {
        this.showCreateModal = false;
        this.showEditModal = false;
        this.showDeleteModal = false;
        this.selectedDataset = null;
        this.formError = '';
        // Re-enable dataset_id field when closing modal
        this.datasetForm.get('dataset_id')?.enable();
        this.datasetForm.reset();
    }

    onCreateSubmit() {
        if (this.datasetForm.invalid) {
            this.formError = 'Please fill in all required fields correctly.';
            return;
        }

        this.formLoading = true;
        this.formError = '';

        const formValue = this.datasetForm.value;
        const datasetData: Partial<Dataset> = {
            dataset_id: formValue.dataset_id,
            dataset_name: formValue.dataset_name,
            dataset_type: formValue.dataset_type,
            layer: formValue.layer,
            upstream_dependencies: Array.isArray(formValue.upstream_dependencies) 
                ? formValue.upstream_dependencies 
                : [],
            status: formValue.status
        };

        this.apiService.createDataset(datasetData).subscribe({
            next: (response) => {
                this.formLoading = false;
                this.closeModals();
                this.loadDatasets(); // Reload the list
            },
            error: (error) => {
                this.formLoading = false;
                if (error.error && error.error.error) {
                    this.formError = error.error.error;
                } else {
                    this.formError = 'Failed to create dataset. Please try again.';
                }
                console.error('Error creating dataset:', error);
            }
        });
    }

    onUpdateSubmit() {
        if (this.datasetForm.invalid || !this.selectedDataset) {
            this.formError = 'Please fill in all required fields correctly.';
            return;
        }

        this.formLoading = true;
        this.formError = '';

        const formValue = this.datasetForm.value;
        const datasetData: Partial<Dataset> = {
            dataset_name: formValue.dataset_name,
            dataset_type: formValue.dataset_type,
            layer: formValue.layer,
            upstream_dependencies: Array.isArray(formValue.upstream_dependencies) 
                ? formValue.upstream_dependencies 
                : [],
            status: formValue.status
        };

        this.apiService.updateDataset(this.selectedDataset.dataset_id, datasetData).subscribe({
            next: (response) => {
                this.formLoading = false;
                this.closeModals();
                this.loadDatasets(); // Reload the list
            },
            error: (error) => {
                this.formLoading = false;
                if (error.error && error.error.error) {
                    this.formError = error.error.error;
                } else {
                    this.formError = 'Failed to update dataset. Please try again.';
                }
                console.error('Error updating dataset:', error);
            }
        });
    }

    onDeleteConfirm() {
        if (!this.selectedDataset) {
            return;
        }

        this.formLoading = true;
        this.formError = '';

        this.apiService.deleteDataset(this.selectedDataset.dataset_id).subscribe({
            next: (response) => {
                this.formLoading = false;
                this.closeModals();
                this.loadDatasets(); // Reload the list
            },
            error: (error) => {
                this.formLoading = false;
                if (error.error && error.error.error) {
                    this.formError = error.error.error;
                } else {
                    this.formError = 'Failed to delete dataset. Please try again.';
                }
                console.error('Error deleting dataset:', error);
            }
        });
    }

    // Helper method to get dataset by ID from the grid
    getDatasetById(datasetId: string): Dataset | undefined {
        return this.datasets.find(ds => ds.dataset_id === datasetId);
    }

    // Handle grid row selection for actions
    onRowSelect(event: any) {
        // This can be used if we want to enable row selection
    }

    // Handle dependencies input blur
    onDependenciesBlur(event: any) {
        const value = event.target.value;
        if (value) {
            const dependencies = value.split(',').map((dep: string) => dep.trim()).filter((dep: string) => dep.length > 0);
            this.datasetForm.patchValue({ upstream_dependencies: dependencies });
        } else {
            this.datasetForm.patchValue({ upstream_dependencies: [] });
        }
    }
}
