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
    const [selectedFilter, setSelectedFilter] = useState<string>('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Calculate date ranges
    const getDateRange = (type: string) => {
        const today = new Date();
        const formatDate = (date: Date) => date.toISOString().split('T')[0];

        switch (type) {
            case 'today':
                return {
                    start: formatDate(today),
                    end: formatDate(today)
                };
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                return {
                    start: formatDate(yesterday),
                    end: formatDate(yesterday)
                };
            case 'last_week':
                const lastWeekEnd = new Date(today);
                lastWeekEnd.setDate(lastWeekEnd.getDate() - 1); // Yesterday
                const lastWeekStart = new Date(lastWeekEnd);
                lastWeekStart.setDate(lastWeekStart.getDate() - 6); // 7 days ago
                return {
                    start: formatDate(lastWeekStart),
                    end: formatDate(lastWeekEnd)
                };
            case 'last_month':
                const lastMonthEnd = new Date(today);
                lastMonthEnd.setDate(lastMonthEnd.getDate() - 1); // Yesterday
                const lastMonthStart = new Date(lastMonthEnd);
                lastMonthStart.setDate(lastMonthStart.getDate() - 29); // 30 days ago
                return {
                    start: formatDate(lastMonthStart),
                    end: formatDate(lastMonthEnd)
                };
            default:
                return { start: '', end: '' };
        }
    };

    const singleDateOptions = [
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'last_week', label: 'Last Week' },
        { value: 'last_month', label: 'Last Month' }
    ];

    const handleSingleDateSelect = (type: string) => {
        const { start, end } = getDateRange(type);
        onDateChange(start, end);
        setSelectedFilter(type);
        setIsOpen(false);
    };

    const handleDateChange = (field: 'start' | 'end', value: string) => {
        if (field === 'start') {
            onDateChange(value, endDate);
        } else {
            onDateChange(startDate, value);
        }
        // Clear selected filter when manually changing dates
        setSelectedFilter('');
    };

    const getDisplayText = () => {
        if (selectedFilter && selectedFilter !== 'custom') {
            const option = singleDateOptions.find(opt => opt.value === selectedFilter);
            return option ? option.label : 'Select Date Range';
        }

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
        setSelectedFilter('');
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
                        {/* Quick Select Section */}
                        <div className="p-3 border-b bg-gray-50">
                            <div className="text-sm font-medium text-gray-700 mb-2">Quick Select</div>
                            <div className="space-y-1">
                                {singleDateOptions.map((option) => (
                                    <div
                                        key={option.value}
                                        className={`px-3 py-2 hover:bg-gray-100 cursor-pointer rounded text-sm ${selectedFilter === option.value ? "bg-blue-50 text-blue-600" : ""
                                            }`}
                                        onClick={() => handleSingleDateSelect(option.value)}
                                    >
                                        {option.label}
                                    </div>
                                ))}
                            </div>
                        </div>

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