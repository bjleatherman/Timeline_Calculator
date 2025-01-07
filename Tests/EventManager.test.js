const { EventManager } = require('../State/EventManager');

describe('EventManager: ', () => {
    let eventManager;

    // Runs before every event in the file
    beforeEach(() => {
        eventManager = new EventManager();
    });

    describe('Event Title Generator -', () => {
        beforeEach(() => {
            // Set specific title length
            eventManager.lettersOfTitleInEventTitle = 7;
        });

        test('long title, words in title, letter in title', () => {
            const result = eventManager.eventTitleGenerator(
                'The Longest Title That One Could Reasonably Decide To Put Into This Here Textbox',
                279850,
                300000,
                5
            );
            expect(result).toBe('The Lon...: 279.9k of 300.0k & Letter');
        });

        test('long title, NO words in title, letter in title', () => {
            const result = eventManager.eventTitleGenerator(
                'The Longest Title That One Could Reasonably Decide To Put Into This Here Textbox',
                300000,
                300000,
                5
            );
            expect(result).toBe('The Lon...: Letter');
        });
    });
});

