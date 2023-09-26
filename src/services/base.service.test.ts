import 'reflect-metadata'
import { Cipher, Decipher } from 'node:crypto';
import Service from './base.service';

const mockEnvironmentManager = {
  variables: {},
  env: (_key: string) => "mocked"
};

const mockedCipher = {
  update: jest.fn(() => "update"),
  final: jest.fn(() => "final")
} as unknown as Cipher

const mockedDecipher = {
  update: jest.fn(() => "update"),
  final: jest.fn(() => "final")
} as unknown as Decipher

const mockEncryptionManager = {
  createCipheriv: jest.fn(() => mockedCipher),
  createDecipheriv: jest.fn(() => mockedDecipher)
};

const service = new Service(undefined!, mockEnvironmentManager, mockEncryptionManager);

describe('Service', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  function mockEnv() {
    mockEnvironmentManager.env = jest.fn()
      .mockReturnValueOnce('mocked-iv')
      .mockReturnValueOnce('mocked-key')
      .mockReturnValueOnce('mocked-algorithm');
  }

  describe('encryptId', () => {
    it('should call createCipheriv', () => {
      mockEnv()

      service.encryptId(123);

      expect(mockEncryptionManager.createCipheriv).toHaveBeenCalledWith(
        'mocked-algorithm',
        Buffer.from('mocked-key', 'utf8').slice(0, 32),
        Buffer.from('mocked-iv', 'utf8')
      );
    });

    it('should call cipher.update and cipher.final', () => {
      mockEnv()

      service.encryptId(123);

      expect(mockedCipher.update).toHaveBeenCalled();
      expect(mockedCipher.final).toHaveBeenCalled();
    });
  });

  describe('decryptId', () => {
    it('should decrypt encoded user id', () => {
      mockEnv()

      service.decryptId('encoded-data');

      expect(mockEncryptionManager.createDecipheriv).toHaveBeenCalledWith(
        'mocked-algorithm',
        Buffer.from('mocked-key', 'utf8').slice(0, 32),
        Buffer.from('mocked-iv', 'utf8')
      );
    });

    it('should call decipher.update and decipher.final', () => {
      mockEnv()

      service.decryptId("mocked-data");

      expect(mockedDecipher.update).toHaveBeenCalled();
      expect(mockedDecipher.final).toHaveBeenCalled();
    });
  });
});
