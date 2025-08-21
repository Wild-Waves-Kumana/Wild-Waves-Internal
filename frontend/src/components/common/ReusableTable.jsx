// ReusableTable.js
import React from "react";

const ReusableTable = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-2 text-left font-semibold border-b border-gray-300"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
        {data.map((row, idx) => (
            <tr key={row._id || idx} className="hover:bg-gray-100">
            {columns.map(col => (
                <td key={col.key} className="px-4 py-2 border-b border-gray-300">
                {col.render
                    ? col.render(row[col.key], row)
                    : row[col.key]}
                </td>
            ))}
            </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReusableTable;
