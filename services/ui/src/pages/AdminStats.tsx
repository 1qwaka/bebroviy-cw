import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { StatisticsResponse } from '../api/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];

export const AdminStats = () => {
    const [stats, setStats] = useState<StatisticsResponse | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        apiClient.get<StatisticsResponse>('/statistics')
            .then(res => setStats(res.data))
            .catch(err => setError(err.response?.data?.message || 'Ошибка загрузки статистики'));
    }, []);

    if (error) return <div className="text-red-500 p-8">{error}</div>;
    if (!stats) return <div className="text-zinc-500 p-8">Загрузка статистики...</div>;

    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-2xl font-semibold">Дашборд Администратора</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 border border-zinc-200 rounded-lg shadow-sm">
                    <div className="text-sm text-zinc-500 mb-1">Успешных бронирований</div>
                    <div className="text-3xl font-bold text-black">{stats.totalCreated}</div>
                </div>
                <div className="p-6 border border-zinc-200 rounded-lg shadow-sm">
                    <div className="text-sm text-zinc-500 mb-1">Отмен бронирований</div>
                    <div className="text-3xl font-bold text-red-600">{stats.totalCanceled}</div>
                </div>
                <div className="p-6 border border-zinc-200 rounded-lg shadow-sm bg-zinc-50">
                    <div className="text-sm text-zinc-500 mb-1">Выручка системы</div>
                    <div className="text-3xl font-bold text-green-600">{stats.revenue.toLocaleString('ru-RU')} ₽</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border border-zinc-200 p-6 rounded-lg">
                    <h2 className="text-lg font-medium mb-4">Популярность отелей (Топ 10)</h2>
                    <div className="h-64">
                        {stats.hotelPopularity.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.hotelPopularity} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" />
                                    <Tooltip formatter={(value) => [value, 'Бронирований']} labelFormatter={() => 'Отель UUID'} />
                                    <Bar dataKey="count" fill="#18181B" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-sm text-zinc-400">Нет данных</div>
                        )}
                    </div>
                </div>

                <div className="border border-zinc-200 p-6 rounded-lg">
                    <h2 className="text-lg font-medium mb-4">Распределение по статусам лояльности</h2>
                    <div className="h-64">
                        {stats.loyaltyDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.loyaltyDistribution}
                                        dataKey="count"
                                        nameKey="status"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label={(pr) => `${(pr as any).status}: ${(pr as any).count}`}
                                    >
                                        {stats.loyaltyDistribution.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [value, 'Пользователей']} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-sm text-zinc-400">Нет данных</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};