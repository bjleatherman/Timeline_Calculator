const BlackoutDate = require('../Model/BlackoutDate');

describe('BlackoutDate', () => {
    test('should throw an error if the date format is invalid', () => {
        expect(() => new BlackoutDate('2024-13-32')).toThrow('Invalid blackout date provided');
    });
    test('should create a valid BlackoutDate instance', () => {
        const blackoutDate = new BlackoutDate('2024-12-25');
        expect(blackoutDate).toEqual({
            date: '2024-12-25',
            userId: 1,
            userGroup: 1,
        });
    });
});