import * as React from 'react';
import {
  GetGroupRowAggParams,
  GridOptions,
  GridReadyEvent,
  ValueFormatterParams,
} from 'ag-grid-community';
import 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
// import { evaluate } from 'mathjs';
import numeral from 'numeral';
import { Header } from '../../components';
import { lots } from './data';

const PriorityEnum: { [key: string]: number } = {
  L: 0,
  M: 1,
  H: 2,
};

const formatNumber = (params: ValueFormatterParams) => {
  return numeral(params.value).format('0,0.00');
};

const columnDefs = [
  { field: 'symbol', headerName: 'Symbol', rowGroup: true, hide: true },
  { field: 'id', headerName: 'Lot #', type: 'rightAligned' },
  {
    field: 'priority',
    headerName: 'Priority',
    comparator: (valueA: string, valueB: string) =>
      PriorityEnum[valueA] - PriorityEnum[valueB],
  },
  {
    field: 'quantity',
    colId: 'quantity',
    headerName: 'Quantity',
    type: 'rightAligned',
    editable: true,
  },
  {
    headerName: 'Buy',
    children: [
      { field: 'buy.date', headerName: 'Date' },
      {
        field: 'buy.price',
        colId: 'buyPrice',
        headerName: 'Price',
        valueFormatter: formatNumber,
        type: 'rightAligned',
        editable: true,
      },
      {
        colId: 'buyAmount',
        headerName: 'Amount',
        valueGetter: 'getValue("quantity") * getValue("buyPrice")',
        valueFormatter: formatNumber,
        type: 'rightAligned',
      },
    ],
  },
  {
    headerName: 'Sell',
    children: [
      { field: 'sell.date', headerName: 'Date' },
      {
        field: 'sell.price',
        colId: 'sellPrice',
        headerName: 'Price',
        valueFormatter: formatNumber,
        type: 'rightAligned',
        editable: true,
      },
      {
        colId: 'sellAmount',
        headerName: 'Amount',
        valueGetter: 'getValue("quantity") * getValue("sellPrice")',
        valueFormatter: formatNumber,
        type: 'rightAligned',
      },
    ],
  },
  {
    field: 'gain',
    headerName: 'Gain',
    valueGetter: 'getValue("sellAmount") - getValue("buyAmount")',
    valueFormatter: formatNumber,
    type: 'rightAligned',
    cellClassRules: {
      loss: 'x < 0',
      profit: 'x > 0',
    },
  },
];

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
