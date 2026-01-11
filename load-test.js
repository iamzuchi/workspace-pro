import http from 'k6/http';
import { check, sleep } from 'k6';

// k6 Load Test Script
// Run with: k6 run load-test.js

export const options = {
    stages: [
        { duration: '30s', target: 20 }, // Ramp up to 20 users
        { duration: '1m', target: 50 },  // Stay at 50 users (Normal Load)
        { duration: '30s', target: 100 }, // Ramp up to 100 users (Peak Load)
        { duration: '1m', target: 100 }, // Stay at 100 users
        { duration: '30s', target: 0 },   // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    },
};

const BASE_URL = 'http://localhost:3000'; // Change to your deployed URL

export default function () {
    // 1. Visit Dashboard (Simulate User)
    const res = http.get(`${BASE_URL}`); // Assuming public or mock auth for test

    check(res, {
        'status is 200': (r) => r.status === 200,
        'protocol is HTTP/2': (r) => r.proto === 'HTTP/2.0',
    });

    // 2. Simulate User Think Time
    sleep(1);
}
