describe('Lazy data loading', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('loads airports data only on first getter call', async () => {
    const requireMock = jest.fn(() => [
      {
        id: 'lhr',
        iata_code: 'LHR',
        icao_code: 'EGLL',
        name: 'Heathrow',
        latitude: 51.47,
        longitude: -0.45,
        time_zone: 'Europe/London',
        iata_country_code: 'GB',
        city_name: 'London',
      },
    ]);
    const createRequireMock = jest.fn(() => requireMock);

    jest.unstable_mockModule('node:module', () => ({
      createRequire: createRequireMock,
    }));

    const { getAirports } = await import('../src/airports.js');

    expect(createRequireMock).not.toHaveBeenCalled();
    expect(requireMock).not.toHaveBeenCalled();

    const first = getAirports();
    const second = getAirports();

    expect(first).toBe(second);
    expect(createRequireMock).toHaveBeenCalledTimes(1);
    expect(requireMock).toHaveBeenCalledTimes(1);
    expect(requireMock).toHaveBeenCalledWith('./../data/airports.json');
  });

  it('loads airlines data only on first getter call', async () => {
    const requireMock = jest.fn(() => [
      {
        id: 'ba',
        iata_code: 'BA',
        name: 'British Airways',
      },
      {
        id: 'invalid',
        iata_code: null,
        name: 'Invalid Airline',
      },
    ]);
    const createRequireMock = jest.fn(() => requireMock);

    jest.unstable_mockModule('node:module', () => ({
      createRequire: createRequireMock,
    }));

    const { getAirlines } = await import('../src/airlines.js');

    expect(createRequireMock).not.toHaveBeenCalled();
    expect(requireMock).not.toHaveBeenCalled();

    const first = getAirlines();
    const second = getAirlines();

    expect(first).toBe(second);
    expect(first).toHaveLength(1);
    expect(createRequireMock).toHaveBeenCalledTimes(1);
    expect(requireMock).toHaveBeenCalledTimes(1);
    expect(requireMock).toHaveBeenCalledWith('./../data/airlines.json');
  });

  it('loads aircraft data only on first getter call', async () => {
    const requireMock = jest.fn(() => [
      {
        id: 'a320',
        iata_code: '320',
        name: 'Airbus A320',
      },
    ]);
    const createRequireMock = jest.fn(() => requireMock);

    jest.unstable_mockModule('node:module', () => ({
      createRequire: createRequireMock,
    }));

    const { getAircraft } = await import('../src/aircraft.js');

    expect(createRequireMock).not.toHaveBeenCalled();
    expect(requireMock).not.toHaveBeenCalled();

    const first = getAircraft();
    const second = getAircraft();

    expect(first).toBe(second);
    expect(createRequireMock).toHaveBeenCalledTimes(1);
    expect(requireMock).toHaveBeenCalledTimes(1);
    expect(requireMock).toHaveBeenCalledWith('./../data/aircraft.json');
  });
});
