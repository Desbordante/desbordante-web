import setupDeviceInfo from '@utils/setupDeviceInfo';

describe('setupDeviceInfo Utility Function', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Should add device info to localStorage', async () => {
    await setupDeviceInfo();
    expect(localStorage.getItem('deviceInfo')).toBeDefined();
    expect(localStorage.getItem('deviceID')).toBeDefined();
  });

  it('Should not overwrite existing device info in localStorage', async () => {
    localStorage.setItem('deviceInfo', 'test');
    localStorage.setItem('deviceID', 'test');
    await setupDeviceInfo();
    expect(localStorage.getItem('deviceInfo')).toBe('test');
    expect(localStorage.getItem('deviceID')).toBe('test');
  });
});
