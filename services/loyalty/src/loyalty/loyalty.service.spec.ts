import { Test, TestingModule } from '@nestjs/testing';
import { LoyaltyService } from './loyalty.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Loyalty, LoyaltyStatus, LoyaltyStatusDiscount } from './entities/loyalty.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateLoyaltyDto } from './dto/create-loyalty.dto';
import { UpdateLoyaltyDto } from './dto/update-loyalty.dto';

describe('LoyaltyService', () => {
  let service: LoyaltyService;
  let repository: Repository<Loyalty>;

  // Мок репозитория
  const mockLoyaltyRepository = {
    // create просто возвращает объект, который в него передали (эмуляция создания сущности)
    create: jest.fn((dto) => dto),
    // save возвращает промис с объектом (эмуляция сохранения)
    save: jest.fn((entity) => Promise.resolve(entity)),
    // findOneBy возвращает промис (будем менять поведение в тестах)
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoyaltyService,
        {
          provide: getRepositoryToken(Loyalty),
          useValue: mockLoyaltyRepository,
        },
      ],
    }).compile();

    service = module.get<LoyaltyService>(LoyaltyService);
    repository = module.get<Repository<Loyalty>>(getRepositoryToken(Loyalty));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Тест onModuleInit ---
  describe('onModuleInit', () => {
    it('should try to create and save default user', () => {
      service.onModuleInit();

      expect(repository.create).toHaveBeenCalledWith({
        id: 1,
        username: "test-max",
        reservationCount: 25,
        status: LoyaltyStatus.GOLD,
        discount: 10,
      });
      // Проверяем, что save был вызван (аргумент можно не проверять, т.к. он результат create)
      expect(repository.save).toHaveBeenCalled();
    });
  });

  // --- Тест create ---
  describe('create', () => {
    it('should create a new loyalty with BRONZE status', async () => {
      const dto: CreateLoyaltyDto = { username: 'NewUser' };
      
      const expectedLoyalty = {
        username: dto.username,
        discount: LoyaltyStatusDiscount[LoyaltyStatus.BRONZE],
        reservationCount: 0,
        status: LoyaltyStatus.BRONZE,
      };

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(expectedLoyalty);
      expect(repository.save).toHaveBeenCalledWith(expectedLoyalty);
      expect(result).toEqual(expectedLoyalty);
    });
  });

  // --- Тест findOne ---
  describe('findOne', () => {
    it('should return loyalty info', async () => {
      const username = 'User1';
      const mockResult = { id: 1, username, status: LoyaltyStatus.BRONZE };
      
      mockLoyaltyRepository.findOneBy.mockResolvedValue(mockResult);

      const result = await service.findOne(username);
      expect(result).toEqual(mockResult);
      expect(repository.findOneBy).toHaveBeenCalledWith({ username });
    });
  });

  // --- Тест update (Самый важный) ---
  describe('update', () => {
    
    it('should throw NotFoundException if user not found', async () => {
      // Мокаем, что ничего не найдено
      mockLoyaltyRepository.findOneBy.mockResolvedValue(null);

      const dto: UpdateLoyaltyDto = { reservationCountChange: 1 };

      await expect(service.update('Unknown', dto)).rejects.toThrow(NotFoundException);
    });

    it('should update count and stay BRONZE (< 10)', async () => {
      // Исходное состояние: 5 бронирований
      const existingLoyalty = { 
        reservationCount: 5, 
        status: LoyaltyStatus.BRONZE, 
        discount: LoyaltyStatusDiscount[LoyaltyStatus.BRONZE] 
      };
      mockLoyaltyRepository.findOneBy.mockResolvedValue({ ...existingLoyalty }); // Возвращаем копию

      // Добавляем 1
      const dto: UpdateLoyaltyDto = { reservationCountChange: 1 };
      
      const result = await service.update('User', dto);

      // Ожидаем: 6 бронирований, статус все еще BRONZE
      expect(result.reservationCount).toBe(6);
      expect(result.status).toBe(LoyaltyStatus.BRONZE);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should upgrade to SILVER when count reaches 10', async () => {
      // Исходное состояние: 9 бронирований
      const existingLoyalty = { reservationCount: 9, status: LoyaltyStatus.BRONZE };
      mockLoyaltyRepository.findOneBy.mockResolvedValue({ ...existingLoyalty });

      // Добавляем 1 -> станет 10
      const dto: UpdateLoyaltyDto = { reservationCountChange: 1 };
      
      const result = await service.update('User', dto);

      expect(result.reservationCount).toBe(10);
      expect(result.status).toBe(LoyaltyStatus.SILVER);
      expect(result.discount).toBe(LoyaltyStatusDiscount[LoyaltyStatus.SILVER]);
    });

    it('should upgrade to GOLD when count reaches 20', async () => {
      // Исходное состояние: 19 бронирований
      const existingLoyalty = { reservationCount: 19, status: LoyaltyStatus.SILVER };
      mockLoyaltyRepository.findOneBy.mockResolvedValue({ ...existingLoyalty });

      // Добавляем 1 -> станет 20
      const dto: UpdateLoyaltyDto = { reservationCountChange: 1 };
      
      const result = await service.update('User', dto);

      expect(result.reservationCount).toBe(20);
      expect(result.status).toBe(LoyaltyStatus.GOLD);
      expect(result.discount).toBe(LoyaltyStatusDiscount[LoyaltyStatus.GOLD]);
    });

    it('should downgrade status if count decreases', async () => {
      // Исходное состояние: 10 бронирований (SILVER)
      const existingLoyalty = { reservationCount: 10, status: LoyaltyStatus.SILVER };
      mockLoyaltyRepository.findOneBy.mockResolvedValue({ ...existingLoyalty });

      // Убираем 1 -> станет 9
      const dto: UpdateLoyaltyDto = { reservationCountChange: -1 };
      
      const result = await service.update('User', dto);

      expect(result.reservationCount).toBe(9);
      expect(result.status).toBe(LoyaltyStatus.BRONZE);
    });

    it('should not allow negative reservation count', async () => {
      // Исходное состояние: 2 бронирования
      const existingLoyalty = { reservationCount: 2, status: LoyaltyStatus.BRONZE };
      mockLoyaltyRepository.findOneBy.mockResolvedValue({ ...existingLoyalty });

      // Пытаемся отнять 5 -> должно стать 0 (Math.max)
      const dto: UpdateLoyaltyDto = { reservationCountChange: -5 };
      
      const result = await service.update('User', dto);

      expect(result.reservationCount).toBe(0);
      expect(result.status).toBe(LoyaltyStatus.BRONZE);
    });
  });
});