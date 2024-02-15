import { normalisePort } from '../src/server';

describe('normalisePort', () => {
  it('should return a valid port number', () => {
    expect(normalisePort('4000')).toBe(4000);
  });

  it('should return a string if the port is not a number', () => {
    expect(normalisePort('invalid')).toBe('invalid');
  });

  it('should return false if the port is less than  0', () => {
    expect(normalisePort('-1')).toBe(false);
  });
});
