import { useCallback, useEffect, useState } from "react";
import Plot from "../components/Plot";

function EnergyForm() {
    const toDateString = (date: Date) => {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    };

    const [now, setNow] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string>(toDateString(now));
    const [errors, setErrors] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const isSelectedDateToday = useCallback(() => {
        return toDateString(now) === selectedDate;
    }, [selectedDate, now]);

    const getDateWithOffset = (dateStr: string, days: number) => {
        console.log(dateStr);
        const date = new Date(dateStr + ' 00:00:00.000 GMT');
        console.log(date)
        date.setDate(date.getUTCDate() + days);
        console.log(date);

        console.log((selectedDate + now.toISOString().split('T')[1]))

        return toDateString(date);
    };

    return (
        <div>
            <h1>Energy Graph</h1>
            <div className='m-2 p-2'>
                {/* <span>🗓️ </span> */}
                {/* <span>{now.toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                })}</span> */}
                <div className='flex align-middle justify-center items-center'>
                    <span className='px-1 cursor-pointer bg-gray-100 rounded-md'
                    onClick={() => setSelectedDate((old) => getDateWithOffset(old, -1))}>&lt;&lt;</span>
                    <span className='rounded-md bg-gray-100 p-1 pb-2 mr-1 inline-block w-fit min-w-36 cursor-pointer'
                        onClick={() => setSelectedDate(toDateString(now))}>
                        <span className='w-[100px]'>{isSelectedDateToday() ? '🕒 Today' : '🕒 Back to today'}</span>
                    </span>
                    <input type='date' value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                    
                    <span className='px-1 cursor-pointer bg-gray-100 rounded-md'
                    onClick={() => setSelectedDate((old) => getDateWithOffset(old, 1))}>&gt;&gt;</span>
                </div>
            </div>
            <p className={(!!errors ? 'visible' : 'invisible') + (' text-red-500 mb-1 font-semibold')}>{errors || '.'}</p>
            <Plot currDate={new Date(selectedDate + 'T' + now.toISOString().split('T')[1])} setErrors={setErrors} />
        </div>
    );
}

export default EnergyForm;