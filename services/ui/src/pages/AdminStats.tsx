import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { StatisticsResponse, PaginationResponse, UserAction } from '../api/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];

export const AdminStats = () => {
    const [stats, setStats] = useState<StatisticsResponse | null>(null);
    const [error, setError] = useState('');
    
    const [actionsData, setActionsData] = useState<PaginationResponse<UserAction> | null>(null);
    const [actionsPage, setActionsPage] = useState(1);

    useEffect(() => {
        apiClient.get<StatisticsResponse>('/statistics')
            .then(res => setStats(res.data))
            .catch(err => setError(err.response?.data?.message || 'Ошибка загрузки статистики'));
    }, []);

    useEffect(() => {
        apiClient.get<PaginationResponse<UserAction>>(`/statistics/actions?page=${actionsPage}&size=10`)
            .then(res => setActionsData(res.data))
            .catch(console.error);
    }, [actionsPage]);

    if (error) return <div className="text-red-500 p-8">{error}</div>;
    if (!stats) return <div className="text-zinc-500 p-8">Загрузка статистики...</div>;

    return (
        <div className="flex flex-col gap-8 pb-10">
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

            <div className="mt-4">
                <h2 className="text-xl font-semibold mb-4">Журнал действий пользователей</h2>
                <div className="border border-zinc-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                <th className="px-4 py-3 font-medium text-zinc-500 w-48">Дата и время</th>
                                <th className="px-4 py-3 font-medium text-zinc-500 w-48">Пользователь</th>
                                <th className="px-4 py-3 font-medium text-zinc-500">Действие</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            {actionsData?.items.map(action => (
                                <tr key={action.id} className="hover:bg-zinc-50">
                                    <td className="px-4 py-3 text-zinc-600">
                                        {new Date(action.createdAt).toLocaleString('ru-RU')}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-black">
                                        {action.username}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-800">
                                        {action.actionName}
                                    </td>
                                </tr>
                            ))}
                            {(!actionsData || actionsData.items.length === 0) && (
                                <tr>
                                    <td colSpan={3} className="px-4 py-6 text-center text-zinc-500">
                                        Нет записей
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    
                    {/* Пагинация */}
                    <div className="bg-white px-4 py-3 border-t border-zinc-200 flex items-center justify-between">
                        <button 
                            onClick={() => setActionsPage(p => p - 1)}
                            disabled={actionsPage <= 1}
                            className="text-sm font-medium text-black disabled:text-zinc-300"
                        >
                            Назад
                        </button>
                        <span className="text-sm text-zinc-500">
                            Страница {actionsPage} из {actionsData ? Math.max(1, Math.ceil(actionsData.totalElements / actionsData.pageSize)) : 1}
                        </span>
                        <button 
                            onClick={() => setActionsPage(p => p + 1)}
                            disabled={actionsData ? actionsPage * actionsData.pageSize >= actionsData.totalElements : true}
                            className="text-sm font-medium text-black disabled:text-zinc-300"
                        >
                            Вперед
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};