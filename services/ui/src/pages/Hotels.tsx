import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { apiClient } from '../api/client';
import { HotelResponse, PaginationResponse } from '../api/types';

export const Hotels = () => {
    const [data, setData] = useState<PaginationResponse<HotelResponse> | null>(null);
    const [page, setPage] = useState(1);
    const [selectedHotel, setSelectedHotel] = useState<HotelResponse | null>(null);

    // Форма бронирования
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [bookingMsg, setBookingMsg] = useState<{ text: string; isError: boolean } | null>(null);

    useEffect(() => {
        apiClient.get<PaginationResponse<HotelResponse>>(`/hotels?page=${page}&size=10`)
            .then((res) => setData(res.data))
            .catch(console.error);
    }, [page]);

    const handleBook = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHotel) return;
        setBookingMsg(null);

        apiClient.post('/reservations', {
            hotelUid: selectedHotel.hotelUid,
            startDate,
            endDate
        })
            .then(() => {
                setBookingMsg({ text: 'Успешно забронировано', isError: false });
                setStartDate('');
                setEndDate('');
            })
            .catch((err) => {
                setBookingMsg({ text: err.response?.data?.message || 'Ошибка бронирования', isError: true });
            });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2">
                <h1 className="text-2xl font-semibold mb-6">Список отелей</h1>
                <div className="flex flex-col gap-4">
                    {data?.items.map(hotel => (
                        <div
                            key={hotel.hotelUid}
                            className={`p-4 border cursor-pointer transition-colors ${selectedHotel?.hotelUid === hotel.hotelUid ? 'border-black' : 'border-zinc-200 hover:border-zinc-400'}`}
                            onClick={() => setSelectedHotel(hotel)}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium text-lg">{hotel.name}</h3>
                                    <p className="text-sm text-zinc-500 mt-1">{hotel.country}, {hotel.city}</p>
                                    <p className="text-sm text-zinc-500">{hotel.address}</p>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">{hotel.price} ₽ / сутки</div>
                                    <div className="text-sm text-zinc-400 mt-1">{'★'.repeat(hotel.stars)}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center mt-6 py-4 border-t border-zinc-200">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                        className="text-sm font-medium disabled:text-zinc-300"
                    >
                        Назад
                    </button>
                    <span className="text-sm text-zinc-500">Страница {page}</span>
                    <button
                        disabled={data ? page * data.pageSize >= data.totalElements : true}
                        onClick={() => setPage(p => p + 1)}
                        className="text-sm font-medium disabled:text-zinc-300"
                    >
                        Вперед
                    </button>
                </div>
            </div>

            <div className="sticky top-6">
                {selectedHotel ? (
                    <form onSubmit={handleBook} className="bg-zinc-50 border border-zinc-200 p-6">
                        <h2 className="text-lg font-medium mb-4">Бронирование</h2>
                        <div className="mb-4 text-sm">
                            Выбран: <strong>{selectedHotel.name}</strong>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Дата заезда</label>
                                <input
                                    type="date"
                                    required
                                    value={startDate}
                                    min={format(new Date(), 'yyyy-MM-dd')}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="w-full border border-zinc-300 p-2 text-sm bg-white focus:outline-none focus:border-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Дата выезда</label>
                                <input
                                    type="date"
                                    required
                                    value={endDate}
                                    min={startDate || format(new Date(), 'yyyy-MM-dd')}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="w-full border border-zinc-300 p-2 text-sm bg-white focus:outline-none focus:border-black"
                                />
                            </div>
                            <button
                                type="submit"
                                className="mt-2 w-full bg-black text-white py-2.5 text-sm font-medium hover:bg-zinc-800 transition-colors"
                            >
                                Забронировать
                            </button>
                            {bookingMsg && (
                                <div className={`text-sm mt-2 ${bookingMsg.isError ? 'text-red-600' : 'text-green-600'}`}>
                                    {bookingMsg.text}
                                </div>
                            )}
                        </div>
                    </form>
                ) : (
                    <div className="border border-zinc-200 p-6 text-zinc-500 text-sm text-center">
                        Выберите отель из списка слева для бронирования
                    </div>
                )}
            </div>
        </div>
    );
};