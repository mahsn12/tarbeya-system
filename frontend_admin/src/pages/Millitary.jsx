import { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const CheckboxRenderer = (props) => {
  const [checked, setChecked] = useState(props.value === true || props.value === 'true');

  const handleChange = () => {
    const newValue = !checked;
    setChecked(newValue);
    props.setValue(newValue);
  };

  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={handleChange}
      style={{ cursor: 'pointer', width: '20px', height: '20px' }}
    />
  );
};

export default function Military() {
  const [rowData, setRowData] = useState([]);

  const addRow = () => {
    const newRow = {
      رقم_مسلسل: '',
      الاسم: '',
      الرقم_القومي: '',
      الكلية: '',
      حالة_تسجيل_البحث: false,
      حالة_تسليم_البحث: false,
    };
    setRowData([...rowData, newRow]);
  };

  const [columnDefs] = useState([
    { field: 'رقم_مسلسل', headerName: 'رقم مسلسل', editable: true, filter: true, sortable: true, width: 120 },
    { field: 'الاسم', headerName: 'الاسم', editable: true, filter: true, sortable: true, flex: 1, minWidth: 150 },
    { field: 'الرقم_القومي', headerName: 'الرقم القومي', editable: true, filter: true, sortable: true, width: 140 },
    { field: 'الكلية', headerName: 'الكلية', editable: true, filter: true, sortable: true, width: 120 },
    {
      field: 'حالة_تسجيل_البحث',
      headerName: 'حالة تسجيل البحث',
      cellRenderer: CheckboxRenderer,
      editable: true,
      width: 140,
    },
    {
      field: 'حالة_تسليم_البحث',
      headerName: 'حالة تسليم البحث',
      cellRenderer: CheckboxRenderer,
      editable: true,
      width: 140,
    },
  ]);

  const defaultColDef = {
    resizable: true,
  };

  const getRowStyle = (params) => {
    if (!params.data.حالة_تسجيل_البحث && !params.data.حالة_تسليم_البحث) {
      return { backgroundColor: '#ffcccc' };
    }
    return {};
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <div style={{ marginBottom: '15px' }}>
        <button onClick={addRow} style={{ padding: '10px 20px', cursor: 'pointer', fontFamily: 'Cairo' }}>
          إضافة طالب جديد
        </button>
      </div>
      <div className="grid-container ag-theme-alpine">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowStyle={getRowStyle}
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
