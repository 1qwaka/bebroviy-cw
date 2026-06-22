export interface PaginationResponse<T> {
    page: number;
    pageSize: number;
    totalElements: number;
    items: T[];
}

export interface HotelResponse {
    hotelUid: string;
    name: string;
    country: string;
    city: string;
    address: string;
    stars: number;
    price: number;
    capacity: number; 
}

export interface HotelInfo {
    hotelUid: string;
    name: string;
    fullAddress: string;
    stars: number;
    capacity?: number;
}

export interface PaymentInfo {
    status: 'PAID' | 'REVERSED' | 'CANCELED';
    price: number;
}

export interface ReservationResponse {
    reservationUid: string;
    hotel: HotelInfo;
    startDate: string;
    endDate: string;
    status: 'PAID' | 'RESERVED' | 'CANCELED';
    payment?: PaymentInfo;
}

export interface LoyaltyInfoResponse {
    status: 'BRONZE' | 'SILVER' | 'GOLD';
    discount: number;
    reservationCount: number;
}

export interface UserInfoResponse {
    reservations: ReservationResponse[];
    loyalty: LoyaltyInfoResponse;
}

export interface CreateReservationRequest {
    hotelUid: string;
    startDate: string;
    endDate: string;
}

export interface CreateReservationResponse {
    reservationUid: string;
    hotelUid: string;
    startDate: string;
    endDate: string;
    discount: number;
    status: 'PAID' | 'RESERVED' | 'CANCELED';
    payment: PaymentInfo;
}

export interface StatHotelItem {
    hotelUid: string;
    count: number;
    name: string;
}

export interface StatLoyaltyItem {
    status: string;
    count: number;
}

export interface StatisticsResponse {
    totalCreated: number;
    totalCanceled: number;
    revenue: number;
    hotelPopularity: StatHotelItem[];
    loyaltyDistribution: StatLoyaltyItem[];
}

export interface UserAction {
    id: number;
    username: string;
    actionName: string;
    createdAt: string;
}