import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteService } from './favorite.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../auth/schemas/user.schema';
import { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('FavoriteService', () => {
  let service: FavoriteService;
  let model: Model<User>;

  const mockUser = {
    _id: 'userId',
    favorites: ['pharmacy1'],
    save: jest.fn(),
  };

  const mockUserModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoriteService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<FavoriteService>(FavoriteService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addFavorite', () => {
    it('should add a pharmacy to favorites', async () => {
      const user = { ...mockUser, save: jest.fn().mockResolvedValue(mockUser) };
      jest.spyOn(mockUserModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      } as any);

      const result = await service.addFavorite('userId', 'newPharmacyId');
      
      expect(result).toEqual(mockUser);
      expect(user.favorites).toContain('pharmacy1');
      expect(user.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(mockUserModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.addFavorite('userId', 'pharmacyId'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if pharmacy already in favorites', async () => {
      const user = { ...mockUser, favorites: ['pharmacyId'] };
      jest.spyOn(mockUserModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      } as any);

      await expect(service.addFavorite('userId', 'pharmacyId'))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a pharmacy from favorites', async () => {
      const user = { 
        ...mockUser, 
        favorites: ['pharmacyId'],
        save: jest.fn().mockResolvedValue({ ...mockUser, favorites: [] }),
      };
      jest.spyOn(mockUserModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      } as any);

      const result = await service.removeFavorite('userId', 'pharmacyId');
      
      expect(result.favorites).not.toContain('pharmacyId');
      expect(user.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(mockUserModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.removeFavorite('userId', 'pharmacyId'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserFavorites', () => {
    it('should return user favorites', async () => {
      jest.spyOn(mockUserModel, 'findById').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      const result = await service.getUserFavorites('userId');
      
      expect(result).toEqual(mockUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith('userId');
    });
  });
});