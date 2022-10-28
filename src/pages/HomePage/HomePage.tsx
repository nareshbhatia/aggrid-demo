import * as React from 'react';
import {
  GetGroupRowAggParams,
  GridOptions,
  GridReadyEvent,
  ValueFormatterParams,
} from 'ag-grid-community';
import 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import deepmerge from 'deepmerge';
import numeral from 'numeral';
import { Header } from '../../components';
import columnConfig from './column-config.json';
import { lots } from './data';

const formatNumber = (params: ValueFormatterParams) => {
  return numeral(params.value).format('0,0.00');
};

const mapValueFormatter = (formatterName: string) => {
  switch (formatterName) {
    case 'formatNumber':
      return formatNumber;
    default:
      return null;
  }
};

function mapColumnConfigs(configs: Array<object>) {
  return configs.map((config) => {
    let columnDef = deepmerge({}, config);
    // @ts-ignore
    if (columnDef.valueFormatter) {
      // @ts-ignore
      columnDef.valueFormatter = mapValueFormatter(columnDef.valueFormatter);
    }
    // @ts-ignore
    if (columnDef.comparator) {
      // @ts-ignore
      // eslint-disable-next-line no-new-func
      columnDef.comparator = new Function('valueA', 'valueB', columnDef.comparator);
    }
    // @ts-ignore
    if (columnDef.children) {
      // @ts-ignore
      columnDef.children = mapColumnConfigs(columnDef.children);
    }
    return columnDef;
  });
}

const columnDefs = mapColumnConfigs(columnConfig);

export function HomePage() {
  const [rowData] = React.useState(lots);

  const handleGridReady = (event: GridReadyEvent) => {
    // save gridApi and columnApi in context so that other components can use it
    const { api: gridApi } = event;
    gridApi.sizeColumnsToFit();
  };

  const defaultColDef = {
    resizable: true,
    sortable: true,
  };

  const gridOptions: GridOptions = {
    suppressCellSelection: true,
    defaultColDef,
    // @ts-ignore
    columnDefs,
    rowData,
    onGridReady: handleGridReady,
  };

  const getGroupRowAgg = React.useCallback((params: GetGroupRowAggParams) => {
    const result = {
      quantity: 0,
      buyAmount: 0,
      sellAmount: 0,
      buyPrice: 0,
      sellPrice: 0,
    };
    params.nodes.forEach((node) => {
      if (node.group === false) {
        const data = node.data;
        result.quantity += data.quantity;
        // TODO: how to get buy amount from calculated field instead of calculating again?
        result.buyAmount += data.quantity * data.buy.price;
        result.sellAmount += data.quantity * data.sell.price;
      }
    });
    result.buyPrice = result.buyAmount / result.quantity;
    result.sellPrice = result.sellAmount / result.quantity;
    return result;
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="p-3 flex-1">
        <div className="ag-theme-alpine h-full w-full">
          <AgGridReact
            gridOptions={gridOptions}
            getGroupRowAgg={getGroupRowAgg}
          />
        </div>
      </div>
    </div>
  );
}
