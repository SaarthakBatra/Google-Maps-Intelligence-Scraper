import { parseListing } from '../../../src/modules/parser/parse-listing.js';

// Helper to create a mock review HTML block
const createReviewHtml = (author, rating, text, date = '2 days ago') => `
<div class="jftiEf">
    <div class="d4r55">${author}</div>
    <div class="kvMYJc" aria-label="${rating} stars"></div>
    <div class="wiI7pd">${text}</div>
    <div class="rsqaWe">${date}</div>
</div>
`;

// Helper to create a mock overview page HTML
const createOverviewHtml = (reviews = []) => `
<div class="m6QErb">
    <h1 class="DUwDvf fontHeadlineLarge">Test Business</h1>
    <div class="F7nice"><span aria-hidden="true">4.5</span><span>(100)</span></div>
    ${reviews.join('')}
</div>
`;

describe('parseListing - Reviews Handling', () => {

    test('should extract reviews from only overview HTML if no reviewsData provided', () => {
        const review1 = createReviewHtml('Alice', 5, 'Great!');
        const html = createOverviewHtml([review1]);

        const result = parseListing(html);

        expect(result.reviews).toHaveLength(1);
        expect(result.reviews[0]).toMatchObject({
            author: 'Alice',
            rating: 5,
            text: 'Great!'
        });
    });

    test('should merge reviews from overview and reviewsData', () => {
        const review1 = createReviewHtml('Alice', 5, 'Great!');
        const review2 = createReviewHtml('Bob', 4, 'Good.');
        const review3 = createReviewHtml('Charlie', 3, 'Okay.');

        const html = createOverviewHtml([review1]);
        const reviewsData = {
            'newest': createReviewHtml('Bob', 4, 'Good.') + review3 // Bob is duplicated here effectively if we consider source
        };

        // Bob is in 'newest' and 'overview' (hypothetically, though here I put Bob in newest and Charlie in newest)
        // Wait, I put Review1 in Overview. Review2 & 3 in Newest. 
        // Result should have Alice, Bob, Charlie.

        const result = parseListing(html, reviewsData);

        expect(result.reviews).toHaveLength(3);
        const authors = result.reviews.map(r => r.author).sort();
        expect(authors).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    test('should deduplicate identical reviews', () => {
        const review1 = createReviewHtml('Alice', 5, 'Great!');

        const html = createOverviewHtml([review1]);
        const reviewsData = {
            'highest': review1, // Duplicate of overview
            'lowest': review1   // Another duplicate
        };

        const result = parseListing(html, reviewsData);

        expect(result.reviews).toHaveLength(1);
        expect(result.reviews[0].author).toBe('Alice');
    });

    test('should distinct reviews with same author but different text', () => {
        const review1 = createReviewHtml('Alice', 5, 'Great!');
        const review2 = createReviewHtml('Alice', 5, 'Updated review: Amazing!'); // Same author, diff text

        const html = createOverviewHtml([review1]);
        const reviewsData = {
            'newest': review2
        };

        const result = parseListing(html, reviewsData);

        expect(result.reviews).toHaveLength(2);
        const texts = result.reviews.map(r => r.text).sort();
        expect(texts).toEqual(['Great!', 'Updated review: Amazing!']);
    });

    test('should handle empty or null reviewsData gracefully', () => {
        const review1 = createReviewHtml('Alice', 5, 'Great!');
        const html = createOverviewHtml([review1]);

        const result1 = parseListing(html, null);
        expect(result1.reviews).toHaveLength(1);

        const result2 = parseListing(html, {});
        expect(result2.reviews).toHaveLength(1);
    });

    test('should extract url and sponsored status', () => {
        const html = `
        <div class="m6QErb">
            <h1 class="DUwDvf fontHeadlineLarge" aria-label="Sponsored">Sponsored Business</h1>
        </div>
        `;
        const url = 'https://google.com/maps/place/Sponsored+Business';

        const result = parseListing(html, {}, url);

        expect(result.name).toBe('Sponsored Business'); // standard extraction
        expect(result.isSponsored).toBe(true);
        expect(result.url).toBe(url);
    });

    test('should default isSponsored to false and url to null', () => {
        const html = `
        <div class="m6QErb">
            <h1 class="DUwDvf fontHeadlineLarge">Normal Business</h1>
        </div>
        `;

        const result = parseListing(html);

        expect(result.name).toBe('Normal Business');
        expect(result.isSponsored).toBe(false);
        expect(result.url).toBeNull();
    });
});
