import React, { useState } from 'react';

const counselors = [
  { name: 'Bindya', stats: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 'R'] },
  { name: 'Bindya', stats: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 'R'] },
];

const columns = [
  'Counselor',
  'Job',
  'Contacted',
  'Not Contacted',
  'Calls',
  'Answered',
  'Not Answered',
  '+ve',
  'Admission',
  '-ve',
  'Walkin Fixed',
  'Followups Set',
  'Last Login',
  'Calls',
  'Activities',
];

export default function ReportPage() {
  const [branch, setBranch] = useState('');
  const [counselor, setCounselor] = useState('');
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Reports</h1>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 mb-1">Branch</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={branch}
                onChange={e => setBranch(e.target.value)}
              >
                <option value="">Select Branch</option>
                <option value="branch1">Branch 1</option>
                <option value="branch2">Branch 2</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 mb-1">Counselor</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={counselor}
                onChange={e => setCounselor(e.target.value)}
              >
                <option value="">Select Counselor</option>
                <option value="Bindya">Bindya</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            <button className="bg-violet-100 text-violet-700 px-4 py-2 rounded font-medium">All time</button>
            <button className="bg-violet-100 text-violet-700 px-4 py-2 rounded font-medium flex items-center gap-1">
              Recent <span className="text-lg">×</span>
            </button>
            <button className="border px-4 py-2 rounded font-medium flex items-center gap-2">
              <span className="material-icons text-base">filter_list</span> More filters
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="bg-green-100 text-green-700 px-3 py-1 rounded">PDF</button>
            <button className="bg-green-100 text-green-700 px-3 py-1 rounded">CSV</button>
            <button className="bg-green-100 text-green-700 px-3 py-1 rounded">EXCEL</button>
            <button className="bg-green-100 text-green-700 px-3 py-1 rounded">COPY</button>
            <button className="bg-green-100 text-green-700 px-3 py-1 rounded">COLUMNS</button>
          </div>
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search"
            className="border rounded px-3 py-2 w-full md:w-64"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div>
          <h2 className="text-gray-700 font-semibold mb-2">COUNSELOR ACTIVITIES</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gray-100">
                  {columns.map((col, idx) => (
                    <th key={idx} className="px-4 py-2 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {counselors.map((c, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2 font-medium text-gray-700 whitespace-nowrap">{c.name}</td>
                    {c.stats.map((stat, j) => (
                      <td key={j} className="px-4 py-2">
                        {typeof stat === 'number' ? (
                          <span className="inline-block w-6 h-6 bg-red-100 text-red-500 rounded-full text-center text-sm font-bold">
                            {stat}
                          </span>
                        ) : (
                          <span className="inline-block w-6 h-6 bg-gray-700 text-white rounded-full text-center text-sm font-bold">
                            {stat}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-center">
                      <button className="text-gray-500 hover:text-gray-700">
                        <span className="material-icons">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
