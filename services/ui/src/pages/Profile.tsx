import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { UserInfoResponse } from '../api/types';

export const Profile = () => {
    const [data, setData] = useState<UserInfoResponse | null>(null);

    const fetchProfile = () => {
        apiClient.get<UserInfoResponse>('/me')
            .then(res => setData(res.data))
            .catch(console.error);
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleCancel = (uid: string) => {
        if (!window.confirm('Отменить бронирование?')) return;
        apiClient.delete(`/reservations/${uid}`)
            .then(fetchProfile)
            .catch(alert);
    };

    if (!data) return <div className="p-4">Загрузка...</div>;

    return (
        <div className="flex flex-col gap-10">
            <section>
                <h2 className="text-xl font-semibold mb-4">Программа лояльности</h2>
                <div className="flex gap-12 border-b border-zinc-200 pb-6">
                    <div>
                        <span className="block text-sm text-zinc-500 mb-1">Статус</span>
                        <span className="font-medium text-lg">{data.loyalty.status}</span>
                    </div>
                    <div>
                        <span className="block text-sm text-zinc-500 mb-1">Скидка</span>
                        <span className="font-medium text-lg">{data.loyalty.discount}%</span>
                    </div>
                    <div>
                        <span className="block text-sm text-zinc-500 mb-1">Бронирований</span>
                        <span className="font-medium text-lg">{data.loyalty.reservationCount}</span>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-4">История бронирований</h2>
                {data.reservations.length === 0 ? (
                    <p className="text-zinc-500 text-sm">Нет бронирований.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-300">
                                    <th className="py-3 px-2 font-medium">Отель</th>
                                    <th className="py-3 px-2 font-medium">Даты</th>
                                    <th className="py-3 px-2 font-medium">Статус</th>
                                    <th className="py-3 px-2 font-medium">Оплата</th>
                                    <th className="py-3 px-2 font-medium text-right">Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.reservations.map(res => (
                                    <tr key={res.reservationUid} className="border-b border-zinc-100 hover:bg-zinc-50">
                                        <td className="py-3 px-2">
                                            <div className="font-medium">{res.hotel.name}</div>
                                            <div className="text-xs text-zinc-500 mt-0.5">{res.hotel.fullAddress}</div>
                                        </td>
                                        <td className="py-3 px-2">
                                            {res.startDate} — {res.endDate}
                                        </td>
                                        <td className="py-3 px-2">
                                            <span className={`inline-block px-2 py-1 text-xs font-medium border ${res.status === 'PAID' ? 'border-green-200 text-green-700 bg-green-50' : res.status === 'CANCELED' ? 'border-red-200 text-red-700 bg-red-50' : 'border-zinc-200 text-zinc-700 bg-zinc-50'}`}>
                                                {res.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2">
                                            {res.payment && 
                                                <>{res.payment.price} ₽ <span className="text-zinc-400">({res.payment.status})</span></>
                                            }
                                        </td>
                                        <td className="py-3 px-2 text-right">
                                            {res.status !== 'CANCELED' && (
                                                <button
                                                    onClick={() => handleCancel(res.reservationUid)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                                                >
                                                    Отменить
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};