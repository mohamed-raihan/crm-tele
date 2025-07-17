// Enhanced Date Filter Component
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface DateFilterProps {
    startDate: string;
    endDate: string;
    onDateChange: (startDate: string, endDate: string) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ startDate, endDate, onDateChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleDateChange = (field: 'start' | 'end', value: string) => {
        if (field === 'start') {
            onDateChange(value, endDate);
        } else {
            onDateChange(startDate, value);
        }
    };

    const getDisplayText = () => {
        if (startDate && endDate) {
            if (startDate === endDate) {
                return `${startDate}`;
            }
            return `${startDate} to ${endDate}`;
        }
        if (startDate) {
            return `From ${startDate}`;
        }
        if (endDate) {
            return `Until ${endDate}`;
        }
        return 'Select Date Range';
    };

    const clearFilter = () => {
        onDateChange('', '');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex-1" ref={dropdownRef}>
            <label className="block text-gray-700 mb-1">Date Filter</label>
            <div className="relative">
                <div
                    className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700 cursor-pointer flex items-center justify-between"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className={!startDate && !endDate ? "text-gray-500" : ""}>
                            {getDisplayText()}
                        </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </div>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
                        {/* Direct Date Inputs Section */}
                        <div className="p-3">
                            <div className="text-sm font-medium text-gray-700 mb-3">Select Date Range</div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={startDate}
                                        onChange={(e) => handleDateChange('start', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={endDate}
                                        onChange={(e) => handleDateChange('end', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Clear Filter */}
                        {(startDate || endDate) && (
                            <div className="p-2 border-t">
                                <button
                                    className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                                    onClick={clearFilter}
                                >
                                    Clear Filter
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DateFilter;