import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from './reservation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reservation, PaymentStatus } from './entities/reservation.entity';
import { Hotel } from '../hotel/entities/hotel.entity';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';

describe('ReservationService', () => {
  let service: ReservationService;
  let reservationRepo: Repository<Reservation>;
  let hotelRepo: Repository<Hotel>;

  // 1. Мок для репозитория бронирований
  const mockReservationRepo = {
    create: jest.fn((dto) => dto),
    save: jest.fn((entity) => Promise.resolve({ id: 1, ...entity })),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  // 2. Мок для репозитория отелей
  const mockHotelRepo = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepo,
        },
        {
          provide: getRepositoryToken(Hotel),
          useValue: mockHotelRepo,
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
    reservationRepo = module.get<Repository<Reservation>>(getRepositoryToken(Reservation));
    hotelRepo = module.get<Repository<Hotel>>(getRepositoryToken(Hotel));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Тест метода create ---
  describe('create', () => {
    it('should create a reservation if hotel exists', async () => {
      const dto: CreateReservationDto = { 
        hotelUid: 'hotel-uuid', 
        startDate: new Date().toISOString(), 
        endDate: new Date().toISOString(),
        username: 'User',
        paymentUid: 'bb856009-e216-49a0-a387-a5ca02772e4a'
      };

      const mockHotel = { id: 1, hotelUid: 'hotel-uuid', name: 'Grand Hotel' };
      
      // Настраиваем мок отеля
      mockHotelRepo.findOneBy.mockResolvedValue(mockHotel);

      const result = await service.create(dto);

      // Проверяем, что поиск отеля был вызван
      expect(hotelRepo.findOneBy).toHaveBeenCalledWith({ hotelUid: dto.hotelUid });
      
      // Проверяем создание объекта
      expect(reservationRepo.create).toHaveBeenCalledWith({
        ...dto,
        hotel: mockHotel,
        status: PaymentStatus.PAID,
      });

      // Проверяем сохранение
      expect(reservationRepo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('status', PaymentStatus.PAID);
    });

    it('should throw NotFoundException if hotel does not exist', async () => {
      const dto: CreateReservationDto = { 
        hotelUid: 'unknown-hotel', 
        startDate: new Date().toISOString(), 
        endDate: new Date().toISOString(),
        username: 'User',
        paymentUid: 'bb856009-e216-49a0-a387-a5ca02772e4a'
      };

      // Отель не найден
      mockHotelRepo.findOneBy.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      
      // Убеждаемся, что save НЕ вызывался
      expect(reservationRepo.save).not.toHaveBeenCalled();
    });
  });

  // --- Тест метода findAll ---
  describe('findAll', () => {
    it('should return array of reservations for specific user', async () => {
      const username = 'TestUser';
      const expectedReservations = [{ id: 1, username }];

      mockReservationRepo.find.mockResolvedValue(expectedReservations);

      const result = await service.findAll(username);

      expect(result).toEqual(expectedReservations);
      expect(reservationRepo.find).toHaveBeenCalledWith({
        where: { username },
        relations: ['hotel'],
      });
    });
  });

  // --- Тест метода findOne ---
  describe('findOne', () => {
    const reservationUid = 'res-uuid';
    const username = 'OwnerUser';

    it('should return reservation if it belongs to user', async () => {
      const mockReservation = { reservationUid, username };
      mockReservationRepo.findOne.mockResolvedValue(mockReservation);

      const result = await service.findOne(reservationUid, username);

      expect(result).toEqual(mockReservation);
      expect(reservationRepo.findOne).toHaveBeenCalledWith({
        where: { reservationUid },
        relations: ['hotel'],
      });
    });

    it('should throw ForbiddenException if reservation belongs to another user', async () => {
      const mockReservation = { reservationUid, username: 'OtherUser' };
      mockReservationRepo.findOne.mockResolvedValue(mockReservation);

      await expect(service.findOne(reservationUid, username))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if reservation not found (logic based check)', async () => {
      // Исходя из кода: if (reservation?.username !== username)
      // Если reservation null, то undefined !== username вернет true -> Forbidden
      mockReservationRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(reservationUid, username))
        .rejects.toThrow(ForbiddenException);
    });
  });

  // --- Тест метода cancel ---
  describe('cancel', () => {
    const reservationUid = 'res-uuid';
    const username = 'OwnerUser';

    it('should change status to CANCELED and save if user owns reservation', async () => {
      // Важно вернуть копию или объект, который можно мутировать
      const mockReservation = { 
        reservationUid, 
        username, 
        status: PaymentStatus.PAID 
      };
      
      mockReservationRepo.findOne.mockResolvedValue(mockReservation);

      const result = await service.cancel(reservationUid, username);

      // Проверяем изменение статуса
      expect(mockReservation.status).toBe(PaymentStatus.CANCELED);
      // Проверяем вызов save
      expect(reservationRepo.save).toHaveBeenCalledWith(expect.objectContaining({
        status: PaymentStatus.CANCELED
      }));
    });

    it('should throw ForbiddenException if user does not own reservation', async () => {
      const mockReservation = { 
        reservationUid, 
        username: 'Hacker', // Чужой пользователь
        status: PaymentStatus.PAID 
      };
      
      mockReservationRepo.findOne.mockResolvedValue(mockReservation);

      await expect(service.cancel(reservationUid, username))
        .rejects.toThrow(ForbiddenException);

      // Убеждаемся, что статус не менялся и сохранение не вызывалось
      expect(reservationRepo.save).not.toHaveBeenCalled();
    });
  });
});