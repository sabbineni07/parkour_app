import {Component, OnInit, AfterViewInit, OnDestroy, ViewChild} from '@angular/core';
import {CommonModule, KeyValuePipe} from '@angular/common';
import {jqxTabsModule, jqxTabsComponent} from 'jqwidgets-ng/jqxtabs';
import {jqxGridModule, jqxGridComponent} from 'jqwidgets-ng/jqxgrid';
import {ApiService, Dataset} from '../../services/api.service';

declare var jqx: any;
declare var jqwidgets: any;

@Component({
    selector: 'app-datasets',
    standalone: true,
    imports: [CommonModule, jqxTabsModule, jqxGridModule],
    templateUrl: './datasets.component.html',
    styleUrls: ['./datasets.component.css']
})
export class DatasetsComponent implements OnInit, AfterViewInit {
    datasets: Dataset[] = [];
    isLoading = false;
    errorMessage = '';
    total = 0;
    page = 1;
    perPage = 20;
    pages = 0;

    gridColumns: any[] = [
        {text: 'ID', datafield: 'dataset_id', width: 300},
        {text: 'Name', datafield: 'dataset_name', width: 200},
        {text: 'Type', datafield: 'dataset_type', width: 100},
        {text: 'Layer', datafield: 'layer', width: 100},
        {text: 'Dependencies', datafield: 'dependencies', width: 200},
        {text: 'Status', datafield: 'status', width: 130, columntype: 'checkbox', filtertype: 'bool'},
        {text: 'Created On', datafield: 'created_ts', width: 120, cellsformat: 'd'},
        {text: 'Updated On', datafield: 'updated_ts', width: 120, cellsformat: 'd'}
    ];

    dataFields: any[] = [
        {name: 'dataset_id', type: 'string'},
        {name: 'dataset_name', type: 'string'},
        {name: 'dataset_type', type: 'string'},
        {name: 'layer', type: 'string'},
        {name: 'dependencies', type: 'number'},
        {name: 'status', type: 'string'},
        {name: 'updated_ts', type: 'string'},
        {name: 'created_ts', type: 'string'}
    ];

    datasetsSource: any = {
        localdata: this.datasets,
        datatype: 'array',
        datafields: this.dataFields
    };

    datasetsDataAdapter: any = new jqx.dataAdapter(this.datasetsSource);

    constructor(private apiService: ApiService) {
    }

    ngOnInit() {
        this.loadDatasets();
    }

    ngAfterViewInit() {
    }

    loadDatasets() {
        this.isLoading = true;
        this.errorMessage = '';

        this.apiService.getDatasets({
            page: this.page,
            per_page: this.perPage
        }).subscribe({
            next: (response) => {
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
        this.datasetsSource = {
            localdata: this.datasets,
            datatype: 'array',
            datafields: this.dataFields
        };
        this.datasetsDataAdapter = new jqx.dataAdapter(this.datasetsSource);
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
            return sum + (ds.upstream_dependencies?.length || 0);
        }, 0);
    }

    getInactiveDatasetsCount(): number {
        return this.datasets.filter(ds => ds.status !== 'active').length;
    }

    getDatasetsWithDependencies(): number {
        return this.datasets.filter(ds => ds.upstream_dependencies && ds.upstream_dependencies.length > 0).length;
    }
}
