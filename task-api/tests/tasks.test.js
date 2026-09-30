const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('GET /tasks', () => {
  test('should return an empty array initially', async () => {
    const response = await request(app).get('/tasks');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe('POST /tasks', () => {
  test('should create a new task', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({
        title: 'Learn Node.js',
        description: 'Practice API testing',
        priority: 'high',
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe('Learn Node.js');
    expect(response.body.description).toBe('Practice API testing');
    expect(response.body.priority).toBe('high');
    expect(response.body.status).toBe('todo');
  });
});

test('should reject a task without a title', async () => {
  const response = await request(app)
    .post('/tasks')
    .send({
      description: 'This task has no title',
      priority: 'high',
    });

  expect(response.statusCode).toBe(400);
  expect(response.body.error).toBe(
    'title is required and must be a non-empty string'
  );
});

describe('GET /tasks pagination', () => {
  test('should return the first page of tasks', async () => {
    // Purane tasks clear karo
    taskService._reset();

    // 3 tasks create karo
    await request(app).post('/tasks').send({ title: 'Task 1' });
    await request(app).post('/tasks').send({ title: 'Task 2' });
    await request(app).post('/tasks').send({ title: 'Task 3' });

    // First page: page=1, limit=2
    const response = await request(app)
      .get('/tasks?page=1&limit=2');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].title).toBe('Task 1');
    expect(response.body[1].title).toBe('Task 2');
  });
});
describe('PATCH /tasks/:id/assign', () => {
  test('should assign a task to a user', async () => {
    taskService._reset();

    const createResponse = await request(app)
      .post('/tasks')
      .send({
        title: 'Complete assignment',
      });

    const taskId = createResponse.body.id;

    const response = await request(app)
      .patch(`/tasks/${taskId}/assign`)
      .send({
        assignedTo: 'Rishabh',
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.assignedTo).toBe('Rishabh');
  });
});
describe('DELETE /tasks/:id', () => {
  test('should delete a task', async () => {
    taskService._reset();

    const createResponse = await request(app)
      .post('/tasks')
      .send({
        title: 'Task to delete',
      });

    const taskId = createResponse.body.id;

    const response = await request(app)
      .delete(`/tasks/${taskId}`);

    expect(response.statusCode).toBe(204);

    const getResponse = await request(app).get('/tasks');

    expect(getResponse.body).toEqual([]);
  });
});
describe('PUT /tasks/:id', () => {
  test('should update a task', async () => {
    taskService._reset();

    const createResponse = await request(app)
      .post('/tasks')
      .send({
        title: 'Old title',
        priority: 'low',
      });

    const taskId = createResponse.body.id;

    const response = await request(app)
      .put(`/tasks/${taskId}`)
      .send({
        title: 'Updated title',
        priority: 'high',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe('Updated title');
    expect(response.body.priority).toBe('high');
  });

  test('should return 404 for unknown task', async () => {
    const response = await request(app)
      .put('/tasks/invalid-id')
      .send({
        title: 'Updated',
      });

    expect(response.statusCode).toBe(404);
  });
});

describe('PATCH /tasks/:id/complete', () => {
  test('should complete a task', async () => {
    taskService._reset();

    const createResponse = await request(app)
      .post('/tasks')
      .send({
        title: 'Complete this task',
      });

    const taskId = createResponse.body.id;

    const response = await request(app)
      .patch(`/tasks/${taskId}/complete`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('done');
    expect(response.body.completedAt).not.toBeNull();
  });

  test('should return 404 for unknown task', async () => {
    const response = await request(app)
      .patch('/tasks/invalid-id/complete');

    expect(response.statusCode).toBe(404);
  });
});

describe('GET /tasks/stats', () => {
  test('should return task statistics', async () => {
    taskService._reset();

    await request(app)
      .post('/tasks')
      .send({ title: 'Todo task' });

    const response = await request(app)
      .get('/tasks/stats');

    expect(response.statusCode).toBe(200);
    expect(response.body.todo).toBe(1);
    expect(response.body.in_progress).toBe(0);
    expect(response.body.done).toBe(0);
    expect(response.body.overdue).toBe(0);
  });
});