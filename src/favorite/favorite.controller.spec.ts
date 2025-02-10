import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteController } from './favorite.controller';
import { FavoriteService } from './favorite.service';
import { AuthGuard } from '../guard/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';

describe('FavoriteController', () => {
  let controller: FavoriteController;
  let service: FavoriteService;

  const mockUser = {
    _id: 'userId',
    favorites: ['pharmacy1'],
  };

  const mockFavoriteService = {
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
    getUserFavorites: jest.fn(),
  };

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoriteController],
      providers: [
        {
          provide: FavoriteService,
          useValue: mockFavoriteService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: AuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    controller = module.get<FavoriteController>(FavoriteController);
    service = module.get<FavoriteService>(FavoriteService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('ajouteFavorite', () => {
    it('should add a pharmacy to favorites', async () => {
      const mockRequest = { user: { _id: 'userId' } };
      mockFavoriteService.addFavorite.mockResolvedValue(mockUser);

      const result = await controller.ajouteFavorite('pharmacyId', mockRequest);

      expect(result).toEqual(mockUser);
      expect(service.addFavorite).toHaveBeenCalledWith('userId', 'pharmacyId');
    });
  });

  describe('deleteFavorite', () => {
    it('should remove a pharmacy from favorites', async () => {
      const mockRequest = { user: { _id: 'userId' } };
      mockFavoriteService.removeFavorite.mockResolvedValue(mockUser);

      const result = await controller.deleteFavorite('pharmacyId', mockRequest);

      expect(result).toEqual(mockUser);
      expect(service.removeFavorite).toHaveBeenCalledWith('userId', 'pharmacyId');
    });
  });

  describe('listeUserFavorites', () => {
    it('should return user favorites', async () => {
      const mockRequest = { user: { _id: 'userId' } };
      mockFavoriteService.getUserFavorites.mockResolvedValue(mockUser);

      const result = await controller.listeUserFavorites(mockRequest);

      expect(result).toEqual(mockUser);
      expect(service.getUserFavorites).toHaveBeenCalledWith('userId');
    });
  });
});