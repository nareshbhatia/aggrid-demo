import * as React from 'react';
import {
  ColDef,
  ValueFormatterParams,
  ValueGetterParams,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { evaluate } from 'mathjs';

import numeral from 'numeral';
import { Header } from '../../components';

const formatNumber = (params: ValueFormatterParams) => {
  return numeral(params.value).format('0,0.00');
};

const calcCircumference = (params: ValueGetterParams) => {
  return 2 * Math.PI * params.data.r;
};

const evaluateExpression = (params: ValueGetterParams) => {
  return evaluate('pi r ^ 2', params.data);
};

const columnDefs: Array<ColDef> = [
  { field: 'r', headerName: 'Radius', type: 'rightAligned' },
  {
    field: 'circumference',
    headerName: 'Circumference',
    valueGetter: calcCircumference,
    valueFormatter: formatNumber,
    type: 'rightAligned',
  },
  {
    field: 'area-aggrid',
    headerName: 'Area (ag-grid)',
    valueGetter: 'Math.PI * data.r ** 2',
    valueFormatter: formatNumber,
    type: 'rightAligned',
  },
  {
    field: 'area-mathjs',
    headerName: 'Area (mathjs)',
    valueGetter: evaluateExpression,
    valueFormatter: formatNumber,
    type: 'rightAligned',
  },
];

export function HomePage() {
  const [rowData] = React.useState([
    { r: 1 },
    { r: 2 },
    { r: 3 },
    { r: 4 },
    { r: 5 },
    { r: 6 },
    { r: 7 },
    { r: 8 },
    { r: 9 },
    { r: 10 },
  ]);

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="p-3 flex-1">
        <div className="ag-theme-alpine h-full w-full">
          <AgGridReact rowData={rowData} columnDefs={columnDefs}></AgGridReact>
        </div>
      </div>
    </div>
  );
}
