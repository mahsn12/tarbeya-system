import { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export default function Research() {
  const [rowData, setRowData] = useState([]);

  const addRow = () => {
    const newRow = {
      اسم_البحث: '',
    };
    setRowData([...rowData, newRow]);
  };

  const [columnDefs] = useState([
    { field: 'اسم_البحث', headerName: 'اسم البحث', editable: true, filter: true, sortable: true, flex: 1, minWidth: 300 },
  ]);

  const defaultColDef = {
    resizable: true,
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <div style={{ marginBottom: '15px' }}>
        <button onClick={addRow} style={{ padding: '10px 20px', cursor: 'pointer', fontFamily: 'Cairo' }}>
          إضافة بحث جديد
        </button>
      </div>
      <div className="grid-container ag-theme-alpine">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          suppressRowClickSelection={true}
          enableCellTextSelection={true}
          rowHeight={40}
          headerHeight={50}
          enableRtl={true}
        />
      </div>
    </div>
  );
}
