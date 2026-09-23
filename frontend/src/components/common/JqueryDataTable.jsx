import React, { useEffect, useRef } from 'react';

/**
 * JqueryDataTable
 * 
 * Production-ready jQuery DataTables wrapper for React.
 * Uses window.$ and $.fn.DataTable loaded via Bootstrap 5 CDN in index.html.
 * 
 * Features:
 * - Full responsive child-row expand/collapse on mobile and tablet tap-screens
 * - Fast data updates via dt.clear().rows.add().draw(false) without DOM flickering
 * - Clean lifecycle cleanup (destroy on unmount)
 * - Click delegation for elements with [data-action="..."]
 * - Integrates with CRM theme & language styling
 */
export default function JqueryDataTable({
  columns,
  data = [],
  options = {},
  onAction,
  className = 'table table-hover align-middle mb-0 w-100',
  tableId,
}) {
  const tableRef = useRef(null);
  const dtInstanceRef = useRef(null);
  const onActionRef = useRef(onAction);

  // Keep onAction callback ref fresh without triggering re-init
  useEffect(() => {
    onActionRef.current = onAction;
  }, [onAction]);

  useEffect(() => {
    const $ = window.$;
    if (!$ || !$.fn || !$.fn.DataTable) {
      console.warn('jQuery or DataTables not loaded on window.');
      return;
    }

    const tableEl = tableRef.current;
    if (!tableEl) return;

    // Destroy existing instance if present
    if ($.fn.DataTable.isDataTable(tableEl)) {
      $(tableEl).DataTable().destroy();
      $(tableEl).empty();
    }

    const defaultOptions = {
      data: data,
      columns: columns,
      responsive: true,
      autoWidth: false,
      pageLength: 10,
      lengthMenu: [5, 10, 25, 50],
      columnDefs: [{ defaultContent: '-', targets: '_all' }],
      language: {
        search: '<i class="fas fa-search text-muted me-1"></i>',
        searchPlaceholder: 'Search records...',
        lengthMenu: 'Show _MENU_ entries',
        info: 'Showing _START_ to _END_ of _TOTAL_ entries',
        infoEmpty: 'Showing 0 to 0 of 0 entries',
        infoFiltered: '(filtered from _MAX_ total)',
        emptyTable: 'No matching records found',
        zeroRecords: 'No matching records found',
        paginate: {
          previous: '<i class="fas fa-chevron-left"></i>',
          next: '<i class="fas fa-chevron-right"></i>',
        },
      },
      order: [], // Preserve initial data ordering by default
    };

    const mergedOptions = { ...defaultOptions, ...options };
    const dt = $(tableEl).DataTable(mergedOptions);
    dtInstanceRef.current = dt;

    // Delegate click events for [data-action] elements (including inside responsive child rows)
    const handleActionClick = function (e) {
      const action = $(this).attr('data-action');
      if (!action || !onActionRef.current) return;

      e.preventDefault();
      e.stopPropagation();

      // Find the row data, whether clicked in the main row or collapsed child row
      let $tr = $(this).closest('tr');
      if ($tr.hasClass('child')) {
        $tr = $tr.prev();
      }
      const rowData = dt.row($tr).data();
      if (rowData) {
        onActionRef.current(action, rowData, e);
      }
    };

    $(tableEl).on('click', '[data-action]', handleActionClick);

    // Responsive recalculation on window resize
    const handleResize = () => {
      if (dtInstanceRef.current) {
        dtInstanceRef.current.responsive.recalc();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      $(tableEl).off('click', '[data-action]', handleActionClick);
      if ($.fn.DataTable.isDataTable(tableEl)) {
        try {
          $(tableEl).DataTable().destroy();
        } catch {
          // Ignore destroy errors during unmount
        }
      }
      dtInstanceRef.current = null;
    };
  }, [columns]); // Re-initialize if column definitions change

  // Synchronize data changes efficiently without destroying DataTable
  useEffect(() => {
    const dt = dtInstanceRef.current;
    if (dt && window.$) {
      dt.clear();
      if (Array.isArray(data) && data.length > 0) {
        dt.rows.add(data);
      }
      dt.draw(false);
      // Recalculate responsive widths after drawing new rows
      setTimeout(() => {
        if (dtInstanceRef.current) {
          dtInstanceRef.current.responsive.recalc();
        }
      }, 50);
    }
  }, [data]);

  return (
    <div className="table-responsive w-100">
      <table
        id={tableId}
        ref={tableRef}
        className={className}
        style={{ width: '100%' }}
      />
    </div>
  );
}
