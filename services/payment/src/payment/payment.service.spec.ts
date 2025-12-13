import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity'; // Путь может отличаться
import { Repository, In } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { FindPaymentsBatchDto } from './dto/find-payments-batch.dto';

// 1. Создаем объект-заглушку для репозитория
// Мы мокаем только те методы, которые используются в сервисе: create, save, find, findOneBy
const mockPaymentRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
};

describe('PaymentsService', () => {
  let service: PaymentsService;
  let repository: Repository<Payment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          // 2. Используем токен репозитория TypeORM
          provide: getRepositoryToken(Payment), 
          // 3. Подменяем реальный репозиторий на наш mock
          useValue: mockPaymentRepository, 
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    repository = module.get<Repository<Payment>>(getRepositoryToken(Payment));
  });

  // Очищаем моки после каждого теста, чтобы счетчики вызовов сбрасывались
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  // --- Тест метода create ---
  describe('create', () => {
    it('should create and save a payment with PAID status', async () => {
      const dto: CreatePaymentDto = { price: 100 };
      
      // Имитируем, что возвращает метод .create() (просто объект, он не асинхронный)
      const createdPayment = {
        status: PaymentStatus.PAID,
        price: dto.price,
      }; 
      mockPaymentRepository.create.mockReturnValue(createdPayment);

      // Имитируем, что возвращает метод .save() (обычно добавляет id, дату и т.д.)
      const savedPayment = { id: 1, ...createdPayment };
      mockPaymentRepository.save.mockResolvedValue(savedPayment);

      // Вызываем реальный метод сервиса
      const result = await service.create(dto);

      // Проверки
      expect(repository.create).toHaveBeenCalledWith({
        status: PaymentStatus.PAID,
        price: dto.price,
      });
      expect(repository.save).toHaveBeenCalledWith(createdPayment);
      expect(result).toEqual(savedPayment);
    });
  });

  // --- Тест метода findAll ---
  describe('findAll', () => {
    it('should find payments by uids', async () => {
      const dto: FindPaymentsBatchDto = { uids: ['uuid-1', 'uuid-2'] };
      const expectedPayments = [
        { id: 1, paymentUid: 'uuid-1', price: 100 },
        { id: 2, paymentUid: 'uuid-2', price: 200 },
      ];

      // Мокаем возвращаемое значение .find()
      mockPaymentRepository.find.mockResolvedValue(expectedPayments);

      const result = await service.findAll(dto);

      expect(result).toEqual(expectedPayments);
      
      // Проверяем, что find был вызван.
      // Примечание: Проверка аргументов с TypeORM оператором In() может быть сложной в Jest,
      // так как In() возвращает специальный объект FindOperator.
      // Достаточно проверить, что метод был вызван.
      expect(repository.find).toHaveBeenCalled();
      
      // Если очень хочется проверить аргументы, можно сделать так:
      expect(repository.find).toHaveBeenCalledWith({
        where: { paymentUid: expect.anything() }, // или использовать In(dto.uids), но объекты могут не совпасть по ссылке
      });
    });
  });

  // --- Тест метода findOne ---
  describe('findOne', () => {
    it('should return a payment if found', async () => {
      const uid = 'uuid-1';
      const expectedPayment = { id: 1, paymentUid: uid, price: 500 };

      mockPaymentRepository.findOneBy.mockResolvedValue(expectedPayment);

      const result = await service.findOne(uid);

      expect(repository.findOneBy).toHaveBeenCalledWith({ paymentUid: uid });
      expect(result).toEqual(expectedPayment);
    });

    it('should return null if payment not found', async () => {
      const uid = 'unknown-uuid';
      mockPaymentRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findOne(uid);

      expect(repository.findOneBy).toHaveBeenCalledWith({ paymentUid: uid });
      expect(result).toBeNull();
    });
  });
});