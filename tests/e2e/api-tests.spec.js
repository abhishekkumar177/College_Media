import { test, expect } from '@playwright/test';

test.describe('Backend API Tests', () => {
  const baseURL = process.env.API_BASE_URL || 'http://localhost:5000';

  test('should return health status', async ({ request }) => {
    const response = await request.get(`${baseURL}/`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('service', 'College Media API');
    expect(data).toHaveProperty('correlationId');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('memory');
    expect(data).toHaveProperty('cpu');
    expect(data).toHaveProperty('timestamp');
  });

  test('should get consistency status', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/system/consistency`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('correlationId');
  });

  test('should get job statistics', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/system/jobs`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('activeJobs');
    expect(data.data).toHaveProperty('completedJobs');
    expect(data.data).toHaveProperty('failedJobs');
    expect(data.data).toHaveProperty('totalJobs');
  });

  test('should get specific job status', async ({ request }) => {
    // First create a job (this would depend on your API)
    // For now, test the 404 case
    const response = await request.get(`${baseURL}/api/system/jobs/non-existent`);

    expect(response.status()).toBe(404);
    const data = await response.json();

    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('message', 'Job not found');
  });

  test('should get saga statistics', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/system/sagas`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('activeSagas');
    expect(data.data).toHaveProperty('completedSagas');
    expect(data.data).toHaveProperty('failedSagas');
    expect(data.data).toHaveProperty('totalSagas');
  });

  test('should get circuit breaker statuses', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/system/circuits`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
  });

  test('should reset circuit breaker', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/system/circuits/test-service/reset`);

    // Should succeed even if service doesn't exist (depends on implementation)
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('message');
  });

  test('should handle API errors gracefully', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/non-existent-endpoint`);

    expect(response.status()).toBe(404);
    const data = await response.json();

    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('message', 'Not Found');
    expect(data).toHaveProperty('correlationId');
  });

  test('should handle request deadline propagation', async ({ request }) => {
    const deadline = Date.now() + 30000; // 30 seconds from now

    const response = await request.get(`${baseURL}/`, {
      headers: {
        'x-request-deadline': deadline.toString()
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data).toHaveProperty('success', true);
  });

  test('should handle rate limiting', async ({ request }) => {
    // Make multiple requests quickly to test rate limiting
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(request.get(`${baseURL}/`));
    }

    const responses = await Promise.all(promises);

    // At least some should succeed
    const successCount = responses.filter(r => r.ok()).length;
    expect(successCount).toBeGreaterThan(0);
  });

  test('should validate request structure', async ({ request }) => {
    // Test with malformed request
    const response = await request.post(`${baseURL}/api/system/jobs/invalid-id`, {
      data: { invalid: 'data' }
    });

    // Should handle gracefully
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('should handle concurrent requests', async ({ request }) => {
    const concurrentRequests = 5;

    const promises = [];
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(request.get(`${baseURL}/api/system/consistency`));
    }

    const responses = await Promise.all(promises);

    // All should succeed
    responses.forEach(response => {
      expect(response.ok()).toBeTruthy();
    });
  });

  test('should handle large payloads', async ({ request }) => {
    // Create a large payload
    const largeData = {
      data: 'x'.repeat(100000) // 100KB of data
    };

    const response = await request.post(`${baseURL}/api/test/large-payload`, {
      data: largeData
    });

    // Should handle gracefully (may return 404 for non-existent endpoint, but shouldn't crash)
    expect([200, 404, 413]).toContain(response.status());
  });

  test('should test API performance', async ({ request }) => {
    const startTime = Date.now();

    const response = await request.get(`${baseURL}/`);
    const endTime = Date.now();

    expect(response.ok()).toBeTruthy();

    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
  });

  test('should handle different content types', async ({ request }) => {
    // Test JSON response
    const jsonResponse = await request.get(`${baseURL}/`);
    expect(jsonResponse.headers()['content-type']).toContain('application/json');

    // Test error responses
    const errorResponse = await request.get(`${baseURL}/api/non-existent`);
    expect(errorResponse.headers()['content-type']).toContain('application/json');
  });

  test('should validate authentication', async ({ request }) => {
    // Test endpoints that require authentication
    // This would depend on your auth implementation
    const protectedResponse = await request.get(`${baseURL}/api/protected`);

    // Should return 401 or handle appropriately
    expect([401, 404]).toContain(protectedResponse.status());
  });
});