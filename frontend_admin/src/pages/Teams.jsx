import { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export default function Teams() {
  const [rowData, setRowData] = useState([]);

  const addRow = () => {
    const newRow = {
      كود_الفريق: '',
      الكلية: '',
      أسماء_أعضاء_الفريق: '',
      الرقم_القومي: '',
      أبحاث_أعضاء_الفريق: '',
    };
    setRowData([...rowData, newRow]);
  };

  const [columnDefs] = useState([
    { field: 'كود_الفريق', headerName: 'كود الفريق', editable: true, filter: true, sortable: true, width: 120 },
    { field: 'الكلية', headerName: 'الكلية', editable: true, filter: true, sortable: true, width: 120 },
    { field: 'أسماء_أعضاء_الفريق', headerName: 'أسماء أعضاء الفريق', editable: true, filter: true, sortable: true, flex: 1, minWidth: 150 },
    { field: 'الرقم_القومي', headerName: 'الرقم القومي', editable: true, filter: true, sortable: true, width: 140 },
    { field: 'أبحاث_أعضاء_الفريق', headerName: 'أبحاث أعضاء الفريق', editable: true, filter: true, sortable: true, flex: 1, minWidth: 150 },
  ]);

  const defaultColDef = {
    resizable: true,
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <div style={{ marginBottom: '15px' }}>
        <button onClick={addRow} style={{ padding: '10px 20px', cursor: 'pointer', fontFamily: 'Cairo' }}>
          إضافة مجموعة جديدة
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
