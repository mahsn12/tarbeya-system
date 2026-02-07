import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'

const API_BASE = 'http://localhost:4000/api/faculties'

export default function Faculties(){
  const [rowData, setRowData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    fetch(API_BASE)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        const rows = Array.isArray(data)
          ? data.map((faculty) => ({
              _id: faculty._id,
              facultyName: faculty.faculty_name || '',
              enrolledInCourse: faculty.enrolled_students ?? 0,
              registeredStudents: faculty.registered_students ?? 0,
              unregisteredStudents: faculty.unregistered_students ?? 0,
              registeredNotEnrolled: faculty.unregistered_unenrolled_students ?? 0,
              numberOfTeams: faculty.number_of_teams ?? 0
            }))
          : []

        setRowData(rows)
        setLoading(false)
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || String(err))
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  const addFaculty = useCallback(async () => {
    setError(null)
    const payload = { faculty_name: `كلية جديدة ${Date.now()}` }

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        throw new Error('تعذر إضافة الكلية')
      }
      const created = await response.json()
      setRowData(prev => [...prev, {
        _id: created._id,
        facultyName: created.faculty_name,
        enrolledInCourse: created.enrolled_students ?? 0,
        registeredStudents: created.registered_students ?? 0,
        unregisteredStudents: created.unregistered_students ?? 0,
        registeredNotEnrolled: created.unregistered_unenrolled_students ?? 0,
        numberOfTeams: created.number_of_teams ?? 0
      }])
    } catch (err) {
      setError(err.message || String(err))
    }
  },[])

  const updateFaculty = useCallback(async (id, row) => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faculty_name: row.facultyName })
    })

    if (!response.ok) {
      throw new Error('تعذر تحديث اسم الكلية')
    }
  },[])

  const columnDefs = useMemo(
    () => [
      { field: 'facultyName', headerName: 'اسم الكلية', minWidth: 220, flex: 1, editable: true },
      { field: 'enrolledInCourse', headerName: 'عدد الطلبة المقيدين بالدورة', width: 210, editable: false },
      { field: 'registeredStudents', headerName: 'عدد الطلاب المسجلين', width: 180, editable: false },
      { field: 'unregisteredStudents', headerName: 'عدد الطلاب غير المسجلين', width: 190, editable: false },
      { field: 'registeredNotEnrolled', headerName: 'عدد الطلاب المسجلين غير المقيدين', width: 250, editable: false },
      { field: 'numberOfTeams', headerName: 'عدد الفرق', width: 120, editable: false }
    ],
    []
  )

  return (
    <div>
      <div className="controls">
        <button className="btn" onClick={addFaculty}>إضافة كلية</button>
      </div>
      {loading && <div>جارٍ تحميل بيانات الكليات...</div>}
      {error && <div style={{ color: 'red' }}>خطأ: {error}</div>}

      <div className="ag-theme-alpine grid-container">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          enableRtl={true}
          defaultColDef={{ sortable: true, filter: true, resizable: true, editable: true }}
          enableRangeSelection={true}
          animateRows={true}
          onCellValueChanged={async (params) => {
            if (params.colDef.field !== 'facultyName') return
            const id = params.data?._id
            if (!id) return
            try {
              await updateFaculty(id, params.data)
            } catch (err) {
              setError(err.message || String(err))
            }
          }}
        />
      </div>
    </div>
  )
}
